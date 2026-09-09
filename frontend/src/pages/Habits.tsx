import { useState, useEffect, useCallback } from 'react';
import { habitsAPI } from '../services/api';
import type { HabitEntry } from '../types';

interface HabitDefinition {
  id: keyof Omit<HabitEntry, 'id' | 'date'>;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const HABITS: HabitDefinition[] = [
  { id: 'workout', label: 'Workout', icon: '💪', description: 'Complete today\'s workout session', color: '#6366f1' },
  { id: 'water', label: 'Hydration', icon: '💧', description: 'Drink 8 glasses of water', color: '#3b82f6' },
  { id: 'healthyMeal', label: 'Healthy Meal', icon: '🥗', description: 'Eat a nutritious meal today', color: '#10b981' },
  { id: 'sleep', label: 'Quality Sleep', icon: '😴', description: 'Get 7-8 hours of sleep tonight', color: '#8b5cf6' },
  { id: 'activity', label: 'Stay Active', icon: '🚶', description: 'Be active for 30+ minutes', color: '#f59e0b' },
];

export default function Habits() {
  const [todayHabits, setTodayHabits] = useState<HabitEntry | null>(null);
  const [streak, setStreak] = useState(0);
  const [last7Days, setLast7Days] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await habitsAPI.get();
      setTodayHabits(res.data.today);
      setStreak(res.data.streak);
      setLast7Days(res.data.last7Days);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load habits.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleToggle = async (habitId: keyof Omit<HabitEntry, 'id' | 'date'>) => {
    if (saving) return;
    const currentValue = todayHabits?.[habitId] ?? false;
    const newValue = !currentValue;

    // Optimistic update
    setTodayHabits((prev) => prev ? { ...prev, [habitId]: newValue } : prev);
    setSaving(habitId);

    try {
      const res = await habitsAPI.update(today, { [habitId]: newValue });
      setTodayHabits(res.data.habit);
      setLastSaved(`${HABITS.find((h) => h.id === habitId)?.label} ${newValue ? 'completed' : 'unchecked'}!`);
      setTimeout(() => setLastSaved(''), 2000);
      // Reload to get streak update
      const habitRes = await habitsAPI.get();
      setStreak(habitRes.data.streak);
      setLast7Days(habitRes.data.last7Days);
    } catch {
      // Revert on error
      setTodayHabits((prev) => prev ? { ...prev, [habitId]: currentValue } : prev);
    } finally {
      setSaving(null);
    }
  };

  const getHabitCount = (entry: HabitEntry) => {
    return HABITS.filter((h) => entry[h.id]).length;
  };

  const completedToday = todayHabits ? getHabitCount(todayHabits) : 0;

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">✅ Habit Tracker</h1>
        <p className="page-subtitle">Build consistent healthy habits — one day at a time</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {lastSaved && (
        <div className="alert alert-success fade-in" style={{ marginBottom: '16px' }}>
          <span>✅</span><span>{lastSaved}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-light)' }}>{streak}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>🔥 Day Streak</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#34d399' }}>{completedToday}/{HABITS.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>✅ Today's Habits</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fbbf24' }}>
            {last7Days.reduce((sum, d) => sum + getHabitCount(d), 0)}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📊 Habits This Week</div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Today's Habits</h3>
          <div>
            <div className="progress-bar-container" style={{ width: '120px', height: '8px' }}>
              <div className="progress-bar-fill" style={{ width: `${(completedToday / HABITS.length) * 100}%` }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '3px' }}>
              {Math.round((completedToday / HABITS.length) * 100)}%
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {HABITS.map((habit) => {
            const isDone = todayHabits?.[habit.id] ?? false;
            const isSaving = saving === habit.id;
            return (
              <button
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                disabled={!!saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: isDone ? `${habit.color}15` : 'var(--bg-input)',
                  border: `2px solid ${isDone ? habit.color + '50' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: saving && !isSaving ? 0.7 : 1,
                  width: '100%',
                }}
              >
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  {isSaving ? <span className="spinner" style={{ borderTopColor: habit.color }}></span> : (isDone ? '✅' : '⬜')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: isDone ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {habit.icon} {habit.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{habit.description}</div>
                </div>
                {isDone && (
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: `${habit.color}20`, color: habit.color, fontWeight: '600' }}>
                    Done!
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7-Day Progress */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>📊 Last 7 Days</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {last7Days.map((day, i) => {
            const count = getHabitCount(day);
            const pct = (count / HABITS.length) * 100;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {getDayLabel(day.date)}
                </div>
                <div
                  title={`${count}/${HABITS.length} habits`}
                  style={{
                    height: '48px',
                    background: pct >= 80 ? 'rgba(16,185,129,0.6)' : pct >= 40 ? 'rgba(245,158,11,0.5)' : pct > 0 ? 'rgba(99,102,241,0.3)' : 'var(--bg-input)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: pct > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.3s',
                  }}
                >
                  {count > 0 ? count : '—'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  /{HABITS.length}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16,185,129,0.6)', display: 'inline-block' }}></span>
            Great (4-5)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(245,158,11,0.5)', display: 'inline-block' }}></span>
            Good (2-3)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(99,102,241,0.3)', display: 'inline-block' }}></span>
            Started (1)
          </span>
        </div>
      </div>
    </div>
  );
}
