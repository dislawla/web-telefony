import { Express, Router } from "express";
import authRoutes from "./authRoutes";
import contactsRoutes from "./contactsRoutes";
import callsRoutes from "./callsRoutes";
import telephonyRoutes from "./telephonyRoutes";
import aiRoutes from "./aiRoutes";

/**
 * Функция настраивает маршруты для приложения.
 * Все маршруты монтируются на префикс /api.
 * 
 * @param app - Экземпляр Express-приложения.
 */
export default function setupRoutes(app: Express): void {

  console.log("⚡ Настройка маршрутов запущена...");

  const router = Router();

  router.use("/auth", authRoutes);
  router.use("/contacts", contactsRoutes);
  router.use("/calls", callsRoutes);
  router.use("/telephony", telephonyRoutes);
  router.use("/ai", aiRoutes); // Register AI routes

  // Монтируем маршруты на префикс /api
  app.use("/api", router);

  console.log("✅ Маршруты настроены: /api/auth, /api/contacts, /api/calls, /api/telephony, /api/ai");

}
