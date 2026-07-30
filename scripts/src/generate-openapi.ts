#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ERP — OpenAPI generator.
 *
 * Parses artifacts/api-server/src/routes/*.ts via the TypeScript compiler API
 * and produces a richly-typed OpenAPI 3.0 spec with real request/response shapes
 * (best-effort) plus a Markdown reference, a Postman collection, and a Redoc HTML
 * viewer. Falls back to permissive shapes only when a route's body/response cannot
 * be inferred.
 *
 * Outputs (overwrites):
 *   exports/ERP_API.openapi.yaml
 *   exports/ERP_API.openapi.json
 *   exports/ERP_API.md
 *   exports/ERP_API.postman_collection.json
 *   exports/ERP_API_docs.html
 *   exports/ERP_API_docs.zip
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as ts from "typescript";
import yaml from "js-yaml";
import { execSync } from "node:child_process";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const ROUTES_DIR = path.join(ROOT, "artifacts/api-server/src/routes");
const EXPORTS_DIR = path.join(ROOT, "exports");
const SHARED_SCHEMA_DIRS = [
  path.join(ROOT, "lib/db/src/schema"),
  path.join(ROOT, "lib/api-zod/src"),
];

// ─── Types ───────────────────────────────────────────────────────────────

interface JSONSchema {
  type?: string | string[];
  format?: string;
  enum?: any[];
  const?: any;
  default?: any;
  description?: string;
  example?: any;
  examples?: any[];
  items?: JSONSchema;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

interface ParamSpec {
  name: string;
  in: "path" | "query" | "header";
  required: boolean;
  schema: JSONSchema;
  description?: string;
}

interface ResponseSpec {
  status: number;
  description: string;
  schema?: JSONSchema;
}

interface Endpoint {
  method: string;
  apiPath: string;            // e.g. /api/auth/login
  routePath: string;          // original express path, e.g. /auth/login
  tag: string;
  summary: string;
  description: string;
  operationId: string;
  sourceFile: string;
  sourceLine: number;
  parameters: ParamSpec[];
  requestBody?: { required: boolean; schema: JSONSchema; description?: string };
  responses: ResponseSpec[];
  requiresAuth: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function readSourceFile(filePath: string): ts.SourceFile {
  const src = fs.readFileSync(filePath, "utf-8");
  return ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getLineNumber(sf: ts.SourceFile, pos: number): number {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}

/** Detect `router.<method>(<path>, ...handlers)` calls and `router.use(<path>, sub)`. */
function findRouteCalls(sf: ts.SourceFile): Array<{
  method: string;
  pathLiteral: string;
  args: ts.NodeArray<ts.Expression>;
  node: ts.CallExpression;
}> {
  const out: Array<{ method: string; pathLiteral: string; args: ts.NodeArray<ts.Expression>; node: ts.CallExpression }> = [];
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const obj = node.expression.expression;
      const method = node.expression.name.text.toLowerCase();
      const isRouter = ts.isIdentifier(obj) && /^(router|app)$/i.test(obj.text);
      if (isRouter && ["get", "post", "put", "patch", "delete"].includes(method)) {
        const first = node.arguments[0];
        if (first && ts.isStringLiteralLike(first)) {
          out.push({ method, pathLiteral: first.text, args: node.arguments, node });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return out;
}

/** Find local `const Name = z.object({...})` (and z.array/string/etc.) definitions. */
function indexLocalSchemas(sf: ts.SourceFile): Map<string, ts.Expression> {
  const map = new Map<string, ts.Expression>();
  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        // Direct Zod call OR identifier ends with "Schema" (covers .partial(), .extend(), etc.)
        if (looksLikeZod(decl.initializer) || /Schema$/.test(decl.name.text)) {
          map.set(decl.name.text, decl.initializer);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return map;
}

/** Build a global map of <SchemaName, Expression> from all shared schema directories (recursive). */
function indexSharedSchemas(): Map<string, ts.Expression> {
  const global = new Map<string, ts.Expression>();
  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith(".ts") || entry.name.endsWith(".d.ts")) continue;
      const sf = readSourceFile(full);
      for (const [name, expr] of indexLocalSchemas(sf)) {
        if (!global.has(name)) global.set(name, expr);
      }
    }
  }
  for (const dir of SHARED_SCHEMA_DIRS) walk(dir);
  return global;
}

/**
 * Parse routes/index.ts and return a map of routerImportName → mount prefix.
 * Defaults to "" when no prefix string is provided.
 */
