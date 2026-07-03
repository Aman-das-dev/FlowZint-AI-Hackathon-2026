# Next.js Full Authentication System

This project contains a production-ready, highly secure full-stack authentication system built using **Next.js 15+ (App Router)** and **Auth.js (NextAuth v5)** with a **Prisma + PostgreSQL/SQLite** database adapter.

---

## Features

1. **Google OAuth 2.0 Integration**
2. **Email + Password Login & Registration** (With secure password rules, verification email, and token-based forgot/reset password flows)
3. **Phone Number OTP Login** (With native rate-limiting, secure bcrypt-hashed local backup storage, and direct Twilio Verify SMS integration support)
4. **Protected Route Middleware** (Shields `/dashboard` from anonymous users)
5. **Unified, Premium Dark Glassmorphism UI Layout** (Fluid CSS transitions, custom loaders, responsive tabs, and validation notifications)

---

## Installation & Setup

### 1. Install Dependencies
Ensure you are inside the `next-auth-system` folder:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

### 3. Setup Database Schema & Migrations

#### SQLite (Default Local Development)
To enable local testing out of the box with zero external database configuration:
1. The database provider is set to SQLite by default (`prisma/schema.prisma`).
2. Run database sync to generate the SQLite database file and tables:
```bash
npx prisma db push
```

#### PostgreSQL (Production Configuration)
When moving to production:
1. In `prisma/schema.prisma`, change the `datasource db` block:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
2. Re-enable PostgreSQL specific type annotations (e.g. restore `@db.Text` on token/account fields in the `Account` model if needed).
3. Update the `DATABASE_URL` in `.env.local` to point to your live PostgreSQL database.
4. Run migrations:
```bash
npx prisma migrate dev --name init
```

---

## How to Get API Credentials

### 1. Google OAuth 2.0 Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **OAuth consent screen**, set user type, and complete details.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **+ Create Credentials** > **OAuth client ID** (Application Type: **Web application**).
5. Add Authorized Redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy your **Client ID** and **Client Secret** into your `.env.local` file.

### 2. Twilio Verify Credentials (for Phone OTP)
1. Sign up/log in to the [Twilio Console](https://www.twilio.com/).
2. Copy your **Account SID** and **Auth Token** into `.env.local`.
3. Locate **Verify** in the sidebar, create a new verification service, and copy its **Service SID** (starts with `VA...`).

> [!NOTE]
> If Twilio environment variables are **not** present, the application automatically runs in **Development Mock Mode**. It hashes and verifies the OTP using the database, and prints the 6-digit OTP code directly to your terminal logs for testing ease.

---

## Running with Docker (Recommended for Production Deployment)

We have included a multi-stage Docker build pipeline for building and orchestrating the authentication system.

### Option A: Using Docker Compose (Simplest)
To build and run the application and database container together:
```bash
docker-compose up --build
```
This automatically reads configuration from `.env.local`, builds the multi-stage Next.js bundle, runs Prisma schema pushes, and starts the server on port `3000`.

### Option B: Building Docker Image Manually
1. Build the production Docker image:
```bash
docker build -t next-auth-system-app .
```
2. Start the container, exposing port `3000` and loading local environment variables:
```bash
docker run -p 3000:3000 --env-file .env.local next-auth-system-app
```

---

## Running Locally

To run the Next.js development server locally without Docker:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
