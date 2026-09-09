# 🏋️ Fitness Buddy — AI-Powered Personal Health & Fitness Coach

<div align="center">

> A production-quality, full-stack web application that delivers personalized fitness coaching, workout generation, nutrition planning, and habit tracking — all powered by **IBM Granite AI** via IBM Cloud watsonx.ai.

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white&style=flat-square)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![IBM Granite](https://img.shields.io/badge/AI-IBM%20Granite%204-052FAD?logo=ibm&logoColor=white&style=flat-square)](https://www.ibm.com/granite)
[![watsonx](https://img.shields.io/badge/Platform-IBM%20watsonx.ai-8A3FFC?style=flat-square)](https://dataplatform.cloud.ibm.com/wx/home)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [How It Works](#3-how-it-works)
4. [Features](#4-features)
5. [Technology Stack](#5-technology-stack)
6. [IBM Granite AI Integration](#6-ibm-granite-ai-integration)
7. [Project Architecture](#7-project-architecture)
8. [Project Structure](#8-project-structure)
9. [IBM Cloud Setup](#9-ibm-cloud-setup)
10. [Environment Variables](#10-environment-variables)
11. [Local Installation & Setup](#11-local-installation--setup)
12. [Running the Application](#12-running-the-application)
13. [API Documentation](#13-api-documentation)
14. [Security Considerations](#14-security-considerations)
15. [AI Safety & Prompt Design](#15-ai-safety--prompt-design)
16. [Demo Flow](#16-demo-flow)
17. [Screenshots & Pages](#17-screenshots--pages)
18. [Future Improvements](#18-future-improvements)

---

## 1. Project Overview

**Fitness Buddy** is a full-stack, AI-powered personal fitness coaching web application built for a university project. It solves the problem of inaccessible, impersonal fitness guidance by providing a smart, always-available virtual coach that adapts to each user's unique goals, fitness level, available time, and equipment.

The application is powered by **IBM Granite** (`ibm/granite-4-h-small`) running on **IBM Cloud watsonx.ai** — IBM's enterprise AI platform. IBM Granite handles all conversational AI, generating personalized workout descriptions, nutrition advice, motivational messages, and fitness coaching through a secure backend service layer.

### Key Highlights

| Attribute | Detail |
|-----------|--------|
| **Type** | Full-stack Web Application |
| **AI Model** | IBM Granite 4 (`ibm/granite-4-h-small`) |
| **AI Platform** | IBM Cloud watsonx.ai |
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Node.js + Express + TypeScript |
| **Port (Frontend)** | `http://localhost:5173` |
| **Port (Backend)** | `http://localhost:5000` |
| **Data Storage** | JSON file-based persistence (production-swappable) |

---

## 2. Problem Statement

In today's fast-paced world, many individuals struggle to maintain a healthy lifestyle due to:

- **Lack of personalized guidance** — Generic workout plans don't account for individual fitness levels, goals, or available equipment
- **Time constraints** — People can't always access gyms or personal trainers
- **Inconsistent motivation** — Without accountability, people quit within weeks
- **Information overload** — Too much conflicting fitness and nutrition advice online
- **High cost** — Personal trainers and nutritionists are expensive

### Solution

Fitness Buddy provides an **accessible, intelligent, always-available virtual fitness coach** that:
- Adapts recommendations to each user's personal profile
- Generates workouts based on available time (10–60 minutes) and equipment
- Provides real-time conversational AI coaching via IBM Granite
- Tracks habits, progress, and workout history
- Motivates users with personalized daily plans

---

## 3. How It Works

### End-to-End Flow

```
┌─────────────┐     HTTP/REST      ┌─────────────────┐     IBM IAM + REST    ┌──────────────────┐
│             │  ─────────────────▶ │                 │ ─────────────────────▶ │                  │
│   Browser   │                    │  Express Backend │                        │  IBM watsonx.ai  │
│  (React)    │ ◀───────────────── │  (Node.js)      │ ◀───────────────────── │  IBM Granite AI  │
│             │   JSON Response    │                 │    Generated Text       │                  │
└─────────────┘                    └─────────────────┘                        └──────────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  JSON Files │
                                   │  (data/)    │
                                   │  profile    │
                                   │  habits     │
                                   │  history    │
                                   │  sessions   │
                                   └─────────────┘
```

### Authentication Flow (IBM Granite)

```
Backend ──▶ IBM IAM API (get token using API Key)
        ◀── access_token (JWT, ~1 hour validity)
        ──▶ watsonx.ai /ml/v1/text/generation (with Bearer token)
        ◀── Generated AI response
        ──▶ Frontend (AI response text only — no keys ever exposed)
```

### User Interaction Flow

```
User fills Profile ──▶ Profile stored in backend
       │
       ▼
User opens Dashboard ──▶ Daily Plan loaded (workout + meal + motivation + habits)
       │
       ▼
User asks AI Coach ──▶ Message sent to /api/chat
                   ──▶ Backend builds system prompt with user profile
                   ──▶ IBM Granite generates response
                   ──▶ Response streamed back to chat UI
       │
       ▼
User generates Workout ──▶ /api/workout/generate
                       ──▶ Exercise library builds structured plan
                       ──▶ IBM Granite adds coaching description
                       ──▶ Workout plan displayed with timer
       │
       ▼
User completes Workout ──▶ /api/workout/complete
                       ──▶ Saved to history.json
                       ──▶ Habit "workout" auto-marked complete
       │
       ▼
Progress Dashboard ──▶ /api/progress
                   ──▶ Aggregates history + habits + streak
                   ──▶ Recharts visualizations rendered
```

---

## 4. Features

### 🤖 AI Fitness Chat Coach
A full conversational chat interface powered by IBM Granite. Users can ask natural language questions and receive structured, personalized responses. The AI remembers conversation context within the session and uses the user's profile to tailor advice.

**Example questions:**
- *"Give me a 20-minute beginner workout with no equipment"*
- *"What should I eat after a workout?"*
- *"I want to lose weight — where do I start?"*
- *"Create a weekly fitness routine for me"*
- *"I feel tired and unmotivated — help me"*

### 👤 Personalized User Profile
Full onboarding form capturing:
- Name, Age, Gender, Height, Weight
- Fitness Level (Beginner / Intermediate / Advanced)
- Fitness Goal (Weight Loss / Muscle Gain / General Fitness / Strength / Endurance)
- Available Workout Time (10 / 20 / 30 / 45 / 60 minutes)
- Workout Location (Home / Gym / Outdoor)
- Equipment (None / Dumbbells / Resistance Bands / Full Gym / Custom)
- Dietary Preference (Vegetarian / Non-Veg / Vegan / Other)
- Food Allergies / Restrictions

BMI is calculated and displayed automatically from height and weight.

### 💪 Workout Generator
Generates complete workout plans with:
- Warm-up section
- Main exercises with sets, reps, instructions, safety tips, and target area
- Cool-down section
- **Live workout timer** — Start, Pause, Resume
- One-click **Complete Workout** saves to history and marks habit done
- AI coaching notes from IBM Granite

### 🥗 Nutrition Planner
Personalized meal suggestions with:
- Ingredient list with measurements
- Step-by-step preparation instructions
- Approximate calories, protein, carbs, fat
- Preparation time
- Health benefits
- "Log as Healthy Meal" button updates habit tracker

### ✅ Habit Tracker
Daily tracking of 5 core habits:
- 💪 Workout completed
- 💧 Drink 8 glasses of water
- 🥗 Eat a healthy meal
- 😴 Sleep 7–8 hours
- 🚶 Stay active 30+ minutes

Features: streak counter, 7-day visual grid (colour-coded), progress bar, optimistic UI updates.

### 📈 Progress Dashboard
Visual progress tracking with:
- 6 stat cards (goal, today's habits, weekly workouts, streak, total workouts, progress %)
- **Bar chart** — daily habit completion over 7 days (Recharts)
- **Line chart** — workout frequency over 6 weeks (Recharts)
- Achievement badges (unlock on milestone completion)
- Progress bar showing weekly habit completion %

### 📋 Workout History
Filterable log of all completed workouts:
- Date and time
- Workout title and type
- Duration in minutes
- Exercises performed
- Completion status (Completed / Partial / Skipped)

### 📅 Daily Plan
Personalised daily overview:
- Today's generated workout
- Meal suggestion
- Water reminder
- Daily fitness tip
- Motivational quote
- Habit checklist with one-tap toggles

### 🎯 Quick Actions
Dashboard shortcut buttons for instant access to all key features.

### 📱 Fully Responsive
Works on mobile, tablet, laptop, and desktop. Mobile-first CSS with a fixed bottom navigation bar on small screens.

---

## 5. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| React Router | v6 | Client-side routing |
| Axios | Latest | HTTP client |
| React Markdown | Latest | Render AI markdown responses |
| Recharts | Latest | Charts & data visualisation |
| CSS Variables | — | Theming & responsive design |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime |
| Express | 4.x | REST API framework |
| TypeScript | 5.x | Type safety |
| dotenv | 16.x | Environment variable loading |
| Helmet | 7.x | HTTP security headers |
| CORS | 2.x | Cross-origin request control |
| express-rate-limit | 7.x | API rate limiting |
| uuid | 9.x | Unique ID generation |

### AI & Cloud

| Technology | Purpose |
|------------|---------|
| **IBM Granite 4** (`ibm/granite-4-h-small`) | Primary AI model for all responses |
| **IBM Cloud watsonx.ai** | AI model hosting and REST API |
| **IBM IAM** | API key → access token authentication |
| Mock AI Provider | Fallback for development without credentials |

### Data Storage

| Layer | Technology | Notes |
|-------|-----------|-------|
| Persistence | JSON files (`backend/data/`) | Lightweight, no DB setup needed |
| Profile | `data/profile.json` | Single user profile |
| Habits | `data/habits.json` | Array of daily habit records |
| History | `data/history.json` | Array of completed workouts |
| Chat Sessions | `data/sessions.json` | Last 10 chat sessions |
| Workouts | `data/workouts.json` | Last 20 generated plans |
| Meals | `data/meals.json` | Last 50 meal recommendations |

> The JSON store is a drop-in replacement layer — swap for MongoDB or PostgreSQL by rewriting `backend/src/utils/store.ts`.

---

## 6. IBM Granite AI Integration

### Model Used
```
Model ID:  ibm/granite-4-h-small
Endpoint:  https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29
Platform:  IBM Cloud watsonx.ai
```

### Authentication Method
IBM Cloud uses IAM (Identity and Access Management) token-based authentication:

```
Step 1:  POST https://iam.cloud.ibm.com/identity/token
         Body: grant_type=...apikey&apikey=<IBM_API_KEY>
         ──▶  Returns: { access_token: "eyJ..." }

Step 2:  POST https://us-south.ml.cloud.ibm.com/ml/v1/text/generation
         Header: Authorization: Bearer <access_token>
         Body: { input, parameters, model_id, project_id }
         ──▶  Returns: { results: [{ generated_text: "..." }] }
```

### API Request Format (matches IBM Sample Code)
```json
{
  "input": "<system prompt>\n\nUser: <message>\nAssistant:",
  "parameters": {
    "decoding_method": "greedy",
    "max_new_tokens": 800,
    "min_new_tokens": 0,
    "repetition_penalty": 1.1
  },
  "model_id": "ibm/granite-4-h-small",
  "project_id": "6eaa6325-ac2e-4618-9e89-70ef5885d496"
}
```

### System Prompt Design
The AI persona is defined in `backend/src/services/aiService.ts`:

```
You are Fitness Buddy, a friendly AI wellness and fitness assistant.
Provide practical, simple, and personalized fitness, workout, healthy
lifestyle, and basic nutrition guidance.

[User Profile injected here if available]:
- Name, Age, Fitness Level, Goal, Available Time
- Equipment, Location, Dietary Preference, Restrictions
```

### Where IBM Granite Is Used
| Endpoint | IBM Granite Usage |
|----------|-------------------|
| `POST /api/chat` | Full conversational AI responses |
| `POST /api/workout/generate` | AI coaching notes for workout plans |
| `POST /api/nutrition/recommend` | AI nutritionist notes for meal suggestions |

### Fallback (Demo Mode)
If `IBM_API_KEY` or `IBM_PROJECT_ID` are not set, the app automatically uses pre-written mock responses. The frontend shows **"Demo Mode"** instead of **"IBM Granite Active"**. All other features work identically.

---

## 7. Project Architecture

### Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Dashboard │ │ AICoach  │ │ Workout  │ │  Nutrition       │ │
│  │          │ │ (Chat UI)│ │(Timer)   │ │  Habits Progress │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       └────────────┴────────────┴────────────────┘            │
│                     Axios HTTP Client                          │
│                  (services/api.ts)                             │
└────────────────────────────┬───────────────────────────────────┘
                             │  REST API  (JSON)
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express + TypeScript)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Middleware  │  │   Routes     │  │     Controllers       │ │
│  │  - Helmet   │  │  /api/chat   │  │  chatController       │ │
│  │  - CORS     │  │  /api/workout│  │  workoutController    │ │
│  │  - RateLimit│  │  /api/habits │  │  nutritionController  │ │
│  │  - Sanitize │  │  /api/profile│  │  habitsController     │ │
│  └─────────────┘  │  /api/...   │  │  profileController    │ │
│                   └──────┬───────┘  │  progressController   │ │
│                          │          └───────────────────────┘ │
│                   ┌──────▼───────┐                            │
│                   │   Services   │                            │
│                   │ aiService ◀──┼──── IBM Granite API        │
│                   │ workoutSvc   │                            │
│                   │ nutritionSvc │                            │
│                   └──────┬───────┘                            │
│                          │                                    │
│                   ┌──────▼───────┐                            │
│                   │  Data Store  │                            │
│                   │  (JSON files)│                            │
│                   └──────────────┘                            │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow — Chat Message

```
1. User types message in AICoach.tsx
2. chatAPI.send(message, sessionId) → POST /api/chat
3. chatController.ts:
   a. Validates & sanitizes input
   b. Loads user profile from store
   c. Gets/creates chat session
   d. Calls aiService.getAIResponse(messages, userMessage, profile)
4. aiService.ts:
   a. Builds system prompt with user profile
   b. Tries IBM Granite → callIBMGranite(messages)
      i.  Gets IAM access token
      ii. Sends prompt to watsonx.ai text/generation endpoint
      iii.Returns generated_text
   c. On failure → returns mock response
5. AI response saved to session, returned to frontend
6. React renders response with ReactMarkdown (formatted)
```

---

## 8. Project Structure

```
fitness-buddy/
│
├── README.md                          ← This file
│
├── backend/
│   ├── .env.example                   ← Template for environment variables
│   ├── .env                           ← Your local config (never commit)
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── data/                          ← Auto-created JSON persistence
│   │   ├── profile.json               ← User profile
│   │   ├── habits.json                ← Daily habit records
│   │   ├── history.json               ← Completed workout log
│   │   ├── workouts.json              ← Generated workout plans
│   │   ├── meals.json                 ← Meal recommendations
│   │   └── sessions.json              ← Chat sessions (last 10)
│   │
│   ├── dist/                          ← Compiled JavaScript (auto-generated)
│   │
│   └── src/
│       ├── index.ts                   ← Express server entry point
│       │
│       ├── models/
│       │   └── types.ts               ← All TypeScript interfaces
│       │
│       ├── controllers/
│       │   ├── chatController.ts      ← /api/chat handler
│       │   ├── workoutController.ts   ← /api/workout/* handlers
│       │   ├── nutritionController.ts ← /api/nutrition/* handlers
│       │   ├── habitsController.ts    ← /api/habits handlers
│       │   ├── profileController.ts   ← /api/profile handlers
│       │   └── progressController.ts  ← /api/progress, /api/history, /api/daily-plan
│       │
│       ├── routes/
│       │   ├── chat.ts
│       │   ├── workout.ts
│       │   ├── nutrition.ts
│       │   ├── habits.ts
│       │   ├── profile.ts
│       │   └── dashboard.ts
│       │
│       ├── services/
│       │   ├── aiService.ts           ← IBM Granite integration + mock fallback
│       │   ├── workoutService.ts      ← Exercise library + workout generation
│       │   └── nutritionService.ts    ← Meal library + nutrition generation
│       │
│       ├── middleware/
│       │   └── index.ts               ← Sanitizer, logger, error handler
│       │
│       └── utils/
│           └── store.ts               ← JSON file persistence layer
│
└── frontend/
    ├── .env.example                   ← Frontend env template
    ├── .env                           ← Your local frontend config
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    │
    └── src/
        ├── App.tsx                    ← Router setup (React Router v6)
        ├── main.tsx                   ← Entry point
        ├── index.css                  ← Global styles + CSS variables
        │
        ├── types/
        │   └── index.ts               ← Frontend TypeScript interfaces
        │
        ├── services/
        │   └── api.ts                 ← Axios client + all API calls
        │
        ├── components/
        │   └── Layout.tsx             ← Sidebar, mobile nav, app shell
        │
        └── pages/
            ├── Dashboard.tsx          ← Home: daily plan, quick actions, habits
            ├── AICoach.tsx            ← Chat UI with IBM Granite
            ├── Workout.tsx            ← Workout generator + live timer
            ├── Nutrition.tsx          ← Meal planner + macro display
            ├── Habits.tsx             ← Habit tracker + 7-day grid
            ├── Progress.tsx           ← Charts + achievements
            ├── History.tsx            ← Workout history log
            └── Profile.tsx            ← User onboarding + profile form
```

---

## 9. IBM Cloud Setup

### Step 1 — Create IBM Cloud Account
1. Go to [https://cloud.ibm.com/registration](https://cloud.ibm.com/registration)
2. Sign up for a **free Lite account** (no credit card required for Lite tier)

### Step 2 — Create a watsonx.ai Project
1. Go to [https://dataplatform.cloud.ibm.com/wx/home](https://dataplatform.cloud.ibm.com/wx/home)
2. Click **"New project"** → give it a name (e.g., `fitness-buddy`)
3. Go to **Manage** tab of the project
4. Copy your **Project ID** — you will need this

> ✅ The project ID for this app: `6eaa6325-ac2e-4618-9e89-70ef5885d496`

### Step 3 — Get your IBM Cloud API Key
1. Go to [https://cloud.ibm.com/iam/apikeys](https://cloud.ibm.com/iam/apikeys)
2. Click **"Create an IBM Cloud API key"**
3. Give it a name like `fitness-buddy-key`
4. **Copy the key immediately** — it is shown only once

### Step 4 — Verify Model Access
The model used is **`ibm/granite-4-h-small`**.

To verify it's available in your region:
1. Go to your watsonx.ai project
2. Click **"Prompt Lab"**
3. Search for `granite-4-h-small` in the model selector

### Step 5 — Add credentials to .env
See [Section 10](#10-environment-variables) below.

---

## 10. Environment Variables

### Backend — `fitness-buddy/backend/.env`

```env
# ── Server ────────────────────────────────────────────────────
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ── IBM Granite / watsonx.ai ──────────────────────────────────
# Your IBM Cloud API Key (from IAM > API Keys)
IBM_API_KEY=your_ibm_cloud_api_key_here

# Your watsonx.ai Project ID
IBM_PROJECT_ID=6eaa6325-ac2e-4618-9e89-70ef5885d496

# IBM Granite model to use
IBM_MODEL_ID=ibm/granite-4-h-small

# watsonx.ai regional endpoint
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Frontend — `fitness-buddy/frontend/.env`

```env
# Backend API base URL
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files** containing real API keys. Use `.env.example` as a safe template.

### What happens without IBM credentials?
The backend detects missing credentials and automatically switches to the **mock AI provider**. All app features still work — workout generation, habits, nutrition, history, progress — only the AI chat responses are pre-written demo answers instead of live IBM Granite responses.

---

## 11. Local Installation & Setup

### Prerequisites
| Requirement | Version |
|-------------|---------|
| Node.js | v18.0.0 or higher |
| npm | v9.0.0 or higher |

Check your versions:
```bash
node --version   # should be v18+
npm --version    # should be v9+
```

### Installation Steps

```bash
# 1. Navigate to project root
cd fitness-buddy

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure backend environment
copy .env.example .env
# Open .env and add your IBM_API_KEY

# 4. Compile TypeScript backend
npm run build

# 5. Install frontend dependencies
cd ../frontend
npm install

# 6. Configure frontend environment
copy .env.example .env
# Default values work for local development — no changes needed
```

---

## 12. Running the Application

> ⚠️ You need **two separate terminal windows** — one for backend, one for frontend.

### Terminal 1 — Start Backend

```bash
cd fitness-buddy/backend
node dist/index.js
```

**Expected output:**
```
🏋️  Fitness Buddy Backend running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
🤖 IBM Granite: ✅ Configured        ← (or ⚠️ Not configured if no API key)
```

### Terminal 2 — Start Frontend

```bash
cd fitness-buddy/frontend
npm run dev
```

**Expected output:**
```
  VITE v8.x.x  ready in 1074 ms

  ➜  Local:   http://localhost:5173/
```

### Open the App
Go to **[http://localhost:5173](http://localhost:5173)** in your browser.

### Verify Both Servers
```bash
# Check backend health
curl http://localhost:5000/api/health
# Should return: {"status":"ok","ibmGraniteEnabled":true,...}
```

### If IBM Granite is configured correctly, the AI Coach page shows:
```
● Powered by IBM Granite ✨        ← green dot
✅ IBM Granite Active               ← green badge (top right)
```

---

## 13. API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status + IBM Granite enabled flag |

---

### Chat (IBM Granite AI)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/chat` | Send message to IBM Granite AI | 30 req/15 min |
| GET | `/chat/history/:sessionId` | Retrieve chat history | — |

**POST `/api/chat` — Request:**
```json
{
  "message": "Give me a 20-minute beginner workout",
  "sessionId": "optional-existing-session-id"
}
```

**POST `/api/chat` — Response:**
```json
{
  "sessionId": "uuid-v4",
  "message": {
    "id": "uuid-v4",
    "role": "assistant",
    "content": "Here's your workout...",
    "timestamp": "2026-09-09T10:00:00.000Z"
  },
  "provider": "ibm-granite"
}
```

---

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get saved user profile |
| POST | `/profile` | Create user profile |
| PUT | `/profile` | Update user profile |

**POST `/api/profile` — Required fields:**
```json
{
  "name": "Alex",
  "age": 25,
  "height": 175,
  "weight": 70,
  "fitnessLevel": "beginner",
  "fitnessGoal": "general-fitness",
  "availableTime": 30,
  "workoutLocation": "home",
  "equipment": "none",
  "dietaryPreference": "non-vegetarian"
}
```

---

### Workout

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workout/generate` | Generate a new workout plan |
| GET | `/workout/today` | Get the most recently generated workout |
| POST | `/workout/complete` | Mark a workout as completed |
| GET | `/workout/motivation` | Get a random motivational message |

**POST `/api/workout/generate` — Body:**
```json
{
  "goal": "general-fitness",
  "fitnessLevel": "beginner",
  "availableTime": 20,
  "equipment": "none",
  "location": "home"
}
```

---

### Nutrition

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/nutrition/recommend` | Get a meal suggestion | 30 req/15 min |
| GET | `/nutrition/history` | Get past meal recommendations | — |

**POST `/api/nutrition/recommend` — Body:**
```json
{
  "mealType": "breakfast",
  "dietaryPreference": "vegetarian",
  "goal": "weight-loss",
  "availableIngredients": "oats, banana, yogurt",
  "restrictions": "no nuts"
}
```

---

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits` | Get today's habits + 7-day data + streak |
| POST | `/habits` | Update habit completion for a date |
| GET | `/habits/all` | Get all habit records |

**POST `/api/habits` — Body:**
```json
{
  "date": "2026-09-09",
  "habits": {
    "workout": true,
    "water": true,
    "healthyMeal": false,
    "sleep": true,
    "activity": false
  }
}
```

---

### Dashboard & Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress` | Get all progress metrics + chart data |
| GET | `/history` | Get full workout history |
| GET | `/daily-plan` | Get today's full plan (workout + meal + tip + habits) |

---

## 14. Security Considerations

| Risk | Mitigation |
|------|-----------|
| API key exposure | Keys only in backend `.env` — never sent to frontend |
| XSS attacks | Input sanitizer middleware strips `<script>`, `javascript:`, etc. |
| CSRF / request flooding | `express-rate-limit`: 30 req/15 min on AI endpoints |
| Sensitive headers | `helmet.js` sets secure HTTP headers automatically |
| CORS abuse | Strict origin allowlist via `CORS_ORIGIN` env variable |
| Large payloads | Body size limited to `10kb` |
| Internal errors leaked | Global error handler catches all errors — never exposes stack traces |
| Credential logging | No API keys or tokens are written to any log |
| Over-permissive profile | Only whitelisted fields accepted on profile update |

---

## 15. AI Safety & Prompt Design

The IBM Granite system prompt explicitly instructs the model to:

✅ Provide beginner-friendly, accessible guidance  
✅ Adapt all recommendations to user's fitness level and equipment  
✅ Encourage realistic, sustainable lifestyle changes  
✅ Use structured formatting (headings, bullet points) for clarity  

❌ Never diagnose or imply medical conditions  
❌ Never recommend dangerous exercises, extreme diets, or unsafe weight loss  
❌ Never encourage eating disorders  
❌ Never present uncertain information as confirmed medical fact  

**Safety Disclaimer (shown in UI):**
> *Fitness Buddy provides general wellness information only. It is not a replacement for a qualified doctor, dietitian, or certified fitness professional. Always consult a professional before starting a new exercise or diet program.*

---

## 16. Demo Flow

Follow these steps for a complete demonstration:

| Step | Action | Page |
|------|--------|------|
| 1 | Open `http://localhost:5173` | Dashboard |
| 2 | Click **Profile** → fill in all fields → Save | Profile |
| 3 | Return to **Dashboard** → see personalized welcome | Dashboard |
| 4 | Click **"Generate Today's Workout"** button | Dashboard |
| 5 | Go to **Workout** → click **"Start Workout"** → timer starts | Workout |
| 6 | Click on any exercise card to expand details | Workout |
| 7 | Click **"Complete"** → workout saved to history | Workout |
| 8 | Go to **AI Coach** → ask *"Give me a weekly plan"* | AI Coach |
| 9 | Click quick prompts at the bottom | AI Coach |
| 10 | Go to **Nutrition** → generate a breakfast suggestion | Nutrition |
| 11 | Click **"Log as Healthy Meal"** | Nutrition |
| 12 | Go to **Habits** → toggle all habits on | Habits |
| 13 | Go to **Progress** → see charts and achievements | Progress |
| 14 | Go to **History** → see completed workout | History |

---

## 17. Screenshots & Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Daily plan, quick actions, motivation, habit checklist |
| AI Coach | `/coach` | IBM Granite chat interface |
| Workout | `/workout` | Generator + exercise cards + live timer |
| Nutrition | `/nutrition` | Meal planner + macros visualisation |
| Habits | `/habits` | Daily tracker + 7-day grid + streak |
| Progress | `/progress` | Bar & line charts + achievement badges |
| History | `/history` | Filterable workout log |
| Profile | `/profile` | Onboarding form + BMI display |

---

## 18. Future Improvements

| Feature | Priority |
|---------|----------|
| User authentication (JWT + bcrypt) | High |
| PostgreSQL / MongoDB database | High |
| Progressive Web App (offline support) | Medium |
| Push notifications (workout/water reminders) | Medium |
| IBM Granite streaming responses | Medium |
| Video exercise demonstrations | Medium |
| Custom workout program builder | Medium |
| Calorie diary & food logging | Medium |
| Integration with wearables (Apple Health, Google Fit) | Low |
| Social features (share progress) | Low |
| Multi-language support | Low |
| AI meal photo analysis | Low |

---

## License

This project was built for a university course project.

---

<div align="center">

**Built with ❤️ using IBM Granite AI on IBM Cloud watsonx.ai**

*Fitness Buddy provides general wellness information only.*  
*Not a replacement for a qualified doctor, dietitian, or fitness professional.*

</div>
