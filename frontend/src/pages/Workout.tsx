import React, { useState, useEffect, useCallback } from 'react';
import { workoutAPI, habitsAPI } from '../services/api';
import type { WorkoutPlan, Exercise } from '../types';

interface TimerState {
  active: boolean;
  seconds: number;
  exerciseIndex: number;
  phase: 'warmup' | 'workout' | 'cooldown' | 'rest' | 'done';
}

export default function Workout() {
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [timer, setTimer] = useState<TimerState>({ active: false, seconds: 0, exerciseIndex: 0, phase: 'workout', done: false } as unknown as TimerState);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Form state
  const [form, setForm] = useState({
    goal: 'general-fitness',
    fitnessLevel: 'beginner',
    availableTime: 30,
    equipment: 'none',
    location: 'home',
  });

  const loadTodayWorkout = useCallback(async () => {
    try {
      const res = await workoutAPI.getToday();
      if (res.data.workout) {
        setWorkout(res.data.workout);
      }
    } catch {
      // No workout yet
    }
  }, []);

  useEffect(() => {
    loadTodayWorkout();
  }, [loadTodayWorkout]);

  // Timer logic
  useEffect(() => {
    if (timer.active) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timer.active]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setCompleted(false);
    setWorkoutStarted(false);
    setTimer({ active: false, seconds: 0, exerciseIndex: 0, phase: 'workout', done: false } as unknown as TimerState);
    try {
      const res = await workoutAPI.generate(form as unknown as Record<string, unknown>);
      setWorkout(res.data.workout);
      if (res.data.aiDescription) setAiDescription(res.data.aiDescription);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate workout.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setTimer({ active: true, seconds: 0, exerciseIndex: 0, phase: 'workout', done: false } as unknown as TimerState);
  };

  const handlePauseResume = () => {
    setTimer((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleCompleteWorkout = async () => {
    if (!workout || markingComplete) return;
    setMarkingComplete(true);
    try {
      await workoutAPI.complete({
        workoutId: workout.id,
        workoutTitle: workout.title,
        workoutType: workout.goal,
        duration: timer.seconds > 0 ? Math.floor(timer.seconds / 60) : workout.totalDuration,
        exercises: workout.exercises.map((e) => e.name),
        status: 'completed',
      });

      // Also mark workout habit
      const today = new Date().toISOString().split('T')[0];
      await habitsAPI.update(today, { workout: true });

      setCompleted(true);
      setTimer((prev) => ({ ...prev, active: false }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save completion.';
      setError(msg);
    } finally {
      setMarkingComplete(false);
    }
  };

  const difficultyColor: Record<string, string> = {
    easy: '#34d399',
    moderate: '#fbbf24',
    hard: '#f87171',
  };

  const ExerciseCard = ({ exercise, index }: { exercise: Exercise; index: number; phase?: string }) => {
    const isExpanded = expandedExercise === index;
    return (
      <div
        className="card"
        style={{ marginBottom: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => setExpandedExercise(isExpanded ? null : index)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-light)', flexShrink: 0 }}>
              {index + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{exercise.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {exercise.sets} sets • {exercise.reps || exercise.duration} • Rest: {exercise.rest}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px', background: `${difficultyColor[exercise.difficulty]}20`, color: difficultyColor[exercise.difficulty], fontWeight: '600' }}>
              {exercise.difficulty}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </div>
        </div>

        {isExpanded && (
          <div className="fade-in" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Area</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: '600' }}>{exercise.targetArea}</div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sets</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: '600' }}>{exercise.sets}</div>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Volume</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: '600' }}>{exercise.reps || exercise.duration}</div>
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>
                📋 <strong style={{ color: 'var(--text-primary)' }}>Instructions:</strong> {exercise.instructions}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#fde68a', margin: 0, background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '6px' }}>
                ⚠️ <strong>Safety tip:</strong> {exercise.safetyTip}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">💪 Workout Generator</h1>
        <p className="page-subtitle">Generate personalized workouts based on your goals and available equipment</p>
      </div>

      {/* Generator Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>⚙️ Generate Workout</h3>
        <div className="grid-3" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Fitness Goal</label>
            <select className="form-select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              <option value="general-fitness">General Fitness</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Fitness Level</label>
            <select className="form-select" value={form.fitnessLevel} onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Duration (minutes)</label>
            <select className="form-select" value={form.availableTime} onChange={(e) => setForm({ ...form, availableTime: Number(e.target.value) })}>
              <option value={10}>10 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Equipment</label>
            <select className="form-select" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
              <option value="none">No Equipment</option>
              <option value="dumbbells">Dumbbells</option>
              <option value="resistance-bands">Resistance Bands</option>
              <option value="full-gym">Full Gym</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <select className="form-select" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner"></span> Generating...</> : '🔥 Generate Workout'}
        </button>
        {error && <p className="form-error" style={{ marginTop: '8px' }}>{error}</p>}
      </div>

      {/* Workout Display */}
      {workout && (
        <div className="fade-in">
          {/* Workout Header */}
          <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', color: 'var(--primary-light)' }}>{workout.title}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">⏱️ {workout.totalDuration} min</span>
                  <span className="badge badge-muted">🎯 {workout.difficulty}</span>
                  <span className="badge badge-muted">📍 {workout.location}</span>
                  <span className="badge badge-muted">🏋️ {workout.equipment}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!workoutStarted && !completed && (
                  <button className="btn btn-success" onClick={handleStartWorkout}>
                    ▶ Start Workout
                  </button>
                )}
                {workoutStarted && !completed && (
                  <button className="btn btn-secondary" onClick={handlePauseResume}>
                    {timer.active ? '⏸ Pause' : '▶ Resume'}
                  </button>
                )}
                {workoutStarted && !completed && (
                  <button className="btn btn-primary" onClick={handleCompleteWorkout} disabled={markingComplete}>
                    {markingComplete ? <><span className="spinner"></span> Saving...</> : '✅ Complete'}
                  </button>
                )}
              </div>
            </div>

            {/* Active Timer */}
            {workoutStarted && (
              <div className="fade-in" style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: timer.active ? '#34d399' : 'var(--text-muted)' }}>
                  {formatTimer(timer.seconds)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {timer.active ? '🏃 Workout in progress...' : '⏸ Paused'}
                </div>
              </div>
            )}
          </div>

          {completed && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              <span>🎉</span>
              <div>
                <strong>Workout Completed!</strong> Amazing work! Keep it up. You're one step closer to your goal.
                Your workout has been saved to your history.
              </div>
            </div>
          )}

          {/* Warm-up */}
          <h3 style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔥 Warm-up
          </h3>
          {workout.warmup.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} phase="warmup" />)}

          {/* Main Workout */}
          <h3 style={{ margin: '16px 0 8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            💪 Main Workout
          </h3>
          {workout.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} phase="workout" />)}

          {/* Cool-down */}
          <h3 style={{ margin: '16px 0 8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🧊 Cool-down
          </h3>
          {workout.cooldown.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} phase="cooldown" />)}

          {/* AI Description */}
          {aiDescription && (
            <div className="card" style={{ marginTop: '16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-light)' }}>🤖 AI Coach Notes</h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {aiDescription}
              </div>
            </div>
          )}

          <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            ⚠️ These workouts provide general fitness guidance. Consult a qualified fitness professional before starting a new exercise program.
          </p>
        </div>
      )}

      {!workout && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">💪</div>
          <h3>No Workout Generated Yet</h3>
          <p>Use the form above to generate a personalized workout plan</p>
        </div>
      )}
    </div>
  );
}
