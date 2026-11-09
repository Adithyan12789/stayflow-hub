import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcrypt";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const SALT_ROUNDS = 10;

// Validation schemas
const signupSchema = z.object({
  email: z.string().email().min(1).max(320),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email().min(1).max(320),
  password: z.string().min(1),
});

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a unique openId for dev auth users
function generateDevOpenId(email: string): string {
  // Use a consistent format: dev_{email}
  // This prevents collisions with OAuth openIds
  return `dev_${email}`;
}

// Register user for dev auth
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<string> {
  const openId = generateDevOpenId(email);

  // Check if user already exists
  const existingUser = await db.getUserByOpenId(openId);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  await db.upsertUser({
    openId,
    name,
    email,
    loginMethod: "email",
    passwordHash,
    lastSignedIn: new Date(),
  });

  return openId;
}

// Authenticate user for dev auth
export async function authenticateUser(
  email: string,
  password: string
): Promise<string | null> {
  const openId = generateDevOpenId(email);

  // Get user
  const user = await db.getUserByOpenId(openId);
  if (!user || !user.passwordHash) {
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.upsertUser({
    openId: user.openId,
    lastSignedIn: new Date(),
  });

  return openId;
}

// Check if OAuth is configured
function isOAuthConfigured(): boolean {
  return !!(ENV.oAuthServerUrl && ENV.oAuthServerUrl.trim().length > 0);
}

// Register dev auth routes
export function registerDevAuthRoutes(app: Express) {
  // POST /api/auth/dev-signup
  app.post("/api/auth/dev-signup", async (req: Request, res: Response) => {
    // If OAuth is configured, dev auth is disabled
    if (isOAuthConfigured()) {
      res.status(404).json({ error: "Dev auth not available - OAuth is configured" });
      return;
    }

    try {
      // Validate request body
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ 
          error: "Invalid request", 
          details: result.error.issues 
        });
        return;
      }

      const { email, password, name } = result.data;

      // Register user
      const openId = await registerUser(email, password, name);

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      res.json({ success: true, message: "Account created successfully" });
    } catch (error) {
      console.error("[DevAuth] Signup failed", error);
      
      if (error instanceof Error && error.message === "Email already registered") {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      res.status(500).json({ error: "Signup failed" });
    }
  });

  // POST /api/auth/dev-login
  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    // If OAuth is configured, dev auth is disabled
    if (isOAuthConfigured()) {
      res.status(404).json({ error: "Dev auth not available - OAuth is configured" });
      return;
    }

    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ 
          error: "Invalid request", 
          details: result.error.issues 
        });
        return;
      }

      const { email, password } = result.data;

      // Authenticate user
      const openId = await authenticateUser(email, password);
      if (!openId) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Get user for name
      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { 
        ...cookieOptions, 
        maxAge: ONE_YEAR_MS 
      });

      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("[DevAuth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
