"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type SelectedMeal = {
  name: string;
  description: string;
  estimatedTime?: string; // e.g. "30 minutes"
  difficulty?: "Easy" | "Medium" | "Hard";
};

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
  fullRecipeMarkdown: string
): Promise<{ id: number } | { error: string }> {
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
  const { data, error } = await supabase
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

  if (error) {
    console.error("Failed to save recipe", error);
    return { error: error.message };
  }

  return { id: data.id };
}
