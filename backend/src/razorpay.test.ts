import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { inrToPaise, verifyRazorpayPaymentSignature } from "./razorpay";

describe("Razorpay helpers", () => {
  it("converts INR to paise without floating-point drift", () => {
    expect(inrToPaise(16800)).toBe(1680000);
    expect(() => inrToPaise(0.5)).toThrow();
  });

  it("verifies the Razorpay order/payment signature", () => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay test credentials are not configured");
    const orderId = "order_test_123";
    const paymentId = "pay_test_123";
    const signature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyRazorpayPaymentSignature(orderId, paymentId, signature)).toBe(true);
    expect(verifyRazorpayPaymentSignature(orderId, paymentId, `${signature.slice(0, -1)}0`)).toBe(false);
  });
});
