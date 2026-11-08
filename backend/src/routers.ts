import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCatalogProperty,
  deleteCatalogProperty,
  createBooking,
  checkRoomAvailability,
  listBookings,
  listRooms,
  listCatalogProperties,
  listBookingsForUser,
  cancelBookingForUser,
  getBookingForUser,
  updateBooking,
  getRoomRateInPaise,
  updateCatalogProperty,
  getUserProfile,
  updateUserProfile,
  listHostProperties,
  listHostBookingRequests,
} from "./mongodb";
import { z } from "zod";
import { createRazorpayOrder, createRazorpayRefund, fetchOrder, fetchPayment, inrToPaise, verifyRazorpayPaymentSignature } from "./razorpay";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: protectedProcedure.query(({ ctx }) => getUserProfile(ctx.user.id)),
  profileUpdate: protectedProcedure.input(z.object({ displayName: z.string().min(1).max(80).optional(), avatarDataUrl: z.string().max(4000000).optional(), payoutMethod: z.enum(["Bank transfer", "UPI", "PayPal"]).optional(), payoutAccount: z.string().max(160).optional(), propertyPhotoUrls: z.array(z.string().url()).max(12).optional() })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.id, input)),
  hostOnboardingCreate: protectedProcedure.input(z.object({ name: z.string().min(1), location: z.string().min(1), type: z.string().min(1), rooms: z.number().int().positive(), price: z.number().nonnegative(), description: z.string().optional() })).mutation(({ ctx, input }) => createCatalogProperty({ ...input, ownerId: ctx.user.id, status: "setup", occupancy: 0, revenue: "—" })),
  hostDashboardData: protectedProcedure.query(({ ctx }) => Promise.all([listHostProperties(ctx.user.id), listHostBookingRequests(ctx.user.id)]).then(([properties, requests]) => ({ properties, requests }))),
  hostBookingDecision: protectedProcedure.input(z.object({ id: z.string().min(1), decision: z.enum(["Confirmed", "Cancelled"]) })).mutation(({ input }) => updateBooking(input.id, { status: input.decision })),
  hostPropertyUpdate: protectedProcedure.input(z.object({ id: z.string().min(1), data: z.object({ name: z.string().min(1).optional(), location: z.string().min(1).optional(), status: z.enum(["live", "setup", "paused"]).optional(), type: z.string().optional(), rooms: z.number().int().positive().optional(), price: z.number().nonnegative().optional(), description: z.string().optional() }) })).mutation(({ input }) => updateCatalogProperty(input.id, input.data)),
  hostPropertyArchive: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(({ input }) => updateCatalogProperty(input.id, { status: "paused" })),

  propertyCatalog: publicProcedure.query(() => listCatalogProperties()),
  propertyCreate: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      location: z.string().min(1),
      status: z.enum(["live", "setup", "paused"]),
      occupancy: z.number().min(0).max(100).default(0),
      revenue: z.string().default("—"),
      type: z.string().optional(),
      rooms: z.number().int().positive().optional(),
      price: z.number().nonnegative().optional(),
      description: z.string().optional(),
    }))
    .mutation(({ input }) => createCatalogProperty(input)),
  propertyUpdate: publicProcedure
    .input(z.object({
      id: z.string().min(1),
      data: z.object({
        name: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        status: z.enum(["live", "setup", "paused"]).optional(),
        occupancy: z.number().min(0).max(100).optional(),
        revenue: z.string().optional(),
        type: z.string().optional(),
        rooms: z.number().int().positive().optional(),
        price: z.number().nonnegative().optional(),
        description: z.string().optional(),
      }),
    }))
    .mutation(({ input }) => updateCatalogProperty(input.id, input.data)),
  propertyDelete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => deleteCatalogProperty(input.id)),
  rooms: publicProcedure.query(() => listRooms()),
  bookings: publicProcedure.query(() => listBookings()),
  bookingCreate: publicProcedure
    .input(z.object({
      guest: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      stay: z.string().min(1),
      room: z.string().min(1),
      checkIn: z.string().min(1),
      checkOut: z.string().min(1),
      nights: z.number().int().positive(),
      amount: z.string().min(1),
      status: z.enum(["Confirmed", "Checked in", "Pending", "Cancelled"]),
    }))
    .mutation(({ input }) => createBooking(input)),
  bookingAvailability: publicProcedure
    .input(z.object({ room: z.string().min(1), checkIn: z.string().min(1), checkOut: z.string().min(1) }))
    .mutation(({ input }) => checkRoomAvailability(input.room, input.checkIn, input.checkOut)),
  guestBookings: protectedProcedure.query(({ ctx }) => listBookingsForUser(ctx.user.id)),
  guestBookingCancel: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await getBookingForUser(input.id, ctx.user.id);
      if (!booking) throw new Error("Booking not found");
      if (booking.status === "Cancelled") return booking;
      if (booking.paymentStatus === "Paid" && booking.providerPaymentId && booking.amountInPaise) {
        const refund = await createRazorpayRefund(booking.providerPaymentId, booking.amountInPaise, { bookingId: input.id, userId: String(ctx.user.id) });
        return updateBooking(input.id, { status: "Cancelled", cancelledAt: new Date(), providerRefundId: refund.id, refundStatus: "Processing" });
      }
      const cancelled = await cancelBookingForUser(input.id, ctx.user.id);
      if (!cancelled) throw new Error("Booking could not be cancelled");
      return cancelled;
    }),
  razorpayOrderCreate: protectedProcedure
    .input(z.object({ stay: z.string().min(1), room: z.string().min(1), checkIn: z.string().min(1), checkOut: z.string().min(1), nights: z.number().int().positive(), amount: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rateInPaise = await getRoomRateInPaise(input.room);
      const expectedAmountInPaise = rateInPaise * input.nights;
      const amountInPaise = inrToPaise(Number(input.amount.replace(/[^0-9.]/g, "")));
      if (!rateInPaise || amountInPaise !== expectedAmountInPaise) throw new Error("Booking amount no longer matches the selected room rate");
      const booking = await createBooking({ ...input, userId: ctx.user.id, guest: ctx.user.name || "Guest traveller", email: ctx.user.email || undefined, status: "Pending", paymentStatus: "Pending", paymentProvider: "razorpay", amountInPaise });
      const order = await createRazorpayOrder({ amountInPaise, receipt: `stayflow_${booking.id}`, notes: { bookingId: booking.id || "", userId: String(ctx.user.id) } });
      await updateBooking(booking.id || "", { providerOrderId: order.id });
      return { bookingId: booking.id, orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID };
    }),
  razorpayPaymentVerify: protectedProcedure
    .input(z.object({ bookingId: z.string().min(1), orderId: z.string().min(1), paymentId: z.string().min(1), signature: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const booking = await getBookingForUser(input.bookingId, ctx.user.id);
      if (!booking) throw new Error("Booking record not found. Please restart checkout.");
      const order = await fetchOrder(input.orderId);
      const orderNotes = (order.notes ?? {}) as Record<string, string>;
      const metadataMatches = orderNotes.bookingId === input.bookingId && orderNotes.userId === String(ctx.user.id);
      if (booking.providerOrderId !== input.orderId && !metadataMatches) throw new Error("Payment order does not match this booking");
      if (booking.providerOrderId !== input.orderId) await updateBooking(input.bookingId, { providerOrderId: input.orderId });
      if (!verifyRazorpayPaymentSignature(input.orderId, input.paymentId, input.signature)) throw new Error("Razorpay payment signature verification failed");
      const payment = await fetchPayment(input.paymentId);
      if (payment.order_id !== input.orderId || payment.status !== "captured") throw new Error("Payment has not been captured");
      return updateBooking(input.bookingId, { providerPaymentId: input.paymentId, paymentStatus: "Paid", status: "Confirmed", refundStatus: "Not eligible" });
    }),
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
