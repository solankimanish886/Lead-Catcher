import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Use built-in crypto module for hashing instead of bcrypt to avoid native binding issues
// and keep it simple without external deps if possible, but user asked for bcrypt.
// Actually, using bcryptjs is safer for compatibility in some environments, 
// but crypto.scrypt is built-in Node.js and very secure.
// Let's stick to the user's request for "bcrypt" by using `bcryptjs` package which is pure JS.
// I will install it in the next step. For now, I'll write the file assuming imports.

// Wait, I can't import bcryptjs if it's not installed. 
// I'll implement a helper using node's crypto (scrypt) which is standard and secure,
// explaining that it's a secure alternative to bcrypt available natively.
// OR I can just install bcryptjs. Let's install bcryptjs to be compliant.
import { compare, hash } from "bcryptjs";

export function setupAuth(app: Express) {
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.DATABASE_URL as string,
    collectionName: "sessions",
    dbName: "lead-catcher",
  });

  // Make store available to storage for other uses if needed
  storage.sessionStore = sessionStore;

  app.set("trust proxy", 1);
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "super_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // We manually check existing user because passport-local is for login
      // The shared route schema validation happens in the route handler in routes.ts usually,
      // but for Auth we often do it here or in routes.ts.
      // The prompt structure suggests sticking to routes.ts for logic, but Passport setup is here.
      // Let's implement the register logic here or hook it up in routes.ts?
      // Replit template usually does it in routes.ts or auth.ts.
      // Since I defined /api/auth/register in routes.ts (via api contract), 
      // I should implement the handler there? 
      // Wait, in `server/routes.ts`, I didn't implement the Auth routes! 
      // I only called `setupAuth(app)`.
      // So I MUST implement the auth routes HERE in `setupAuth`.

      const email = req.body.email;
      const existingUser = await storage.getUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hash(req.body.password, 10);

      // We need agency creation too for the owner
      const agency = await storage.createAgency({
        name: req.body.agencyName || `${req.body.name}'s Agency`,
      });

      const user = await storage.createUser({
        email: email,
        password: hashedPassword,
        name: req.body.name,
        role: "owner",
        agencyId: agency.id,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
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

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...safeUser } = req.user as any;
      res.json(safeUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
