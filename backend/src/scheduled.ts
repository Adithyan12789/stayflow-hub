import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { cleanupAbandonedBookings } from "./mongodb";

export async function cleanupPendingBookingsHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) return res.status(403).json({ error: "cron-only" });
    const result = await cleanupAbandonedBookings(30 * 60 * 1000);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
