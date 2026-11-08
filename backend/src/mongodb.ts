import { MongoClient, type Collection } from "mongodb";

export type UserProfileRecord = { userId: number; displayName?: string; avatarDataUrl?: string; payoutMethod?: "Bank transfer" | "UPI" | "PayPal"; payoutAccount?: string; propertyPhotoUrls?: string[]; updatedAt: Date };

export type PropertyCatalogItem = {
  id?: string;
  name: string;
  location: string;
  status: "live" | "setup" | "paused";
  occupancy: number;
  revenue: string;
  type?: string;
  rooms?: number;
  price?: number;
  description?: string;
  updatedAt?: Date;
  ownerId?: number;
};

export type RoomCatalogItem = {
  id?: string;
  number: string;
  name: string;
  stay: string;
  type: string;
  status: "Ready" | "Occupied" | "Cleaning";
  rate: string;
  updatedAt?: Date;
};

export type BookingCatalogItem = {
  id?: string;
  userId?: number;
  guest: string;
  email?: string;
  phone?: string;
  stay: string;
  room: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: string;
  status: "Confirmed" | "Checked in" | "Pending" | "Cancelled";
  paymentStatus?: "Pending" | "Paid";
  refundStatus?: "Not eligible" | "Requested" | "Processing" | "Refunded";
  cancelledAt?: Date;
  paymentProvider?: "razorpay" | "cashfree" | "stripe";
  providerOrderId?: string;
  providerPaymentId?: string;
  providerRefundId?: string;
  amountInPaise?: number;
  updatedAt?: Date;
};

const fallbackProperties: PropertyCatalogItem[] = [
  { id: "hilltop-villa", name: "Hilltop Villa", location: "Manali, HP", status: "live", occupancy: 78, revenue: "₹1.42L", rooms: 4, price: 8400 },
  { id: "cedar-cottage", name: "Cedar Cottage", location: "Coonoor, TN", status: "live", occupancy: 71, revenue: "₹98K", rooms: 2, price: 6200 },
  { id: "lakehouse-02", name: "Lakehouse 02", location: "Udaipur, RJ", status: "setup", occupancy: 0, revenue: "—", rooms: 3, price: 7200 },
];
const fallbackRooms: RoomCatalogItem[] = [
  { id: "101", number: "101", name: "Pine View", stay: "Hilltop Villa", type: "King room", status: "Ready", rate: "₹8,400" },
  { id: "102", number: "102", name: "Valley View", stay: "Hilltop Villa", type: "Twin room", status: "Occupied", rate: "₹7,600" },
  { id: "201", number: "201", name: "The Veranda", stay: "Cedar Cottage", type: "King room", status: "Cleaning", rate: "₹6,200" },
  { id: "202", number: "202", name: "Garden Room", stay: "Cedar Cottage", type: "Queen room", status: "Ready", rate: "₹5,900" },
];
const fallbackBookings: BookingCatalogItem[] = [
  { id: "b1", guest: "Aarav Sharma", stay: "Hilltop Villa", room: "Pine View · 101", checkIn: "2026-09-12", checkOut: "2026-09-15", nights: 3, amount: "₹25,200", status: "Confirmed" },
  { id: "b2", guest: "Mia Thompson", stay: "Cedar Cottage", room: "The Veranda · 201", checkIn: "2026-09-14", checkOut: "2026-09-18", nights: 4, amount: "₹24,800", status: "Checked in" },
  { id: "b3", guest: "Kabir Nair", stay: "Hilltop Villa", room: "Valley View · 102", checkIn: "2026-09-18", checkOut: "2026-09-20", nights: 2, amount: "₹15,200", status: "Pending" },
  { id: "b4", guest: "Sofia Patel", stay: "The Fern Room", room: "Fern Room · 1", checkIn: "2026-09-21", checkOut: "2026-09-24", nights: 3, amount: "₹10,500", status: "Confirmed" },
];

let client: MongoClient | null = null;
let properties: Collection<PropertyCatalogItem> | null = null;
let rooms: Collection<RoomCatalogItem> | null = null;
let bookings: Collection<BookingCatalogItem> | null = null;
let profiles: Collection<UserProfileRecord> | null = null;
const memoryBookings = new Map<string, BookingCatalogItem>();

