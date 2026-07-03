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

#### PostgreSQL (Production default)
1. Ensure a PostgreSQL instance is running.
2. In `.env.local`, configure the `DATABASE_URL`.
3. Create the database schema and generate the client:
```bash
npx prisma migrate dev --name init
```

#### SQLite (Local development fallback)
If you prefer not to use PostgreSQL during local testing:
1. In `prisma/schema.prisma`, change the `datasource db` block:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```
2. Remove any database-specific type annotations (e.g. `@db.Text` in the `Account` model).
3. Run the SQLite schema creation:
```bash
npx prisma db push
```

---

## How to Get API Credentials

### 1. Google OAuth 2.0 Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services** > **OAuth consent screen**, set user type, and complete details.
4. Navigate to **APIs & Services** > **Credentials**.
5. Click **+ Create Credentials** > **OAuth client ID**.
6. Set Application Type to **Web application**.
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
8. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
9. Copy your **Client ID** and **Client Secret** into your `.env.local` file.

### 2. Twilio Verify Credentials (for Phone OTP)
1. Sign up/log in to the [Twilio Console](https://www.twilio.com/).
2. Copy your **Account SID** and **Auth Token** from your Console dashboard.
3. In the sidebar search, locate **Verify** or go directly to the Verify services page.
4. Click **Create Service** and give it a name (e.g., "NextAuth Gateway").
5. Copy the generated **Service SID** (starts with `VA...`).
6. Paste all three variables into your `.env.local`.

> [!NOTE]
> If Twilio environment variables are **not** present, the application automatically runs in **Development Mock Mode**. It hashes and verifies the OTP using the database, and prints the 6-digit OTP code directly to your terminal logs for testing ease.

### 3. Nodemailer SMTP Setup (for Verification Emails)
To test verification links, configure any SMTP server (e.g. Mailtrap, Gmail, or Resend SMTP credentials) inside `.env.local`:
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`

> [!NOTE]
> If SMTP variables are **not** present, the application prints email verification and password reset links directly to your terminal logs so you can copy and test them immediately.

---

## Running the Application
To run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