function parseMountPrefixes(indexFile: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(indexFile)) return map;
  const sf = readSourceFile(indexFile);

  // Build importName → moduleBasename map
  const importToFile = new Map<string, string>();
  sf.statements.forEach(stmt => {
    if (ts.isImportDeclaration(stmt) && stmt.importClause?.name) {
      const name = stmt.importClause.name.text;
      const mod = (stmt.moduleSpecifier as ts.StringLiteral).text;
      const base = path.basename(mod);
      importToFile.set(name, base.endsWith(".ts") ? base : base + ".ts");
    }
  });

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "router" &&
      node.expression.name.text === "use"
    ) {
      let prefix = "";
      let routerArg: ts.Expression | undefined;
      const args = node.arguments;
      if (args[0] && ts.isStringLiteralLike(args[0])) {
        prefix = args[0].text;
        routerArg = args[1];
      } else {
        routerArg = args[0];
      }
      if (routerArg && ts.isIdentifier(routerArg)) {
        const file = importToFile.get(routerArg.text);
        if (file) map.set(file, prefix);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return map;
}

const ZOD_NS = new Set(["z", "zod"]);

function looksLikeZod(expr: ts.Expression): boolean {
  if (ts.isCallExpression(expr)) {
    const callee = expr.expression;
    if (ts.isPropertyAccessExpression(callee)) {
      let cursor: ts.Node = callee;
      while (ts.isPropertyAccessExpression(cursor)) {
        cursor = cursor.expression;
        if (ts.isCallExpression(cursor)) cursor = cursor.expression;
      }
      if (ts.isIdentifier(cursor) && ZOD_NS.has(cursor.text)) return true;
    }
  }
  return false;
}

/** Zod expression → JSON schema (best-effort). */
function zodToSchema(expr: ts.Expression, locals: Map<string, ts.Expression>, depth = 0): JSONSchema {
  if (depth > 10) return { type: "object", additionalProperties: true };

  // If identifier references a local or shared schema, resolve it.
  if (ts.isIdentifier(expr)) {
    const ref = locals.get(expr.text) ?? SHARED_SCHEMAS.get(expr.text);
    if (ref) return zodToSchema(ref, locals, depth + 1);
    return {};
  }

  if (!ts.isCallExpression(expr)) return {};

  const callee = expr.expression;
  // Unwrap chained call: `<base>.<modifier>(...)` like .optional(), .default(), .min(), .describe()
  if (ts.isPropertyAccessExpression(callee) && callee.name.text !== undefined) {
    const method = callee.name.text;
    const base = callee.expression;

    // z.foo(...) / zod.foo(...) — terminal Zod constructor
    if (ts.isIdentifier(base) && ZOD_NS.has(base.text)) {
      return zodConstructor(method, expr.arguments, locals, depth);
    }

    // z.coerce.foo(...) / zod.coerce.foo(...) — treat coerce.* as direct constructor
    if (ts.isPropertyAccessExpression(base) && ts.isIdentifier(base.expression) && ZOD_NS.has(base.expression.text) && base.name.text === "coerce") {
      return zodConstructor(method, expr.arguments, locals, depth);
    }

    // Chained modifier: zodToSchema(base) then apply modifier
    const baseSchema = zodToSchema(base as ts.Expression, locals, depth + 1);
    return applyZodModifier(baseSchema, method, expr.arguments, locals);
  }

  return {};
}

function zodConstructor(name: string, args: ts.NodeArray<ts.Expression>, locals: Map<string, ts.Expression>, depth: number): JSONSchema {
  switch (name) {
    case "string": return { type: "string" };
    case "number": return { type: "number" };
    case "bigint": return { type: "integer" };
    case "boolean": return { type: "boolean" };
    case "date": return { type: "string", format: "date-time" };
    // Zod v4 shorthand constructors
    case "email": return { type: "string", format: "email" };
    case "url": return { type: "string", format: "uri" };
    case "uuid": return { type: "string", format: "uuid" };
    case "iso": return { type: "string" };
    case "any":
    case "unknown": return {};
    case "void":
    case "never": return {};
    case "null": return { type: "null" as any };
    case "literal": {
      const a = args[0];
      if (a && ts.isStringLiteralLike(a)) return { type: "string", const: a.text };
      if (a && ts.isNumericLiteral(a)) return { type: "number", const: Number(a.text) };
      if (a?.kind === ts.SyntaxKind.TrueKeyword) return { type: "boolean", const: true };
      if (a?.kind === ts.SyntaxKind.FalseKeyword) return { type: "boolean", const: false };
      return {};
    }
    case "enum":
    case "nativeEnum": {
      const a = args[0];
      if (a && ts.isArrayLiteralExpression(a)) {
        const values = a.elements
          .map(el => ts.isStringLiteralLike(el) ? el.text : ts.isNumericLiteral(el) ? Number(el.text) : null)
          .filter(v => v !== null);
        return { type: "string", enum: values as any[] };
      }
      return { type: "string" };
    }
    case "array": {
      const a = args[0];
      return { type: "array", items: a ? zodToSchema(a, locals, depth + 1) : {} };
    }
    case "object": {
      const a = args[0];
      const properties: Record<string, JSONSchema> = {};
      const required: string[] = [];
      if (a && ts.isObjectLiteralExpression(a)) {
        for (const prop of a.properties) {
          if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
            const key = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.text;
            const sub = zodToSchema(prop.initializer, locals, depth + 1);
            properties[key] = sub;
            if (!(sub as any).__optional) required.push(key);
            delete (sub as any).__optional;
          }
        }
      }
      const out: JSONSchema = { type: "object", properties };
      if (required.length) out.required = required;
      return out;
    }
    case "record": {
      const valExpr = args[1] ?? args[0];
      return { type: "object", additionalProperties: valExpr ? zodToSchema(valExpr, locals, depth + 1) : true };
    }
    case "union": {
      const a = args[0];
      if (a && ts.isArrayLiteralExpression(a)) {
        return { oneOf: a.elements.map(e => zodToSchema(e, locals, depth + 1)) };
      }
      return {};
    }
    case "tuple": return { type: "array" };
    case "instanceof": return { type: "object" };
    default: return {};
  }
}

