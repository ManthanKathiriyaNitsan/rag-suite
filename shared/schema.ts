import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Integrations schema
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  publicId: text("public_id").notNull().unique(),
  status: text("status").notNull().default("active"), // active, paused, archived
  ownerId: varchar("owner_id").references(() => users.id),
  tags: text("tags").array().default([]),
  
  // Configuration (stored as JSON)
  config: jsonb("config").notNull().default({}),
  theme: jsonb("theme").default({}),
  
  // Environments
  environments: text("environments").array().default([]), // staging, production
  
  // Analytics
  queriesLast7d: integer("queries_last_7d").default(0),
  queriesLast30d: integer("queries_last_30d").default(0),
  errorsLast7d: integer("errors_last_7d").default(0),
  errorsLast30d: integer("errors_last_30d").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastPublish: timestamp("last_publish"),
});

export const integrationKeys = pgTable("integration_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(), // Store hashed key for security
  environment: text("environment").notNull(), // staging, production
  rateLimit: integer("rate_limit").default(1000),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationDomains = pgTable("integration_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  origin: text("origin").notNull(),
  cspHelper: text("csp_helper"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const integrationWebhooks = pgTable("integration_webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  environment: text("environment").notNull(),
  secretHash: text("secret_hash").notNull(), // Store hashed secret for security
  events: text("events").array().notNull(),
  isActive: boolean("is_active").default(true),
  lastDelivery: timestamp("last_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationVersions = pgTable("integration_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  config: jsonb("config").notNull(),
  theme: jsonb("theme"),
  status: text("status").notNull().default("draft"), // draft, live
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueVersionPerIntegration: sql`UNIQUE (integration_id, version)`,
}));

export const integrationEventLogs = pgTable("integration_event_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // answer.created, search.performed, etc.
  payload: jsonb("payload").notNull(),
  sessionId: text("session_id"),
  environment: text("environment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationPermissions = pgTable("integration_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // viewer, config, admin
  grantedAt: timestamp("granted_at").defaultNow(),
  grantedBy: varchar("granted_by").references(() => users.id),
});

export const integrationVariants = pgTable("integration_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // A, B, C or custom names
  configVersionId: varchar("config_version_id").references(() => integrationVersions.id),
  trafficWeight: integer("traffic_weight").default(0), // 0-100
  isCanary: boolean("is_canary").default(false),
  canaryPercentage: integer("canary_percentage").default(0),
  isActive: boolean("is_active").default(true),
  metrics: jsonb("metrics").default({}), // Store performance metrics
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationAuditLogs = pgTable("integration_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // key_create, key_rotate, domain_add, config_publish, etc.
  details: jsonb("details"),
  performedBy: varchar("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").defaultNow(),
});

// Integration schemas
export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  queriesLast7d: true,
  queriesLast30d: true,
  errorsLast7d: true,
  errorsLast30d: true,
  lastPublish: true,
}).extend({
  publicId: z.string().min(1, "Public ID is required"),
});

export const insertIntegrationKeySchema = createInsertSchema(integrationKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
  keyHash: true,
});

export const insertIntegrationDomainSchema = createInsertSchema(integrationDomains).omit({
  id: true,
  addedAt: true,
});

export const insertIntegrationWebhookSchema = createInsertSchema(integrationWebhooks).omit({
  id: true,
  createdAt: true,
  lastDelivery: true,
  secretHash: true,
});

export const insertIntegrationVariantSchema = createInsertSchema(integrationVariants).omit({
  id: true,
  createdAt: true,
}).extend({
  trafficWeight: z.number().min(0).max(100).optional(),
  canaryPercentage: z.number().min(0).max(100).optional(),
});

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegrationKey = z.infer<typeof insertIntegrationKeySchema>;
export type IntegrationKey = typeof integrationKeys.$inferSelect;
export type InsertIntegrationDomain = z.infer<typeof insertIntegrationDomainSchema>;
export type IntegrationDomain = typeof integrationDomains.$inferSelect;
export type InsertIntegrationWebhook = z.infer<typeof insertIntegrationWebhookSchema>;
export type IntegrationWebhook = typeof integrationWebhooks.$inferSelect;
export type InsertIntegrationVariant = z.infer<typeof insertIntegrationVariantSchema>;
export type IntegrationVariant = typeof integrationVariants.$inferSelect;
export type IntegrationVersion = typeof integrationVersions.$inferSelect;
export type IntegrationEventLog = typeof integrationEventLogs.$inferSelect;
export type IntegrationPermission = typeof integrationPermissions.$inferSelect;
export type IntegrationAuditLog = typeof integrationAuditLogs.$inferSelect;
