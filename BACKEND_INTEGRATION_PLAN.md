# Kayal GMS – Backend Integration Plan (End-to-End)

This document is a **high-level plan** to build an MVC backend and replace all hardcoded/mock flows in the frontend with real API integration. Work in phases so you can ship incrementally.

---

## 1. Current State Summary

### Frontend – What’s Hardcoded

| Area | Source | Used In |
|------|--------|--------|
| **Auth** | `App.tsx` (phone→user mapping, localStorage) | Login, role routing, permissions |
| **Users/Members** | `mockData.ts` → `memberUtils.ts` | MemberDashboard, MemberMembership, MemberPayments, MembersManagement, DietPlanManagement, MemberDiet |
| **Membership plans** | `mockMembershipPlans` | MembershipPlans, MembersManagement, MemberMembership, PricingSection |
| **Products** | `mockProducts` | ProductManagement, Shop |
| **Payments** | `mockPayments` | PaymentsManagement, DashboardOverview, MemberPayments |
| **Trainers** | `mockTrainers` | TrainersManagement |
| **Dashboard stats** | `mockDashboardStats` | DashboardOverview |
| **Notifications** | `mockNotifications` | AdminHeader, NotificationsManagement |
| **Diet plans** | `mockDietPlan` + `dietPlanUtils` (localStorage) | DietPlanManagement, MemberDiet, MemberDashboard |
| **Recipes** | `recipeUtils` (localStorage) | RecipeManagement, Recipes |
| **Testimonials** | `mockTestimonials` | TestimonialsSection (public) |
| **Settings / Staff** | Inline mock in SettingsManagement | SettingsManagement |
| **Reports** | Inline mock in ReportsAnalytics | ReportsAnalytics |

### Backend Today

- Only `backend/package.json` exists (no app code yet).

---

## 2. Backend High-Level MVC Design

### 2.1 Stack (Recommended)

- **Runtime:** Node.js
- **Language:** JavaScript (no TypeScript)
- **Framework:** Express
- **Database:** MongoDB (see “What is Prisma?” below)
- **ODM:** Mongoose (schemas, models, and queries)
- **Auth:** JWT (access + optional refresh), password hash (bcrypt)
- **Validation:** Optional (e.g. express-validator or Joi)

### 2.2 MongoDB + Mongoose (brief)

**MongoDB** is a **document database**. Data is stored as JSON-like documents in collections (e.g. `users`, `members`, `payments`). Run it locally or use MongoDB Atlas. **Mongoose** is the Node.js ODM: you define a **schema** per collection and get a **Model** with `find()`, `findById()`, `create()`, `save()`, `findOneAndUpdate()`. Relations use `ref`. No migrations—change schema in code and run a seed when needed. This plan uses **MongoDB + Mongoose** for all persistence.

2. **Gives you a JavaScript API instead of raw SQL**  
   Instead of writing `db.query('SELECT * FROM users WHERE id = ?', [id])`, you write:
   ```js
   const user = await mongoose.model({ where: { id } });
   ```
   Same for create, update, delete, and relations (e.g. “get member with their payments”).


4. **Works with JavaScript**  
   You don’t need TypeScript. You use the same `model.find()` etc. in plain `.js` files.

**Alternatives** if you prefer something you already know:

- **Raw SQL** with `pg` (node-postgres): full control, more code and manual migrations.
- **Sequelize**: another ORM, more “classic” (models as JS classes). 
### 2.3 MVC Layout (JavaScript)

