import crypto from "node:crypto";
import Razorpay from "razorpay";
import express, { type Express, type Request, type Response } from "express";
import { updateBookingByProvider } from "./mongodb";

const keyId = process.env.RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

function client() {
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured on the server.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function inrToPaise(amount: number) {
  const paise = Math.round(amount * 100);
  if (!Number.isSafeInteger(paise) || paise < 100) throw new Error("Razorpay amount must be at least ₹1.");
  return paise;
}

export async function createRazorpayOrder(input: { amountInPaise: number; receipt: string; notes: Record<string, string> }) {
  return client().orders.create({ amount: input.amountInPaise, currency: "INR", receipt: input.receipt.slice(0, 40), notes: input.notes, payment_capture: true });
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function fetchPayment(paymentId: string) { return client().payments.fetch(paymentId); }
export async function fetchOrder(orderId: string) { return client().orders.fetch(orderId); }

export async function createRazorpayRefund(paymentId: string, amountInPaise: number, notes: Record<string, string>) {
  return client().payments.refund(paymentId, { amount: amountInPaise, speed: "normal", notes });
}

function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!webhookSecret || !signature) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function registerRazorpayWebhook(app: Express) {
  const handler = (req: Request, res: Response) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body ?? {});
    const signature = req.header("x-razorpay-signature") ?? "";
    if (!verifyWebhookSignature(rawBody, signature)) return res.status(400).json({ error: "Invalid Razorpay webhook signature" });
    const event = JSON.parse(rawBody) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } }; refund?: { entity?: { id?: string; payment_id?: string; status?: string } } } };
    const payment = event.payload?.payment?.entity;
    const refund = event.payload?.refund?.entity;
    void (async () => {
      if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.id) {
        const updated = await updateBookingByProvider("providerPaymentId", payment.id, { paymentStatus: "Paid", status: "Confirmed" });
        if (!updated && payment.order_id) await updateBookingByProvider("providerOrderId", payment.order_id, { providerPaymentId: payment.id, paymentStatus: "Paid", status: "Confirmed" });
      }
      if (event.event === "payment.failed" && payment?.id) await updateBookingByProvider("providerPaymentId", payment.id, { paymentStatus: "Pending" });
      if (event.event === "refund.created" && refund?.id) {
        const updated = await updateBookingByProvider("providerRefundId", refund.id, { refundStatus: "Processing" });
        if (!updated && refund.payment_id) await updateBookingByProvider("providerPaymentId", refund.payment_id, { providerRefundId: refund.id, refundStatus: "Processing" });
      }
      if (event.event === "refund.processed" && refund?.id) await updateBookingByProvider("providerRefundId", refund.id, { refundStatus: "Refunded" });
      if (event.event === "refund.failed" && refund?.id) await updateBookingByProvider("providerRefundId", refund.id, { refundStatus: "Requested" });
    })().catch((error) => console.error("[Razorpay webhook] Failed to update booking:", error));
    return res.json({ received: true });
  };
  const rawBody = express.raw({ type: "application/json" });
  app.post("/api/razorpay/webhook", rawBody, handler);
  app.post("/api/payments/razorpay/webhook", rawBody, handler);
}
