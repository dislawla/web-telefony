import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      path: '/',
      httpOnly: true
    },
    name: 'session'
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Добавляем отладочный middleware для проверки состояния сессии
  app.use((req, res, next) => {
    console.log('Auth check:', {
      isAuthenticated: req.isAuthenticated(),
      session: req.session,
      user: req.user
    });
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Invalid username or password" });
        }
  
        const passwordMatch = await comparePasswords(password, user.password);
        console.log(`Password match: ${passwordMatch}`);
  
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }
  
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: User, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Добавляем обработчик регистрации
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, companyName } = req.body;

      console.log("Registration attempt:", { username, companyName }); // Добавляем логирование

      // Проверяем, что все необходимые поля присутствуют
      if (!username || !password || !companyName) {
        return res.status(400).json({
          message: "Все поля обязательны для заполнения"
        });
      }

      // Проверяем, не существует ли уже пользователь с таким именем
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          message: "Пользователь с таким именем уже существует"
        });
      }

      // Хешируем пароль
      const hashedPassword = await hashPassword(password);

      // Создаем нового пользователя
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        companyName
      });

      console.log("User created:", newUser); // Добавляем логирование

      // Автоматически логиним пользователя после регистрации
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({
            message: "Ошибка при автоматическом входе после регистрации"
          });
        }

        // Отправляем данные пользователя без пароля
        const { password, ...safeUser } = newUser;
        res.status(201).json(safeUser);
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Ошибка при регистрации пользователя"
      });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("POST /api/auth/login - Request Body:", req.body);
  
    passport.authenticate("local", (err: any, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Invalid credentials:", info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        console.log("User authenticated:", user);
        const { password, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  });
}