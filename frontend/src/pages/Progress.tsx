import { useEffect, useState, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import type { Progress as ProgressType } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

export default function Progress() {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getProgress();
      setProgress(res.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load progress.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const goalLabels: Record<string, string> = {
    'weight-loss': '⚖️ Weight Loss',
    'muscle-gain': '💪 Muscle Gain',
    'general-fitness': '🏃 General Fitness',
    strength: '🏋️ Strength',
    endurance: '🚴 Endurance',
    'Not set': '❓ Not set',
  };

  const customTooltipStyle = {
    background: '#1e293b',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#f1f5f9',
    fontSize: '0.82rem',
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Current Goal', value: goalLabels[progress?.currentGoal || 'Not set'] || progress?.currentGoal || 'Not set', icon: '🎯', color: '#6366f1' },
    { label: 'Today\'s Habits', value: `${progress?.todayProgress || 0}/5`, icon: '✅', color: '#10b981' },
    { label: 'Weekly Workouts', value: progress?.weeklyWorkouts || 0, icon: '💪', color: '#f59e0b' },
    { label: 'Habit Streak', value: `${progress?.habitStreak || 0} days`, icon: '🔥', color: '#ef4444' },
    { label: 'Total Workouts', value: progress?.completedWorkouts || 0, icon: '🏆', color: '#8b5cf6' },
    { label: 'Progress', value: `${progress?.progressPercentage || 0}%`, icon: '📈', color: '#06b6d4' },
  ];

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">📈 Progress Dashboard</h1>
        <p className="page-subtitle">Track your fitness journey and celebrate every win</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div key={card.label} className="card" style={{ borderLeft: `3px solid ${card.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.75rem' }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>📊 Weekly Progress</h3>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-light)' }}>{progress?.progressPercentage || 0}%</span>
        </div>
        <div className="progress-bar-container" style={{ height: '12px' }}>
          <div className="progress-bar-fill" style={{ width: `${progress?.progressPercentage || 0}%` }}></div>
        </div>
        <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Based on your habit completion rate over the past 7 days
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Weekly Habits Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>📅 Daily Habit Completion</h3>
          {(progress?.weeklyHabitData?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progress!.weeklyHabitData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 5]} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Habits Done" />
                <Bar dataKey="total" fill="#2d3748" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>Start tracking habits to see your progress here!</p>
            </div>
          )}
        </div>

        {/* Workout Frequency */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>💪 Workout Frequency (6 Weeks)</h3>
          {(progress?.workoutFrequency?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progress!.workoutFrequency} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Workouts" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>Complete workouts to see your frequency trend!</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Section */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>🏆 Achievements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { icon: '🌟', label: 'First Workout', unlocked: (progress?.completedWorkouts || 0) >= 1, desc: 'Complete your first workout' },
            { icon: '🔥', label: '3-Day Streak', unlocked: (progress?.habitStreak || 0) >= 3, desc: '3-day habit streak' },
            { icon: '💪', label: '5 Workouts', unlocked: (progress?.completedWorkouts || 0) >= 5, desc: 'Complete 5 workouts' },
            { icon: '🏆', label: 'Week Champion', unlocked: (progress?.weeklyWorkouts || 0) >= 5, desc: '5 workouts in a week' },
            { icon: '🎯', label: 'Habit Master', unlocked: (progress?.habitStreak || 0) >= 7, desc: '7-day habit streak' },
            { icon: '🚀', label: '10 Workouts', unlocked: (progress?.completedWorkouts || 0) >= 10, desc: 'Complete 10 workouts' },
          ].map((ach) => (
            <div
              key={ach.label}
              className="card"
              style={{
                padding: '14px',
                textAlign: 'center',
                opacity: ach.unlocked ? 1 : 0.4,
                background: ach.unlocked ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                border: `1px solid ${ach.unlocked ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{ach.icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: ach.unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{ach.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{ach.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
