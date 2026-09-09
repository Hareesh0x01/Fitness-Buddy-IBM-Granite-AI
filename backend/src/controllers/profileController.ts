import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { profileStore } from '../utils/store';
import { UserProfile } from '../models/types';

// GET /api/profile
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const profile = profileStore.get();
    if (!profile) {
      res.json({ profile: null, message: 'No profile found. Complete your fitness profile to get personalized recommendations.' });
      return;
    }
    res.json({ profile });
  } catch (err) {
    console.error('[Get Profile]', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

// POST /api/profile
export async function createProfile(req: Request, res: Response): Promise<void> {
  try {
    const {
      name, age, gender, height, weight, fitnessLevel, fitnessGoal,
      availableTime, workoutLocation, equipment, equipmentDetails,
      dietaryPreference, foodAllergies,
    } = req.body as Partial<UserProfile>;

    // Validate required fields
    if (!name || !age || !height || !weight || !fitnessLevel || !fitnessGoal ||
        !availableTime || !workoutLocation || !equipment || !dietaryPreference) {
      res.status(400).json({
        error: 'Missing required fields.',
        required: ['name', 'age', 'height', 'weight', 'fitnessLevel', 'fitnessGoal', 'availableTime', 'workoutLocation', 'equipment', 'dietaryPreference'],
      });
      return;
    }

    // Validate ranges
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (ageNum < 10 || ageNum > 120) {
      res.status(400).json({ error: 'Age must be between 10 and 120.' });
      return;
    }
    if (heightNum < 50 || heightNum > 300) {
      res.status(400).json({ error: 'Height must be between 50 and 300 cm.' });
      return;
    }
    if (weightNum < 20 || weightNum > 500) {
      res.status(400).json({ error: 'Weight must be between 20 and 500 kg.' });
      return;
    }

    const validFitnessLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validFitnessLevels.includes(fitnessLevel as string)) {
      res.status(400).json({ error: 'Invalid fitness level.' });
      return;
    }

    const validGoals = ['weight-loss', 'muscle-gain', 'general-fitness', 'strength', 'endurance'];
    if (!validGoals.includes(fitnessGoal as string)) {
      res.status(400).json({ error: 'Invalid fitness goal.' });
      return;
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: uuidv4(),
      name: String(name).trim().slice(0, 100),
      age: ageNum,
      gender: gender as UserProfile['gender'],
      height: heightNum,
      weight: weightNum,
      fitnessLevel: fitnessLevel as UserProfile['fitnessLevel'],
      fitnessGoal: fitnessGoal as UserProfile['fitnessGoal'],
      availableTime: Number(availableTime) as UserProfile['availableTime'],
      workoutLocation: workoutLocation as UserProfile['workoutLocation'],
      equipment: equipment as UserProfile['equipment'],
      equipmentDetails: equipmentDetails ? String(equipmentDetails).trim().slice(0, 200) : undefined,
      dietaryPreference: dietaryPreference as UserProfile['dietaryPreference'],
      foodAllergies: foodAllergies ? String(foodAllergies).trim().slice(0, 200) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = profileStore.save(profile);
    res.status(201).json({ profile: saved, message: 'Profile created successfully! Welcome to Fitness Buddy! 🎉' });
  } catch (err) {
    console.error('[Create Profile]', err);
    res.status(500).json({ error: 'Failed to create profile.' });
  }
}

// PUT /api/profile
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const existing = profileStore.get();
    if (!existing) {
      res.status(404).json({ error: 'Profile not found. Please create a profile first.' });
      return;
    }

    // Only update allowed fields
    const allowedUpdates: (keyof UserProfile)[] = [
      'name', 'age', 'gender', 'height', 'weight', 'fitnessLevel', 'fitnessGoal',
      'availableTime', 'workoutLocation', 'equipment', 'equipmentDetails',
      'dietaryPreference', 'foodAllergies',
    ];

    const updates: Partial<UserProfile> = {};
    for (const field of allowedUpdates) {
      if (field in req.body) {
        (updates as Record<string, unknown>)[field] = req.body[field as string];
      }
    }

    const updated = profileStore.update(updates);
    if (!updated) {
      res.status(500).json({ error: 'Failed to update profile.' });
      return;
    }

    res.json({ profile: updated, message: 'Profile updated successfully!' });
  } catch (err) {
    console.error('[Update Profile]', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}
