# Project Dashboard

## Current Project Status
- **Phase**: UI & Theme Polish Completed
- **Health**: Both frontend (React/Vite) and backend (FastAPI) are fully up and running. Database fallback is SQLite.
- **Milestones**: Integrated a fully functional light/dark theme context. Created a premium dark mode theme (Obsidian & Neon Emerald). Restored the original translucent glass light-mode theme layout. Replaced all generic/emoji graphics on the Landing Page with custom Lucide icon graphics.

## Recently Completed Tasks
- [x] Restored original light-mode translucent glass layout on a `#F8F9FA` background.
- [x] Implemented a premium dark mode (Obsidian Slate `#090D14` and Neon Emerald `#10B981`).
- [x] Fixed theme background swapping using React state variables inside `Dashboard.tsx` layout wrapper.
- [x] Overhauled the `LandingPage.tsx` hero section, stats, and steps to use clean Lucide React icons instead of generic emojis.
- [x] Implemented local password recovery code feature on signup and password reset validation flows.
- [x] Show/hide toggles and strength indicator added to the authentication form modal.
- [x] Launched FastAPI backend successfully on `http://127.0.0.1:8000`.
- [x] Launched React/Vite dev server successfully on `http://localhost:5173`.
- [x] Configured Google OAuth 2.0 Client credentials on the Google Cloud Console and integrated with both Supabase Auth and NextAuth.
- [x] Overhauled Nodemailer SMTP transporter code to dynamically support SSL (port 465) and TLS (port 587) configurations with self-signed certificate fallback in development.
- [x] Integrated fully functional Google login account selector on the frontend connected to backend's `/api/auth/google` endpoint.
- [x] Implemented Email & Phone Number OTP generation, secure delivery (SMTP & Twilio/Mock), and verification backend routes and frontend input views.
- [x] Created `vercel.json` file in the workspace root to support multi-service deployment (Vite + FastAPI).
- [x] Unified all environment variable configurations into a single root `.env` file, and configured the backend to load it automatically using `find_dotenv()`.
- [x] Removed all duplicate and unwanted `.env` files from `/next-auth-system` directory.
- [x] Fixed local database connection warnings by setting default local SQLite fallback `DATABASE_URL=sqlite:///./ecotrack.db` in `.env`.

## Core Dependencies
- **Frontend**: React 19, Vite, Tailwind CSS (v4), Framer Motion, Recharts, Leaflet.
- **Backend**: FastAPI, SQLAlchemy, SQLite (Default/Fallback), PyJWT, Google Generative AI (Gemini), email-validator.

## Unused Code Review
- **Directory**: `/next-auth-system`
  - *Status*: Cleaned up of environment credentials and files. Ready for complete deletion.

## Immediate Next Steps
- [ ] Perform full walkthrough of the register-login-recover pipeline using Google OAuth and email verification.
- [ ] Confirm and proceed with the deletion of `/next-auth-system` directory if no longer needed.
