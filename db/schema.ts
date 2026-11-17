import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const registry = sqliteTable("registry", {
  id: integer("id").primaryKey(),
  revision: integer("revision").notNull(),
  data: text("data").notNull(),
});
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  role: text("role").notNull(),
  expires: integer("expires").notNull(),
});