```
backend/
├── src/
│   ├── index.js              # App entry, MongoDB connect, middleware (CORS, auth, error handler)
│   ├── config/
│   │   └── env.js            # env vars (MONGODB_URI, JWT_SECRET, etc.)
│   │
│   ├── models/               # Mongoose schemas and models
│   │   ├── User.js
│   │   ├── Member.js
│   │   ├── Trainer.js
│   │   ├── MembershipPlan.js
│   │   ├── Product.js
│   │   ├── Payment.js
│   │   ├── DietPlan.js
│   │   ├── Recipe.js
│   │   ├── Notification.js
│   │   ├── GymSettings.js
│   │   └── Testimonial.js
│   │
│   ├── controllers/          # Request/response, call services
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── members.controller.js
│   │   ├── membership-plans.controller.js
│   │   ├── products.controller.js
│   │   ├── payments.controller.js
│   │   ├── trainers.controller.js
│   │   ├── diet-plans.controller.js
│   │   ├── recipes.controller.js
│   │   ├── notifications.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── reports.controller.js
│   │   ├── settings.controller.js
│   │   └── testimonials.controller.js
│   │
│   ├── services/             # Business logic, use Mongoose models
│   │   ├── auth.service.js
│   │   ├── members.service.js
│   │   ├── membership-plans.service.js
│   │   ├── products.service.js
│   │   ├── payments.service.js
│   │   ├── trainers.service.js
│   │   ├── diet-plans.service.js
│   │   ├── recipes.service.js
│   │   ├── notifications.service.js
│   │   ├── dashboard.service.js
│   │   ├── reports.service.js
│   │   ├── settings.service.js
│   │   └── testimonials.service.js
│   │
│   ├── routes/               # Wire routes → controllers
│   │   ├── index.js          # Mount all routers
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── members.routes.js
│   │   ├── membership-plans.routes.js
│   │   ├── products.routes.js
│   │   ├── payments.routes.js
│   │   ├── trainers.routes.js
│   │   ├── diet-plans.routes.js
│   │   ├── recipes.routes.js
│   │   ├── notifications.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── reports.routes.js
│   │   ├── settings.routes.js
│   │   └── testimonials.routes.js
│   │
│   └── middleware/
│       ├── auth.middleware.js   # JWT verify, attach user to req
│       └── role.middleware.js   # Optional: admin / member / trainer guards
│
├── scripts/
│   └── seed.js                # Seed DB with initial admin, members, plans, etc.
│
├── package.json
└── .env.example
```

- **Models:** Mongoose schemas in `src/models/` (User, Member, Trainer, MembershipPlan, Product, Payment, DietPlan, Recipe, Notification, GymSettings, Testimonial). Each file exports a model (e.g. `mongoose.model('User', userSchema)`).
- **Controllers:** Parse request, call one or more **services**, return JSON.
- **Services:** All DB access via Mongoose models and business rules (e.g. “member has personal training”, “dashboard stats”).
- **Routes:** Map HTTP method + path to controller methods; apply auth/role middleware where needed.

---

## 3. Database Entities (MongoDB + Mongoose)

Align with `frontend/src/types/index.ts` and mock data. Each entity is a **Mongoose schema**; IDs are MongoDB `_id` (ObjectId). Use `ref` for relations (e.g. `memberId: { type: Schema.Types.ObjectId, ref: 'Member' }`).

- **User** – base schema (or single collection with `role`): name, phone, role (`admin`|`member`|`trainer`), status, passwordHash, createdAt, lastLogin, permissions (Array), isOnboarded. Can be embedded or referenced by Member/Trainer.
- **Member** – either same `User` collection with `role: 'member'` plus member fields, or separate **Member** collection with userId ref: membershipId, membershipPlanId (ref), membershipExpiry, joinDate, hasPersonalTraining, onboardingData (Object), dietPlanId (ref, optional).
- **Trainer** – same idea: User with `role: 'trainer'` plus Trainer collection or embedded: specialization (Array), experience, bio, rating, clients (Array of refs to Member).
- **MembershipPlan** – name, description, price, duration, features (Array), isPopular, isActive.
- **Product** – name, description, price, category, image, stock, status.
- **Payment** – memberId (ref), amount, type, status, date, dueDate, invoiceNumber. Optionally store memberName for display.
- **DietPlan** – memberId (ref), nutritionistId (ref), name, dailyCalories, macros (Object: protein, carbs, fats), meals (Array of subdocuments: type, foods, calories, time).
- **Recipe** – name, description, category, image, prepTime, cookTime, servings, calories, macros (Object), ingredients (Array), instructions (Array), tags (Array), createdBy (ref), createdAt, isActive.
- **Notification** – userId (ref), title, message, type, isRead, createdAt.
- **GymSettings** – single document or key-value: name, address, phone, logo, workingHours (Object), socialLinks (Object).
- **Testimonial** – name, role, avatar, content, rating (for public site).

Add **ScheduleSlot** (and trainer ref) when you implement class/schedule features.

---

## 4. API Surface (REST)

