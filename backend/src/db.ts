import { MongoClient, type Collection } from "mongodb";

// User types
export type User = {
  id?: string;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  passwordHash: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type InsertUser = Partial<User> & { openId: string };

let client: MongoClient | null = null;
let usersCollection: Collection<User> | null = null;

// Get MongoDB database connection
async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI not configured");
    return null;
  }
  
  if (!client) {
    try {
      client = new MongoClient(uri);
      await client.connect();
      console.log("[MongoDB] Connected successfully");
    } catch (error) {
      console.error("[MongoDB] Connection failed:", error);
      return null;
    }
  }
  
  return client.db(process.env.MONGODB_DB_NAME || "stayflow");
}

// Get users collection
async function getUsersCollection(): Promise<Collection<User> | null> {
  if (usersCollection) return usersCollection;
  
  const database = await getDatabase();
  if (!database) return null;
  
  usersCollection = database.collection<User>("users");
  
  // Create indexes
  try {
    await usersCollection.createIndex({ openId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { sparse: true });
  } catch (error) {
    console.warn("[MongoDB] Index creation warning:", error);
  }
  
  return usersCollection;
}

/**
 * Upsert a user (create or update)
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const collection = await getUsersCollection();
  if (!collection) {
    console.warn("[MongoDB] Cannot upsert user: database not available");
    return;
  }

  try {
    const now = new Date();
    const existingUser = await collection.findOne({ openId: user.openId });
    
    if (existingUser) {
      // Update existing user
      const updateFields: Partial<User> = {
        updatedAt: now,
      };
      
      if (user.name !== undefined) updateFields.name = user.name;
      if (user.email !== undefined) updateFields.email = user.email;
      if (user.loginMethod !== undefined) updateFields.loginMethod = user.loginMethod;
      if (user.passwordHash !== undefined) updateFields.passwordHash = user.passwordHash;
      if (user.role !== undefined) updateFields.role = user.role;
      if (user.lastSignedIn !== undefined) updateFields.lastSignedIn = user.lastSignedIn;
      
      await collection.updateOne(
        { openId: user.openId },
        { $set: updateFields }
      );
    } else {
      // Create new user
      const newUser: User = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        passwordHash: user.passwordHash ?? null,
        role: user.role ?? "user",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      
      await collection.insertOne(newUser);
    }
  } catch (error) {
    console.error("[MongoDB] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get user by openId
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const collection = await getUsersCollection();
  if (!collection) {
    console.warn("[MongoDB] Cannot get user: database not available");
    return undefined;
  }

  try {
    const user = await collection.findOne({ openId });
    return user ?? undefined;
  } catch (error) {
    console.error("[MongoDB] Failed to get user by openId:", error);
    return undefined;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const collection = await getUsersCollection();
  if (!collection) {
    console.warn("[MongoDB] Cannot get user: database not available");
    return undefined;
  }

  try {
    const user = await collection.findOne({ email });
    return user ?? undefined;
  } catch (error) {
    console.error("[MongoDB] Failed to get user by email:", error);
    return undefined;
  }
}

/**
 * Close MongoDB connection (for graceful shutdown)
 */
export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    usersCollection = null;
    console.log("[MongoDB] Connection closed");
  }
}
