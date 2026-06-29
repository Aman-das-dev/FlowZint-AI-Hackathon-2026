# Project Brain

## Core Rules
1. **Surgical Edits**: When making changes to code, always use surgical, targeted edits rather than rewriting large sections of files. 
2. **Global Text Search**: You MUST perform a global text search before modifying any shared dependencies, utility functions, or components to understand the impact of your changes across the entire codebase.
3. **Permission for Core Modifications**: Always ask for permission before modifying core configuration files (like `package.json`, `vite.config.ts`, `requirements.txt`) or routing files.

## Tech Stack
### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8.1
- **Styling**: Tailwind CSS 4.3 (New Eco theme: Forest Green `#38523A`, Vibrant Green `#84B056`, Yellow `#D9E335`, Light Background `#F8F9FA`)
- **State Management / Data Fetching**: React Query (TanStack Query)
- **UI / Data Visualization**: Recharts, Leaflet (Voyager Light Maps), Framer Motion (Animations), Lucide React (Icons)

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy 
- **Authentication**: Passlib (bcrypt), PyJWT
- **AI Integration**: Google Generative AI (Gemini)

### Database
- **Primary Database**: PostgreSQL (for production/logistics tracking)
- **Local Fallback Database**: SQLite (via `sqlite:///./ecotrack.db` when `DATABASE_URL` is commented in `.env`)

## Project Map
```text
FlowZint-AI-Hackathon-2026/
├── backend/                  # FastAPI backend application
│   ├── .env                  # Environment variables
│   ├── main.py               # Main FastAPI application entrypoint
│   ├── public/               # Public assets for backend (if any)
│   ├── requirements.txt      # Python dependencies
│   └── setup_postgres.py     # Database setup scripts
├── public/                   # Static public assets for frontend
├── src/                      # React frontend source code
│   ├── components/           # React component views
│   │   ├── AdminPanel.tsx    # Logistics control metrics & heatmap
│   │   ├── AIScan.tsx        # Camera scanning & classification
│   │   ├── AuthModal.tsx     # Login/Register modal
│   │   ├── Chatbot.tsx       # AI assistant chat dialog
│   │   ├── Dashboard.tsx     # Sidebar shell, mobile top-nav & main view router
│   │   ├── ImpactDashboard.tsx # Environmental metrics ledger & charts
│   │   ├── LandingPage.tsx   # Premium split-hero landing page
│   │   ├── PickupTracker.tsx # Booking scheduler & trackable list
│   │   └── RewardsLeaderboard.tsx # Badge checklist & competitor rows
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Architectural & Theme Decisons (2026 Redesign)
1. **Light Eco Theme Styling**: The entire system has been converted from a dark theme to a bright light-mode theme (`#F8F9FA` body). Translucent glassmorphism panels have been converted into solid white cards (`#ffffff`) with thin border lines and shadow effects.
2. **Text Contrast Rules**: All text colors on viewport components must be slate-800 (`#1e293b`) or slate-600 (`#475569`) rather than white/light grey, ensuring legible contrast on the new light theme.
3. **Mobile Drawer Navigation**: The dashboard implements a responsive mobile top navigation header with a menu toggle button. The sidebar navigates as a fixed overlay drawer on mobile viewports (`md:hidden`) and docks as a normal sidebar on desktop views (`md:flex`).
4. **Local DB Fallback**: The server is designed to easily fall back to SQLite when local PostgreSQL servers are not available.

## Workflow Rule
**MANDATORY:** At the end of every major task or code change, you MUST update `DASHBOARD.md` with the latest state of the project.
