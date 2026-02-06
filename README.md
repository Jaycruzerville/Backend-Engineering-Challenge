# OneHaven Caregiver API

A robust, real-time Caregiver Management API built with **Node.js (Express)**, **MongoDB**, and **Supabase Auth**.

## Quick setup

Prerequisites
- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Supabase project (for authentication)

Clone & install
```bash
git clone <repository-url>
cd onehaven-backend-challenge
npm install
```

Environment
```bash
# Create .env file:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/onehaven
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```
> **Note**: Disable "Confirm Email" in Supabase Authentication settings (Providers -> Email) for easier testing with the seed script.

Run
```bash
npm start
```

Swagger UI (Local): [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
Live Demo: [https://backend-engineering-challenge-production.up.railway.app/api-docs/](https://backend-engineering-challenge-production.up.railway.app/api-docs/)

Verification Harness
```bash
# Simulates Signup -> Login -> Concurrent Member Addition
npm run seed
```

## Design explanation (succinct)
1. Language & framework
	- **Node.js + Express** for lightweight routing and middleware.
	- **Mongoose** for schema validation and data modeling.
	- **Winston** for structured logging.

2. Authentication & identity
	- **Supabase** as identity provider (JWT).
	- **Self-Healing Auth**: Middleware automatically links Supabase users to MongoDB records if they get desynchronized (e.g., deleted in DB but not Auth).

3. Database & architecture
	- **MongoDB** for application data.
	- **Layered Architecture**: Routes, Controllers, Models, and Middleware are strictly separated.
	- **Centralized Error Handling**: Unified middleware catches Zod validation errors, CastErrors, and generic server errors.

4. Security considerations
	- **Rate Limiting**: 100 requests per 15 minutes per IP.
	- **RBAC**: Application-level logic enforces strict data isolation (via `caregiverId` scoping).
	- **Input Validation**: Zod ensures all incoming data matches expected schemas.

## AI usage summary (short)
- The AI assistant was used as a developer tool to accelerate implementation (scaffolding, docs, tests).
- All architectural decisions, security logic (RBAC, Rate Limiting), and code reviews were guided by the developer.
- Code changes were verified manually via the execution harness.

## Event flow (brief)
1. Client obtains JWT from Supabase.
2. Client calls protected API with `Authorization: Bearer <token>`.
3. Server validates token, syncs caregiver record if needed, and attaches `req.user`.
4. Controllers execute business logic and emit real-time logs:

```text
[TIMESTAMP] EVENT: member_added — { ... }
```

## Verification Results
- **Execution Harness**: Adds 3 members concurrently.
- **RBAC**: Code verified to enforce strict scoping.
- **Error Handling**: Graceful JSON responses for all error types.

## API Endpoints
*   `POST /api/protected-members` (Create)
*   `GET /api/protected-members` (List)
*   `PATCH /api/protected-members/:id` (Update)
*   `DELETE /api/protected-members/:id` (Delete)
