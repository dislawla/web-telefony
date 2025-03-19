import { Router } from "express";
import { saveTelephonySettings, getTelephonySettings } from "../services/telephonyService";

const router = Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const settings = await getTelephonySettings(req.user.id);
    res.json(settings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Произошла неизвестная ошибка" });
    }
  }
});

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const response = await saveTelephonySettings(req.user.id, req.body);
    res.json(response);
  } 
  catch (error) {
    if (error instanceof Error) {
      console.error("Error creating contact:", error.message);
      res.status(500).json({ message: error.message });
    } 
    else {
      console.error("Unknown error:", error);
      res.status(500).json({ message: "Произошла неизвестная ошибка" });
    }
  }
});

export default router;
