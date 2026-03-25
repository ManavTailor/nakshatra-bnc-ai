import { pgTable, uuid, text, json, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const designs = pgTable("designs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id), // Can be null if guest
  rawClothImageUrl: text("raw_cloth_image_url").notNull(),
  garmentType: text("garment_type").notNull(),
  generatedImageUrls: json("generated_image_urls").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
