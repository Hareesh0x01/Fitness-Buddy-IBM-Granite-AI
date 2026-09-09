import { Request, Response } from 'express';
import { habitStore } from '../utils/store';

// POST /api/habits
export async function updateHabits(req: Request, res: Response): Promise<void> {
  try {
    const { date, habits } = req.body as {
      date?: string;
      habits?: Record<string, boolean>;
    };

    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      return;
    }

    // Validate habit keys
    const validHabits = ['workout', 'water', 'healthyMeal', 'sleep', 'activity'];
    const sanitizedHabits: Record<string, boolean> = {};
    if (habits && typeof habits === 'object') {
      for (const key of validHabits) {
        if (key in habits) {
          sanitizedHabits[key] = Boolean(habits[key]);
        }
      }
    }

    const entry = habitStore.upsert(targetDate, sanitizedHabits);
    res.json({ habit: entry, message: 'Habit updated!' });
  } catch (err) {
    console.error('[Update Habits]', err);
    res.status(500).json({ error: 'Failed to update habits.' });
  }
}

// GET /api/habits
export async function getHabits(req: Request, res: Response): Promise<void> {
  try {
    const { date } = req.query as { date?: string };
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    const entry = habitStore.getByDate(targetDate);
    const streak = habitStore.getStreakCount();
    const last7Days = habitStore.getLast7Days();

    res.json({
      today: entry || {
        id: '',
        date: today,
        workout: false,
        water: false,
        healthyMeal: false,
        sleep: false,
        activity: false,
      },
      streak,
      last7Days,
    });
  } catch (err) {
    console.error('[Get Habits]', err);
    res.status(500).json({ error: 'Failed to retrieve habits.' });
  }
}

// GET /api/habits/all
export async function getAllHabits(req: Request, res: Response): Promise<void> {
  try {
    const all = habitStore.getAll();
    res.json({ habits: all });
  } catch (err) {
    console.error('[Get All Habits]', err);
    res.status(500).json({ error: 'Failed to retrieve habits.' });
  }
}
