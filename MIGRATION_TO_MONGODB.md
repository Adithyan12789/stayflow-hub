# Migration from MySQL to MongoDB

This document describes the migration from MySQL (with Drizzle ORM) to MongoDB.

## What Changed

### Removed Dependencies
- ❌ `mysql2` - MySQL database driver
- ❌ `drizzle-orm` - ORM for SQL databases
- ❌ `drizzle-kit` - Drizzle schema migration tool

### Added/Kept Dependencies
- ✅ `mongodb` - Native MongoDB driver (already present)
- ✅ All other dependencies remain unchanged

### File Changes

#### Deleted Files
- `backend/drizzle/` - Entire Drizzle schema and migration folder
- `backend/drizzle.config.ts` - Drizzle configuration

#### Modified Files
- `backend/src/db.ts` - Completely rewritten to use MongoDB
- `backend/package.json` - Removed MySQL/Drizzle dependencies
- `backend/.env` - Removed `DATABASE_URL`, kept `MONGODB_URI`
- `backend/.env.example` - Updated example configuration

## New Database Structure

### User Collection Schema

```typescript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  openId: string,             // Unique user identifier (indexed)
  name: string | null,        // User's full name
  email: string | null,       // User's email (indexed)
  loginMethod: string | null, // "email", "google", "apple", etc.
  passwordHash: string | null,// Bcrypt password hash (null for OAuth users)
  role: "user" | "admin",     // User role
  createdAt: Date,            // Account creation timestamp
  updatedAt: Date,            // Last update timestamp
  lastSignedIn: Date          // Last login timestamp
}
```

### Indexes
- `openId`: Unique index for fast user lookups
- `email`: Sparse index for email-based queries

## Database Functions

### `upsertUser(user: InsertUser)`
Creates a new user or updates an existing one by `openId`.

### `getUserByOpenId(openId: string)`
Retrieves a user by their unique `openId`.

### `getUserByEmail(email: string)`
Retrieves a user by their email address.

### `closeDatabase()`
Gracefully closes the MongoDB connection.

## Environment Configuration

### Before (MySQL)
```env
DATABASE_URL=mysql://root:password@localhost:3306/stayflow
MONGODB_URI=mongodb://localhost:27017/stayflow
MONGODB_DB_NAME=stayflow
```

### After (MongoDB Only)
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=stayflow
```

## Authentication

Authentication continues to work exactly as before:
- ✅ Email/password development authentication
- ✅ OAuth authentication (when configured)
- ✅ Session tokens using JWT
- ✅ Password hashing with bcrypt

The authentication layer is **completely transparent** to this change - no frontend changes needed!

## Testing the Migration

### 1. Start MongoDB
Make sure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 2. Configure Environment
Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017
# Or for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DB_NAME=stayflow
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Server
```bash
npm run dev
```

You should see:
```
[MongoDB] Connected successfully
[StayFlow Backend] Server running on http://localhost:5000
```

### 5. Test Authentication
Navigate to `/signup` and create a new account. The user will be stored in MongoDB!

## Verifying Data in MongoDB

### Using MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Select database: `stayflow`
3. View collection: `users`

### Using MongoDB Shell
```bash
mongosh
use stayflow
db.users.find().pretty()
```

### Using Node.js Script
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('stayflow');
const users = await db.collection('users').find({}).toArray();
console.log(users);
```

## Migration Benefits

1. **Simpler Stack**: One database instead of two
2. **Better Scalability**: MongoDB handles large datasets efficiently
3. **Flexible Schema**: No migrations needed for schema changes
4. **Cloud-Ready**: Easy deployment to MongoDB Atlas
5. **Reduced Dependencies**: Fewer packages to maintain
6. **Native Queries**: Direct MongoDB driver is faster than ORM

## Rollback (If Needed)

If you need to rollback to MySQL:

1. Checkout the previous commit:
   ```bash
   git checkout d87dca9
   ```

2. Reinstall dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Update `.env` to include `DATABASE_URL`

## Production Deployment

### MongoDB Atlas Setup
1. Create free cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist your IP (or use 0.0.0.0/0 for testing)
4. Get connection string
5. Update `MONGODB_URI` in production environment

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=stayflow
CLIENT_ORIGIN=https://yourdomain.com
JWT_SECRET=your-production-secret-min-32-chars
```

## Troubleshooting

### Connection Issues
```
Error: Cannot connect to MongoDB
```
**Solution**: Check that MongoDB is running and `MONGODB_URI` is correct.

### Missing Collections
```
Warning: users collection not found
```
**Solution**: MongoDB creates collections automatically on first insert. Just create a user and the collection will appear.

### Authentication Errors
```
Error: Cannot upsert user
```
**Solution**: Verify MongoDB connection and check server logs for detailed error messages.

## Support

For issues or questions:
1. Check server logs: `npm run dev` output
2. Verify MongoDB connection in MongoDB Compass
3. Review this migration guide
4. Check GitHub issues

---

**Migration completed successfully!** 🎉
All MySQL dependencies removed. Application now uses MongoDB exclusively.
