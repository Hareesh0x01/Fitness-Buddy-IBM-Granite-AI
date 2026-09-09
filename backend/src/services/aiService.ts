import { UserProfile } from '../models/types';

// ============================================================
// IBM Granite AI Service
// Primary provider: IBM Granite via IBM Cloud watsonx.ai
// Fallback: Mock provider for local development
// ============================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  provider: 'ibm-granite' | 'mock';
}

// ============================================================
// System prompt for Fitness Buddy persona
// ============================================================
export function buildSystemPrompt(profile: Partial<UserProfile> | undefined): string {
  let profileContext = '';
  if (profile) {
    const parts: string[] = [];
    if (profile.name) parts.push(`Name: ${profile.name}`);
    if (profile.age) parts.push(`Age: ${profile.age}`);
    if (profile.gender) parts.push(`Gender: ${profile.gender}`);
    if (profile.fitnessLevel) parts.push(`Fitness level: ${profile.fitnessLevel}`);
    if (profile.fitnessGoal) parts.push(`Fitness goal: ${profile.fitnessGoal}`);
    if (profile.availableTime) parts.push(`Available workout time: ${profile.availableTime} minutes`);
    if (profile.workoutLocation) parts.push(`Workout location: ${profile.workoutLocation}`);
    if (profile.equipment) parts.push(`Equipment: ${profile.equipment}`);
    if (profile.dietaryPreference) parts.push(`Dietary preference: ${profile.dietaryPreference}`);
    if (profile.foodAllergies) parts.push(`Food restrictions: ${profile.foodAllergies}`);
    if (parts.length > 0) {
      profileContext = `\n\nUser Profile:\n${parts.join('\n')}`;
    }
  }

  return `You are Fitness Buddy, a friendly AI wellness and fitness assistant. Provide practical, simple, and personalized fitness, workout, healthy lifestyle, and basic nutrition guidance.

Your guidelines:
- Give beginner-friendly explanations when needed.
- Adapt workouts to the user's available time and equipment.
- Encourage consistency and realistic goals.
- Suggest healthy, sustainable habits.
- Avoid dangerous or extreme exercise or diet advice.
- Never diagnose medical conditions — always recommend consulting a qualified professional for medical concerns.
- State clearly when information is uncertain.
- Never encourage eating disorders, dangerous weight-loss, or unsafe exercise.
- Keep responses practical, structured, and easy to follow.
- Use bullet points, numbered lists, and clear headings for workout and meal content.
- Be encouraging and motivating.

Safety disclaimer: Always remind users that Fitness Buddy provides general wellness information and is not a replacement for a qualified doctor, dietitian, or fitness professional.${profileContext}`;
}

// ============================================================
// IBM Granite provider (via watsonx.ai REST API)
// Uses /ml/v1/text/generation endpoint — matches IBM sample code format
// ============================================================
async function callIBMGranite(messages: AIMessage[]): Promise<string> {
  const apiKey = process.env.IBM_API_KEY;
  const projectId = process.env.IBM_PROJECT_ID;
  const modelId = process.env.IBM_MODEL_ID || 'ibm/granite-4-h-small';
  const baseUrl = process.env.IBM_WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

  if (!apiKey || !projectId) {
    throw new Error('IBM credentials not configured');
  }

  // Step 1: Get IAM access token from IBM Cloud
  const tokenResponse = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`IBM IAM token error ${tokenResponse.status}: ${errText}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  const accessToken = tokenData.access_token;

  // Step 2: Build a single prompt string from messages
  // Format: <system>\n\nUser: <msg>\nAssistant:
  const systemMsg = messages.find((m) => m.role === 'system');
  const conversation = messages.filter((m) => m.role !== 'system');

  let prompt = systemMsg ? `${systemMsg.content}\n\n` : '';
  for (const msg of conversation) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n`;
    }
  }
  prompt += 'Assistant:';

  // Step 3: Call watsonx.ai text/generation endpoint (matches IBM sample code)
  const response = await fetch(
    `${baseUrl}/ml/v1/text/generation?version=2023-05-29`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        input: prompt,
        parameters: {
          decoding_method: 'greedy',
          max_new_tokens: 800,
          min_new_tokens: 0,
          repetition_penalty: 1.1,
        },
        model_id: modelId,
        project_id: projectId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IBM Granite API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    results?: { generated_text?: string }[];
    choices?: { message?: { content?: string } }[];
  };

  // Parse response — text/generation returns results[]
  if (data.results && data.results[0]?.generated_text) {
    return data.results[0].generated_text.trim();
  }
  // Fallback for chat endpoint format
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  throw new Error('Unexpected IBM Granite response format');
}

