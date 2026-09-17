import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["FARMER", "OFFICER", "ADMIN"]);
export const severityEnum = pgEnum("severity_level", ["LOW", "MEDIUM", "HIGH"]);
export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  regionName: varchar("region_name", { length: 120 }).notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  password: varchar("password", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: userRoleEnum("role").notNull().default("FARMER"),
  regionId: integer("region_id").references(() => regions.id),
});

export const pests = pgTable("pests", {
  id: serial("id").primaryKey(),
  pestName: varchar("pest_name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  symptoms: text("symptoms").notNull(),
  treatmentGuide: text("treatment_guide").notNull(),
  imageGuideUrl: text("image_guide_url"),
  severityLevel: severityEnum("severity_level").notNull().default("MEDIUM"),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  pestId: integer("pest_id")
    .notNull()
    .references(() => pests.id),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  photoUrl: text("photo_url"),
  additionalNote: text("additional_note"),
  status: reportStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