function applyZodModifier(schema: JSONSchema, method: string, args: ts.NodeArray<ts.Expression>, locals: Map<string, ts.Expression> = new Map()): JSONSchema {
  const s = { ...schema };
  switch (method) {
    case "optional":
    case "nullish":
      (s as any).__optional = true;
      if (method === "nullish") {
        if (Array.isArray(s.type)) s.type.push("null"); else if (s.type) s.type = [s.type as string, "null"];
        s.nullable = true;
      }
      return s;
    case "nullable":
      if (Array.isArray(s.type)) s.type.push("null"); else if (s.type) s.type = [s.type as string, "null"];
      s.nullable = true;
      return s;
    case "default": {
      (s as any).__optional = true;
      const a = args[0];
      if (a) {
        if (ts.isStringLiteralLike(a)) s.default = a.text;
        else if (ts.isNumericLiteral(a)) s.default = Number(a.text);
        else if (a.kind === ts.SyntaxKind.TrueKeyword) s.default = true;
        else if (a.kind === ts.SyntaxKind.FalseKeyword) s.default = false;
      }
      return s;
    }
    case "describe": {
      const a = args[0];
      if (a && ts.isStringLiteralLike(a)) s.description = a.text;
      return s;
    }
    case "email": s.format = "email"; return s;
    case "url": s.format = "uri"; return s;
    case "uuid": s.format = "uuid"; return s;
    case "datetime": s.format = "date-time"; return s;
    case "date": s.format = "date"; return s;
    case "min": {
      const a = args[0];
      if (a && ts.isNumericLiteral(a)) {
        if (s.type === "string") s.minLength = Number(a.text);
        else if (s.type === "number" || s.type === "integer") s.minimum = Number(a.text);
      }
      return s;
    }
    case "max": {
      const a = args[0];
      if (a && ts.isNumericLiteral(a)) {
        if (s.type === "string") s.maxLength = Number(a.text);
        else if (s.type === "number" || s.type === "integer") s.maximum = Number(a.text);
      }
      return s;
    }
    case "regex": {
      const a = args[0];
      if (a && ts.isRegularExpressionLiteral(a)) {
        s.pattern = a.text.replace(/^\//, "").replace(/\/[gimsuy]*$/, "");
      }
      return s;
    }
    case "int": s.type = "integer"; return s;
    case "positive": s.minimum = 1; return s;
    case "nonempty": if (s.type === "string") s.minLength = 1; return s;
    case "partial": {
      // All properties become optional
      if (s.properties) s.required = [];
      return s;
    }
    case "deepPartial": {
      if (s.properties) s.required = [];
      return s;
    }
    case "required": {
      if (s.properties) s.required = Object.keys(s.properties);
      return s;
    }
    case "pick": {
      const a = args[0];
      if (a && ts.isObjectLiteralExpression(a) && s.properties) {
        const keys = a.properties
          .filter(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)))
          .map(p => ts.isIdentifier((p as ts.PropertyAssignment).name) ? ((p as ts.PropertyAssignment).name as ts.Identifier).text : ((p as ts.PropertyAssignment).name as ts.StringLiteralLike).text);
        const props: Record<string, JSONSchema> = {};
        for (const k of keys) if (s.properties[k]) props[k] = s.properties[k];
        s.properties = props;
        s.required = (s.required ?? []).filter(r => keys.includes(r));
      }
      return s;
    }
    case "omit": {
      const a = args[0];
      if (a && ts.isObjectLiteralExpression(a) && s.properties) {
        const keys = new Set(a.properties
          .filter(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)))
          .map(p => ts.isIdentifier((p as ts.PropertyAssignment).name) ? ((p as ts.PropertyAssignment).name as ts.Identifier).text : ((p as ts.PropertyAssignment).name as ts.StringLiteralLike).text));
        const props: Record<string, JSONSchema> = {};
        for (const [k, v] of Object.entries(s.properties)) if (!keys.has(k)) props[k] = v;
        s.properties = props;
        s.required = (s.required ?? []).filter(r => !keys.has(r));
      }
      return s;
    }
    case "extend":
    case "merge": {
      const a = args[0];
      if (a) {
        let other: JSONSchema | undefined;
        if (ts.isObjectLiteralExpression(a)) {
          const props: Record<string, JSONSchema> = {};
          const required: string[] = [];
          for (const prop of a.properties) {
            if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
              const key = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.text;
              const sub = zodToSchema(prop.initializer, locals);
              props[key] = sub;
              if (!(sub as any).__optional) required.push(key);
            }
          }
          other = { type: "object", properties: props, required };
        } else {
          other = zodToSchema(a, locals);
        }
        if (other?.properties) {
          s.properties = { ...(s.properties ?? {}), ...other.properties };
          s.required = Array.from(new Set([...(s.required ?? []), ...(other.required ?? [])]));
        }
      }
      return s;
    }
    case "passthrough": s.additionalProperties = true; return s;
    case "strict": s.additionalProperties = false; return s;
    case "transform":
    case "refine":
    case "superRefine":
    case "brand":
    case "readonly":
      return s;
    default: return s;
  }
}

