# EcoTrack AI Workspace

This repository houses the full-stack **EcoTrack AI** ecosystem alongside a production-ready **Next.js Authentication System** built for scale and high security.

---

## 📂 Repository Structure

The workspace is organized into two primary pillars:

### 1. EcoTrack AI App
* **Frontend (`src/`)**: React 19 + TypeScript + Vite + Tailwind CSS.
* **Backend (`backend/`)**: Express.js (Node.js) server running database models and Gemini AI assistant integrations.
* **Vercel Serverless Gateway (`api/`)**: Points Vercel serverless functions directly to our centralized backend logic.

### 2. Next.js Auth System (`/next-auth-system`)
* **Framework**: Next.js 15+ App Router.
* **Auth Provider**: Auth.js (NextAuth v5) supporting Credentials (Email & Password), Google OAuth 2.0, and Phone OTP flows.
* **Database Manager**: Prisma ORM with a PostgreSQL database adapter configured to connect seamlessly to Supabase.
* **Containerization**: Includes a multi-stage production `Dockerfile` and `docker-compose.yml`.

---

## 🛠️ Quick Start Guide

### Step 1: Clone & Sync Environment Variables
Set up your local configuration by copying the templates:

* **EcoTrack Root**:
  Create `.env` at the root of the project:
  ```env
  # Comma-separated allowed admin emails
  VITE_ADMIN_EMAILS="admin1@domain.com,admin2@domain.com"
  
  # Default fallback Admin login credentials
  VITE_DEFAULT_ADMIN_EMAIL="admin@domain.com"
  VITE_DEFAULT_ADMIN_PASSWORD="your-secure-password"
  ```
  *(Note: A `.env.example` template is provided as a reference.)*

* **Next.js Auth System**:
  Create `.env.local` inside the `next-auth-system/` directory:
  ```bash
  cp next-auth-system/.env.example next-auth-system/.env.local
  ```

### Step 2: Initialize Database (Auth System)
Generate the database client and synchronize the schema:
```bash
cd next-auth-system
npm install
npx prisma db push
```

### Step 3: Run the Services

#### A. Running the Next.js Auth System
To run the authentication system locally:
```bash
# Inside /next-auth-system
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

#### B. Running the EcoTrack Vite App & Node.js Backend
1. **Frontend**:
   ```bash
   # From root workspace directory
   npm run dev
   ```
2. **Backend**:
   ```bash
   # From root workspace directory
   npm run backend
   ```
3. **Run Both Simultaneously**:
   ```bash
   # From root workspace directory
   npm run dev:fullstack
   ```

---

## 🐳 Docker Deployment (Next.js Auth System)

To build and run the authentication gateway in a containerized environment:
```bash
cd next-auth-system
docker-compose up --build
```
This automatically maps port `3000:3000` and loads configurations from `.env.local` to interface with your Supabase database instance.

---

## 🛡️ Security Implementations

* **No Credentials Leaks**: Hardcoded administrative emails and developer passwords have been stripped and migrated to local environment files (`.env` & `.env.local`) which are strictly git-ignored.
* **Account-Linking Mitigation**: NextAuth is configured with `allowDangerousEmailAccountLinking: false` to prevent credential account hijacking via Google OAuth. The client UI actively handles the `OAuthAccountNotLinked` error state.
* **Safe SMS Fallback**: If Twilio API keys are not supplied in development, the system falls back to mock SMS mode, printing verification and OTP codes securely to the server terminal.
