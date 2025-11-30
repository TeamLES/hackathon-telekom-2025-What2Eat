import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema for meal plan generation
const mealPlanSchema = z.object({
  days: z.array(
    z.object({
      dayIndex: z.number().describe("Day index starting from 0"),
      meals: z.array(
        z.object({
          name: z.string().describe("The name of the meal"),
          description: z.string().describe("A brief, appetizing description of the meal (1-2 sentences)"),
          type: z.enum(["breakfast", "lunch", "dinner", "snack"]).describe("Type of meal"),
          estimatedTime: z.string().describe("Estimated cooking time (e.g., '25 minutes')"),
          difficulty: z.enum(["Easy", "Medium", "Hard"]).describe("Difficulty level"),
          emoji: z.string().describe("A single emoji that represents this dish"),
          estimatedCalories: z.number().optional().describe("Estimated calories"),
          estimatedProtein: z.number().optional().describe("Estimated protein in grams"),
        })
      ),
    })
  ),
});

export type MealPlanDay = z.infer<typeof mealPlanSchema>["days"][number];
export type MealPlanMeal = MealPlanDay["meals"][number];

interface MealPlanRequest {
  days: number;
  mealsPerDay: number;
  includeBreakfast: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
  includeSnacks: boolean;
  // User preferences
  cuisines?: string[];
  restrictions?: string[];
  cookingSkill?: string;
  calorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  primaryGoal?: string;
  budgetLevel?: string;
  maxCookingTime?: number;
  flavorPreferences?: string[];
  foodDislikes?: string[];
}

function buildMealPlanPrompt(request: MealPlanRequest): string {
  const mealTypes: string[] = [];
  if (request.includeBreakfast) mealTypes.push("breakfast");
  if (request.includeLunch) mealTypes.push("lunch");
  if (request.includeDinner) mealTypes.push("dinner");
  if (request.includeSnacks) mealTypes.push("1-2 snacks");

  let prompt = `Generate a ${request.days}-day meal plan with ${mealTypes.join(", ")} for each day.

Requirements:
- Total meals per day: ${request.mealsPerDay}
- Meal types to include: ${mealTypes.join(", ")}
- Ensure variety - don't repeat the same meals
- Consider nutritional balance across the day
`;

  if (request.cuisines && request.cuisines.length > 0) {
    prompt += `\nPreferred cuisines: ${request.cuisines.join(", ")}`;
  }

  if (request.restrictions && request.restrictions.length > 0) {
    prompt += `\n⚠️ CRITICAL - Dietary restrictions (MUST be strictly followed): ${request.restrictions.join(", ")}`;
  }

  if (request.cookingSkill) {
    const skillDescriptions: Record<string, string> = {
      beginner: "Keep recipes simple with basic techniques",
      intermediate: "Moderately complex recipes are fine",
      advanced: "Can handle challenging recipes",
    };
    prompt += `\nCooking skill: ${skillDescriptions[request.cookingSkill] || request.cookingSkill}`;
  }

  if (request.calorieTarget) {
    prompt += `\nDaily calorie target: approximately ${request.calorieTarget} kcal`;
  }

  if (request.proteinTarget) {
    prompt += `\nDaily protein target: approximately ${request.proteinTarget}g`;
  }

  if (request.carbsTarget) {
    prompt += `\nDaily carbohydrates target: approximately ${request.carbsTarget}g`;
  }

  if (request.fatTarget) {
    prompt += `\nDaily fat target: approximately ${request.fatTarget}g`;
  }

  if (request.primaryGoal) {
    const goalDescriptions: Record<string, string> = {
      lose_weight: "Focus on lower-calorie, high-protein options",
      gain_muscle: "Focus on high-protein meals",
      maintain: "Balanced nutrition",
      eat_healthier: "Emphasize whole foods and vegetables",
    };
    prompt += `\nGoal: ${goalDescriptions[request.primaryGoal] || request.primaryGoal}`;
  }

  if (request.budgetLevel) {
    const budgetDescriptions: Record<string, string> = {
      low: "Use affordable, budget-friendly ingredients",
      medium: "Moderate budget",
      high: "Can include premium ingredients",
    };
    prompt += `\nBudget: ${budgetDescriptions[request.budgetLevel] || request.budgetLevel}`;
  }

  if (request.maxCookingTime) {
    prompt += `\nMax cooking time per meal: ${request.maxCookingTime} minutes`;
  }

  if (request.flavorPreferences && request.flavorPreferences.length > 0) {
    prompt += `\nFlavor preferences: ${request.flavorPreferences.join(", ")}`;
  }

  if (request.foodDislikes && request.foodDislikes.length > 0) {
    prompt += `\nFoods to avoid: ${request.foodDislikes.join(", ")}`;
  }

  return prompt;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mode, ...requestData } = body;

    if (mode === "generate-plan") {
      const request = requestData as MealPlanRequest;

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: mealPlanSchema,
        system: `You are What2Eat, an AI meal planning assistant. Generate diverse, practical meal plans that are:
- Nutritionally balanced
- Varied (no repeating meals within the plan)
- Practical to cook at home
- Matched to the user's preferences and restrictions

For each meal, provide a brief but appetizing description, realistic cooking time, and appropriate difficulty level.`,
        prompt: buildMealPlanPrompt(request),
      });

      return Response.json({ plan: object });
    }

    if (mode === "generate-recipe") {
      // Generate full recipe for a specific meal
      const { meal, mealType } = body as { meal: MealPlanMeal; mealType: string };

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: `You are What2Eat, a friendly cooking assistant. Provide detailed, easy-to-follow recipes with proper markdown formatting.

Always include:
- Full ingredient list with quantities
- Step-by-step numbered instructions
- Pro tips
- Nutrition facts section

Use this format:
## ${meal.name}

${meal.description}

### 🥘 Ingredients
- Item 1
- Item 2

### 📝 Instructions
1. **Step**: Description
2. **Step**: Description

### 💡 Pro Tips
- Tip 1

### ⏱️ Time & Difficulty
- **Prep time**: X minutes
- **Cook time**: X minutes
- **Difficulty**: ${meal.difficulty}

### 📊 Nutrition Facts (per serving)
| Calories | Protein | Carbs | Fat |
|----------|---------|-------|-----|
| XXX kcal | XXg | XXg | XXg |`,
        prompt: `Generate a complete recipe for: ${meal.name}
Description: ${meal.description}
Meal type: ${mealType}
Difficulty: ${meal.difficulty}
Target time: ${meal.estimatedTime}`,
      });

      return result.toTextStreamResponse();
    }

    return Response.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Error in meal-plan API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
