import { Request, Response } from 'express';
import { generateWorkout, getMotivationalMessages, getDailyTips } from '../services/workoutService';
import { workoutStore, historyStore, profileStore } from '../utils/store';
import { WorkoutHistory } from '../models/types';

// POST /api/workout/generate
export async function generateWorkoutPlan(req: Request, res: Response): Promise<void> {
  try {
    const profile = profileStore.get();
    const {
      goal = profile?.fitnessGoal || 'general-fitness',
      fitnessLevel = profile?.fitnessLevel || 'beginner',
      availableTime = profile?.availableTime || 30,
      equipment = profile?.equipment || 'none',
      location = profile?.workoutLocation || 'home',
    } = req.body as {
      goal?: string;
      fitnessLevel?: string;
      availableTime?: number;
      equipment?: string;
      location?: string;
    };

    const { plan, aiDescription } = await generateWorkout(
      { goal, fitnessLevel, availableTime: Number(availableTime), equipment, location },
      profile || undefined
    );

    const savedPlan = workoutStore.save(plan);

    res.json({
      workout: savedPlan,
      aiDescription,
      message: aiDescription
        ? 'Workout generated with AI assistance.'
        : 'Workout generated from our exercise library.',
    });
  } catch (err) {
    console.error('[Workout Generate]', err);
    res.status(500).json({ error: 'Failed to generate workout. Please try again.' });
  }
}

// GET /api/workout/today
export async function getTodayWorkout(req: Request, res: Response): Promise<void> {
  try {
    const latest = workoutStore.getLatest();
    if (latest) {
      res.json({ workout: latest });
    } else {
      res.json({ workout: null, message: 'No workout generated yet. Click "Generate Today\'s Workout".' });
    }
  } catch (err) {
    console.error('[Today Workout]', err);
    res.status(500).json({ error: 'Failed to retrieve workout.' });
  }
}

// POST /api/workout/complete
export async function completeWorkout(req: Request, res: Response): Promise<void> {
  try {
    const { workoutId, workoutTitle, workoutType, duration, exercises, notes, status = 'completed' } = req.body as {
      workoutId: string;
      workoutTitle: string;
      workoutType: string;
      duration: number;
      exercises: string[];
      notes?: string;
      status?: 'completed' | 'partial' | 'skipped';
    };

    if (!workoutId || !workoutTitle) {
      res.status(400).json({ error: 'Workout ID and title are required.' });
      return;
    }

    const historyEntry: Omit<WorkoutHistory, 'id'> = {
      workoutId,
      workoutTitle,
      workoutType: workoutType || 'General',
      duration: Number(duration) || 0,
      exercises: exercises || [],
      completedAt: new Date().toISOString(),
      status,
      notes,
    };

    const saved = historyStore.add(historyEntry);
    res.json({ history: saved, message: 'Workout marked as completed! Great job! 💪' });
  } catch (err) {
    console.error('[Complete Workout]', err);
    res.status(500).json({ error: 'Failed to save workout completion.' });
  }
}

// GET /api/workout/motivation
export async function getMotivation(req: Request, res: Response): Promise<void> {
  try {
    const messages = getMotivationalMessages();
    const tips = getDailyTips();
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json({ message: randomMsg, tip: randomTip });
  } catch (err) {
    console.error('[Motivation]', err);
    res.status(500).json({ error: 'Failed to get motivation.' });
  }
}
