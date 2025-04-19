import { pgTable, serial, integer, varchar, boolean, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  companyName: text('company_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  name: text('name'),
  avatar_url: text('avatar_url'),
  avatar_position: jsonb('avatar_position'),
  avatar_size: integer('avatar_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const telephonySettings = pgTable("telephony_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  incomingRouting: varchar("incoming_routing", { length: 50 }).notNull(),
  incomingGreeting: text("incoming_greeting").notNull(),
  incomingWaitTime: integer("incoming_wait_time").notNull(),
  outgoingPhone: varchar("outgoing_phone", { length: 50 }).notNull(),
  recordCalls: boolean("record_calls").default(true),
  analyzeConversations: boolean("analyze_conversations").default(true),
  transcriptionEnabled: boolean("transcription_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Пример использования sql
// const query = sql`SELECT * FROM users WHERE id = ${userId}`;
