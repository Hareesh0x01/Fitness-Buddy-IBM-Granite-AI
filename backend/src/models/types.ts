// ============================================================
// Core Data Types for Fitness Buddy Backend
// ============================================================

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  height: number; // cm
  weight: number; // kg
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal: 'weight-loss' | 'muscle-gain' | 'general-fitness' | 'strength' | 'endurance';
  availableTime: 10 | 20 | 30 | 45 | 60;
  workoutLocation: 'home' | 'gym' | 'outdoor';
  equipment: 'none' | 'dumbbells' | 'resistance-bands' | 'full-gym' | 'custom';
  equipmentDetails?: string;
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'other';
  foodAllergies?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  name: string;
  duration?: string;
  reps?: string;
  sets: number;
  rest: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  instructions: string;
  targetArea: string;
  safetyTip: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  totalDuration: number;
  difficulty: string;
  goal: string;
  location: string;
  equipment: string;
  warmup: Exercise[];
  exercises: Exercise[];
  cooldown: Exercise[];
  generatedAt: string;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutTitle: string;
  workoutType: string;
  duration: number;
  exercises: string[];
  completedAt: string;
  status: 'completed' | 'partial' | 'skipped';
  notes?: string;
}

export interface HabitEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workout: boolean;
  water: boolean;
  healthyMeal: boolean;
  sleep: boolean;
  activity: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MealRecommendation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  ingredients: string[];
  preparationSteps: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  healthBenefits: string[];
  generatedAt: string;
}

export interface DailyPlan {
  date: string;
  workout: WorkoutPlan | null;
  mealSuggestion: string;
  waterReminder: string;
  dailyTip: string;
  motivationMessage: string;
  habitChecklist: string[];
}

export interface Progress {
  currentGoal: string;
  todayProgress: number;
  weeklyWorkouts: number;
  habitStreak: number;
  completedWorkouts: number;
  progressPercentage: number;
  weeklyHabitData: { day: string; completed: number; total: number }[];
  workoutFrequency: { week: string; count: number }[];
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  userProfile?: Partial<UserProfile>;
}

export interface WorkoutGenerateRequest {
  goal?: string;
  fitnessLevel?: string;
  availableTime?: number;
  equipment?: string;
  location?: string;
}

export interface NutritionRequest {
  mealType: string;
  dietaryPreference?: string;
  goal?: string;
  availableIngredients?: string;
  restrictions?: string;
}

export interface HabitUpdateRequest {
  date: string;
  habits: Partial<Omit<HabitEntry, 'id' | 'date'>>;
}