/** Walk handler body to find request fields, query/params, response shapes. */
function analyzeHandler(handler: ts.Node, locals: Map<string, ts.Expression>) {
  const bodyFields = new Set<string>();
  const queryFields = new Set<string>();
  const paramFields = new Set<string>();
  const responses = new Map<number, JSONSchema>();
  let bodySchemaName: string | undefined;
  let bodySchemaInline: JSONSchema | undefined;
  let requiresAuth = false;

  function visit(node: ts.Node) {
    // Detect Schema.safeParse(req.body) / Schema.parse(req.body)
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const m = node.expression.name.text;
      if ((m === "safeParse" || m === "parse") && node.arguments[0]) {
        const arg = node.arguments[0];
        const target = ts.isPropertyAccessExpression(arg) && ts.isIdentifier(arg.expression) && arg.expression.text === "req" ? arg.name.text : undefined;
        if (target === "body" || target === "query" || target === "params") {
          const callee = node.expression.expression;
          if (ts.isIdentifier(callee) && !bodySchemaName && target === "body") {
            bodySchemaName = callee.text;
            const ref = locals.get(callee.text) ?? SHARED_SCHEMAS.get(callee.text);
            if (ref) bodySchemaInline = zodToSchema(ref, locals);
          }
        }
      }
    }

    // req.body.<X>, req.query.<X>, req.params.<X>
    if (ts.isPropertyAccessExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const inner = node.expression;
      if (ts.isIdentifier(inner.expression) && inner.expression.text === "req") {
        const which = inner.name.text;
        const field = node.name.text;
        if (which === "body") bodyFields.add(field);
        else if (which === "query") queryFields.add(field);
        else if (which === "params") paramFields.add(field);
      }
    }

    // Destructure: const { x, y } = req.body / req.query / req.params
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const init = node.initializer;
      if (ts.isPropertyAccessExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === "req") {
        const which = init.name.text;
        if (ts.isObjectBindingPattern(node.name)) {
          for (const el of node.name.elements) {
            if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) {
              const f = (el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : el.name.text);
              if (which === "body") bodyFields.add(f);
              else if (which === "query") queryFields.add(f);
              else if (which === "params") paramFields.add(f);
            }
          }
        }
      }
      // Destructure off parsed.data
      if (ts.isPropertyAccessExpression(init) && init.name.text === "data" && ts.isObjectBindingPattern(node.name)) {
        for (const el of node.name.elements) {
          if (ts.isBindingElement(el) && ts.isIdentifier(el.name)) {
            const f = (el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : el.name.text);
            bodyFields.add(f);
          }
        }
      }
    }

    // res.status(N).json(<expr>) or res.json(<expr>)
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "json") {
      let status = 200;
      let target: ts.Node = node.expression.expression;
      if (ts.isCallExpression(target) && ts.isPropertyAccessExpression(target.expression) && target.expression.name.text === "status") {
        const a = target.arguments[0];
        if (a && ts.isNumericLiteral(a)) status = Number(a.text);
      }
      const payload = node.arguments[0];
      if (payload) {
        const sch = exprToSchema(payload, locals);
        // Merge with existing for same status
        const prev = responses.get(status);
        responses.set(status, prev ? mergeSchemas(prev, sch) : sch);
      }
    }

    // Detect auth middleware
    if (ts.isIdentifier(node) && /requireAuth|requirePermission|requireAdmin/i.test(node.text)) {
      requiresAuth = true;
    }

    ts.forEachChild(node, visit);
  }

  visit(handler);
  return { bodyFields, queryFields, paramFields, responses, bodySchemaName, bodySchemaInline, requiresAuth };
}

/** Convert a JS expression (response payload) to a best-effort JSON Schema. */
function exprToSchema(expr: ts.Expression, locals: Map<string, ts.Expression>, depth = 0): JSONSchema {
  if (depth > 6) return {};

  if (ts.isStringLiteralLike(expr)) return { type: "string", example: expr.text };
  if (ts.isNumericLiteral(expr)) return { type: "number", example: Number(expr.text) };
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return { type: "boolean", example: true };
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return { type: "boolean", example: false };
  if (expr.kind === ts.SyntaxKind.NullKeyword) return { type: "null" as any };

  if (ts.isArrayLiteralExpression(expr)) {
    const first = expr.elements[0];
    return { type: "array", items: first ? exprToSchema(first, locals, depth + 1) : {} };
  }

  if (ts.isObjectLiteralExpression(expr)) {
    const properties: Record<string, JSONSchema> = {};
    for (const prop of expr.properties) {
      if (ts.isPropertyAssignment(prop) && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name))) {
        const key = ts.isIdentifier(prop.name) ? prop.name.text : prop.name.text;
        properties[key] = exprToSchema(prop.initializer, locals, depth + 1);
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        properties[prop.name.text] = {};
      } else if (ts.isSpreadAssignment(prop)) {
        // ignore — could be merged dynamically
      }
    }
    return { type: "object", properties };
  }

  // Conditional/Await/Identifier/etc.
  if (ts.isAwaitExpression(expr)) return exprToSchema(expr.expression, locals, depth + 1);
  if (ts.isConditionalExpression(expr)) {
    const a = exprToSchema(expr.whenTrue, locals, depth + 1);
    const b = exprToSchema(expr.whenFalse, locals, depth + 1);
    return mergeSchemas(a, b);
  }

  return {};
}

function mergeSchemas(a: JSONSchema, b: JSONSchema): JSONSchema {
  if (a.type === "object" && b.type === "object") {
    return {
      type: "object",
      properties: { ...(a.properties ?? {}), ...(b.properties ?? {}) },
    };
  }
  if (a.type === b.type) return a;
  return { oneOf: [a, b] };
}

// ─── Tag derivation ──────────────────────────────────────────────────────

