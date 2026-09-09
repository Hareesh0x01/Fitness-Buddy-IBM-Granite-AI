import { Request, Response } from 'express';
import { generateMealRecommendation } from '../services/nutritionService';
import { mealStore, profileStore } from '../utils/store';

// POST /api/nutrition/recommend
export async function recommendMeal(req: Request, res: Response): Promise<void> {
  try {
    const profile = profileStore.get();
    const {
      mealType = 'breakfast',
      dietaryPreference = profile?.dietaryPreference || 'non-vegetarian',
      goal = profile?.fitnessGoal || 'general-fitness',
      availableIngredients = '',
      restrictions = profile?.foodAllergies || '',
    } = req.body as {
      mealType?: string;
      dietaryPreference?: string;
      goal?: string;
      availableIngredients?: string;
      restrictions?: string;
    };

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType.toLowerCase())) {
      res.status(400).json({ error: 'Invalid meal type. Use: breakfast, lunch, dinner, or snack.' });
      return;
    }

    const { meal, aiDescription } = await generateMealRecommendation(
      { mealType: mealType.toLowerCase(), dietaryPreference, goal, availableIngredients, restrictions },
      profile || undefined
    );

    const saved = mealStore.save(meal);
    res.json({
      meal: saved,
      aiDescription,
      disclaimer: 'Nutrition information is approximate. Consult a registered dietitian for personalized dietary advice.',
    });
  } catch (err) {
    console.error('[Nutrition Recommend]', err);
    res.status(500).json({ error: 'Failed to generate meal recommendation. Please try again.' });
  }
}

// GET /api/nutrition/history
export async function getMealHistory(req: Request, res: Response): Promise<void> {
  try {
    const meals = mealStore.getAll();
    res.json({ meals });
  } catch (err) {
    console.error('[Meal History]', err);
    res.status(500).json({ error: 'Failed to retrieve meal history.' });
  }
}
