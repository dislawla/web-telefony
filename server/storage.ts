import { InsertUser, User, Contact, InsertContact, Call, InsertCall, Client, InsertClient } from "@shared/schema";
import { db, getPool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { users, contacts, calls, clients } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>; // 👈 Добавлено
  getCalls(userId: number): Promise<Call[]>; // 👈 Добавлено
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  async initializeSessionStore() {
    const pool = await getPool();
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getCalls(userId: number) {
    try {
      console.log("Fetching calls for user:", userId);
      const result = await db
        .select()
        .from(calls)
        .where(eq(calls.userId, userId));

      console.log("Calls fetched:", result);
      return result;
    } catch (error) {
      console.error("Error fetching calls:", error);
      throw error;
    }
  }

  constructor() {
    this.initializeSessionStore();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Getting user by username:', username);
      const [user] = await db.select().from(users).where(eq(users.username, username));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Getting user by id:', id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
        console.log("Creating user:", userData);
        const [newUser] = await db.insert(users).values(userData).returning();
        console.log("User created:", newUser);
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

  async getContacts(userId: number) {
    try {
      console.log("Fetching contacts for user:", userId);
      const result = await db
          .select()
          .from(contacts)
          .where(eq(contacts.userId, userId));

      console.log("Contacts fetched:", result);
      return result;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  async createContact(userId: number, contactData: InsertContact): Promise<Contact> {
    try {
        const [newContact] = await db.insert(contacts)
            .values({ ...contactData, userId })
            .returning();
        return newContact;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
}

  async createCall(userId: number, callData: InsertCall): Promise<Call> {
    try {
        console.log("Creating call for user:", userId, "with data:", callData);
        const [newCall] = await db
            .insert(calls)
            .values({ ...callData, userId })
            .returning();
        console.log("Call created:", newCall);
        return newCall;
    } catch (error) {
        console.error("Error creating call:", error);
        throw error;
    }
}

}


export const storage = await new DatabaseStorage();