async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!client) { client = new MongoClient(uri); await client.connect(); }
  return client.db(process.env.MONGODB_DB_NAME || "stayflow");
}

async function getCollections() {
  const database = await getDatabase();
  if (!database) return null;
  properties = properties || database.collection<PropertyCatalogItem>("properties");
  rooms = rooms || database.collection<RoomCatalogItem>("rooms");
  bookings = bookings || database.collection<BookingCatalogItem>("bookings");
  profiles = profiles || database.collection<UserProfileRecord>("profiles");
  return { properties, rooms, bookings, profiles };
}

export async function listCatalogProperties() {
  try { const collections = await getCollections(); if (!collections) return fallbackProperties; const records = await collections.properties.find({}, { projection: { _id: 0 } }).sort({ updatedAt: -1 }).limit(100).toArray(); return records.length ? records : fallbackProperties; } catch (error) { console.warn("[MongoDB] Properties unavailable; using fallback data.", error); return fallbackProperties; }
}
export async function createCatalogProperty(input: Omit<PropertyCatalogItem, "id" | "updatedAt">) { const record: PropertyCatalogItem = { ...input, id: crypto.randomUUID(), updatedAt: new Date() }; const collections = await getCollections(); if (!collections) return record; await collections.properties.insertOne(record); return record; }
export async function updateCatalogProperty(id: string, input: Partial<Omit<PropertyCatalogItem, "id" | "updatedAt">>) { const collections = await getCollections(); if (!collections) return { id, ...input, updatedAt: new Date() } as PropertyCatalogItem; const result = await collections.properties.findOneAndUpdate({ id }, { $set: { ...input, updatedAt: new Date() } }, { returnDocument: "after", projection: { _id: 0 } }); return result ?? null; }
export async function deleteCatalogProperty(id: string) { const collections = await getCollections(); if (!collections) return { id, deleted: true }; const result = await collections.properties.deleteOne({ id }); return { id, deleted: result.deletedCount > 0 }; }

export async function listRooms() { try { const collections = await getCollections(); if (!collections) return fallbackRooms; const records = await collections.rooms.find({}, { projection: { _id: 0 } }).sort({ number: 1 }).limit(200).toArray(); return records.length ? records : fallbackRooms; } catch { return fallbackRooms; } }
export async function listBookings() { try { const collections = await getCollections(); if (!collections) return fallbackBookings; const records = await collections.bookings.find({}, { projection: { _id: 0 } }).sort({ checkIn: 1 }).limit(500).toArray(); return records.length ? records : fallbackBookings; } catch { return fallbackBookings; } }
export async function listBookingsForUser(userId: number) { try { const collections = await getCollections(); if (!collections) return [...fallbackBookings.filter((booking) => booking.userId === userId), ...Array.from(memoryBookings.values()).filter((booking) => booking.userId === userId)]; return await collections.bookings.find({ userId }, { projection: { _id: 0 } }).sort({ checkIn: 1 }).limit(500).toArray(); } catch { return Array.from(memoryBookings.values()).filter((booking) => booking.userId === userId); } }
export async function getRoomRateInPaise(room: string) { const fallbackRates: Record<string, number> = { "Pine View · 101": 840000, "Valley View · 102": 760000, "The Veranda · 201": 620000, "Garden Room · 202": 590000, "Lake Suite · 301": 720000, "Courtyard Room · 302": 650000, "Fern Room · 1": 550000, "Garden Studio · 2": 610000 }; try { const collections = await getCollections(); const record = collections ? await collections.rooms.findOne({ name: room.split(" · ")[0], number: room.split(" · ")[1] }, { projection: { _id: 0, rate: 1 } }) : null; const rate = record?.rate ? Number(record.rate.replace(/[^0-9.]/g, "")) * 100 : fallbackRates[room]; return rate || 0; } catch { return fallbackRates[room] || 0; } }
export async function createBooking(input: Omit<BookingCatalogItem, "id" | "updatedAt">) { const record: BookingCatalogItem = { ...input, id: crypto.randomUUID(), updatedAt: new Date() }; const collections = await getCollections(); if (!collections) { memoryBookings.set(record.id!, record); return record; } await collections.bookings.insertOne(record); return record; }
export async function cancelBookingForUser(id: string, userId: number) { const collections = await getCollections(); const update = { status: "Cancelled" as const, refundStatus: "Requested" as const, cancelledAt: new Date(), updatedAt: new Date() }; if (!collections) { const current = memoryBookings.get(id); if (!current || current.userId !== userId) return null; const next = { ...current, ...update }; memoryBookings.set(id, next); return next; } const result = await collections.bookings.findOneAndUpdate({ id, userId }, { $set: update }, { returnDocument: "after", projection: { _id: 0 } }); return result ?? null; }
export async function getBookingForUser(id: string, userId: number) { const collections = await getCollections(); if (!collections) { const current = memoryBookings.get(id); return current?.userId === userId ? current : null; } return collections.bookings.findOne({ id, userId }, { projection: { _id: 0 } }); }
export async function updateBooking(id: string, update: Partial<BookingCatalogItem>) { const collections = await getCollections(); if (!collections) { const current = memoryBookings.get(id); if (!current) return null; const next = { ...current, ...update, updatedAt: new Date() }; memoryBookings.set(id, next); return next; } const result = await collections.bookings.findOneAndUpdate({ id }, { $set: { ...update, updatedAt: new Date() } }, { returnDocument: "after", projection: { _id: 0 } }); return result ?? null; }
export async function updateBookingByProvider(field: "providerOrderId" | "providerPaymentId" | "providerRefundId", value: string, update: Partial<BookingCatalogItem>) { const collections = await getCollections(); if (!collections) return null; const result = await collections.bookings.findOneAndUpdate({ [field]: value }, { $set: { ...update, updatedAt: new Date() } }, { returnDocument: "after", projection: { _id: 0 } }); return result ?? null; }
export async function cleanupAbandonedBookings(maxAgeMs: number) { const cutoff = new Date(Date.now() - maxAgeMs); const collections = await getCollections(); if (!collections) { let removed = 0; for (const [id, booking] of Array.from(memoryBookings.entries())) { if (booking.status === "Pending" && (!booking.updatedAt || booking.updatedAt < cutoff)) { memoryBookings.delete(id); removed += 1; } } return { removed, cutoff: cutoff.toISOString() }; } const result = await collections.bookings.deleteMany({ status: "Pending", updatedAt: { $lt: cutoff } }); return { removed: result.deletedCount, cutoff: cutoff.toISOString() }; }