Keep URLs RESTful and consistent. Example:

| Resource | GET (list) | GET (one) | POST | PUT/PATCH | DELETE |
|----------|------------|-----------|------|-----------|--------|
| Auth | – | – | /auth/login, /auth/refresh | – | /auth/logout (optional) |
| Users | /users (admin) | /users/:id | /users (admin) | /users/:id | /users/:id |
| Members | /members (admin) | /members/me, /members/:id | /members | /members/:id | – |
| Membership plans | /membership-plans | /membership-plans/:id | /membership-plans | /membership-plans/:id | /membership-plans/:id |
| Products | /products | /products/:id | /products | /products/:id | /products/:id |
| Payments | /payments (admin), /payments/me (member) | /payments/:id | /payments | /payments/:id | – |
| Trainers | /trainers | /trainers/:id | /trainers | /trainers/:id | /trainers/:id |
| Diet plans | /diet-plans (admin), /diet-plans/me (member) | /diet-plans/:id | /diet-plans | /diet-plans/:id | /diet-plans/:id |
| Recipes | /recipes | /recipes/:id | /recipes | /recipes/:id | /recipes/:id |
| Notifications | /notifications/me | /notifications/:id | – | /notifications/:id/read | – |
| Dashboard | /dashboard/stats (admin) | – | – | – | – |
| Reports | /reports?type=...&from=...&to=... | – | – | – | – |
| Settings | /settings | – | – | /settings | – |
| Testimonials | /testimonials (public) | – | /testimonials (admin) | /testimonials/:id | /testimonials/:id |

- **Auth:** POST `/auth/login` body `{ phone, password, role? }` → returns `{ user, accessToken }`. Optional: POST `/auth/forgot-password`, POST `/auth/refresh`.
- **Guards:** Admin-only routes use role middleware; member routes use “member or admin”; `/members/me`, `/diet-plans/me`, `/payments/me` use JWT to resolve current user.

---

## 5. Phased Implementation Plan

### Phase 0 – Backend skeleton (Week 1)

1. Initialize Node + JavaScript in `backend/` (no TypeScript).
2. Add Express, mongoose, bcrypt, jsonwebtoken, dotenv, cors.
3. Create Mongoose **models** in `src/models/`: User (with role), Member (or User with member fields), Trainer, MembershipPlan, Product, Payment, DietPlan, Recipe, Notification, GymSettings, Testimonial. Connect to MongoDB in `src/index.js`.
4. Implement `src/index.js`: connect to MongoDB (MONGODB_URI), CORS, JSON body parser, global error handler, mount `/api` (or no prefix).
5. Implement auth middleware (JWT verify, attach `req.user`).
6. Implement **auth routes + controller + service**: login (phone + password → JWT), optional forgot-password stub.
7. **Seed script** `scripts/seed.js`: create 1 admin, 2–3 members, 2 trainers, a few plans, products, payments, notifications, 1 diet plan, 1–2 recipes, settings, testimonials so frontend can test immediately. Run with `node scripts/seed.js` (or add `npm run seed`).

**Exit criteria:** POST `/auth/login` returns a token; GET `/api/health` returns 200; MongoDB has seeded data.

---

### Phase 1 – Auth + “Me” and core read (Week 2)

1. **Frontend – API client**
   - Add `frontend/src/api/client.ts` (axios/fetch base URL, attach `Authorization: Bearer <token>` from localStorage).
   - Add `frontend/src/api/auth.ts`: `login(phone, password, role?)` → store token + user in localStorage and state.

2. **Backend**
   - Implement **users/members “me”**: GET `/users/me` or GET `/members/me` (return current user/member from JWT).
   - Implement GET **membership-plans** (public or authenticated).
   - Implement GET **products** (for shop and admin list).

3. **Frontend**
   - Replace `App.tsx` login flow: call `api.auth.login()` instead of building mockUser from phone; set user from API response; keep same routing (admin/member/trainer).
   - Replace `getCurrentMember(userId)` in `memberUtils.ts`: call GET `/members/me` (or `/users/me`) and cache in context or react-query; remove dependency on `mockMembers`.
   - Member area: get “current member” from API; Membership and Shop can still use mock plans/products until next step.
   - PricingSection: replace `mockMembershipPlans` with GET `/membership-plans`.
   - Shop: replace `mockProducts` with GET `/products`.

