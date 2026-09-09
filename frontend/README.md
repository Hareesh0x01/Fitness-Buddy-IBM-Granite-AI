# 🏋️ Fitness Buddy — Frontend

> React 18 + TypeScript + Vite frontend for the **Fitness Buddy** AI-powered personal health & fitness coach application.

---

## 📋 Overview

This is the frontend client for Fitness Buddy. It is a **single-page application (SPA)** built with React 18, TypeScript, and Vite. It communicates with the Express backend via REST API and renders responses from IBM Granite AI using markdown formatting.

| Property | Value |
|----------|-------|
| **Framework** | React 18 |
| **Language** | TypeScript 5.x |
| **Build Tool** | Vite 8.x |
| **Dev Port** | `http://localhost:5173` |
| **Backend API** | `http://localhost:5000/api` |
| **Router** | React Router v6 |
| **HTTP Client** | Axios |
| **Charts** | Recharts |
| **AI Rendering** | React Markdown |

---

## 📁 Folder Structure

```
src/
│
├── App.tsx                  ← Root component — React Router v6 setup
├── main.tsx                 ← Entry point — ReactDOM.createRoot
├── index.css                ← Global CSS styles + CSS custom properties
│
├── types/
│   └── index.ts             ← All shared TypeScript interfaces
│
├── services/
│   └── api.ts               ← Axios instance + all API call functions
│
├── components/
│   └── Layout.tsx           ← App shell: sidebar, mobile nav, page outlet
│
└── pages/
    ├── Dashboard.tsx        ← Home page: daily plan, quick actions, habits
    ├── AICoach.tsx          ← IBM Granite chat interface
    ├── Workout.tsx          ← Workout generator + exercise cards + timer
    ├── Nutrition.tsx        ← Meal planner + macro visualisation
    ├── Habits.tsx           ← Daily habit tracker + 7-day streak grid
    ├── Progress.tsx         ← Charts (Recharts) + achievement badges
    ├── History.tsx          ← Filterable completed workout log
    └── Profile.tsx          ← User onboarding form + BMI display
```

---

## 🧩 Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `Dashboard.tsx` | Daily plan, quick action buttons, motivation, habit checklist |
| `/coach` | `AICoach.tsx` | Full chat UI powered by IBM Granite AI |
| `/workout` | `Workout.tsx` | Generate workouts, view exercises, start live timer |
| `/nutrition` | `Nutrition.tsx` | Get meal suggestions with macros and preparation steps |
| `/habits` | `Habits.tsx` | Track 5 daily habits with streak and weekly grid |
| `/progress` | `Progress.tsx` | View progress charts and unlock achievements |
| `/history` | `History.tsx` | Browse completed workout history |
| `/profile` | `Profile.tsx` | Set up and update your fitness profile |

---

## 🔌 API Service (`src/services/api.ts`)

All backend communication goes through the Axios client in `api.ts`. The base URL is read from the environment variable `VITE_API_URL`.

```ts
// Available API modules:
chatAPI.send(message, sessionId)        // POST /api/chat
profileAPI.get()                        // GET  /api/profile
profileAPI.create(data)                 // POST /api/profile
profileAPI.update(data)                 // PUT  /api/profile
workoutAPI.generate(params)             // POST /api/workout/generate
workoutAPI.getToday()                   // GET  /api/workout/today
workoutAPI.complete(data)               // POST /api/workout/complete
workoutAPI.getMotivation()              // GET  /api/workout/motivation
nutritionAPI.recommend(params)          // POST /api/nutrition/recommend
habitsAPI.get(date?)                    // GET  /api/habits
habitsAPI.update(date, habits)          // POST /api/habits
dashboardAPI.getProgress()              // GET  /api/progress
dashboardAPI.getHistory()               // GET  /api/history
dashboardAPI.getDailyPlan()             // GET  /api/daily-plan
dashboardAPI.getHealth()                // GET  /api/health
```

---

## 🎨 Styling

The application uses **plain CSS with custom properties** (CSS variables) — no CSS framework or Tailwind.

All styles are in [`src/index.css`](src/index.css). Key design tokens:

