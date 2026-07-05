# Project Brain

## Core Rules
1. **Surgical Edits**: When making changes to code, always use surgical, targeted edits rather than rewriting large sections of files. 
2. **Global Text Search**: You MUST perform a global text search before modifying any shared dependencies, utility functions, or components to understand the impact of your changes across the entire codebase.
3. **Permission for Core Modifications**: Always ask for permission before modifying core configuration files (like `package.json`, `vite.config.ts`, `requirements.txt`) or routing files.

## Tech Stack
### Frontend (React Ecosystem)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8.1
- **Styling**: Tailwind CSS 4.3 with CSS Variables theme overrides.
  - **Light Theme**: Default eco green layout with dark glass panels on `#F8F9FA` background.
  - **Dark Theme (Obsidian & Neon Emerald)**: Deep obsidian backgrounds (`#090D14`, `#111827`, `#030712`) with neon green (`#10B981`, `#34D399`) and amber (`#FBBF24`) details.
- **State Management / Data Fetching**: React Query (TanStack Query)
- **UI / Data Visualization**: Recharts, Leaflet (Voyager Light Maps - imported locally to bypass browser tracking block alerts), Framer Motion (Animations), Lucide React (Icons)

### Next.js Authentication Ecosystem (Standalone - Unused Candidate for Deletion)
- **Framework**: Next.js 15+ (App Router)
- **Status**: Standalone package in `/next-auth-system` directory. Not used or referenced by current Vite frontend or FastAPI backend. Candidate for deletion.

### Python Backend
- **Framework**: FastAPI (Python 3)
- **Database ORM**: SQLAlchemy 2.0 (using `text()` helper annotations)
- **Authentication**: Passlib (bcrypt) with password hashing and recovery code verification, PyJWT
- **AI Integration**: Google Generative AI (Gemini)

### Database
- **Primary Database**: PostgreSQL (via `psycopg2-binary`)
- **Local Fallback Database**: SQLite (via `sqlite:///./ecotrack.db` when `DATABASE_URL` is omitted or commented out in `.env`). Automatically handles connection failures gracefully by creating database tables on launch.

## Project Map
```text
FlowZint-AI-Hackathon-2026/
├── .env.example              # Sample template environment file
├── Vercel.json               # Vercel service definition & routing configuration
├── backend/                  # FastAPI backend application
│   ├── .env                  # Environment variables (SQLite/Postgres configuration)
│   ├── main.py               # Main FastAPI application entrypoint with fallback logic
│   ├── public/               # Public assets for backend
│   └── requirements.txt      # Python dependencies
├── next-auth-system/         # Standalone Next.js auth system service (UNUSED)
├── public/                   # Static public assets for Vite frontend
├── src/                      # React frontend source code
│   ├── components/           # React component views
│   │   ├── AdminPanel.tsx    # Authorized admin console logs and heatmap
│   │   ├── AIScan.tsx        # Camera scanning & classification presets
│   │   ├── AuthModal.tsx     # Sign in & sign up modal with password eye toggles & strength validation
│   │   ├── Chatbot.tsx       # AI assistant chat dialog
│   │   ├── Dashboard.tsx     # Sidebar shell, mobile top-nav, and main view router (with theme integration)
│   │   ├── ImpactDashboard.tsx # Environmental metrics ledger & charts
│   │   ├── LandingPage.tsx   # Premium landing page overalled with clean Lucide icons
│   │   ├── PickupTracker.tsx # Booking scheduler & trackable list
│   │   └── RewardsLeaderboard.tsx # Badge checklist & competitor rows
│   ├── context/
│   │   └── ThemeContext.tsx  # Global light/dark mode theme state
│   ├── services/
│   │   └── api.ts            # Frontend HTTP clients and recovery actions
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
```

## Architectural & Security Decisions
1. **Light & Dark Eco Themes**: 
   - **Light Mode**: Translucent dark glassmorphism panels styled over a clean light gray background (`#F8F9FA`).
   - **Dark Mode**: High contrast Obsidian and Neon Emerald theme that updates backgrounds to `#090D14` and navigation elements to `#030712`.
   - Toggle state is handled via `ThemeContext` and applied dynamically via layout ternaries and the `.dark` class.
2. **Dynamic Geolocation Maps**: Locator maps are relocated to India and centered dynamically using the browser's live Geolocation API.
3. **Admin Dashboard Security & Visibility**:
   - The Admin Console is hidden from normal users in the main sidebar and tab views.
   - Restricted to authorized admin emails (`admin@ecotrack.ai`) and exposes full lists of registered users (including plain-text passwords in administrative log tables for audit purposes) and e-waste submissions.
   - Authorized admin users bypass secondary passcode logins and directly access metrics logs.
4. **Local DB Fallback**: The server is designed to easily fall back to SQLite when local PostgreSQL servers are not available.
5. **Vercel Rewrite Routing**: `Vercel.json` rewrites all `/api/*` routes to the backend FastAPI service, and all other routes to the Vite React frontend.
## Workflow Rule
**MANDATORY:** At the end of every major task or code change, you MUST update `DASHBOARD.md` with the latest state of the project.
