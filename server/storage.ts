import { InsertUser, User, Contact, InsertContact, Call, InsertCall, Client, InsertClient } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { users, contacts, calls, clients } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // Contact operations
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(userId: number, contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Call operations
  getCalls(userId: number): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(userId: number, call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<Call>): Promise<Call>;

  // Client operations
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(userId: number, client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Getting user by id:', id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
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

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log('Creating user:', insertUser);
      const [user] = await db.insert(users).values(insertUser).returning();
      console.log('Created user:', user);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    try {
      console.log('Updating user:', { id, updates });
      const [user] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      console.log('Updated user:', user);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Contact operations
  async getContacts(userId: number): Promise<Contact[]> {
    return db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(userId: number, insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({ ...insertContact, userId })
      .returning();
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Call operations
  async getCalls(userId: number): Promise<Call[]> {
    return db.select().from(calls).where(eq(calls.userId, userId));
  }

  async getCall(id: number): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call;
  }

  async createCall(userId: number, insertCall: InsertCall): Promise<Call> {
    const [call] = await db
      .insert(calls)
      .values({ ...insertCall, userId })
      .returning();
    return call;
  }

  async updateCall(id: number, updates: Partial<Call>): Promise<Call> {
    const [call] = await db
      .update(calls)
      .set(updates)
      .where(eq(calls.id, id))
      .returning();
    return call;
  }

  // Client operations
  async getClients(userId: number): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.userId, userId));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(userId: number, insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values({ ...insertClient, userId })
      .returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    if (!client) {
      throw new Error(`Client with id ${id} not found`);
    }
    return client;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }
}

export const storage = new DatabaseStorage();