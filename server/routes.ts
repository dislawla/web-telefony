import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { makeCall, getCallStatus, getRecording } from "./services/mtt";
import { analyzeTranscript, generateResponse } from "./services/openai";
import { createContact as createAmoCRMContact, createLead, updateLeadStatus } from "./services/amocrm";
import { insertContactSchema, insertCallSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

const userUpdateSchema = z.object({
  email: z.string().email("Неверный формат email").optional(),
  phone: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // User Profile Update API
  app.patch("/api/user", requireAuth, async (req, res) => {
    try {
      const updates = userUpdateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user!.id, updates);
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Произошла неизвестная ошибка" });
      }
    }
  });

  // MTT Settings API
  app.post("/api/settings/mtt", requireAuth, async (req, res) => {
    try {
      const settings = z.object({
        mttApiKey: z.string().min(1),
        mttPhoneNumber: z.string().min(1),
      }).parse(req.body);
      await storage.updateUser(req.user!.id, settings);
      res.json({ message: "Настройки MTT успешно сохранены" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Произошла неизвестная ошибка" });
      }
    }
  });

  // CRM Settings API
  app.post("/api/settings/crm", requireAuth, async (req, res) => {
    try {
      const settings = z.object({
        amocrmDomain: z.string().min(1),
        amocrmAccessToken: z.string().min(1),
      }).parse(req.body);
      await storage.updateUser(req.user!.id, settings);
      res.json({ message: "Настройки CRM успешно сохранены" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Произошла неизвестная ошибка" });
      }
    }
  });

  // Contacts API
  app.get("/api/contacts", requireAuth, async (req, res) => {
    const contacts = await storage.getContacts(req.user!.id);
    res.json(contacts);
  });

  app.post("/api/contacts", requireAuth, async (req, res) => {
    const contactData = insertContactSchema.parse(req.body);
    const contact = await storage.createContact(req.user!.id, contactData);

    try {
      const amoContact = await createAmoCRMContact({
        name: contact.name,
        phone: contact.phone,
        email: contact.email
      });

      await storage.updateContact(contact.id, { 
        status: "synced_with_crm" 
      });

      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to sync with AmoCRM:", error.message);
      }
      res.status(201).json(contact);
    }
  });

  // Calls API
  app.get("/api/calls", requireAuth, async (req, res) => {
    const calls = await storage.getCalls(req.user!.id);
    res.json(calls);
  });

  app.post("/api/calls", requireAuth, async (req, res) => {
    const callData = insertCallSchema.parse(req.body);
    const contact = await storage.getContact(callData.contactId);
    const user = await storage.getUser(req.user!.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (!user?.mttApiKey || !user?.mttPhoneNumber) {
      return res.status(400).json({ message: "Настройки MTT не заданы" });
    }

    try {
      const call = await storage.createCall(req.user!.id, callData);

      const mttCall = await makeCall(
        contact.phone,
        user.mttPhoneNumber,
        user.mttApiKey
      );

      await storage.updateCall(call.id, {
        status: mttCall.status,
        recordingUrl: mttCall.recordingUrl
      });

      res.status(201).json(call);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Произошла неизвестная ошибка" });
      }
    }
  });

  app.get("/api/calls/:id/status", requireAuth, async (req, res) => {
    const call = await storage.getCall(parseInt(req.params.id));
    const user = await storage.getUser(req.user!.id);

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    if (!user?.mttApiKey) {
      return res.status(400).json({ message: "Настройки MTT не заданы" });
    }

    try {
      const status = await getCallStatus(call.id.toString(), user.mttApiKey);
      await storage.updateCall(call.id, { status });
      res.json({ status });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Произошла неизвестная ошибка" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}