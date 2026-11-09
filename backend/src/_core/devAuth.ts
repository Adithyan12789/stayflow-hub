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
const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user with email/password
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string; openId?: string }> {
  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate openId for dev users (prefix with 'dev_' + hash of email)
    const openId = `dev_${Buffer.from(email).toString("base64").replace(/[^a-zA-Z0-9]/g, "").substring(0, 32)}`;

    // Create user
    await db.upsertUser({
      openId,
      email,
      name,
      passwordHash,
      loginMethod: "email",
      lastSignedIn: new Date(),
    });

    return { success: true, openId };
  } catch (error) {
    console.error("[DevAuth] Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Authenticate a user with email/password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; openId?: string }> {
  try {
    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return { success: false, error: "Invalid credentials" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return { success: true, openId: user.openId };
  } catch (error) {
    console.error("[DevAuth] Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Check if OAuth is configured
 */
function isOAuthConfigured(): boolean {
  return Boolean(ENV.oAuthServerUrl && ENV.oAuthServerUrl.length > 0);
}

/**
 * Register development authentication routes
 */
export function registerDevAuthRoutes(app: Express) {
  // POST /api/auth/dev-signup
  app.post("/api/auth/dev-signup", async (req: Request, res: Response) => {
    // If OAuth is configured, dev auth is disabled
    if (isOAuthConfigured()) {
      res.status(404).json({ error: "Development authentication is not available when OAuth is configured" });
      return;
    }

    try {
      // Validate request body
      const result = SignupSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
      }

      const { email, password, name } = result.data;

      // Register user
      const registration = await registerUser(email, password, name);
      if (!registration.success) {
        res.status(400).json({ error: registration.error });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(registration.openId!, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[DevAuth] Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // POST /api/auth/dev-login
  app.post("/api/auth/dev-login", async (req: Request, res: Response) => {
    // If OAuth is configured, dev auth is disabled
    if (isOAuthConfigured()) {
      res.status(404).json({ error: "Development authentication is not available when OAuth is configured" });
      return;
    }

    try {
      // Validate request body
      const result = LoginSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
      }

      const { email, password } = result.data;

      // Authenticate user
      const auth = await authenticateUser(email, password);
      if (!auth.success) {
        res.status(401).json({ error: auth.error });
        return;
      }

      // Get user info for session
      const user = await db.getUserByOpenId(auth.openId!);
      if (!user) {
        res.status(500).json({ error: "User not found" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(auth.openId!, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[DevAuth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