const TAG_MAP: Record<string, string> = {
  auth: "Auth",
  health: "Health",
  dashboardOverview: "Dashboard Overview",
  accountsDashboard: "Accounts · Dashboard",
  accountSales: "Accounts · Sales",
  accountPurchases: "Accounts · Purchases",
  creditDebitNotes: "Accounts · Credit/Debit Notes",
  invoicePayments: "Accounts · Invoice Payments",
  invoices: "Accounts · Invoices",
  otherExpenses: "Accounts · Other Expenses",
  clientPortal: "Client Portal",
  clientLinks: "Client Portal · Links",
  inventory: "Inventory",
  packingLists: "Inventory · Packing Lists",
  shipping: "Inventory · Shipping",
  lookups: "Lookups",
  artworks: "Masters · Artworks",
  clients: "Masters · Clients",
  costing: "Masters · Costing",
  departments: "Masters · Departments",
  fabrics: "Masters · Fabrics",
  hsn: "Masters · HSN",
  items: "Masters · Items",
  itemTypes: "Masters · Item Types",
  materials: "Masters · Materials",
  packagingMaterials: "Masters · Packaging Materials",
  styleCategories: "Masters · Style Categories",
  styles: "Masters · Styles",
  swatchCategories: "Masters · Swatch Categories",
  swatches: "Masters · Swatches",
  unitTypes: "Masters · Unit Types",
  vendors: "Masters · Vendors",
  procurement: "Procurement",
  quotations: "Quotations",
  reports: "Reports",
  swatchOrders: "Orders · Swatch",
  styleOrders: "Orders · Style",
  styleOrderProducts: "Orders · Style Products",
  orders: "Orders",
  userManagement: "Settings · User Management",
  settings: "Settings",
  vendorLedger: "Vendors · Ledger",
  clientLedger: "Clients · Ledger",
  bom: "Inventory · BOM",
  vendorChallans: "Procurement · Vendor Challans",
  uploads: "Uploads",
};

function tagFromFile(file: string): string {
  const base = path.basename(file, ".ts");
  return TAG_MAP[base] ?? base.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim();
}

// ─── Path normalization ──────────────────────────────────────────────────

function normalizePath(p: string): { openapi: string; pathParams: string[] } {
  const pathParams: string[] = [];
  const openapi = p.replace(/:([A-Za-z_][\w]*)/g, (_, name) => {
    pathParams.push(name);
    return `{${name}}`;
  });
  return { openapi, pathParams };
}

// ─── Endpoint extraction ─────────────────────────────────────────────────

function extractEndpoints(): Endpoint[] {
  const files = fs.readdirSync(ROUTES_DIR)
    .filter(f => f.endsWith(".ts") && f !== "index.ts")
    .sort();

  const mountPrefixes = parseMountPrefixes(path.join(ROUTES_DIR, "index.ts"));

  const endpoints: Endpoint[] = [];

  for (const file of files) {
    const filePath = path.join(ROUTES_DIR, file);
    const sf = readSourceFile(filePath);
    const locals = indexLocalSchemas(sf);
    const tag = tagFromFile(file);
    const calls = findRouteCalls(sf);
    const mountPrefix = mountPrefixes.get(file) ?? "";

    for (const c of calls) {
      const handler = c.args[c.args.length - 1];
      const middlewares = c.args.slice(1, -1);
      const fullRoutePath = mountPrefix + (c.pathLiteral.startsWith("/") || c.pathLiteral === "" ? c.pathLiteral : "/" + c.pathLiteral);
      const normalizedRoute = fullRoutePath === "" ? "/" : fullRoutePath;
      const { openapi: openapiPath, pathParams } = normalizePath(normalizedRoute);
      const apiPath = "/api" + (openapiPath.startsWith("/") ? openapiPath : "/" + openapiPath);

      let bodyFields = new Set<string>();
      let queryFields = new Set<string>();
      let paramFields = new Set<string>(pathParams);
      let responses = new Map<number, JSONSchema>();
      let bodySchemaName: string | undefined;
      let bodySchemaInline: JSONSchema | undefined;
      let requiresAuth = false;

      if (handler) {
        const a = analyzeHandler(handler, locals);
        bodyFields = a.bodyFields;
        queryFields = a.queryFields;
        for (const p of a.paramFields) paramFields.add(p);
        responses = a.responses;
        bodySchemaName = a.bodySchemaName;
        bodySchemaInline = a.bodySchemaInline;
        requiresAuth = a.requiresAuth;
      }
      // Check middleware list too
      for (const mw of middlewares) {
        if (ts.isIdentifier(mw) && /requireAuth|requirePermission|requireAdmin/i.test(mw.text)) requiresAuth = true;
        if (ts.isCallExpression(mw) && ts.isIdentifier(mw.expression) && /requireAuth|requirePermission|requireAdmin/i.test(mw.expression.text)) requiresAuth = true;
      }

      const parameters: ParamSpec[] = [];
      for (const p of pathParams) {
        parameters.push({ name: p, in: "path", required: true, schema: { type: "string" }, description: `Path parameter \`${p}\`` });
      }
      for (const q of queryFields) {
        parameters.push({ name: q, in: "query", required: false, schema: { type: "string" }, description: `Query parameter \`${q}\`` });
      }

      const hasBody = ["post", "put", "patch"].includes(c.method);
      let requestBody: Endpoint["requestBody"] | undefined;
      if (hasBody) {
        if (bodySchemaInline && bodySchemaInline.properties && Object.keys(bodySchemaInline.properties).length) {
          requestBody = {
            required: true,
            schema: bodySchemaInline,
            description: bodySchemaName ? `Validated against \`${bodySchemaName}\` (Zod schema).` : undefined,
          };
        } else if (bodyFields.size) {
          const properties: Record<string, JSONSchema> = {};
          for (const f of bodyFields) properties[f] = { type: "string", description: "Inferred from handler usage" };
          requestBody = {
            required: true,
            schema: { type: "object", properties, additionalProperties: true },
            description: "Field types inferred from request usage in the handler.",
          };
        } else {
          requestBody = {
            required: false,
            schema: { type: "object", additionalProperties: true },
            description: "Request body schema not statically detected.",
          };
        }
      }

      const responsesOut: ResponseSpec[] = [];
      const sortedStatuses = Array.from(responses.keys()).sort();
      for (const status of sortedStatuses) {
        responsesOut.push({
          status,
          description: STATUS_DESCRIPTIONS[status] ?? `Response with status ${status}`,
          schema: responses.get(status),
        });
      }
      if (!responsesOut.find(r => r.status === 200) && !responsesOut.find(r => r.status === 201)) {
        responsesOut.unshift({ status: 200, description: "Success", schema: { type: "object" } });
      }
      // Standard error responses
      if (hasBody && !responsesOut.find(r => r.status === 400)) {
        responsesOut.push({ status: 400, description: "Bad Request — validation failed", schema: errorSchema() });
      }
      if (requiresAuth && !responsesOut.find(r => r.status === 401)) {
        responsesOut.push({ status: 401, description: "Unauthorized — missing or invalid Bearer token", schema: errorSchema() });
      }
      if (!responsesOut.find(r => r.status === 500)) {
        responsesOut.push({ status: 500, description: "Internal Server Error", schema: errorSchema() });
      }

      endpoints.push({
        method: c.method,
        apiPath,
        routePath: normalizedRoute,
        tag,
        summary: `${c.method.toUpperCase()} ${c.pathLiteral}`,
        description: `Handler in \`artifacts/api-server/src/routes/${file}\` (line ${getLineNumber(sf, c.node.pos)}).`,
        operationId: makeOperationId(c.method, c.pathLiteral),
        sourceFile: `artifacts/api-server/src/routes/${file}`,
        sourceLine: getLineNumber(sf, c.node.pos),
        parameters,
        requestBody,
        responses: responsesOut,
        requiresAuth,
      });
    }
  }
  return endpoints;
}

