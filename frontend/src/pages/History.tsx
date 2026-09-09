import { useEffect, useState, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import type { WorkoutHistory } from '../types';

export default function History() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'partial'>('all');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getHistory();
      setHistory(res.data.history);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load history.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filtered = filter === 'all' ? history : history.filter((h) => h.status === filter);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    completed: { color: '#34d399', label: 'Completed', icon: '✅' },
    partial: { color: '#fbbf24', label: 'Partial', icon: '⚡' },
    skipped: { color: '#f87171', label: 'Skipped', icon: '❌' },
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
        <h1 className="page-title">📋 Workout History</h1>
        <p className="page-subtitle">Track your completed workouts and progress over time</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-light)' }}>
            {history.length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Workouts</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>
            {history.filter((h) => h.status === 'completed').length}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Completed</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>
            {history.reduce((sum, h) => sum + (h.duration || 0), 0)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Minutes</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['all', 'completed', 'partial'] as const).map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'completed' ? '✅ Completed' : '⚡ Partial'}
          </button>
        ))}
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{filter === 'all' ? 'No Workouts Yet' : `No ${filter} workouts`}</h3>
          <p>{filter === 'all'
            ? 'Complete your first workout and mark it as done to see it here!'
            : `You don't have any ${filter} workouts yet.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((entry) => {
            const status = statusConfig[entry.status] || statusConfig.completed;
            return (
              <div key={entry.id} className="card" style={{ borderLeft: `3px solid ${status.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)' }}>{entry.workoutTitle}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      🕐 {formatDate(entry.completedAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: `${status.color}20`, color: status.color, fontWeight: '600' }}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    ⏱️ <strong>{entry.duration} min</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    🎯 <strong>{entry.workoutType}</strong>
                  </span>
                  {entry.exercises.length > 0 && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      📋 {entry.exercises.slice(0, 3).join(', ')}{entry.exercises.length > 3 ? ` +${entry.exercises.length - 3} more` : ''}
                    </span>
                  )}
                </div>
                {entry.notes && (
                  <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{entry.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
