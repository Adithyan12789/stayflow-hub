import { describe, expect, it } from "vitest";

describe("Razorpay Test Mode credentials", () => {
  it("authenticates against the Razorpay Orders API without creating a charge", async () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay test credentials are not configured");
    }

    const response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { items?: unknown[] };
    expect(Array.isArray(body.items)).toBe(true);
  }, 20_000);
});
