import { useState } from 'react';
import { nutritionAPI, habitsAPI } from '../services/api';
import type { MealRecommendation } from '../types';

export default function Nutrition() {
  const [meal, setMeal] = useState<MealRecommendation | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealLogged, setMealLogged] = useState(false);

  const [form, setForm] = useState({
    mealType: 'breakfast',
    dietaryPreference: 'non-vegetarian',
    goal: 'general-fitness',
    availableIngredients: '',
    restrictions: '',
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMealLogged(false);
    try {
      const res = await nutritionAPI.recommend(form as unknown as Record<string, unknown>);
      setMeal(res.data.meal);
      if (res.data.aiDescription) setAiDescription(res.data.aiDescription);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate meal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await habitsAPI.update(today, { healthyMeal: true });
      setMealLogged(true);
    } catch {
      // Silent fail
    }
  };

  const MacroBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{value}g</span>
      </div>
      <div className="progress-bar-container" style={{ height: '6px' }}>
        <div style={{ height: '100%', borderRadius: '20px', background: color, width: `${Math.min(100, (value / max) * 100)}%`, transition: 'width 0.5s ease' }}></div>
      </div>
    </div>
  );

  return (
    <div className="page-content fade-in">
      <div className="page-header">
        <h1 className="page-title">🥗 Nutrition Planner</h1>
        <p className="page-subtitle">Get personalized meal suggestions aligned with your fitness goals</p>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>🍽️ Get Meal Suggestion</h3>
        <div className="grid-3" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Meal Type</label>
            <select className="form-select" value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dietary Preference</label>
            <select className="form-select" value={form.dietaryPreference} onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="other">Other</option>
            </select>
          </div>
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
        </div>
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Available Ingredients (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.availableIngredients}
              onChange={(e) => setForm({ ...form, availableIngredients: e.target.value })}
              placeholder="e.g., chicken, rice, broccoli..."
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Food Restrictions (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.restrictions}
              onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
              placeholder="e.g., no dairy, gluten-free..."
            />
          </div>
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner"></span> Generating...</> : '🥗 Get Meal Suggestion'}
        </button>
        {error && <p className="form-error" style={{ marginTop: '8px' }}>{error}</p>}
      </div>

      {/* Meal Display */}
      {meal && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>{meal.title}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">🍽️ {meal.mealType}</span>
                  <span className="badge badge-muted">⏱️ {meal.prepTime}</span>
                  <span className="badge badge-success">🔥 ~{meal.calories} cal</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!mealLogged ? (
                  <button className="btn btn-success btn-sm" onClick={handleLogMeal}>
                    ✅ Log as Healthy Meal
                  </button>
                ) : (
                  <span className="badge badge-success">✅ Logged!</span>
                )}
              </div>
            </div>

            <div className="grid-2">
              {/* Ingredients */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary-light)' }}>🛒 Ingredients</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {meal.ingredients.map((ing, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>•</span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nutrition */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary-light)' }}>📊 Nutrition (approx.)</h4>
                <div style={{ background: 'rgba(99,102,241,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center' }}>
                    ~{meal.calories}
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '4px' }}>kcal</span>
                  </div>
                </div>
                <MacroBar label="Protein" value={meal.protein} max={50} color="#6366f1" />
                <MacroBar label="Carbohydrates" value={meal.carbs} max={80} color="#f59e0b" />
                <MacroBar label="Fat" value={meal.fat} max={40} color="#10b981" />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  * Nutrition values are approximate estimates.
                </p>
              </div>
            </div>

            {/* Preparation Steps */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ marginBottom: '10px', color: 'var(--primary-light)' }}>👨‍🍳 Preparation Steps</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {meal.preparationSteps.map((step, i) => (
                  <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Health Benefits */}
            {meal.healthBenefits.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary-light)' }}>✨ Health Benefits</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {meal.healthBenefits.map((b, i) => (
                    <span key={i} className="badge badge-success">✓ {b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Description */}
          {aiDescription && (
            <div className="card" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-light)' }}>🤖 AI Nutritionist Notes</h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {aiDescription}
              </div>
            </div>
          )}

          <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            ⚠️ Nutrition information is approximate. Consult a registered dietitian for personalized dietary advice. This is not medical nutrition therapy.
          </p>
        </div>
      )}

      {!meal && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">🥗</div>
          <h3>No Meal Suggestion Yet</h3>
          <p>Use the form above to get a personalized meal recommendation</p>
        </div>
      )}
    </div>
  );
}