export async function checkRoomAvailability(room: string, checkIn: string, checkOut: string) {
  try {
    const collections = await getCollections();
    const source = collections ? await collections.bookings.find({ room, status: { $ne: "Cancelled" } }, { projection: { _id: 0, checkIn: 1, checkOut: 1 } }).toArray() : fallbackBookings.filter((booking) => booking.room === room && booking.status !== "Cancelled");
    const available = !source.some((booking) => booking.checkIn < checkOut && booking.checkOut > checkIn);
    return { available, room, checkIn, checkOut };
  } catch {
    return { available: true, room, checkIn, checkOut };
  }
}

export async function getUserProfile(userId: number) { try { const collections = await getCollections(); if (!collections) return null; return collections.profiles.findOne({ userId }, { projection: { _id: 0 } }); } catch { return null; } }
export async function updateUserProfile(userId: number, data: { displayName?: string; avatarDataUrl?: string; payoutMethod?: UserProfileRecord["payoutMethod"]; payoutAccount?: string; propertyPhotoUrls?: string[] }) { const record = { userId, ...data, updatedAt: new Date() }; try { const collections = await getCollections(); if (!collections) return record; await collections.profiles.updateOne({ userId }, { $set: record }, { upsert: true }); return record; } catch { return record; } }
export async function listHostProperties(ownerId: number) { try { const collections = await getCollections(); if (!collections) return fallbackProperties; const records = await collections.properties.find({ $or: [{ ownerId }, { ownerId: { $exists: false } }] }, { projection: { _id: 0 } }).sort({ updatedAt: -1 }).limit(100).toArray(); return records.length ? records : fallbackProperties; } catch { return fallbackProperties; } }
export async function listHostBookingRequests(ownerId: number) { try { const collections = await getCollections(); if (!collections) return fallbackBookings; return await collections.bookings.find({ $or: [{ ownerId }, { ownerId: { $exists: false } }] }, { projection: { _id: 0 } }).sort({ checkIn: 1 }).limit(100).toArray(); } catch { return fallbackBookings; } }
