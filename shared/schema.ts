import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Существующие таблицы остаются без изменений
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  email: text("email"),
  phone: text("phone"),
  avatar_url: text("avatar_url"),
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

// Добавляем новую таблицу clients
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull().default("new"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  callId: integer("call_id").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  duration: integer("duration").notNull().default(0),
  transcription: text("transcription"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Существующие схемы insertUser, insertContact, insertCall
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  companyName: true,
  email: true,
  phone: true,
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

// Добавляем схему для создания клиентов
export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  source: true,
  status: true,
  phone: true,
  email: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type Client = typeof clients.$inferSelect;