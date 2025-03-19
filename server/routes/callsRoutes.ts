import { Router } from "express";
import { storage } from "../storage";
import { insertCallSchema } from "@shared/schema";
import { makeCall, getCallStatus } from "../services/mtt";

const router = Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const calls = await storage.getCalls(req.user.id);
  res.json(calls);
});

router.get('/calls', async (req, res) => {
    try {
        const calls = await storage.getCalls(req.user.id); // Fixed reference to `storage`
        res.json(calls);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching calls');
    }
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const callData = insertCallSchema.parse(req.body);
    const call = await storage.createCall(req.user.id, callData);
    res.status(201).json(call);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
