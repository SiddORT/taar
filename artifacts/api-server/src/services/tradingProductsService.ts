import { db, eq, and, ilike, sql, desc, inArray } from "@workspace/db";
import {
  tradingProducts,
  tradingProductImages,
  tradingProductColors,
  tradingProductSizes,
  styleCategoriesTable,
  entityTagsTable,
  usersTable,
  type InsertTradingProduct,
  type UpdateTradingProduct,
} from "@workspace/db";
import { uploadFile, deleteUpload, type UploadOptions } from "../utils/uploadHelper";

const ENTITY_TYPE = "trading_product";

// ─── Type Inference ───────────────────────────────────────────────────────────
type TradingProductImageRow = typeof tradingProductImages.$inferSelect;
type TradingProductColorRow = typeof tradingProductColors.$inferSelect;
type TradingProductSizeRow = typeof tradingProductSizes.$inferSelect;
type EntityTagRow = typeof entityTagsTable.$inferSelect;
type StyleCategoryRow = typeof styleCategoriesTable.$inferSelect;

export interface UserSummary {
  id: number;
  username: string;
  email: string;
}

// ─── Generate Product Code ────────────────────────────────────────────────────
export async function generateProductCode(): Promise<string> {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(today.getMonth() + 1).padStart(2, "0")}${today.getFullYear()}`;
  const prefix = `PROD-${dateStr}-`;

  const last = await db
    .select({ productCode: tradingProducts.productCode })
    .from(tradingProducts)
    .where(ilike(tradingProducts.productCode, `${prefix}%`))
    .orderBy(desc(tradingProducts.productCode))
    .limit(1);

  const nextNum = last.length > 0
    ? parseInt(last[0].productCode.split("-").pop() || "0", 10) + 1
    : 1;

  return `${prefix}${String(nextNum).padStart(2, "0")}`;
}

// ─── Load User Summaries ──────────────────────────────────────────────────────
async function loadUsers(ids: (number | null | undefined)[]): Promise<Map<number, UserSummary>> {
  const validIds = [...new Set(ids.filter((id): id is number => id != null))];
  if (validIds.length === 0) return new Map();

  const rows = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(inArray(usersTable.id, validIds));

  return new Map(rows.map(u => [u.id, u]));
}

// ─── Sync sizes into trading_product_sizes ────────────────────────────────────
export async function syncProductSizes(
  tx: any,
  input:
    | Array<{ productId: string | number; size?: string | null }>
    | { productId: string | number; sizes?: string[] }
): Promise<void> {
  // ── 1. Normalize input to a flat list of (productId, size) pairs ──
  const pairs = new Map<string, { productId: number; size: string }>();

  if (Array.isArray(input)) {
    for (const it of input) {
      const pid = Number(it.productId);
      const size = (it.size ?? "").trim();
      if (!pid || !size) continue;
      const key = `${pid}::${size}`;
      if (!pairs.has(key)) pairs.set(key, { productId: pid, size });
    }
  } else {
    const pid = Number(input.productId);
    if (pid && Array.isArray(input.sizes)) {
      for (const raw of input.sizes) {
        const size = (raw ?? "").trim();
        if (!size) continue;
        const key = `${pid}::${size}`;
        if (!pairs.has(key)) pairs.set(key, { productId: pid, size });
      }
    }
  }

  if (pairs.size === 0) return;

  const productIds = [...new Set([...pairs.values()].map(p => p.productId))];

  // ── 2. Load existing sizes for these products (single query) ──
  const existing = await tx
    .select({
      productId: tradingProductSizes.productId,
      sizeLabel: tradingProductSizes.sizeLabel,
      sortOrder: tradingProductSizes.sortOrder,
    })
    .from(tradingProductSizes)
    .where(inArray(tradingProductSizes.productId, productIds));

  const existingKeys = new Set(
    existing.map((r: any) => `${r.productId}::${r.sizeLabel}`)
  );

  // ── 3. Compute next sortOrder per product ──
  const nextSort = new Map<number, number>();
  for (const r of existing) {
    const cur = nextSort.get(r.productId) ?? 0;
    nextSort.set(r.productId, Math.max(cur, (r.sortOrder ?? 0) + 1));
  }

  // ── 4. Build list of new rows to insert ──
  const toInsert: Array<{ productId: number; sizeLabel: string; sortOrder: number }> = [];
  const productsThatGotNewSizes = new Set<number>();

  for (const { productId, size } of pairs.values()) {
    const key = `${productId}::${size}`;
    if (existingKeys.has(key)) continue;

    const order = nextSort.get(productId) ?? 0;
    toInsert.push({ productId, sizeLabel: size, sortOrder: order });
    nextSort.set(productId, order + 1);
    productsThatGotNewSizes.add(productId);
  }

  // ── 5. Bulk insert new sizes + flip hasSizes on affected products ──
  if (toInsert.length > 0) {
    await tx.insert(tradingProductSizes).values(toInsert);

    const idsToUpdate = [...productsThatGotNewSizes];
    if (idsToUpdate.length > 0) {
      await tx
        .update(tradingProducts)
        .set({ hasSizes: true })
        .where(
          and(
            inArray(tradingProducts.id, idsToUpdate),
            eq(tradingProducts.hasSizes, false)   
          )
        );
    }
  }
}

// ─── List ─────────────────────────────────────────────────────────────────────
export async function listTradingProducts(params: {
  search: string;
  status: "all" | "active" | "inactive";
  categoryId?: number;
  tag?: string;
  colorName?: string;
  sizeLabel?: string;
  page: number;
  limit: number;
}) {
  const { search, status, categoryId, tag, colorName, sizeLabel, page, limit } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(tradingProducts.isDeleted, false)];

  if (search) {
    conditions.push(
      sql`(${tradingProducts.productName} ILIKE ${"%" + search + "%"} OR ${tradingProducts.productCode} ILIKE ${"%" + search + "%"})`
    );
  }
  if (status === "active") conditions.push(eq(tradingProducts.isActive, true));
  if (status === "inactive") conditions.push(eq(tradingProducts.isActive, false));
  if (categoryId) conditions.push(eq(tradingProducts.category, categoryId));

  if (tag) {
    const taggedIds = await db
      .select({ entityId: entityTagsTable.entityId })
      .from(entityTagsTable)
      .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), eq(entityTagsTable.tag, tag)));
    const ids = taggedIds.map(t => t.entityId);
    if (ids.length === 0) return { data: [], total: 0, page, limit };
    conditions.push(inArray(tradingProducts.id, ids));
  }

  if (colorName) {
    const matching = await db
      .select({ productId: tradingProductColors.productId })
      .from(tradingProductColors)
      .where(eq(tradingProductColors.colorName, colorName));
    const ids = matching.map(r => r.productId);
    if (ids.length === 0) return { data: [], total: 0, page, limit };
    conditions.push(inArray(tradingProducts.id, ids));
  }

  if (sizeLabel) {
    const matching = await db
      .select({ productId: tradingProductSizes.productId })
      .from(tradingProductSizes)
      .where(eq(tradingProductSizes.sizeLabel, sizeLabel));
    const ids = matching.map(r => r.productId);
    if (ids.length === 0) return { data: [], total: 0, page, limit };
    conditions.push(inArray(tradingProducts.id, ids));
  }

  const where = and(...conditions);

  const [rows, countResult] = await Promise.all([
    db.select().from(tradingProducts).where(where).limit(limit).offset(offset).orderBy(desc(tradingProducts.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(tradingProducts).where(where),
  ]);

  if (rows.length === 0) {
    return { data: [], total: Number(countResult[0]?.count ?? 0), page, limit };
  }

  const productIds = rows.map(r => r.id);
  const categoryIds = [...new Set(rows.map(r => r.category))];
  const userIds = rows.flatMap(r => [r.createdBy, r.updatedBy]);

  let categories: StyleCategoryRow[] = [];
  let tags: EntityTagRow[] = [];
  let images: TradingProductImageRow[] = [];
  let colorRows: TradingProductColorRow[] = [];
  let sizeRows: TradingProductSizeRow[] = [];

  if (categoryIds.length > 0) {
    categories = await db.select().from(styleCategoriesTable).where(inArray(styleCategoriesTable.id, categoryIds));
  }

  if (productIds.length > 0) {
    [tags, images, colorRows, sizeRows] = await Promise.all([
      db.select().from(entityTagsTable)
        .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), inArray(entityTagsTable.entityId, productIds))),
      db.select().from(tradingProductImages)
        .where(inArray(tradingProductImages.productId, productIds)),
      db.select().from(tradingProductColors)
        .where(inArray(tradingProductColors.productId, productIds)),
      db.select().from(tradingProductSizes)
        .where(inArray(tradingProductSizes.productId, productIds)),
    ]);
  }

  const userMap = await loadUsers(userIds);

  const catMap = new Map(categories.map(c => [c.id, c.categoryName]));
  const tagMap = new Map<number, string[]>();
  tags.forEach(t => {
    if (!tagMap.has(t.entityId)) tagMap.set(t.entityId, []);
    tagMap.get(t.entityId)!.push(t.tag);
  });
  const imgMap = new Map<number, TradingProductImageRow[]>();
  images.forEach(img => {
    if (!imgMap.has(img.productId)) imgMap.set(img.productId, []);
    imgMap.get(img.productId)!.push(img);
  });
  const colorMap = new Map<number, TradingProductColorRow[]>();
  colorRows.forEach(c => {
    if (!colorMap.has(c.productId)) colorMap.set(c.productId, []);
    colorMap.get(c.productId)!.push(c);
  });
  const sizeMap = new Map<number, TradingProductSizeRow[]>();
  sizeRows.forEach(s => {
    if (!sizeMap.has(s.productId)) sizeMap.set(s.productId, []);
    sizeMap.get(s.productId)!.push(s);
  });

  const data = rows.map(r => ({
    ...r,
    categoryName: catMap.get(r.category) ?? "—",
    tags: tagMap.get(r.id) ?? [],
    images: (imgMap.get(r.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    colors: (colorMap.get(r.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({ colorName: c.colorName, hexCode: c.hexCode })),
    sizes: (sizeMap.get(r.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(s => s.sizeLabel),
    createdByUser: userMap.get(r.createdBy) ?? null,
    updatedByUser: r.updatedBy ? userMap.get(r.updatedBy) ?? null : null,
  }));

  return { data, total: Number(countResult[0]?.count ?? 0), page, limit };
}

// ─── Get By ID ────────────────────────────────────────────────────────────────
export async function getTradingProductById(id: number) {
  const [product] = await db
    .select()
    .from(tradingProducts)
    .where(and(eq(tradingProducts.id, id), eq(tradingProducts.isDeleted, false)))
    .limit(1);

  if (!product) return null;

  const [category] = await db
    .select()
    .from(styleCategoriesTable)
    .where(eq(styleCategoriesTable.id, product.category))
    .limit(1);

  const [tags, images, colors, sizes] = await Promise.all([
    db.select().from(entityTagsTable)
      .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), eq(entityTagsTable.entityId, id))),
    db.select().from(tradingProductImages).where(eq(tradingProductImages.productId, id)),
    db.select().from(tradingProductColors).where(eq(tradingProductColors.productId, id)),
    db.select().from(tradingProductSizes).where(eq(tradingProductSizes.productId, id)),
  ]);

  const userMap = await loadUsers([product.createdBy, product.updatedBy]);

  return {
    ...product,
    categoryName: category?.categoryName ?? null,
    tags: tags.map(t => t.tag),
    images: images.sort((a, b) => a.sortOrder - b.sortOrder),
    colors: colors.sort((a, b) => a.sortOrder - b.sortOrder).map(c => ({ colorName: c.colorName, hexCode: c.hexCode })),
    sizes: sizes.sort((a, b) => a.sortOrder - b.sortOrder).map(s => s.sizeLabel),
    createdByUser: userMap.get(product.createdBy) ?? null,
    updatedByUser: product.updatedBy ? userMap.get(product.updatedBy) ?? null : null,
  };
}

// ─── Create (Transactional) ───────────────────────────────────────────────────
export async function createTradingProduct(
  input: InsertTradingProduct & {
    productCode?: string;
    images?: Array<{ imagePath: string; originalName?: string }>;
  },
  createdBy: number
) {
  const productCode = input.productCode || (await generateProductCode());

  return await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(tradingProducts)
      .values({
        productCode,
        productName: input.productName,
        category: input.category,
        description: input.description ?? null,
        hsnCode: input.hsnCode ?? null,
        gstPercentage: input.gstPercentage ?? null,
        isActive: input.isActive ?? true,
        hasColors: input.hasColors ?? false,
        hasSizes: input.hasSizes ?? false,
        createdBy,
      })
      .returning();

    if (input.tags && input.tags.length > 0) {
      await tx.insert(entityTagsTable).values(
        input.tags.map(tag => ({ entityType: ENTITY_TYPE, entityId: product.id, tag }))
      );
    }

    if (input.images && input.images.length > 0) {
      await tx.insert(tradingProductImages).values(
        input.images.map((img, i) => ({
          productId: product.id,
          imagePath: img.imagePath,
          originalName: img.originalName ?? null,
          isPrimary: i === 0,
          sortOrder: i,
          createdBy,
        }))
      );
    }

    if (input.hasColors && input.colors && input.colors.length > 0) {
      await tx.insert(tradingProductColors).values(
        input.colors.map((c, i) => ({
          productId: product.id,
          colorName: c.colorName.trim(),
          hexCode: c.hexCode.trim(),
          sortOrder: i,
        }))
      );
    }

    if (input.hasSizes && input.sizes && input.sizes.length > 0) {
      await tx.insert(tradingProductSizes).values(
        input.sizes.map((s, i) => ({
          productId: product.id,
          sizeLabel: s.trim(),
          sortOrder: i,
        }))
      );
    }

    return product;
  });
}

// ─── Update (Transactional) ───────────────────────────────────────────────────
export async function updateTradingProduct(
  id: number,
  input: UpdateTradingProduct & {
    images?: Array<{ imagePath: string; originalName?: string }>;
  },
  updatedBy: number
) {
  const { tags, images, colors, sizes, ...fields } = input;

  let removedImagePaths: string[] = [];

  const updatedProduct = await db.transaction(async (tx) => {
    const currentImages = await tx
      .select()
      .from(tradingProductImages)
      .where(eq(tradingProductImages.productId, id));

    const [product] = await tx
      .update(tradingProducts)
      .set({ ...fields, updatedBy, updatedAt: new Date() })
      .where(eq(tradingProducts.id, id))
      .returning();

    if (!product) return null;

    if (tags !== undefined) {
      await tx.delete(entityTagsTable)
        .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), eq(entityTagsTable.entityId, id)));
      if (tags.length > 0) {
        await tx.insert(entityTagsTable).values(
          tags.map(tag => ({ entityType: ENTITY_TYPE, entityId: id, tag }))
        );
      }
    }

    if (images !== undefined) {
      const newPaths = new Set(images.map(i => i.imagePath));
      removedImagePaths = currentImages
        .filter(img => !newPaths.has(img.imagePath))
        .map(img => img.imagePath);

      await tx.delete(tradingProductImages).where(eq(tradingProductImages.productId, id));

      if (images.length > 0) {
        await tx.insert(tradingProductImages).values(
          images.map((img, i) => ({
            productId: id,
            imagePath: img.imagePath,
            originalName: img.originalName ?? null,
            isPrimary: i === 0,
            sortOrder: i,
            createdBy: updatedBy,
          }))
        );
      }
    }

    if (colors !== undefined || fields.hasColors !== undefined) {
      await tx.delete(tradingProductColors).where(eq(tradingProductColors.productId, id));

      const shouldWriteColors = (fields.hasColors ?? product.hasColors) && colors && colors.length > 0;
      if (shouldWriteColors) {
        await tx.insert(tradingProductColors).values(
          colors!.map((c, i) => ({
            productId: id,
            colorName: c.colorName.trim(),
            hexCode: c.hexCode.trim(),
            sortOrder: i,
          }))
        );
      }
    }

    if (sizes !== undefined || fields.hasSizes !== undefined) {
      await tx.delete(tradingProductSizes).where(eq(tradingProductSizes.productId, id));

      const shouldWriteSizes = (fields.hasSizes ?? product.hasSizes) && sizes && sizes.length > 0;
      if (shouldWriteSizes) {
        await tx.insert(tradingProductSizes).values(
          sizes!.map((s, i) => ({
            productId: id,
            sizeLabel: s.trim(),
            sortOrder: i,
          }))
        );
      }
    }

    return product;
  });

  if (!updatedProduct) return null;

  if (removedImagePaths.length > 0) {
    await Promise.all(removedImagePaths.map(p => deleteUpload(p).catch(() => undefined)));
  }

  return updatedProduct;
}

// ─── Upload Image ─────────────────────────────────────────────────────────────
export async function uploadProductImage(
  file: Express.Multer.File,
  productIdentifier: number | string
): Promise<string> {
  const opts: UploadOptions = {
    entity: "trading-products",
    id: productIdentifier,
    category: "images",
  };
  return await uploadFile(file, opts);
}

// ─── Toggle Status ────────────────────────────────────────────────────────────
export async function toggleTradingProductStatus(id: number, updatedBy: number) {
  const [current] = await db
    .select()
    .from(tradingProducts)
    .where(eq(tradingProducts.id, id))
    .limit(1);
  if (!current) return null;

  const [updated] = await db
    .update(tradingProducts)
    .set({ isActive: !current.isActive, updatedBy, updatedAt: new Date() })
    .where(eq(tradingProducts.id, id))
    .returning();
  return updated;
}

// ─── Delete (Soft) ────────────────────────────────────────────────────────────
export async function deleteTradingProduct(id: number, deletedBy: number) {
  const currentImages = await db
    .select()
    .from(tradingProductImages)
    .where(eq(tradingProductImages.productId, id));

  const deleted = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(tradingProducts)
      .set({ isDeleted: true, deletedBy, deletedAt: new Date() })
      .where(eq(tradingProducts.id, id))
      .returning();

    if (!row) return null;

    await tx.delete(entityTagsTable)
      .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), eq(entityTagsTable.entityId, id)));
    await tx.delete(tradingProductImages).where(eq(tradingProductImages.productId, id));
    await tx.delete(tradingProductColors).where(eq(tradingProductColors.productId, id));
    await tx.delete(tradingProductSizes).where(eq(tradingProductSizes.productId, id));

    return row;
  });

  if (deleted && currentImages.length > 0) {
    await Promise.all(currentImages.map(img => deleteUpload(img.imagePath).catch(() => undefined)));
  }

  return deleted;
}

// ─── Distinct Meta for Filters ────────────────────────────────────────────────
export async function getDistinctColors() {
  const rows = await db
    .selectDistinct({ colorName: tradingProductColors.colorName })
    .from(tradingProductColors);
  return rows.map(r => r.colorName).sort();
}

export async function getDistinctSizes() {
  const rows = await db
    .selectDistinct({ sizeLabel: tradingProductSizes.sizeLabel })
    .from(tradingProductSizes);
  return rows.map(r => r.sizeLabel).sort();
}

// ─── Export All ───────────────────────────────────────────────────────────────
export async function fetchAllTradingProductsForExport(params: {
  search: string;
  status: "all" | "active" | "inactive";
  categoryId?: number;
  colorName?: string;
  sizeLabel?: string;
}) {
  const { search, status, categoryId, colorName, sizeLabel } = params;
  const conditions = [eq(tradingProducts.isDeleted, false)];

  if (search) {
    conditions.push(
      sql`(${tradingProducts.productName} ILIKE ${"%" + search + "%"} OR ${tradingProducts.productCode} ILIKE ${"%" + search + "%"})`
    );
  }
  if (status === "active") conditions.push(eq(tradingProducts.isActive, true));
  if (status === "inactive") conditions.push(eq(tradingProducts.isActive, false));
  if (categoryId) conditions.push(eq(tradingProducts.category, categoryId));

  if (colorName) {
    const matching = await db
      .select({ productId: tradingProductColors.productId })
      .from(tradingProductColors)
      .where(eq(tradingProductColors.colorName, colorName));
    const ids = matching.map(r => r.productId);
    if (ids.length === 0) return [];
    conditions.push(inArray(tradingProducts.id, ids));
  }

  if (sizeLabel) {
    const matching = await db
      .select({ productId: tradingProductSizes.productId })
      .from(tradingProductSizes)
      .where(eq(tradingProductSizes.sizeLabel, sizeLabel));
    const ids = matching.map(r => r.productId);
    if (ids.length === 0) return [];
    conditions.push(inArray(tradingProducts.id, ids));
  }

  const rows = await db
    .select()
    .from(tradingProducts)
    .where(and(...conditions))
    .orderBy(desc(tradingProducts.createdAt));

  if (rows.length === 0) return [];

  const productIds = rows.map(r => r.id);
  const categoryIds = [...new Set(rows.map(r => r.category))];

  const [categories, tags, colorRows, sizeRows, userMap] = await Promise.all([
    categoryIds.length > 0
      ? db.select().from(styleCategoriesTable).where(inArray(styleCategoriesTable.id, categoryIds))
      : Promise.resolve([]),
    db.select().from(entityTagsTable)
      .where(and(eq(entityTagsTable.entityType, ENTITY_TYPE), inArray(entityTagsTable.entityId, productIds))),
    db.select().from(tradingProductColors).where(inArray(tradingProductColors.productId, productIds)),
    db.select().from(tradingProductSizes).where(inArray(tradingProductSizes.productId, productIds)),
    loadUsers(rows.flatMap(r => [r.createdBy, r.updatedBy, r.deletedBy])),
  ]);

  const catMap = new Map(categories.map(c => [c.id, c.categoryName]));
  const tagMap = new Map<number, string[]>();
  tags.forEach(t => {
    if (!tagMap.has(t.entityId)) tagMap.set(t.entityId, []);
    tagMap.get(t.entityId)!.push(t.tag);
  });
  const colorMap = new Map<number, typeof colorRows>();
  colorRows.forEach(c => {
    if (!colorMap.has(c.productId)) colorMap.set(c.productId, []);
    colorMap.get(c.productId)!.push(c);
  });
  const sizeMap = new Map<number, typeof sizeRows>();
  sizeRows.forEach(s => {
    if (!sizeMap.has(s.productId)) sizeMap.set(s.productId, []);
    sizeMap.get(s.productId)!.push(s);
  });

  return rows.map(r => ({
    ...r,
    categoryName: catMap.get(r.category) ?? null,
    tags: tagMap.get(r.id) ?? [],
    colors: (colorMap.get(r.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({ colorName: c.colorName, hexCode: c.hexCode })),
    sizes: (sizeMap.get(r.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(s => s.sizeLabel),
    createdByUser: userMap.get(r.createdBy) ?? null,
    updatedByUser: r.updatedBy ? userMap.get(r.updatedBy) ?? null : null,
    deletedByUser: r.deletedBy ? userMap.get(r.deletedBy) ?? null : null,
  }));
}

// ─── Import ───────────────────────────────────────────────────────────────────
export interface ImportRowResult {
  row: number;
  status: "success" | "error";
  name?: string;
  errors?: string[];
}

export async function importTradingProducts(
  rows: Record<string, unknown>[],
  createdBy: number
) {
  const results = {
    total: rows.length,
    succeeded: 0,
    failed: 0,
    results: [] as ImportRowResult[],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const productName = String(row["Product Name"] ?? row["productName"] ?? "").trim();
    const rowErrors: string[] = [];

    try {
      const categoryName = String(row["Category"] ?? row["category"] ?? "").trim();
      const description = row["Description"] ?? row["description"] ?? null;
      const hsnCode = row["HSN Code"] ?? row["hsnCode"] ?? null;
      const gstPercentage = row["GST %"] ?? row["gstPercentage"] ?? null;
      const statusRaw = String(row["Is Active"] ?? row["isActive"] ?? "Active");

      const hasColors =
        row["Has Colors"] === true ||
        String(row["Has Colors"] ?? "").toLowerCase() === "yes";
      const colors = Array.isArray(row["Colors"])
        ? (row["Colors"] as Array<{ colorName: string; hexCode: string }>)
        : [];

      const hasSizes =
        row["Has Sizes"] === true ||
        String(row["Has Sizes"] ?? "").toLowerCase() === "yes";
      const sizes = Array.isArray(row["Sizes"]) ? (row["Sizes"] as string[]) : [];
      const tags = Array.isArray(row["Tags"]) ? (row["Tags"] as string[]) : [];

      // ── Collect all validation errors for this row ──
      if (!productName) rowErrors.push("Product Name is required");
      if (!categoryName) rowErrors.push("Category is required");

      if (hasColors && colors.length === 0) {
        rowErrors.push('"Has Colors" is Yes but no colors were provided');
      }
      colors.forEach((c, idx) => {
        if (!c.colorName?.trim()) {
          rowErrors.push(`Color #${idx + 1}: name is required`);
        }
        if (!c.hexCode?.match(/^#[0-9A-Fa-f]{6}$/)) {
          rowErrors.push(`Color #${idx + 1}: invalid hex code "${c.hexCode}"`);
        }
      });

      if (hasSizes && sizes.length === 0) {
        rowErrors.push('"Has Sizes" is Yes but no sizes were provided');
      }

      // ── Resolve category ──
      let categoryId: number | null = null;
      if (categoryName) {
        const [cat] = await db
          .select()
          .from(styleCategoriesTable)
          .where(eq(styleCategoriesTable.categoryName, categoryName))
          .limit(1);

        if (!cat) {
          rowErrors.push(`Category "${categoryName}" not found`);
        } else {
          categoryId = cat.id;
        }
      }

      // ── If any errors, record once per row ──
      if (rowErrors.length > 0) {
        results.failed++;
        results.results.push({
          row: i + 2,
          status: "error",
          name: productName || undefined,
          errors: rowErrors,
        });
        continue;
      }

      // ── Valid row: create the product ──
      const isActive = statusRaw.toLowerCase() !== "inactive";

      await createTradingProduct(
        {
          productCode: "",
          productName,
          category: categoryId!,
          description: description ? String(description) : null,
          hsnCode: hsnCode ? String(hsnCode) : null,
          gstPercentage: gstPercentage ? String(gstPercentage) : null,
          isActive,
          tags,
          hasColors,
          colors,
          hasSizes,
          sizes,
          images: [],
        } as any,
        createdBy
      );

      results.succeeded++;
      results.results.push({
        row: i + 2,
        status: "success",
        name: productName,
      });
    } catch (err) {
      results.failed++;
      results.results.push({
        row: i + 2,
        status: "error",
        name: productName || undefined,
        errors: [err instanceof Error ? err.message : "Unknown error"],
      });
    }
  }

  return results;
}