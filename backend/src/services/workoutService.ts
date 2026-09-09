import { v4 as uuidv4 } from 'uuid';
import { WorkoutPlan, Exercise, UserProfile } from '../models/types';
import { generateStructuredContent } from './aiService';

// ============================================================
// Workout Service
// ============================================================

interface WorkoutParams {
  goal: string;
  fitnessLevel: string;
  availableTime: number;
  equipment: string;
  location: string;
}

// Fallback exercise library for when AI is unavailable
const exerciseLibrary: Record<string, Exercise[]> = {
  beginner: [
    { name: 'Squats', reps: '12', sets: 3, rest: '30s', difficulty: 'easy', instructions: 'Stand with feet shoulder-width apart. Lower until thighs are parallel to the floor, then push back up.', targetArea: 'Legs & Glutes', safetyTip: 'Keep your knees aligned with your toes. Don\'t let knees cave inward.' },
    { name: 'Push-ups', reps: '10', sets: 3, rest: '30s', difficulty: 'easy', instructions: 'Start in plank position. Lower chest to floor, then push back up. Modify on knees if needed.', targetArea: 'Chest & Triceps', safetyTip: 'Keep core tight throughout. Don\'t let hips sag.' },
    { name: 'Lunges', reps: '10 each leg', sets: 3, rest: '30s', difficulty: 'easy', instructions: 'Step forward with one foot, lower back knee toward floor. Push back to standing.', targetArea: 'Legs & Glutes', safetyTip: 'Keep front knee over ankle, not past toes.' },
    { name: 'Plank', duration: '20 seconds', sets: 3, rest: '20s', difficulty: 'easy', instructions: 'Hold body in a straight line from head to heels, supported on forearms and toes.', targetArea: 'Core', safetyTip: 'Breathe normally throughout. Don\'t hold your breath.' },
    { name: 'Glute Bridges', reps: '15', sets: 3, rest: '30s', difficulty: 'easy', instructions: 'Lie on back, knees bent. Push hips toward ceiling, squeeze glutes, lower slowly.', targetArea: 'Glutes & Hamstrings', safetyTip: 'Press through your heels, not your toes.' },
    { name: 'Mountain Climbers', duration: '30 seconds', sets: 3, rest: '30s', difficulty: 'moderate', instructions: 'Start in plank. Alternate bringing knees toward chest in a running motion.', targetArea: 'Core & Cardio', safetyTip: 'Keep hips level — don\'t let them rise too high.' },
  ],
  intermediate: [
    { name: 'Jump Squats', reps: '15', sets: 3, rest: '45s', difficulty: 'moderate', instructions: 'Perform a squat then explode upward into a jump. Land softly with bent knees.', targetArea: 'Legs & Cardio', safetyTip: 'Land with soft knees to protect joints.' },
    { name: 'Diamond Push-ups', reps: '12', sets: 3, rest: '45s', difficulty: 'moderate', instructions: 'Position hands in diamond shape under chest. Perform push-up.', targetArea: 'Chest & Triceps', safetyTip: 'If too hard, modify to regular push-ups.' },
    { name: 'Bulgarian Split Squats', reps: '10 each', sets: 3, rest: '45s', difficulty: 'moderate', instructions: 'Rear foot elevated on bench. Lower into single-leg squat position.', targetArea: 'Legs & Balance', safetyTip: 'Keep torso upright. Hold onto a wall if needed for balance.' },
    { name: 'Burpees', reps: '10', sets: 3, rest: '45s', difficulty: 'hard', instructions: 'Drop to push-up, do push-up, jump feet forward, jump up with arms overhead.', targetArea: 'Full Body', safetyTip: 'Go at your own pace. Skip the jump if needed.' },
  ],
  advanced: [
    { name: 'Pistol Squats', reps: '8 each', sets: 3, rest: '60s', difficulty: 'hard', instructions: 'Single-leg squat until standing leg is parallel to floor. Hold opposite leg extended.', targetArea: 'Legs & Balance', safetyTip: 'Master regular squats first. Use a wall for balance if needed.' },
    { name: 'Plyometric Push-ups', reps: '12', sets: 4, rest: '60s', difficulty: 'hard', instructions: 'Explosive push-up where hands leave the floor at the top.', targetArea: 'Chest, Shoulders & Power', safetyTip: 'Only attempt if you can do 20+ regular push-ups easily.' },
    { name: 'L-Sit Hold', duration: '15 seconds', sets: 4, rest: '60s', difficulty: 'hard', instructions: 'Support body on two objects, extend legs parallel to floor.', targetArea: 'Core & Shoulder Stability', safetyTip: 'Build up gradually. Use bent knees to modify.' },
  ],
  warmup: [
    { name: 'March in Place', duration: '2 minutes', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'March in place lifting knees high, swinging arms naturally.', targetArea: 'Full Body Activation', safetyTip: 'Start slow and gradually increase pace.' },
    { name: 'Arm Circles', duration: '1 minute', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Extend arms and make large circles forward then backward.', targetArea: 'Shoulders', safetyTip: 'Keep movements controlled and smooth.' },
    { name: 'Hip Circles', duration: '1 minute', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Hands on hips, make large circles with your hips.', targetArea: 'Hips & Lower Back', safetyTip: 'Move slowly through the full range of motion.' },
  ],
  cooldown: [
    { name: 'Standing Quad Stretch', duration: '30s each side', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Stand on one leg, pull other ankle toward glutes. Hold.', targetArea: 'Quadriceps', safetyTip: 'Hold a wall for balance if needed.' },
    { name: 'Hamstring Stretch', duration: '30s each side', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Stand with one leg extended forward, hinge at hips to reach toward toes.', targetArea: 'Hamstrings', safetyTip: 'Don\'t lock your knee. Slight bend is fine.' },
    { name: 'Child\'s Pose', duration: '1 minute', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Kneel, sit back on heels, extend arms forward on floor. Hold.', targetArea: 'Back & Hips', safetyTip: 'Breathe deeply. Relax fully into the stretch.' },
    { name: 'Deep Breathing', duration: '2 minutes', sets: 1, rest: '0s', difficulty: 'easy', instructions: 'Inhale for 4 counts, hold 2, exhale for 6. Repeat.', targetArea: 'Recovery & Relaxation', safetyTip: 'Focus on slowing your heart rate.' },
  ],
};

function buildWorkoutPrompt(params: WorkoutParams): string {
  return `Create a detailed ${params.availableTime}-minute ${params.fitnessLevel} workout plan for someone with the following profile:
- Goal: ${params.goal}
- Fitness Level: ${params.fitnessLevel}
- Available Time: ${params.availableTime} minutes
- Equipment: ${params.equipment}
- Location: ${params.location}

Format the response as a structured workout with:
1. A warm-up section (2-3 minutes)
2. Main workout section with exercises including: exercise name, sets, reps/duration, rest time, instructions, target area, and safety tips
3. Cool-down section (2-3 minutes)

Make sure the workout is appropriate for a ${params.fitnessLevel} and completable in ${params.availableTime} minutes with ${params.equipment} equipment at ${params.location}.`;
}

function generateFallbackWorkout(params: WorkoutParams): WorkoutPlan {
  const level = params.fitnessLevel as keyof typeof exerciseLibrary;
  const exercises = exerciseLibrary[level] || exerciseLibrary.beginner;

  // Scale exercise count based on available time
  let exerciseCount = 4;
  if (params.availableTime <= 10) exerciseCount = 2;
  else if (params.availableTime <= 20) exerciseCount = 4;
  else if (params.availableTime <= 30) exerciseCount = 5;
  else exerciseCount = 6;

  const selectedExercises = exercises.slice(0, exerciseCount);

  const goalLabels: Record<string, string> = {
    'weight-loss': 'Weight Loss',
    'muscle-gain': 'Muscle Gain',
    'general-fitness': 'General Fitness',
    strength: 'Strength',
    endurance: 'Endurance',
  };

  return {
    id: uuidv4(),
    title: `${params.availableTime}-Minute ${params.fitnessLevel.charAt(0).toUpperCase() + params.fitnessLevel.slice(1)} ${goalLabels[params.goal] || 'Fitness'} Workout`,
    totalDuration: params.availableTime,
    difficulty: params.fitnessLevel,
    goal: params.goal,
    location: params.location,
    equipment: params.equipment,
    warmup: exerciseLibrary.warmup,
    exercises: selectedExercises,
    cooldown: exerciseLibrary.cooldown,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateWorkout(
  params: WorkoutParams,
  userProfile?: Partial<UserProfile>
): Promise<{ plan: WorkoutPlan; aiDescription: string }> {
  const prompt = buildWorkoutPrompt(params);
  let aiDescription = '';

  try {
    const aiResponse = await generateStructuredContent(prompt, userProfile);
    aiDescription = aiResponse.text;
  } catch {
    aiDescription = '';
  }

  // Always provide a structured workout plan for the UI
  const plan = generateFallbackWorkout(params);

  return { plan, aiDescription };
}

export function getMotivationalMessages(): string[] {
  return [
    "Every rep counts. Every step matters. Keep going! 💪",
    "You're one workout away from a better mood.",
    "The body achieves what the mind believes.",
    "Progress, not perfection. Show up today.",
    "Small consistent steps lead to big results.",
    "Your future self will thank you for not giving up.",
    "Strength doesn't come from what you can do — it comes from overcoming what you thought you couldn't.",
    "The only bad workout is the one that didn't happen.",
    "It always seems impossible until it's done.",
    "Train hard, stay consistent, trust the process.",
    "Champions are made in the moments when they want to quit but don't.",
    "Your health is an investment, not an expense.",
    "The pain you feel today is the strength you'll feel tomorrow.",
    "Make yourself proud.",
    "Discipline is choosing between what you want now and what you want most.",
  ];
}

export function getDailyTips(): string[] {
  return [
    "Drink a glass of water before every meal — it aids digestion and helps with portion control.",
    "Try to take a 10-minute walk after dinner to boost metabolism.",
    "Aim for 7-8 hours of sleep — sleep is when your muscles grow.",
    "Add protein to every meal to stay fuller longer and support muscle recovery.",
    "Take the stairs today instead of the elevator.",
    "Practice 5 minutes of deep breathing to reduce cortisol and stress.",
    "Meal prep on Sunday — it makes healthy eating easier all week.",
    "Stretch for 5 minutes before bed to improve flexibility and sleep quality.",
    "Try replacing one processed snack today with a piece of fruit.",
    "Move your body for at least 10 minutes today — consistency matters most.",
  ];
}
