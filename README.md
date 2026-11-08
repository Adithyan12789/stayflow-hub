# StayFlow Hub

StayFlow is a modern stay management and booking platform built with a clean, separated architecture consisting of an independent **Frontend** (React + Vite + Tailwind CSS) and **Backend** (Node.js + Express + tRPC + Drizzle ORM + MongoDB).

---

## 📁 Project Structure

```text
stayflow-hub/
├── frontend/                     # React 19 Client Application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # UI components (Radix / Tailwind / Custom)
│   │   ├── contexts/             # React Contexts
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── lib/                  # Utilities & tRPC client setup
│   │   ├── pages/                # App pages & routes
│   │   ├── shared/               # Shared constants & error types
│   │   ├── App.tsx               # Main App routing
│   │   ├── index.css             # Tailwind v4 theme styling
│   │   └── main.tsx              # React DOM entry point
│   ├── components.json           # Shadcn UI configuration
│   ├── index.html                # Vite HTML entry point
│   ├── package.json              # Frontend dependencies & scripts
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── vite.config.ts            # Vite config with backend API proxy
│
├── backend/                      # Node.js + Express + tRPC API Server
│   ├── drizzle/                  # Drizzle MySQL schema & migrations
│   ├── src/
│   │   ├── _core/                # Auth, cookies, OAuth, S3, & helpers
│   │   ├── shared/               # Shared constants, types & error helpers
│   │   ├── db.ts                 # Database client (MySQL / Drizzle)
│   │   ├── mongodb.ts            # MongoDB models & operations
│   │   ├── razorpay.ts           # Razorpay payment & webhook logic
│   │   ├── routers.ts            # tRPC application procedures & routers
│   │   ├── scheduled.ts          # Scheduled tasks & background jobs
│   │   ├── storage.ts            # File storage proxy & handlers
│   │   └── index.ts              # Express API server entry point
│   ├── drizzle.config.ts         # Drizzle kit configuration
│   ├── package.json              # Backend dependencies & scripts
│   ├── tsconfig.json             # Backend TypeScript configuration
│   └── vitest.config.ts          # Backend test runner configuration
│
└── package.json                  # Root orchestration scripts
```

---

## 🚀 Quick Start

### 1. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm run install:all
```

Or install them individually:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`):
Copy `backend/.env.example` to `backend/.env` and update the variables:
```bash
cp backend/.env.example backend/.env
```
Key variables:
- `PORT=5000`
- `CLIENT_ORIGIN=http://localhost:5173`
- `DATABASE_URL=mysql://user:pass@localhost:3306/stayflow`
- `MONGODB_URI=mongodb://localhost:27017/stayflow`
- `RAZORPAY_KEY_ID=`
- `RAZORPAY_KEY_SECRET=`

#### Frontend (`frontend/.env`):
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
- `VITE_BACKEND_URL=http://localhost:5000`

---

### 3. Run Development Servers

From the root project folder:

| Command | Action |
| --- | --- |
| `npm run dev` | Runs both Backend and Frontend concurrently |
| `npm run dev:frontend` | Runs Frontend standalone on [http://localhost:5173](http://localhost:5173) |
| `npm run dev:backend` | Runs Backend standalone on [http://localhost:5000](http://localhost:5000) |

Or run from their respective folders:

```bash
# In frontend/:
npm run dev

# In backend/:
npm run dev
```

---

## 🛠️ Building for Production

```bash
# Build both
npm run build

# Or individually
npm run build:frontend
npm run build:backend
```