```css
--primary: #6366f1;        /* Indigo — buttons, accents */
--secondary: #10b981;      /* Emerald — success states */
--bg: #0f172a;             /* Dark navy — page background */
--bg-card: #1e293b;        /* Slightly lighter — cards */
--text-primary: #f1f5f9;   /* Near-white text */
--text-secondary: #94a3b8; /* Muted text */
--border: #2d3748;         /* Card borders */
--radius: 12px;            /* Default border radius */
--sidebar-width: 260px;    /* Desktop sidebar */
```

### Responsive Breakpoints
| Breakpoint | Layout |
|------------|--------|
| `> 1024px` | Desktop — sidebar visible, full grid |
| `769–1024px` | Tablet — 2-column grids |
| `≤ 768px` | Mobile — sidebar hidden, bottom nav bar shown |

---

## 🤖 IBM Granite AI — Frontend Behaviour

The AI Coach page (`/coach`) connects to IBM Granite via the backend:

1. **On page load** — calls `GET /api/health` to check if IBM Granite is configured
2. **IBM Granite Active** — green badge: `✅ IBM Granite Active`, dot shows `Powered by IBM Granite ✨`
3. **Demo Mode** — yellow badge: `⚠️ Demo Mode`, dot shows `Demo Mode`
4. **On message send** — `POST /api/chat` → response rendered with `react-markdown`
5. **Typing indicator** — animated 3-dot indicator while awaiting response
6. **Quick prompts** — scrollable bar of pre-built suggestion buttons

### Chat Message Rendering
AI responses use `react-markdown` with custom component styling:
- `**bold**` → highlighted text
- `## Heading` → section headers in indigo
- `- bullet` → styled list items
- Numbered steps for workout instructions

---

## ⚙️ Environment Variables

Create a `.env` file in this directory:

```env
# URL of the backend API server
VITE_API_URL=http://localhost:5000/api
```

> All Vite env variables must be prefixed with `VITE_` to be accessible in the browser.

Copy from the example file:
```bash
copy .env.example .env
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- Backend server running on port `5000`

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Opens at **http://localhost:5173** with hot module replacement (HMR).

### Build for Production
```bash
npm run build
```
Output goes to `dist/`. Serve with any static file server.

### Type Check
```bash
npx tsc --noEmit
```

### Preview Production Build
```bash
npm run preview
```

---

## 📦 Dependencies

### Runtime
| Package | Purpose |
|---------|---------|
| `react` | UI component framework |
| `react-dom` | DOM rendering |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests to backend |
| `react-markdown` | Render IBM Granite AI markdown responses |
| `recharts` | Bar + line charts on Progress page |
| `lucide-react` | Icon set |

### Dev
| Package | Purpose |
|---------|---------|
| `vite` | Build tool + dev server |
| `@vitejs/plugin-react` | React fast-refresh plugin |
| `typescript` | Type checking |
| `@types/react` | React type definitions |
| `@types/react-dom` | ReactDOM type definitions |

---

## 🔒 Security Notes

- **No API keys in frontend** — IBM Granite credentials are only in the backend `.env`
- The frontend only sends user messages and receives text responses
- `VITE_API_URL` only contains the backend URL — no secrets
- All user data stays local (sent to backend, stored in `backend/data/` JSON files)

---

## 📱 Mobile Navigation

On screens `≤ 768px`:
- The sidebar is **hidden**
- A **top header bar** shows the current page name and a hamburger menu
- A **bottom navigation bar** shows the first 5 navigation items (Dashboard, AI Coach, Workout, Nutrition, Habits)
- Page content has `padding-bottom: 70px` to avoid overlap with the bottom bar

---

## 🛠️ Key Implementation Details

### Optimistic UI Updates (Habits)
Habit toggles in `Habits.tsx` update the UI immediately before the API call completes, then roll back on error — for a snappy user experience.

### Session Persistence (Chat)
The `sessionId` from the first chat response is stored in React state and sent with every subsequent message, allowing the backend to maintain conversation context within the session.

### Workout Timer
The `Workout.tsx` page uses `setInterval` via `useEffect` with proper cleanup to implement a live workout timer that can be paused and resumed.

### Profile-Aware Requests
When generating workouts or meals, the backend uses the saved user profile to personalise results. No profile data needs to be sent from the frontend on each request — it's loaded server-side.

---

*Part of the Fitness Buddy project — see the [main README](../README.md) for full project documentation.*
