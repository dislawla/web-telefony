import { Router } from "express";
import passport from "passport";
import { hashPassword } from "../auth";
import { storage } from "../storage";

const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
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

export default router;