**Exit criteria:** Login uses real API; member dashboard and shop use real “me” and real plans/products.

---

### Phase 2 – Admin CRUD: Members, Plans, Products, Payments (Week 3)

1. **Backend**
   - Members: full CRUD + list with filters (status, search).
   - Membership plans: CRUD.
   - Products: CRUD.
   - Payments: list (admin + by member), create, update status.

2. **Frontend**
   - Add API modules: `members.ts`, `membership-plans.ts`, `products.ts`, `payments.ts`.
   - **MembersManagement:** fetch list from API, create/update member from forms; remove `mockMembers` / `mockMembershipPlans` for this page.
   - **MembershipPlans:** fetch/create/update/delete from API; remove local mock state.
   - **ProductManagement:** same; remove `mockProducts`.
   - **PaymentsManagement:** fetch and filter from API; remove `mockPayments`.
   - **DashboardOverview:** replace `mockDashboardStats`, `mockMembers`, `mockPayments` with GET `/dashboard/stats`, recent members, recent payments (add these endpoints if needed).
   - **MemberMembership:** use GET `/members/me` and GET `/membership-plans` (already in Phase 1); ensure “current plan” comes from member API.
   - **MemberPayments:** use GET `/payments/me` (or filter by memberId from token); remove mock.

**Exit criteria:** All admin member/plan/product/payment UIs and member membership/payments use API only.

---

### Phase 3 – Trainers, Diet plans, Recipes (Week 4)

1. **Backend**
   - Trainers: CRUD, list with filters.
   - Diet plans: CRUD; list by member (admin) or “my plan” (member); ensure only members with personal training can have a plan (business rule in service).
   - Recipes: CRUD, list (admin + public/member active).

2. **Frontend**
   - API: `trainers.ts`, `diet-plans.ts`, `recipes.ts`.
   - **TrainersManagement:** full API; remove `mockTrainers`.
   - **DietPlanManagement:** fetch members with PT and diet plans from API; replace `mockMembers` and `dietPlanUtils` (localStorage) with API.
   - **MemberDiet:** fetch “my diet plan” from API; remove `dietPlanUtils` and mock.
   - **RecipeManagement:** replace `recipeUtils` with API; remove localStorage.
   - **Recipes (member):** fetch active recipes from API.
   - **MemberDashboard:** diet summary from GET `/diet-plans/me` (or from member payload); remove mock/memberUtils for diet.

**Exit criteria:** Trainers, diet plans, and recipes are fully backed by API; no localStorage for diet/recipes.

---

### Phase 4 – Notifications, Dashboard stats, Reports, Settings (Week 5)

1. **Backend**
   - Notifications: list by user, mark read, optional create (for system events).
   - Dashboard: GET `/dashboard/stats` (aggregates: total/active members, revenue, pending, expiring).
   - Reports: GET `/reports?type=revenue|members|trainers&from=&to=` (return chart-ready data).
   - Settings: GET/PATCH gym settings; optional staff/admin user list for settings page.

2. **Frontend**
   - API: `notifications.ts`, `dashboard.ts`, `reports.ts`, `settings.ts`.
   - **AdminHeader:** unread count and list from `/notifications/me`; mark read via PATCH.
   - **NotificationsManagement:** list and mark read from API; remove mock.
   - **DashboardOverview:** already wired in Phase 2; ensure stats and charts use reports API if needed.
   - **ReportsAnalytics:** replace inline mock data with GET `/reports`; use same chart components.
   - **SettingsManagement:** load/save from `/settings`; staff list from `/users` or dedicated endpoint; remove inline mock.

**Exit criteria:** Notifications, dashboard stats, reports, and settings are API-driven.

---

### Phase 5 – Testimonials, Onboarding, Polish (Week 6)

1. **Backend**
   - Testimonials: list (public), CRUD (admin).
   - Member onboarding: PATCH `/members/me` with onboardingData and set `isOnboarded=true`.

