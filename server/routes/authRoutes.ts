import { Router } from "express";
import passport from "passport";
import { hashPassword } from "../auth";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { User } from "@shared/schema";

const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: User | false, info: { message?: string }) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
    console.log("LOGOUT REQUEST:", req.session, req.user);
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  
router.get("/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

router.post("/register", async (req, res, next) => {
    try {
      console.log("Регистрация запроса:", req.body); // Логируем данные
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
  
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
  
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

router.patch("/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    await db.update(users)
      .set({ 
        email: email || null,
        phone: phone || null
      })
      .where(eq(users.id, userId));

    const updatedUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);

    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Error updating user profile" });
  }
});

router.post("/user/avatar-position", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { position, size } = req.body;
    const userId = req.user.id;

    await db.update(users)
      .set({ 
        avatar_position: position,
        avatar_size: size
      })
      .where(eq(users.id, userId));

    const updatedUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);

    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error("Error updating avatar position:", error);
    res.status(500).json({ error: "Error updating avatar position" });
  }
});

export default router;