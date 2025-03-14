import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  mttApiKey: text("mtt_api_key"),
  mttPhoneNumber: text("mtt_phone_number"),
  amocrmDomain: text("amocrm_domain"),
  amocrmAccessToken: text("amocrm_access_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contactId: integer("contact_id").notNull(),
  status: text("status").notNull(),
  duration: integer("duration"),
  transcript: text("transcript"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  aiSummary: json("ai_summary").$type<{
    sentiment: string;
    nextActions: string[];
    keywords: string[];
  }>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  companyName: true,
  mttApiKey: true,
  mttPhoneNumber: true,
  amocrmDomain: true,
  amocrmAccessToken: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  phone: true,
  email: true,
  notes: true,
});

export const insertCallSchema = createInsertSchema(calls).pick({
  contactId: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;

export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Call = typeof calls.$inferSelect;