const STATUS_DESCRIPTIONS: Record<number, string> = {
  200: "Success",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

function errorSchema(): JSONSchema {
  return {
    type: "object",
    properties: {
      error: { type: "string", description: "Human-readable error message" },
      message: { type: "string", description: "Optional additional detail" },
    },
    required: ["error"],
  };
}

function makeOperationId(method: string, p: string): string {
  return `${method}_${p.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "")}`.toLowerCase();
}

// ─── OpenAPI builder ─────────────────────────────────────────────────────

function buildOpenApi(endpoints: Endpoint[]) {
  // Group by tag
  const tagCounts = new Map<string, number>();
  for (const e of endpoints) tagCounts.set(e.tag, (tagCounts.get(e.tag) ?? 0) + 1);

  const tags = Array.from(tagCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, n]) => ({ name, description: `${n} endpoint${n !== 1 ? "s" : ""}` }));

  const paths: Record<string, any> = {};
  for (const ep of endpoints) {
    paths[ep.apiPath] ??= {};
    const op: any = {
      tags: [ep.tag],
      summary: ep.summary,
      description: ep.description,
      operationId: ep.operationId,
      parameters: ep.parameters.length ? ep.parameters : undefined,
      responses: {},
    };
    if (ep.requiresAuth) op.security = [{ bearerAuth: [] }];
    if (ep.requestBody) {
      op.requestBody = {
        required: ep.requestBody.required,
        description: ep.requestBody.description,
        content: {
          "application/json": { schema: cleanSchema(ep.requestBody.schema) },
        },
      };
    }
    for (const r of ep.responses) {
      op.responses[String(r.status)] = {
        description: r.description,
        content: r.schema ? { "application/json": { schema: cleanSchema(r.schema) } } : undefined,
      };
    }
    if (paths[ep.apiPath][ep.method]) {
      console.warn(`  ⚠ Collision: ${ep.method.toUpperCase()} ${ep.apiPath} (${ep.sourceFile}:${ep.sourceLine})`);
    }
    paths[ep.apiPath][ep.method] = op;
  }

  const totalEndpoints = endpoints.length;
  const moduleCount = new Set(endpoints.map(e => e.sourceFile)).size;

  return {
    openapi: "3.0.3",
    info: {
      title: "ERP API",
      version: "1.0.0",
      description: [
        `Complete API reference for the ERP backend (Express 5 + PostgreSQL + Drizzle ORM).`,
        ``,
        `**Authentication.** Most endpoints require a Bearer JWT obtained from \`POST /api/auth/login\`. Send the token in the \`Authorization: Bearer <token>\` header.`,
        ``,
        `**Base path.** All endpoints are served under \`/api\`. The platform reverse proxy listens on port 80 in development and \`$REPLIT_DOMAINS\` in production.`,
        ``,
        `Auto-generated from \`artifacts/api-server/src/routes/\` — ${totalEndpoints} endpoints across ${moduleCount} modules. Request/response shapes are extracted from Zod schemas and route handler usage; where a shape could not be statically inferred, a permissive \`object\` is used.`,
      ].join("\n"),
      contact: { name: "Zari Embroideries", email: "admin@example.com" },
    },
    servers: [
      { url: "http://localhost", description: "Local dev (Replit shared proxy on :80)" },
      { url: "https://{host}", description: "Production", variables: { host: { default: "your-app.replit.app" } } },
    ],
    tags,
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths,
  };
}