2. **Frontend**
   - **TestimonialsSection:** GET `/testimonials`; remove `mockTestimonials`.
   - **MemberOnboarding:** on complete, PATCH `/members/me` with onboarding data; then redirect; remove local-only handling in `App.tsx`.
   - **Permissions:** if you have restricted admins, ensure backend returns permissions with user and that admin routes enforce them (middleware or in each controller).
   - Remove all remaining imports from `@/data/mockData` and delete or slim `mockData.ts` to dev-only fixtures if needed.
   - Optional: use React Query or SWR for all API calls (caching, loading, error states).

**Exit criteria:** No mock data in production path; onboarding and testimonials fully integrated.

---

## 6. Frontend Integration Checklist (Where to Change Code)

Use this as a quick reference when replacing mocks.

| Component / File | Replace with |
|------------------|-------------|
| `App.tsx` | `api.auth.login()`; user from API; onboarding PATCH `/members/me` |
| `useAuth.ts` | Optional: keep for interface; implement with API client |
| `memberUtils.ts` | GET `/members/me` (or from AuthContext); remove mockMembers |
| `dietPlanUtils.ts` | GET/POST/PUT/DELETE `/diet-plans` and `/diet-plans/me` |
| `recipeUtils.ts` | GET/POST/PUT/DELETE `/recipes` |
| `DashboardOverview` | GET `/dashboard/stats`, recent members/payments |
| `MembersManagement` | GET/POST/PUT `/members`, GET `/membership-plans` |
| `MembershipPlans` | GET/POST/PUT/DELETE `/membership-plans` |
| `ProductManagement` | GET/POST/PUT/DELETE `/products` |
| `PaymentsManagement` | GET `/payments`, POST/PATCH payments |
| `TrainersManagement` | GET/POST/PUT/DELETE `/trainers` |
| `DietPlanManagement` | GET members (with PT), GET/POST/PUT/DELETE `/diet-plans` |
| `RecipeManagement` | GET/POST/PUT/DELETE `/recipes` |
| `NotificationsManagement` | GET `/notifications/me`, PATCH read |
| `AdminHeader` | GET `/notifications/me` (unread count + list) |
| `MemberDashboard` | GET `/members/me`, GET `/diet-plans/me` (or from member) |
| `MemberMembership` | GET `/members/me`, GET `/membership-plans` |
| `MemberDiet` | GET `/diet-plans/me` |
| `MemberPayments` | GET `/payments/me` |
| `Shop` | GET `/products` |
| `Recipes` | GET `/recipes` (active) |
| `PricingSection` | GET `/membership-plans` |
| `TestimonialsSection` | GET `/testimonials` |
| `SettingsManagement` | GET/PATCH `/settings`, GET staff (e.g. `/users?role=admin`) |
| `ReportsAnalytics` | GET `/reports?type=...&from=...&to=...` |

---

## 7. Suggested Order of Backend Implementation

Within each phase, implement in this order to minimize blocking:

1. **Auth** (login, JWT, middleware).
2. **Members + Membership plans** (needed for “me” and admin members UI).
3. **Products + Payments** (admin + member payments).
4. **Dashboard stats** (aggregations from members/payments).
5. **Trainers.**
6. **Diet plans + Recipes.**
7. **Notifications.**
8. **Reports** (queries on members, payments, trainers).
9. **Settings.**
10. **Testimonials.**

---

## 8. Environment and Security

- **Backend:** `.env`: `MONGODB_URI` (e.g. `mongodb://localhost:27017/kayal-gms` or MongoDB Atlas connection string), `JWT_SECRET`, `PORT`, optional `NODE_ENV`.
- **Frontend:** `.env`: `VITE_API_BASE_URL=http://localhost:3001/api` (or your backend URL).
- **CORS:** Allow frontend origin in development and production.
- **Auth:** Store JWT in memory or localStorage (or httpOnly cookie if you add cookie-based auth); send in `Authorization: Bearer <token>`.
- **Passwords:** Never store plain text; use bcrypt (or similar) on signup and login.

---

## 9. Next Step

Start with **Phase 0**: scaffold the backend (Express + MongoDB + Mongoose + JavaScript), define the Mongoose models for the entities above, add auth (login + JWT middleware), and a seed script. Once you can log in and get `/users/me` or `/members/me`, move to Phase 1 and add the frontend API client and replace login and “current member” + plans/products.

If you want, the next concrete step can be: **generate the exact `backend/` folder structure and Mongoose models** (JavaScript entrypoints and schemas) so you can copy-paste and run.
