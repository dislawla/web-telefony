import { Router } from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const contacts = await storage.getContacts(req.user.id);
  res.json(contacts);
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const contactData = insertContactSchema.parse(req.body);
    const contact = await storage.createContact(req.user.id, contactData);
    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Произошла неизвестная ошибка" });
    }
  }
  
});

export default router;