function cleanSchema(s: JSONSchema): JSONSchema {
  // Strip internal markers and null entries
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k.startsWith("__")) continue;
    if (v === undefined || v === null) continue;
    if (k === "properties" && v && typeof v === "object") {
      out.properties = {};
      for (const [pk, pv] of Object.entries(v as Record<string, JSONSchema>)) {
        out.properties[pk] = cleanSchema(pv);
      }
    } else if (k === "items") {
      out.items = cleanSchema(v as JSONSchema);
    } else if (k === "oneOf" || k === "anyOf") {
      out[k] = (v as JSONSchema[]).map(cleanSchema);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ─── Markdown reference ──────────────────────────────────────────────────

function buildMarkdown(endpoints: Endpoint[]): string {
  const byTag = new Map<string, Endpoint[]>();
  for (const e of endpoints) {
    if (!byTag.has(e.tag)) byTag.set(e.tag, []);
    byTag.get(e.tag)!.push(e);
  }
  const tags = Array.from(byTag.keys()).sort();

  const lines: string[] = [];
  lines.push(`# ERP — API Reference`);
  lines.push(``);
  lines.push(`Auto-generated reference for the ERP backend. ${endpoints.length} endpoints across ${byTag.size} modules.`);
  lines.push(``);
  lines.push(`## Authentication`);
  lines.push(``);
  lines.push(`Most endpoints require a Bearer JWT. Obtain one from \`POST /api/auth/login\` and send it as:`);
  lines.push(``);
  lines.push("```");
  lines.push(`Authorization: Bearer <token>`);
  lines.push("```");
  lines.push(``);
  lines.push(`## Table of Contents`);
  lines.push(``);
  for (const t of tags) {
    const anchor = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    lines.push(`- [${t}](#${anchor}) (${byTag.get(t)!.length})`);
  }
  lines.push(``);

  for (const t of tags) {
    lines.push(`## ${t}`);
    lines.push(``);
    for (const ep of byTag.get(t)!.sort((a, b) => a.apiPath.localeCompare(b.apiPath) || a.method.localeCompare(b.method))) {
      lines.push(`### \`${ep.method.toUpperCase()} ${ep.apiPath}\``);
      lines.push(``);
      if (ep.requiresAuth) lines.push(`> 🔒 Requires Bearer token`);
      lines.push(``);
      lines.push(`Source: \`${ep.sourceFile}\` (line ${ep.sourceLine})`);
      lines.push(``);
      if (ep.parameters.length) {
        lines.push(`**Parameters:**`);
        lines.push(``);
        lines.push(`| Name | In | Required | Type | Description |`);
        lines.push(`|------|----|----------|------|-------------|`);
        for (const p of ep.parameters) {
          lines.push(`| \`${p.name}\` | ${p.in} | ${p.required ? "yes" : "no"} | ${schemaTypeLabel(p.schema)} | ${p.description ?? ""} |`);
        }
        lines.push(``);
      }
      if (ep.requestBody) {
        lines.push(`**Request body** (\`application/json\`):`);
        lines.push(``);
        lines.push("```json");
        lines.push(JSON.stringify(cleanSchema(ep.requestBody.schema), null, 2));
        lines.push("```");
        if (ep.requestBody.description) {
          lines.push(``);
          lines.push(`_${ep.requestBody.description}_`);
        }
        lines.push(``);
      }
      lines.push(`**Responses:**`);
      lines.push(``);
      for (const r of ep.responses) {
        lines.push(`- **${r.status}** — ${r.description}`);
        if (r.schema && Object.keys(r.schema).length) {
          lines.push(``);
          lines.push("  ```json");
          lines.push("  " + JSON.stringify(cleanSchema(r.schema), null, 2).split("\n").join("\n  "));
          lines.push("  ```");
        }
      }
      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }
  }
  return lines.join("\n");
}

function schemaTypeLabel(s: JSONSchema): string {
  if (s.enum) return `enum (${s.enum.join("|")})`;
  if (Array.isArray(s.type)) return s.type.join(" \\| ");
  return s.type ?? "any";
}

// ─── Postman collection ──────────────────────────────────────────────────

function buildPostman(endpoints: Endpoint[]) {
  const byTag = new Map<string, Endpoint[]>();
  for (const e of endpoints) {
    if (!byTag.has(e.tag)) byTag.set(e.tag, []);
    byTag.get(e.tag)!.push(e);
  }
  const tags = Array.from(byTag.keys()).sort();

  return {
    info: {
      name: "ERP API",
      description: `Auto-generated Postman collection. ${endpoints.length} endpoints across ${byTag.size} modules.`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    auth: {
      type: "bearer",
      bearer: [{ key: "token", value: "{{token}}", type: "string" }],
    },
    variable: [
      { key: "baseUrl", value: "http://localhost", type: "string" },
      { key: "token", value: "", type: "string" },
    ],
    item: tags.map(t => ({
      name: t,
      item: byTag.get(t)!.map(ep => {
        const urlParts = ep.apiPath.split("/").filter(Boolean);
        return {
          name: `${ep.method.toUpperCase()} ${ep.apiPath}`,
          request: {
            method: ep.method.toUpperCase(),
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: `{{baseUrl}}${ep.apiPath}`,
              host: ["{{baseUrl}}"],
              path: urlParts,
              query: ep.parameters.filter(p => p.in === "query").map(p => ({ key: p.name, value: "", disabled: true })),
              variable: ep.parameters.filter(p => p.in === "path").map(p => ({ key: p.name, value: "" })),
            },
            body: ep.requestBody ? {
              mode: "raw",
              raw: JSON.stringify(exampleFromSchema(ep.requestBody.schema), null, 2),
              options: { raw: { language: "json" } },
            } : undefined,
            description: ep.description,
          },
          response: [],
        };
      }),
    })),
  };
}

function exampleFromSchema(s: JSONSchema): any {
  if (s.example !== undefined) return s.example;
  if (s.const !== undefined) return s.const;
  if (s.enum && s.enum.length) return s.enum[0];
  if (s.type === "string") return s.format === "date-time" ? new Date().toISOString() : s.format === "email" ? "user@example.com" : "string";
  if (s.type === "number" || s.type === "integer") return 0;
  if (s.type === "boolean") return false;
  if (s.type === "array") return [s.items ? exampleFromSchema(s.items) : null];
  if (s.type === "object" || s.properties) {
    const o: any = {};
    for (const [k, v] of Object.entries(s.properties ?? {})) o[k] = exampleFromSchema(v);
    return o;
  }
  return null;
}

// ─── Redoc HTML wrapper ──────────────────────────────────────────────────

function buildRedocHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ERP API — Reference</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
    #redoc-container { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="redoc-container">Loading API reference…</div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    (async function () {
      try {
        const specUrl = new URL('openapi.json', window.location.href).toString();
        // When served from /api/docs the spec lives at /api/docs/openapi.json with the same ?n= nonce.
        const params = window.location.search;
        const specWithAuth = window.location.pathname.includes('/api/docs')
          ? '/api/docs/openapi.json' + params
          : specUrl;
        Redoc.init(specWithAuth, {
          theme: {
            colors: { primary: { main: '#C6AF4B' } },
            typography: { fontFamily: "'Inter', system-ui, sans-serif" },
            sidebar: { backgroundColor: '#0b0b0b', textColor: '#C6AF4B' },
            rightPanel: { backgroundColor: '#111111' },
          },
          hideDownloadButton: false,
          expandResponses: '200,201',
          jsonSampleExpandLevel: 2,
          requiredPropsFirst: true,
          pathInMiddlePanel: true,
        }, document.getElementById('redoc-container'));
      } catch (err) {
        document.getElementById('redoc-container').innerHTML =
          '<div style="padding:40px;color:#b00">Failed to load API spec: ' + (err && err.message) + '</div>';
      }
    })();
  </script>
