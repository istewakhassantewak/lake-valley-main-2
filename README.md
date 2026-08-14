# Lake Valley — Flower City Real Estate

Vite + React frontend with Express API backend, Firebase Authentication, and MongoDB.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite 8, React 19, React Router 7, Tailwind CSS 4 |
| Backend | Express 4, Mongoose 8 |
| Auth | Firebase (client) + Firebase Admin (server) |
| Database | MongoDB Atlas (+ JSON fallback) |

## Local Development

### 1. Frontend setup

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Frontend runs at `http://localhost:5173`

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env         # Windows: copy .env.example backend\.env
# Edit backend/.env with your MongoDB URI and Firebase Admin credentials
npm run dev
```

Backend runs at `http://localhost:5000`

### Required environment variables

**Frontend (`.env.local`):**
- `VITE_API_URL=/api` (uses Vite proxy in dev)
- `VITE_FIREBASE_*` — Firebase web app config

**Backend (`backend/.env`):**
- `MONGODB_URI` — MongoDB Atlas connection string
- `CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com`
- `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-admin-key.json` (local) OR `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (production)
- `ADMIN_API_KEY` — secret for admin GET endpoints

## Production Deployment

### Frontend (Netlify / Vercel)

```bash
npm run build
```

Set environment variables in your hosting dashboard:
- `VITE_API_URL` — your deployed API URL (e.g. `https://lake-valley-api.onrender.com/api`)
- All `VITE_FIREBASE_*` variables from `.env.example`

### Backend (Render)

Deploy the `backend/` directory. See `backend/render.yaml` for configuration.

Set all backend env vars in Render dashboard:
- `MONGODB_URI`, `CORS_ORIGIN`, `ADMIN_API_KEY`
- Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `CORS_ORIGIN` must include your production frontend URL (e.g. `https://lakevalley.netlify.app`)

> **Note:** This project uses **Vite + React** (not Next.js). All routing is client-side via React Router.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run dev:backend` | Start backend with nodemon |
| `npm run build` | Production build |
| `npm run lint` | Run oxlint |
| `npm run start:backend` | Start backend (production) |
| `cd backend && npm run dev` | Start backend with nodemon |
| `cd backend && npm start` | Start backend (production) |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/bookings` | Optional | Create booking |
| PATCH | `/api/bookings/:id/cancel` | Required | Cancel booking |
| POST | `/api/contact` | Optional | Submit contact message |
| GET | `/api/users/profile` | Required | Get profile |
| PUT | `/api/users/profile` | Required | Update profile |
| GET | `/api/users/bookings` | Required | Get user bookings |
