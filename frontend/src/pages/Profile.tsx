import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../services/api';
import type { UserProfile } from '../types';

const INITIAL_FORM = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  fitnessLevel: 'beginner',
  fitnessGoal: 'general-fitness',
  availableTime: '30',
  workoutLocation: 'home',
  equipment: 'none',
  equipmentDetails: '',
  dietaryPreference: 'non-vegetarian',
  foodAllergies: '',
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileAPI.get();
      if (res.data.profile) {
        setProfile(res.data.profile);
        const p = res.data.profile;
        setForm({
          name: p.name || '',
          age: String(p.age || ''),
          gender: p.gender || '',
          height: String(p.height || ''),
          weight: String(p.weight || ''),
          fitnessLevel: p.fitnessLevel || 'beginner',
          fitnessGoal: p.fitnessGoal || 'general-fitness',
          availableTime: String(p.availableTime || '30'),
          workoutLocation: p.workoutLocation || 'home',
          equipment: p.equipment || 'none',
          equipmentDetails: p.equipmentDetails || '',
          dietaryPreference: p.dietaryPreference || 'non-vegetarian',
          foodAllergies: p.foodAllergies || '',
        });
      } else {
        setIsEditing(true);
      }
    } catch {
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!form.name.trim()) { setError('Name is required.'); setSaving(false); return; }
    if (!form.age || Number(form.age) < 10 || Number(form.age) > 120) { setError('Please enter a valid age (10-120).'); setSaving(false); return; }
    if (!form.height || Number(form.height) < 50 || Number(form.height) > 300) { setError('Please enter a valid height in cm (50-300).'); setSaving(false); return; }
    if (!form.weight || Number(form.weight) < 20 || Number(form.weight) > 500) { setError('Please enter a valid weight in kg (20-500).'); setSaving(false); return; }

    const data = {
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      availableTime: Number(form.availableTime),
    };

    try {
      let res;
      if (profile) {
        res = await profileAPI.update(data as unknown as Record<string, unknown>);
      } else {
        res = await profileAPI.create(data as unknown as Record<string, unknown>);
      }
      setProfile(res.data.profile);
      setSuccess(res.data.message || 'Profile saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const bmi = profile ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1) : null;
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { label: 'Normal weight', color: '#34d399' };
    if (bmi < 30) return { label: 'Overweight', color: '#fbbf24' };
    return { label: 'Obese', color: '#f87171' };
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">👤 Your Profile</h1>
            <p className="page-subtitle">Personalize your fitness experience</p>
          </div>
          {profile && !isEditing && (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="alert alert-success fade-in" style={{ marginBottom: '16px' }}>
          <span>✅</span><span>{success}</span>
        </div>
      )}

      {/* Profile Summary (when not editing) */}
      {profile && !isEditing && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
                👤
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{profile.name}</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
                  {profile.age} years • {profile.gender || 'Not specified'} • {profile.height}cm • {profile.weight}kg
                </p>
              </div>
              {bmi && (
                <div style={{ marginLeft: 'auto', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: getBmiCategory(Number(bmi)).color }}>
                    {bmi}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: getBmiCategory(Number(bmi)).color }}>BMI</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getBmiCategory(Number(bmi)).label}</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-light)' }}>🏋️ Fitness Details</h4>
              {[
                { label: 'Level', value: profile.fitnessLevel, icon: '⚡' },
                { label: 'Goal', value: profile.fitnessGoal, icon: '🎯' },
                { label: 'Available Time', value: `${profile.availableTime} minutes`, icon: '⏱️' },
                { label: 'Location', value: profile.workoutLocation, icon: '📍' },
                { label: 'Equipment', value: profile.equipment, icon: '🏋️' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.icon} {item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', textTransform: 'capitalize' }}>{item.value.replace(/-/g, ' ')}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-light)' }}>🥗 Diet & Lifestyle</h4>
              {[
                { label: 'Dietary Preference', value: profile.dietaryPreference, icon: '🥗' },
                { label: 'Food Allergies', value: profile.foodAllergies || 'None', icon: '⚠️' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.icon} {item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', textTransform: 'capitalize' }}>{item.value}</span>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99,102,241,0.08)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  💡 Your profile is used to personalize workout and meal recommendations. Update it anytime as your goals change.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="fade-in">
          {!profile && (
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              <span>👋</span>
              <span>Welcome! Complete your fitness profile to get personalized recommendations from Fitness Buddy.</span>
            </div>
          )}

          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>📋 Personal Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input id="name" name="name" type="text" className="form-input" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="age">Age *</label>
                <input id="age" name="age" type="number" className="form-input" value={form.age} onChange={handleChange} placeholder="e.g., 25" min="10" max="120" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender (optional)</label>
                <select id="gender" name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="height">Height (cm) *</label>
                <input id="height" name="height" type="number" className="form-input" value={form.height} onChange={handleChange} placeholder="e.g., 170" min="50" max="300" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="weight">Weight (kg) *</label>
                <input id="weight" name="weight" type="number" className="form-input" value={form.weight} onChange={handleChange} placeholder="e.g., 70" min="20" max="500" required />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>💪 Fitness Settings</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="fitnessLevel">Fitness Level *</label>
                <select id="fitnessLevel" name="fitnessLevel" className="form-select" value={form.fitnessLevel} onChange={handleChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fitnessGoal">Fitness Goal *</label>
                <select id="fitnessGoal" name="fitnessGoal" className="form-select" value={form.fitnessGoal} onChange={handleChange}>
                  <option value="general-fitness">General Fitness</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="availableTime">Available Time *</label>
                <select id="availableTime" name="availableTime" className="form-select" value={form.availableTime} onChange={handleChange}>
                  <option value="10">10 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="workoutLocation">Workout Location *</label>
                <select id="workoutLocation" name="workoutLocation" className="form-select" value={form.workoutLocation} onChange={handleChange}>
                  <option value="home">Home</option>
                  <option value="gym">Gym</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="equipment">Available Equipment *</label>
                <select id="equipment" name="equipment" className="form-select" value={form.equipment} onChange={handleChange}>
                  <option value="none">No Equipment</option>
                  <option value="dumbbells">Dumbbells</option>
                  <option value="resistance-bands">Resistance Bands</option>
                  <option value="full-gym">Full Gym</option>
                  <option value="custom">Custom (specify below)</option>
                </select>
              </div>
              {form.equipment === 'custom' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="equipmentDetails">Equipment Details</label>
                  <input id="equipmentDetails" name="equipmentDetails" type="text" className="form-input" value={form.equipmentDetails} onChange={handleChange} placeholder="Describe your equipment..." />
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>🥗 Diet & Nutrition</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="dietaryPreference">Dietary Preference *</label>
                <select id="dietaryPreference" name="dietaryPreference" className="form-select" value={form.dietaryPreference} onChange={handleChange}>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="foodAllergies">Food Allergies / Restrictions (optional)</label>
                <input id="foodAllergies" name="foodAllergies" type="text" className="form-input" value={form.foodAllergies} onChange={handleChange} placeholder="e.g., nuts, dairy, gluten..." />
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <span>❌</span><span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner"></span> Saving...</> : `${profile ? '💾 Update' : '🚀 Create'} Profile`}
            </button>
            {profile && (
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </div>

          <p style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            🔒 Your profile information is stored locally and is not shared with third parties.
            We only collect information necessary to personalize your fitness experience.
          </p>
        </form>
      )}
    </div>
  );
}
