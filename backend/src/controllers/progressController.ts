import { Request, Response } from 'express';
import { historyStore, habitStore, profileStore, workoutStore } from '../utils/store';

// GET /api/progress
export async function getProgress(req: Request, res: Response): Promise<void> {
  try {
    const profile = profileStore.get();
    const history = historyStore.getAll();
    const thisWeekWorkouts = historyStore.getThisWeek();
    const habitStreak = habitStore.getStreakCount();
    const last7DaysHabits = habitStore.getLast7Days();

    const completedWorkouts = history.filter((h) => h.status === 'completed').length;
    const totalHabitsCompleted = last7DaysHabits.reduce((sum, day) => {
      return sum + [day.workout, day.water, day.healthyMeal, day.sleep, day.activity].filter(Boolean).length;
    }, 0);
    const maxPossibleHabits = 7 * 5;
    const progressPercentage = Math.min(100, Math.round((totalHabitsCompleted / maxPossibleHabits) * 100));

    // Weekly habit breakdown for chart
    const weeklyHabitData = last7DaysHabits.map((day) => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: [day.workout, day.water, day.healthyMeal, day.sleep, day.activity].filter(Boolean).length,
      total: 5,
    }));

    // Workout frequency last 6 weeks
    const workoutFrequency: { week: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = history.filter((h) => {
        const d = new Date(h.completedAt);
        return d >= weekStart && d <= weekEnd && h.status === 'completed';
      }).length;

      workoutFrequency.push({
        week: `W${6 - i}`,
        count,
      });
    }

    res.json({
      currentGoal: profile?.fitnessGoal || 'Not set',
      todayProgress: last7DaysHabits[6]
        ? [
            last7DaysHabits[6].workout,
            last7DaysHabits[6].water,
            last7DaysHabits[6].healthyMeal,
            last7DaysHabits[6].sleep,
            last7DaysHabits[6].activity,
          ].filter(Boolean).length
        : 0,
      weeklyWorkouts: thisWeekWorkouts.length,
      habitStreak,
      completedWorkouts,
      progressPercentage,
      weeklyHabitData,
      workoutFrequency,
    });
  } catch (err) {
    console.error('[Progress]', err);
    res.status(500).json({ error: 'Failed to retrieve progress data.' });
  }
}

// GET /api/history
export async function getWorkoutHistory(req: Request, res: Response): Promise<void> {
  try {
    const history = historyStore.getAll();
    res.json({ history });
  } catch (err) {
    console.error('[History]', err);
    res.status(500).json({ error: 'Failed to retrieve workout history.' });
  }
}

// GET /api/daily-plan
export async function getDailyPlan(req: Request, res: Response): Promise<void> {
  try {
    const { getMotivationalMessages, getDailyTips } = await import('../services/workoutService');
    const profile = profileStore.get();
    const workout = workoutStore.getLatest();

    const messages = getMotivationalMessages();
    const tips = getDailyTips();
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const mealSuggestions = [
      'Try a high-protein breakfast: eggs with whole grain toast and avocado',
      'Power up with a quinoa bowl topped with grilled chicken and veggies',
      'Fuel your workout with oatmeal, banana, and a handful of nuts',
      'Go for a colorful salad with mixed greens, chickpeas, and tahini dressing',
      'Enjoy grilled salmon with sweet potato and steamed broccoli for dinner',
    ];
    const mealSuggestion = mealSuggestions[Math.floor(Math.random() * mealSuggestions.length)];

    const today = new Date().toISOString().split('T')[0];
    const todayHabits = habitStore.getByDate(today);

    res.json({
      date: today,
      workout,
      mealSuggestion,
      waterReminder: 'Aim for at least 8 glasses (2L) of water today. Start with a glass now!',
      dailyTip: randomTip,
      motivationMessage: randomMsg,
      habitChecklist: [
        { id: 'workout', label: 'Complete today\'s workout', done: todayHabits?.workout || false },
        { id: 'water', label: 'Drink 8 glasses of water', done: todayHabits?.water || false },
        { id: 'healthyMeal', label: 'Eat a healthy meal', done: todayHabits?.healthyMeal || false },
        { id: 'sleep', label: 'Sleep 7-8 hours tonight', done: todayHabits?.sleep || false },
        { id: 'activity', label: 'Stay active for 30+ minutes', done: todayHabits?.activity || false },
      ],
      profileComplete: !!profile,
      userName: profile?.name || null,
    });
  } catch (err) {
    console.error('[Daily Plan]', err);
    res.status(500).json({ error: 'Failed to retrieve daily plan.' });
  }
}
