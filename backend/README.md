# Kayal GMS Backend

Express + MongoDB + Mongoose (JavaScript) API for the Kayal GMS frontend.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI` (e.g. `mongodb://localhost:27017/kayal-gms` or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string)
   - Set `JWT_SECRET` (use a long random string in production)

3. **MongoDB**
   - Run MongoDB locally, or use MongoDB Atlas (free tier).
   - Ensure the app can connect to `MONGODB_URI`.

**If you get "bad auth : authentication failed" (Atlas):**
- In Atlas: Database Access → your user → Edit → ensure password is correct (or reset it).
- If the password contains special characters (`@`, `#`, `:`, `/`, `%`, etc.), **URL-encode** them in the connection string (e.g. `@` → `%40`, `#` → `%23`). Or set a password without special characters for the DB user.
- Use the connection string from Atlas: Connect → Drivers → Node.js. Replace `<password>` with your actual (encoded) password.
- Ensure Network Access in Atlas allows your IP (or use `0.0.0.0/0` for development).

4. **Seed the database**
   ```bash
   npm run seed
   ```
   This creates an admin, members, trainers, plans, products, payments, notifications, a diet plan, recipes, settings, and testimonials.  
   **Default password for all seeded users:** `password123`  
   - Admin: `9876543210`  
   - Members: `9876543212`, `9876543213`, `9876543214`, `9876543215`, `9876543216`  
   - Trainers: `9876543220`, `9876543221`

## Run

```bash
npm start
# or with auto-reload
npm run dev
```

Server runs at `http://localhost:3001`. API base: `http://localhost:3001/api`.

## API (Phase 0)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | - | Health check |
| POST | `/api/auth/login` | - | Login. Body: `{ "phone": "9876543210", "password": "password123", "role": "admin" }`. Returns `{ user, accessToken }`. |
| GET | `/api/users/me` | Bearer | Current user (from JWT). |
| GET | `/api/membership-plans` | optional | List active membership plans. |
| GET | `/api/products` | optional | List products. |

Use the returned `accessToken` in the header: `Authorization: Bearer <accessToken>`.

## Project structure

```
backend/
├── src/
│   ├── config/env.js
│   ├── models/          # Mongoose models
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── scripts/seed.js
├── .env.example
└── package.json
```

Next phases (see `BACKEND_INTEGRATION_PLAN.md`): members CRUD, payments, diet plans, recipes, notifications, dashboard stats, etc.
