import { pgTable, serial, integer, varchar, timestamp, unique} from "drizzle-orm/pg-core";

export const entityTagsTable = pgTable("entity_tags",{
    id: serial("id").primaryKey(),
    entityType: varchar("entity_type", { length: 20 }).notNull(),
    entityId: integer("entity_id").notNull(),
    tag: varchar("tag", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    entityTagUnique: unique().on(
      table.entityType,
      table.entityId,
      table.tag
    ),
  })
);