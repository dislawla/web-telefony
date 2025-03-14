import { InsertUser, User, Contact, InsertContact, Call, InsertCall } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private calls: Map<number, Call>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.calls = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      mttApiKey: null,
      mttPhoneNumber: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.userId === userId,
    );
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(userId: number, contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const newContact: Contact = {
      ...contact,
      id,
      userId,
      status: "new",
      createdAt: new Date(),
      email: contact.email || null,
      notes: contact.notes || null,
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(id);
    if (!contact) {
      throw new Error("Contact not found");
    }
    const updatedContact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  async getCalls(userId: number): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(
      (call) => call.userId === userId,
    );
  }

  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(userId: number, call: InsertCall): Promise<Call> {
    const id = this.currentId++;
    const newCall: Call = {
      ...call,
      id,
      userId,
      duration: 0,
      transcript: null,
      recordingUrl: null,
      createdAt: new Date(),
      aiSummary: null,
    };
    this.calls.set(id, newCall);
    return newCall;
  }

  async updateCall(id: number, updates: Partial<Call>): Promise<Call> {
    const call = this.calls.get(id);
    if (!call) {
      throw new Error("Call not found");
    }
    const updatedCall = { ...call, ...updates };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }
}

export const storage = new MemStorage();