"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type SelectedMeal = {
  name: string;
  description: string;
  estimatedTime?: string; // e.g. "30 minutes"
  difficulty?: "Easy" | "Medium" | "Hard";
};

type MealType = Database["public"]["Enums"]["meal_type"];

function parseEstimatedTimeToMinutes(time?: string): number | null {
  if (!time) return null;
  // naive parse: take first number
  const match = time.match(/(\d+)/);
  if (!match) return null;
  return Number(match[1]) || null;
}

function mapDifficultyToEnum(
  difficulty?: SelectedMeal["difficulty"]
): Database["public"]["Enums"]["cooking_skill_level"] | null {
  if (!difficulty) return null;
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "beginner";
    case "medium":
      return "intermediate";
    case "hard":
      return "advanced";
    default:
      return null;
  }
}

export async function saveAiRecipeAction(
  selectedMeal: SelectedMeal,
  fullRecipeMarkdown: string,
  mealType: MealType = "lunch",
  planDate?: string // ISO date string like "2025-11-29"
): Promise<{ id: number; mealPlanItemId?: number } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const cookTimeMinutes = parseEstimatedTimeToMinutes(selectedMeal.estimatedTime);
  const difficultyEnum = mapDifficultyToEnum(selectedMeal.difficulty);

  // Store whole recipe as markdown in `description`
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: selectedMeal.name,
      // include the short description at the top
      description: `${selectedMeal.description}\n\n${fullRecipeMarkdown}`,
      source: "ai_generated",
      cook_time_minutes: cookTimeMinutes,
      difficulty: difficultyEnum,
      is_public: false,
    })
    .select("id")
    .single();

  if (recipeError) {
    console.error("Failed to save recipe", recipeError);
    return { error: recipeError.message };
  }

  // Add to meal plan for today (or specified date)
  const targetDate = planDate || new Date().toISOString().split("T")[0];
  
  // Get or create meal plan for the target date
  let { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("plan_date", targetDate)
    .single();

  if (!mealPlan) {
    // Create a new meal plan for this date
    const { data: newPlan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        plan_date: targetDate,
      })
      .select("id")
      .single();

    if (planError) {
      console.error("Failed to create meal plan", planError);
      // Recipe was saved, just couldn't add to plan
      return { id: recipe.id };
    }
    mealPlan = newPlan;
  }

  // Get the highest position for this meal type
  const { data: existingItems } = await supabase
    .from("meal_plan_items")
    .select("position")
    .eq("meal_plan_id", mealPlan.id)
    .eq("meal_type", mealType)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existingItems && existingItems.length > 0 
    ? (existingItems[0].position || 0) + 1 
    : 1;

  // Add recipe to meal plan
  const { data: mealPlanItem, error: itemError } = await supabase
    .from("meal_plan_items")
    .insert({
      meal_plan_id: mealPlan.id,
      recipe_id: recipe.id,
      meal_type: mealType,
      servings: 1,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (itemError) {
    console.error("Failed to add to meal plan", itemError);
    // Recipe was saved, just couldn't add to plan
    return { id: recipe.id };
  }

  return { id: recipe.id, mealPlanItemId: mealPlanItem.id };
}
