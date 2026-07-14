import { db, clientsTable, eq, sql } from "@workspace/db";


const IDENTIFIERS = {
  swatch_orders: "ZSWA",
  style_orders: "ZSTY",
  quotations: "ZQUO",
} as const;

export async function generateOrderCode(
  clientId: number,
  table: keyof typeof IDENTIFIERS,
  codeColumn: string,
  client?: any
): Promise<string> {
  // Fetch client's custom code
  const [clientRow] = await db
    .select({
      customClientCode: clientsTable.customClientCode,
    })
    .from(clientsTable)
    .where(eq(clientsTable.id, clientId));

  if (!clientRow?.customClientCode) {
    throw new Error("Client does not have a Custom Client Code.");
  }

  const prefix = `${clientRow.customClientCode}-${IDENTIFIERS[table]}-`;

  let lastCode: string | null = null;

  if (client) {
    // Uses same transaction
    const result = await client.query(
      `
      SELECT ${codeColumn}
      FROM ${table}
      WHERE ${codeColumn} LIKE $1
      ORDER BY ${codeColumn} DESC
      LIMIT 1
      `,
      [`${prefix}%`]
    );

    lastCode = result.rows[0]?.[codeColumn] ?? null;
  } else {
    // Uses shared drizzle connection
    const result = await db.execute(sql.raw(`
      SELECT ${codeColumn}
      FROM ${table}
      WHERE ${codeColumn} LIKE '${prefix}%'
      ORDER BY ${codeColumn} DESC
      LIMIT 1
    `));

    lastCode = (result.rows[0] as any)?.[codeColumn] ?? null;
  }

  if (!lastCode) {
    return `${prefix}0001`;
  }

  const seq = parseInt(lastCode.replace(prefix, ""), 10) + 1;

  return `${prefix}${String(seq).padStart(4, "0")}`;
}