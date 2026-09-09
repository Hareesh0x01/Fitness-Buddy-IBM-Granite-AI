import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UserProfile,
  WorkoutHistory,
  HabitEntry,
  ChatSession,
  WorkoutPlan,
  MealRecommendation,
} from '../models/types';

// ============================================================
// Simple JSON file-based persistence layer
// Designed to be swapped for a real DB (MongoDB, PostgreSQL, etc.)
// ============================================================

const DATA_DIR = path.join(__dirname, '../../data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      const raw = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch {
    // Return default if file is corrupted
  }
  return defaultValue;
}

function writeFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================================
// Profile Store
// ============================================================
export const profileStore = {
  get(): UserProfile | null {
    return readFile<UserProfile | null>('profile.json', null);
  },
  save(profile: UserProfile): UserProfile {
    writeFile('profile.json', profile);
    return profile;
  },
  update(updates: Partial<UserProfile>): UserProfile | null {
    const existing = this.get();
    if (!existing) return null;
    const updated: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeFile('profile.json', updated);
    return updated;
  },
};

// ============================================================
// Workout History Store
// ============================================================
export const historyStore = {
  getAll(): WorkoutHistory[] {
    return readFile<WorkoutHistory[]>('history.json', []);
  },
  add(entry: Omit<WorkoutHistory, 'id'>): WorkoutHistory {
    const all = this.getAll();
    const newEntry: WorkoutHistory = { id: uuidv4(), ...entry };
    all.unshift(newEntry);
    writeFile('history.json', all);
    return newEntry;
  },
  getById(id: string): WorkoutHistory | undefined {
    return this.getAll().find((h) => h.id === id);
  },
  getThisWeek(): WorkoutHistory[] {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return this.getAll().filter(
      (h) => new Date(h.completedAt) >= weekStart && h.status === 'completed'
    );
  },
};

// ============================================================
// Habit Store
// ============================================================
export const habitStore = {
  getAll(): HabitEntry[] {
    return readFile<HabitEntry[]>('habits.json', []);
  },
  getByDate(date: string): HabitEntry | null {
    const all = this.getAll();
    return all.find((h) => h.date === date) || null;
  },
  upsert(date: string, habits: Partial<Omit<HabitEntry, 'id' | 'date'>>): HabitEntry {
    const all = this.getAll();
    const index = all.findIndex((h) => h.date === date);
    if (index !== -1) {
      all[index] = { ...all[index], ...habits };
      writeFile('habits.json', all);
      return all[index];
    }
    const newEntry: HabitEntry = {
      id: uuidv4(),
      date,
      workout: false,
      water: false,
      healthyMeal: false,
      sleep: false,
      activity: false,
      ...habits,
    };
    all.push(newEntry);
    writeFile('habits.json', all);
    return newEntry;
  },
  getStreakCount(): number {
    const all = this.getAll().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    for (const entry of all) {
      if (entry.date !== checkDate) break;
      const completedCount = Object.values({
        workout: entry.workout,
        water: entry.water,
        healthyMeal: entry.healthyMeal,
        sleep: entry.sleep,
        activity: entry.activity,
      }).filter(Boolean).length;
      if (completedCount >= 3) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    return streak;
  },
  getLast7Days(): HabitEntry[] {
    const days: HabitEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = this.getByDate(dateStr);
      days.push(
        entry || {
          id: '',
          date: dateStr,
          workout: false,
          water: false,
          healthyMeal: false,
          sleep: false,
          activity: false,
        }
      );
    }
    return days;
  },
};

// ============================================================
// Chat Session Store
// ============================================================
export const chatStore = {
  getSession(sessionId: string): ChatSession | null {
    const sessions = readFile<Record<string, ChatSession>>('sessions.json', {});
    return sessions[sessionId] || null;
  },
  saveSession(session: ChatSession): void {
    const sessions = readFile<Record<string, ChatSession>>('sessions.json', {});
    sessions[session.id] = session;
    // Keep only last 10 sessions to avoid unbounded growth
    const keys = Object.keys(sessions);
    if (keys.length > 10) {
      const oldest = keys.sort(
        (a, b) => new Date(sessions[a].createdAt).getTime() - new Date(sessions[b].createdAt).getTime()
      )[0];
      delete sessions[oldest];
    }
    writeFile('sessions.json', sessions);
  },
  createSession(): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveSession(session);
    return session;
  },
};

// ============================================================
// Meal Recommendation Store
// ============================================================
export const mealStore = {
  getAll(): MealRecommendation[] {
    return readFile<MealRecommendation[]>('meals.json', []);
  },
  save(meal: MealRecommendation): MealRecommendation {
    const all = this.getAll();
    all.unshift(meal);
    if (all.length > 50) all.splice(50);
    writeFile('meals.json', all);
    return meal;
  },
};

// ============================================================
// Workout Plan Store (cache recently generated plans)
// ============================================================
export const workoutStore = {
  getAll(): WorkoutPlan[] {
    return readFile<WorkoutPlan[]>('workouts.json', []);
  },
  save(plan: WorkoutPlan): WorkoutPlan {
    const all = this.getAll();
    all.unshift(plan);
    if (all.length > 20) all.splice(20);
    writeFile('workouts.json', all);
    return plan;
  },
  getLatest(): WorkoutPlan | null {
    const all = this.getAll();
    return all.length > 0 ? all[0] : null;
  },
};
