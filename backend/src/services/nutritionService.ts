import { v4 as uuidv4 } from 'uuid';
import { MealRecommendation, UserProfile } from '../models/types';
import { generateStructuredContent } from './aiService';

// ============================================================
// Nutrition Service
// ============================================================

interface NutritionParams {
  mealType: string;
  dietaryPreference: string;
  goal: string;
  availableIngredients: string;
  restrictions: string;
}

const fallbackMeals: Record<string, MealRecommendation[]> = {
  breakfast: [
    {
      id: '',
      mealType: 'breakfast',
      title: 'High-Protein Oat Bowl',
      ingredients: ['½ cup rolled oats', '1 cup milk or almond milk', '2 tbsp peanut butter', '1 banana', '1 tbsp honey', 'Handful of berries'],
      preparationSteps: [
        'Cook oats with milk over medium heat for 5 minutes, stirring occasionally.',
        'Transfer to bowl and stir in peanut butter.',
        'Top with sliced banana, berries, and a drizzle of honey.',
        'Serve warm.',
      ],
      calories: 480,
      protein: 18,
      carbs: 65,
      fat: 14,
      prepTime: '10 minutes',
      healthBenefits: ['Sustained energy from complex carbs', 'Protein supports muscle recovery', 'Antioxidants from berries reduce inflammation'],
      generatedAt: new Date().toISOString(),
    },
    {
      id: '',
      mealType: 'breakfast',
      title: 'Scrambled Eggs with Veggies',
      ingredients: ['3 eggs', '½ cup spinach', '¼ cup diced bell pepper', '¼ cup onion', '1 tbsp olive oil', '2 slices whole grain toast', 'Salt & pepper'],
      preparationSteps: [
        'Heat olive oil in a pan over medium heat.',
        'Sauté onion and bell pepper for 2 minutes.',
        'Add spinach, cook until wilted.',
        'Beat eggs, pour over vegetables, scramble until cooked.',
        'Season and serve with toast.',
      ],
      calories: 390,
      protein: 26,
      carbs: 28,
      fat: 18,
      prepTime: '10 minutes',
      healthBenefits: ['Complete protein for muscle building', 'Vitamins from colorful vegetables', 'Whole grains provide fiber'],
      generatedAt: new Date().toISOString(),
    },
  ],
  lunch: [
    {
      id: '',
      mealType: 'lunch',
      title: 'Chicken & Quinoa Power Bowl',
      ingredients: ['150g grilled chicken breast', '½ cup cooked quinoa', '1 cup mixed salad greens', '½ avocado', '¼ cup cherry tomatoes', '2 tbsp olive oil & lemon dressing'],
      preparationSteps: [
        'Cook quinoa according to package directions.',
        'Season and grill chicken breast for 6-7 minutes per side.',
        'Slice chicken and arrange over quinoa and greens.',
        'Add avocado slices and cherry tomatoes.',
        'Drizzle with dressing.',
      ],
      calories: 520,
      protein: 42,
      carbs: 38,
      fat: 20,
      prepTime: '20 minutes',
      healthBenefits: ['High protein for muscle repair', 'Healthy fats from avocado', 'Complete amino acids from quinoa'],
      generatedAt: new Date().toISOString(),
    },
  ],
  dinner: [
    {
      id: '',
      mealType: 'dinner',
      title: 'Baked Salmon with Sweet Potato',
      ingredients: ['150g salmon fillet', '1 medium sweet potato', '1 cup broccoli', '1 tbsp olive oil', 'Garlic, lemon, herbs'],
      preparationSteps: [
        'Preheat oven to 200°C.',
        'Cube sweet potato, toss with olive oil and roast 25 minutes.',
        'Season salmon, place on baking sheet, bake 12-15 minutes.',
        'Steam broccoli for 5 minutes.',
        'Serve together with lemon wedge.',
      ],
      calories: 490,
      protein: 38,
      carbs: 42,
      fat: 16,
      prepTime: '35 minutes',
      healthBenefits: ['Omega-3 fatty acids support heart health', 'Beta-carotene from sweet potato', 'Broccoli is high in vitamin C and fiber'],
      generatedAt: new Date().toISOString(),
    },
  ],
  snack: [
    {
      id: '',
      mealType: 'snack',
      title: 'Greek Yogurt & Nuts',
      ingredients: ['1 cup Greek yogurt', '1 tbsp mixed nuts', '1 tsp honey', '¼ tsp cinnamon'],
      preparationSteps: [
        'Spoon Greek yogurt into a bowl.',
        'Top with nuts, honey, and cinnamon.',
        'Enjoy immediately.',
      ],
      calories: 220,
      protein: 18,
      carbs: 20,
      fat: 8,
      prepTime: '2 minutes',
      healthBenefits: ['Protein and probiotics from yogurt', 'Healthy fats from nuts', 'Blood sugar stabilizing cinnamon'],
      generatedAt: new Date().toISOString(),
    },
  ],
};

function buildNutritionPrompt(params: NutritionParams): string {
  return `Suggest a healthy ${params.mealType} meal for someone with these preferences:
- Dietary preference: ${params.dietaryPreference}
- Fitness goal: ${params.goal}
- Available ingredients: ${params.availableIngredients || 'common pantry staples'}
- Restrictions: ${params.restrictions || 'none'}

Please provide:
1. Meal name
2. Complete ingredients list with measurements
3. Step-by-step preparation instructions
4. Approximate nutrition info (calories, protein, carbs, fat)
5. Preparation time
6. Health benefits

Keep the meal practical, nutritious, and aligned with the fitness goal.
Do not provide extreme diet advice. Note that nutrition info is approximate.`;
}

export async function generateMealRecommendation(
  params: NutritionParams,
  userProfile?: Partial<UserProfile>
): Promise<{ meal: MealRecommendation; aiDescription: string }> {
  const prompt = buildNutritionPrompt(params);
  let aiDescription = '';

  try {
    const aiResponse = await generateStructuredContent(prompt, userProfile);
    aiDescription = aiResponse.text;
  } catch {
    aiDescription = '';
  }

  // Provide structured meal from library
  const mealOptions = fallbackMeals[params.mealType.toLowerCase()] || fallbackMeals.breakfast;
  const baseMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];

  const meal: MealRecommendation = {
    ...baseMeal,
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
  };

  return { meal, aiDescription };
}
