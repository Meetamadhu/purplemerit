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

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env — set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET to long random strings
npm install
npm run seed
npm run dev
```

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

1. Deploy the API (e.g. Render, Railway) with `MONGODB_URI` and JWT secrets set.
2. Deploy the static frontend (e.g. Vercel, Netlify) with `VITE_API_URL` pointing at the API.
3. Set `CLIENT_ORIGIN` on the server to your frontend URL for CORS.

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
