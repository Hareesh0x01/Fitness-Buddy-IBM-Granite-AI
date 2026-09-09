import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, workoutAPI, habitsAPI } from '../services/api';
import type { DailyPlan, HabitEntry } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [workoutMessage, setWorkoutMessage] = useState('');
  const [motivation, setMotivation] = useState<{ message: string; tip: string } | null>(null);
  const [todayHabits, setTodayHabits] = useState<HabitEntry | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, motivRes, habitsRes] = await Promise.all([
        dashboardAPI.getDailyPlan(),
        workoutAPI.getMotivation(),
        habitsAPI.get(),
      ]);
      setDailyPlan(planRes.data);
      setMotivation(motivRes.data);
      setTodayHabits(habitsRes.data.today);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleGenerateWorkout = async () => {
    setGeneratingWorkout(true);
    setWorkoutMessage('');
    try {
      const res = await workoutAPI.generate();
      setWorkoutMessage(`✅ Workout generated: ${res.data.workout.title}`);
      // Reload daily plan to show new workout
      const planRes = await dashboardAPI.getDailyPlan();
      setDailyPlan(planRes.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate workout.';
      setWorkoutMessage(`❌ ${msg}`);
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const handleToggleHabit = async (habitId: string, currentValue: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await habitsAPI.update(today, { [habitId]: !currentValue });
      setTodayHabits(res.data.habit);
      // Update daily plan checklist
      if (dailyPlan) {
        setDailyPlan({
          ...dailyPlan,
          habitChecklist: dailyPlan.habitChecklist.map((h) =>
            h.id === habitId ? { ...h, done: !currentValue } : h
          ),
        });
      }
    } catch {
      // Silent fail for habit toggle
    }
  };

  const quickActions = [
    { label: 'Generate Today\'s Workout', icon: '💪', color: '#6366f1', action: handleGenerateWorkout, loading: generatingWorkout },
    { label: 'Ask Fitness Buddy', icon: '🤖', color: '#10b981', action: () => navigate('/coach') },
    { label: 'Suggest a Meal', icon: '🥗', color: '#f59e0b', action: () => navigate('/nutrition') },
    { label: 'Track Habit', icon: '✅', color: '#3b82f6', action: () => navigate('/habits') },
    { label: 'Create Weekly Plan', icon: '📅', color: '#8b5cf6', action: () => navigate('/coach') },
    { label: 'View Progress', icon: '📈', color: '#06b6d4', action: () => navigate('/progress') },
  ];

  if (loading) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <p className="text-secondary">Loading your fitness dashboard...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const completedHabitsCount = Object.entries(todayHabits || {})
    .filter(([k, v]) => !['id', 'date'].includes(k) && v === true).length;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">
            {dailyPlan?.userName ? `Welcome back, ${dailyPlan.userName}! 👋` : 'Welcome to Fitness Buddy! 👋'}
          </h1>
          <p className="page-subtitle">{today} • {completedHabitsCount}/5 habits completed today</p>
        </div>
        {!dailyPlan?.profileComplete && (
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            Complete Profile →
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!dailyPlan?.profileComplete && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <span>💡</span>
          <span>
            <strong>Complete your fitness profile</strong> to get personalized workout and nutrition recommendations tailored to your goals.
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/profile')} style={{ marginLeft: '12px' }}>
              Set Up Profile
            </button>
          </span>
        </div>
      )}

      {/* Motivation Banner */}
      {motivation && (
        <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem', margin: '0 0 6px' }}>
                {motivation.message}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                💡 {motivation.tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="card card-hover"
              onClick={action.action}
              disabled={action.loading}
              style={{ border: 'none', cursor: 'pointer', textAlign: 'center', padding: '16px 12px', background: 'var(--bg-card)' }}
            >
              {action.loading ? (
                <div className="spinner" style={{ margin: '0 auto 8px' }}></div>
              ) : (
                <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{action.icon}</div>
              )}
              <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {action.loading ? 'Generating...' : action.label}
              </div>
            </button>
          ))}
        </div>
        {workoutMessage && (
          <p style={{ marginTop: '8px', fontSize: '0.875rem', color: workoutMessage.startsWith('✅') ? '#34d399' : '#f87171' }}>
            {workoutMessage}
          </p>
        )}
      </section>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Today's Workout */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>💪 Today's Workout</h3>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/workout')}>
              View →
            </button>
          </div>
          {dailyPlan?.workout ? (
            <>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                {dailyPlan.workout.title}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">⏱️ {dailyPlan.workout.totalDuration} min</span>
                <span className="badge badge-muted">📍 {dailyPlan.workout.location}</span>
                <span className="badge badge-warning">🎯 {dailyPlan.workout.difficulty}</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p className="text-muted" style={{ marginBottom: '12px', fontSize: '0.875rem' }}>No workout generated yet.</p>
              <button className="btn btn-sm btn-primary" onClick={handleGenerateWorkout} disabled={generatingWorkout}>
                {generatingWorkout ? 'Generating...' : 'Generate Now'}
              </button>
            </div>
          )}
        </div>

        {/* Meal Suggestion */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>🥗 Meal Suggestion</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/nutrition')}>
              More →
            </button>
          </div>
          <p style={{ color: 'var(--text-primary)', margin: '0 0 8px', fontSize: '0.9rem' }}>
            {dailyPlan?.mealSuggestion || 'Visit the Nutrition section for personalized meal ideas.'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
            💧 {dailyPlan?.waterReminder || 'Stay hydrated throughout the day.'}
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Habit Checklist */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>✅ Today's Habits</h3>
            <span className="badge badge-success">{completedHabitsCount}/5</span>
          </div>
          {dailyPlan?.habitChecklist?.map((habit) => {
            const habitKey = habit.id as string;
            const isDone = (todayHabits as unknown as Record<string, boolean>)?.[habitKey] ?? habit.done;
            return (
              <button
                key={habit.id}
                onClick={() => handleToggleHabit(habitKey, isDone)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  color: isDone ? '#34d399' : 'var(--text-secondary)',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{isDone ? '✅' : '⬜'}</span>
                <span style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                  {habit.label}
                </span>
              </button>
            );
          })}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>Progress</span>
              <span>{Math.round((completedHabitsCount / 5) * 100)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${(completedHabitsCount / 5) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Daily Tip */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>💡 Today's Tip</h3>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '16px' }}>
            {dailyPlan?.dailyTip || 'Start small, stay consistent. Every bit of movement counts toward your goals.'}
          </p>
          <hr className="divider" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/workout')}>
              💪 Workout
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/habits')}>
              ✅ Habits
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/progress')}>
              📈 Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
