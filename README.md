# User Management System (MERN)

Full-stack user management app aligned with the Purple Merit MERN Stack Developer Intern Assessment: JWT authentication, role-based access (Admin, Manager, User), user lifecycle management, audit fields, and a React admin UI.

## Tech stack

- **Frontend:** React 18, React Router, Context API, Axios, Vite
- **Backend:** Node.js, Express, Mongoose, express-validator
- **Auth:** JWT access + refresh tokens, bcrypt password hashing
- **Database:** MongoDB

## Roles

| Role    | Capabilities |
|--------|----------------|
| **Admin** | Full user CRUD, assign roles, deactivate users, paginated searchable user list with filters |
| **Manager** | List all users; view/update **non-admin** users (name, email, status only) |
| **User** | View/update own profile (name, password); cannot change role or see others |

## Quick start (local)

### 1. MongoDB

```bash
docker compose up -d
```

Or use your own MongoDB URI.

**`MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`** means nothing is listening on Mongo’s port. Fix one of these:

1. **Docker** — Start Docker Desktop, wait until it is running, then run `docker compose up -d` again. Check with `docker compose ps` (container should be “running”).
2. **MongoDB installed on Windows** — Start the “MongoDB” Windows service (Services app) or run `mongod` so it binds to `127.0.0.1:27017`.
3. **MongoDB Atlas (cloud)** — Create a free cluster, get the connection string, and set `MONGODB_URI` in `server/.env` (replace `<password>` and allow your IP / `0.0.0.0/0` for testing).

Only start the API **after** Mongo accepts connections.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to long random strings
npm install
npm run seed
npm run dev
```

Re-run **`npm run seed`** anytime to recreate/reset the three demo accounts and their passwords (useful if you changed them or see “Invalid email or password”).

API defaults to `http://localhost:5000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the backend in development.

### Seeded logins

After `npm run seed`:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin123! | admin |
| manager@example.com | Manager123! | manager |
| user@example.com | User12345! | user |

## Environment variables

**Server** (`server/.env` — see `server/.env.example`):

- `MONGODB_URI` — Mongo connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — signing secrets
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` — optional (defaults `15m` / `7d`)
- `PORT` — API port (default `5000`)
- `CLIENT_ORIGIN` — CORS origin for production (e.g. your Vercel URL)
- `ALLOW_REGISTER` — set `true` to enable `POST /api/auth/register` (creates `user` role only)

**Client** (`client/.env` — see `client/.env.example`):

- `VITE_API_URL` — leave empty for local dev (use proxy). For production, set to your deployed API origin (no trailing slash).

## API overview

- `POST /api/auth/login` — `{ email, password }` → tokens + user
- `POST /api/auth/refresh` — `{ refreshToken }` → new access token
- `POST /api/auth/register` — optional if `ALLOW_REGISTER=true`
- `GET /api/auth/me` — current user (Bearer access token)
- `GET /api/users` — admin, manager — query: `page`, `limit`, `search`, `role`, `status`
- `POST /api/users` — admin — create user (optional `autoPassword: true`)
- `GET /api/users/:id` — authorized per RBAC
- `PATCH /api/users/:id` — update per RBAC
- `PATCH /api/users/:id/deactivate` — admin — soft deactivate (inactive users cannot log in)

Password hashes are never returned. User records include `createdAt`, `updatedAt`, `createdBy`, `updatedBy` where applicable.

## Database schema

Single `User` collection (Mongoose model in `server/src/models/User.js`):

- `name`, `email` (unique), `password` (hashed, `select: false`)
- `role`: `admin` | `manager` | `user`
- `status`: `active` | `inactive`
- `createdBy`, `updatedBy` — references to `User`
- Timestamps: `createdAt`, `updatedAt`

No separate migration files; schema is defined in code. Use `npm run seed` for initial data.

## Deployment

### Option A: Vercel (frontend + API on one project)

The repo includes `vercel.json` and `api/index.js` so the **Vite build** is static hosting and **Express** runs as a single serverless function (MongoDB must be reachable from the internet, e.g. **MongoDB Atlas**).

1. Push the project to GitHub and [import it in Vercel](https://vercel.com/new). **Root directory:** leave as the repository root (where `vercel.json` lives).
2. **Environment variables** (Project → Settings → Environment Variables), for *Production* (and Preview if you want):

   | Name | Notes |
   |------|--------|
   | `MONGODB_URI` | Atlas connection string (not `127.0.0.1`) |
   | `JWT_ACCESS_SECRET` | Long random string |
   | `JWT_REFRESH_SECRET` | Different long random string |
   | `CLIENT_ORIGIN` | Optional; your site URL, e.g. `https://your-app.vercel.app` or your custom domain. If omitted, `VERCEL_URL` is used for CORS when present. |
   | `ALLOW_REGISTER` | Optional: `true` / `false` |

3. Do **not** set `VITE_API_URL` for this setup: the browser should call `/api/...` on the same origin.
4. After deploy, **seed the database** from your machine (same Atlas URI as in Vercel):

   ```bash
   cd server
   # Set MONGODB_URI in .env to the same string as Vercel, then:
   npm run seed
   ```

5. In Atlas → **Network Access**, allow **`0.0.0.0/0`** (or Vercel’s IPs) so serverless functions can connect.

Local dev is unchanged: run Mongo locally, `server` on port 5000, `client` with Vite proxy.

### Option B: Split hosting

1. Deploy the API (e.g. Render, Railway) with `MONGODB_URI` and JWT secrets set.
2. Deploy the static frontend (e.g. Vercel, Netlify) with **`VITE_API_URL`** set to the **public API base URL** (no trailing slash), e.g. `https://api.example.com`.
3. Set **`CLIENT_ORIGIN`** on the API to your frontend URL for CORS.

## Assessment deliverables checklist

- [x] MERN stack, JWT + bcrypt, RBAC on the backend
- [x] Admin user management (pagination, search, filters, create/edit, deactivate)
- [x] Manager view/update for non-admin users
- [x] User self-service profile
- [x] Audit fields + detail view showing who created/updated and when
- [x] README, `.env.example`, optional `docker-compose.yml` for MongoDB
- [ ] Record a 2–3 minute demo video and submit via the assessment form
- [ ] Push to a **public** GitHub repo and link it in the form

Form link (from assessment): [Google Form](https://forms.gle/fgbFeS2dgiZ4pqez9)