// ============================================================
// Mock AI provider — for local development without IBM credentials
// ============================================================
const mockResponses: Record<string, string> = {
  workout: `**Today's Workout Plan** 🏋️\n\nHere's a 20-minute beginner-friendly full-body workout:\n\n**Warm-up (3 min)**\n- March in place — 2 minutes\n- Arm circles — 1 minute\n\n**Main Workout**\n1. **Squats** — 3 sets × 12 reps | Rest: 30s\n   - Stand feet shoulder-width apart, lower until thighs are parallel to floor\n2. **Push-ups** — 3 sets × 10 reps | Rest: 30s\n   - Keep core tight, lower chest to floor\n3. **Lunges** — 3 sets × 10 each leg | Rest: 30s\n   - Step forward, lower back knee toward floor\n4. **Plank** — 3 sets × 20 seconds | Rest: 20s\n   - Keep body straight from head to heels\n\n**Cool-down (3 min)**\n- Standing quad stretch — 30s each leg\n- Shoulder stretch — 30s each side\n- Deep breathing — 1 minute\n\n💡 **Safety tip:** Listen to your body and stop if you feel pain (not just fatigue). Stay hydrated!\n\n*Fitness Buddy provides general wellness information — consult a fitness professional for a personalized program.*`,

  meal: `**Healthy Meal Suggestion** 🥗\n\n**High-Protein Breakfast Bowl**\n\n**Ingredients:**\n- 2 eggs (scrambled or boiled)\n- ½ cup oats\n- 1 banana\n- ½ cup Greek yogurt\n- 1 tbsp honey\n- Handful of berries\n\n**Preparation (10 min):**\n1. Cook oats with water or milk (3-4 min)\n2. Top with Greek yogurt and berries\n3. Prepare eggs alongside\n4. Drizzle honey on top\n\n**Nutrition (approx):**\n- Calories: ~450\n- Protein: 28g\n- Carbs: 52g\n- Fat: 12g\n\n**Health benefits:** High protein supports muscle recovery, complex carbs provide sustained energy, and antioxidants from berries aid recovery.\n\n*Nutrition information is approximate. Consult a registered dietitian for personalized advice.*`,

  motivation: `**Your Daily Motivation** ✨\n\n"The only bad workout is the one that didn't happen."\n\n**Today's Fitness Tips:**\n\n1. 🌅 **Start small** — even 10 minutes of movement counts\n2. 💧 **Hydrate** — drink a glass of water right now\n3. 🧘 **Recovery matters** — rest days are part of the program\n4. 📱 **Track your wins** — celebrate small victories\n5. 🤝 **Consistency beats intensity** — show up every day\n\n**Your Goal Reminder:**\nEvery step forward, no matter how small, brings you closer to your goal. You have chosen to invest in your health — that already makes you ahead of the game!\n\n**Daily Challenge:** Do 10 jumping jacks right now. Go! 🎯`,

  weekly: `**Your Weekly Fitness Plan** 📅\n\n**Monday — Full Body Strength**\n- 20 min: Squats, Push-ups, Lunges, Plank\n\n**Tuesday — Active Recovery**\n- 15 min: Light walking or stretching\n\n**Wednesday — Cardio**\n- 20 min: Jumping jacks, High knees, Burpees, Mountain climbers\n\n**Thursday — Rest Day**\n- Focus on hydration and sleep\n\n**Friday — Upper Body**\n- 20 min: Push-ups, Tricep dips, Shoulder taps, Superman\n\n**Saturday — Lower Body**\n- 20 min: Squats, Lunges, Glute bridges, Calf raises\n\n**Sunday — Flexibility**\n- 15 min: Full body stretching routine\n\n**Tips for the week:**\n- Aim for 7-8 hours of sleep each night\n- Eat protein with every meal\n- Track your water intake daily\n\n*Adjust intensity based on how your body feels. Rest when needed.*`,

  default: `**Fitness Buddy** 🏃‍♂️\n\nGreat question! Here are some practical fitness tips for you:\n\n**Getting Started:**\n- Begin with 2-3 workouts per week\n- Focus on compound movements (squats, push-ups, lunges)\n- Consistency is more important than intensity\n\n**Staying Motivated:**\n- Set small, achievable weekly goals\n- Track your progress\n- Find activities you enjoy\n\n**Nutrition Basics:**\n- Eat plenty of whole foods\n- Stay hydrated (aim for 8 glasses of water daily)\n- Don't skip meals — fuel your workouts\n\n**Recovery:**\n- Get 7-8 hours of sleep\n- Include rest days in your routine\n- Stretch after workouts\n\nFeel free to ask me anything specific about workouts, nutrition, or healthy habits! 💪\n\n*Remember: Fitness Buddy provides general wellness information and is not a replacement for a qualified doctor, dietitian, or fitness professional.*`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('training')) {
    return mockResponses.workout;
  }
  if (lower.includes('meal') || lower.includes('eat') || lower.includes('food') || lower.includes('nutrition') || lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner')) {
    return mockResponses.meal;
  }
  if (lower.includes('motivat') || lower.includes('consistent') || lower.includes('tip') || lower.includes('inspire')) {
    return mockResponses.motivation;
  }
  if (lower.includes('week') || lower.includes('plan') || lower.includes('schedule') || lower.includes('routine')) {
    return mockResponses.weekly;
  }
  return mockResponses.default;
}

// ============================================================
// Main AI service — tries IBM Granite, falls back to mock
// ============================================================
export async function getAIResponse(
  messages: AIMessage[],
  userMessage: string,
  userProfile?: Partial<UserProfile>
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(userProfile);
  const fullMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const ibmEnabled = !!(process.env.IBM_API_KEY && process.env.IBM_PROJECT_ID);

  if (ibmEnabled) {
    try {
      const text = await callIBMGranite(fullMessages);
      return { text, provider: 'ibm-granite' };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[AI Service] IBM Granite failed, using mock fallback:', errorMsg);
      // Fall through to mock
    }
  }

  // Mock fallback
  const text = getMockResponse(userMessage);
  return { text, provider: 'mock' };
}

// ============================================================
// Structured generation helper (for workout/nutrition generation)
// ============================================================
export async function generateStructuredContent(
  prompt: string,
  userProfile?: Partial<UserProfile>
): Promise<AIResponse> {
  return getAIResponse(
    [{ role: 'user', content: prompt }],
    prompt,
    userProfile
  );
}