</body>
</html>`;
}

// ─── Zip bundle ──────────────────────────────────────────────────────────

function buildZipBundle() {
  const files = [
    "ERP_API.md",
    "ERP_API.openapi.json",
    "ERP_API.openapi.yaml",
    "ERP_API.postman_collection.json",
    "ERP_API_docs.html",
  ];
  const py = `import zipfile
with zipfile.ZipFile('ERP_API_docs.zip','w',zipfile.ZIP_DEFLATED) as z:
${files.map(f => `  z.write('${f}')`).join("\n")}`;
  execSync(`cd ${EXPORTS_DIR} && python3 -c "${py.replace(/"/g, '\\"')}"`);
}

// ─── Main ────────────────────────────────────────────────────────────────

let SHARED_SCHEMAS: Map<string, ts.Expression> = new Map();

function main() {
  console.log("→ Indexing shared Zod schemas (lib/db, lib/api-zod)…");
  SHARED_SCHEMAS = indexSharedSchemas();
  console.log(`  Indexed ${SHARED_SCHEMAS.size} shared schemas.`);

  console.log("→ Scanning routes…");
  const endpoints = extractEndpoints();
  console.log(`  Found ${endpoints.length} endpoints in ${new Set(endpoints.map(e => e.sourceFile)).size} files.`);

  const withBody = endpoints.filter(e => e.requestBody && e.requestBody.schema.properties && Object.keys(e.requestBody.schema.properties).length).length;
  const withResp = endpoints.filter(e => e.responses.some(r => r.schema && r.schema.properties && Object.keys(r.schema.properties).length)).length;
  console.log(`  ${withBody} endpoints have inferred request body fields`);
  console.log(`  ${withResp} endpoints have inferred response shapes`);

  const oas = buildOpenApi(endpoints);

  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

  console.log("→ Writing OpenAPI YAML/JSON…");
  fs.writeFileSync(path.join(EXPORTS_DIR, "ERP_API.openapi.yaml"), yaml.dump(oas, { lineWidth: 120, noRefs: true }));
  fs.writeFileSync(path.join(EXPORTS_DIR, "ERP_API.openapi.json"), JSON.stringify(oas, null, 2));

  console.log("→ Writing Markdown reference…");
  fs.writeFileSync(path.join(EXPORTS_DIR, "ERP_API.md"), buildMarkdown(endpoints));

  console.log("→ Writing Postman collection…");
  fs.writeFileSync(path.join(EXPORTS_DIR, "ERP_API.postman_collection.json"), JSON.stringify(buildPostman(endpoints), null, 2));

  console.log("→ Writing Redoc HTML wrapper…");
  fs.writeFileSync(path.join(EXPORTS_DIR, "ERP_API_docs.html"), buildRedocHtml());

  console.log("→ Bundling ZIP…");
  buildZipBundle();

  console.log("✓ Done.");
}

main();
