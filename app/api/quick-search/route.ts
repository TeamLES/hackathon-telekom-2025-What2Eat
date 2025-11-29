import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export interface QuickSearchRequest {
  query: string;
  mode?: "suggestions" | "full-recipe";
  selectedMeal?: {
    name: string;
    description: string;
  };
}

interface UserPreferences {
  dietary_restrictions: string[];
  favorite_cuisines: string[];
  kitchen_equipment: string[];
  flavor_preferences: string[];
  food_dislikes: string[];
  cooking_skill: string | null;
  max_cooking_time_minutes: number | null;
  calorie_target: number | null;
  protein_target_g: number | null;
  budget_level: string | null;
  ai_tone: string | null;
}

// Schema for meal suggestions
const mealSuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string().describe("Name of the dish"),
      description: z.string().describe("Brief appetizing description (1-2 sentences)"),
      estimatedTime: z.string().describe("Estimated cooking time, e.g. '30 min'"),
      difficulty: z.enum(["Easy", "Medium", "Hard"]),
      emoji: z.string().describe("A food emoji that represents this dish"),
      calories: z.number().optional().describe("Approximate calories per serving"),
      protein: z.number().optional().describe("Approximate protein in grams per serving"),
    })
  ).min(3).max(5),
});

async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (!userId) return null;

    // Load user preferences from database
    const [
      nutritionRes,
      dietRestrictionsRes,
      cuisinesRes,
      equipmentRes,
      flavorsRes,
      dislikesRes,
      preferencesRes,
      cuisineLookupRes,
      restrictionLookupRes,
      equipmentLookupRes,
      flavorLookupRes,
    ] = await Promise.all([
      supabase
        .from("nutrition_profiles")
        .select("cooking_skill, calorie_target, protein_target_g, budget_level")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("user_dietary_restrictions")
        .select("restriction_id")
        .eq("user_id", userId),
      supabase
        .from("user_favorite_cuisines")
        .select("cuisine_id")
        .eq("user_id", userId),
      supabase
        .from("user_kitchen_equipment")
        .select("equipment_id")
        .eq("user_id", userId),
      supabase
        .from("user_flavor_preferences")
        .select("flavor_id")
        .eq("user_id", userId),
      supabase
        .from("user_food_dislikes")
        .select("food_name")
        .eq("user_id", userId),
      supabase
        .from("user_preferences")
        .select("max_cooking_time_minutes, ai_tone")
        .eq("user_id", userId)
        .single(),
      // Lookup tables
      supabase.from("cuisines").select("id, name"),
      supabase.from("dietary_restrictions").select("id, label"),
      supabase.from("kitchen_equipment").select("id, label"),
      supabase.from("flavor_profiles").select("id, label"),
    ]);

    // Map IDs to labels
    const cuisineMap = new Map(
      cuisineLookupRes.data?.map((c: { id: number; name: string }) => [c.id, c.name]) || []
    );
    const restrictionMap = new Map(
      restrictionLookupRes.data?.map((r: { id: number; label: string }) => [r.id, r.label]) || []
    );
    const equipmentMap = new Map(
      equipmentLookupRes.data?.map((e: { id: number; label: string }) => [e.id, e.label]) || []
    );
    const flavorMap = new Map(
      flavorLookupRes.data?.map((f: { id: number; label: string }) => [f.id, f.label]) || []
    );

    return {
      dietary_restrictions:
        dietRestrictionsRes.data
          ?.map((r: { restriction_id: number }) => restrictionMap.get(r.restriction_id))
          .filter(Boolean) as string[] || [],
      favorite_cuisines:
        cuisinesRes.data
          ?.map((c: { cuisine_id: number }) => cuisineMap.get(c.cuisine_id))
          .filter(Boolean) as string[] || [],
      kitchen_equipment:
        equipmentRes.data
          ?.map((e: { equipment_id: number }) => equipmentMap.get(e.equipment_id))
          .filter(Boolean) as string[] || [],
      flavor_preferences:
        flavorsRes.data
          ?.map((f: { flavor_id: number }) => flavorMap.get(f.flavor_id))
          .filter(Boolean) as string[] || [],
      food_dislikes:
        dislikesRes.data?.map((d: { food_name: string }) => d.food_name) || [],
      cooking_skill: nutritionRes.data?.cooking_skill || null,
      max_cooking_time_minutes: preferencesRes.data?.max_cooking_time_minutes || null,
      calorie_target: nutritionRes.data?.calorie_target || null,
      protein_target_g: nutritionRes.data?.protein_target_g || null,
      budget_level: nutritionRes.data?.budget_level || null,
      ai_tone: preferencesRes.data?.ai_tone || null,
    };
  } catch (error) {
    console.error("Error loading user preferences:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body: QuickSearchRequest = await req.json();

    if (!body.query || body.query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mode = body.mode || "suggestions";
    console.log("[quick-search] Query:", body.query, "Mode:", mode);

    // Load user preferences
    const prefs = await getUserPreferences();
    console.log("[quick-search] User preferences loaded:", !!prefs);

    // MODE 1: Get structured meal suggestions
    if (mode === "suggestions") {
      const suggestionsPrompt = buildSuggestionsPrompt(body.query, prefs);

      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: mealSuggestionSchema,
        prompt: suggestionsPrompt,
        temperature: 0.8,
      });

      return new Response(
        JSON.stringify(result.object),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // MODE 2: Get full recipe (streamed markdown)
    if (mode === "full-recipe") {
      const recipePrompt = buildRecipePrompt(body.query, body.selectedMeal, prefs);

      const result = await streamText({
        model: openai("gpt-4o-mini"),
        system: buildRecipeSystemPrompt(prefs),
        prompt: recipePrompt,
        temperature: 0.7,
      });

      return result.toTextStreamResponse();
    }

    // Default fallback
    return new Response(
      JSON.stringify({ error: "Invalid mode" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in quick search API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process search" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildSuggestionsPrompt(query: string, prefs: UserPreferences | null): string {
  let prompt = `Based on this food request: "${query}"

Generate 4-5 diverse meal suggestions that match the request.`;

  if (prefs?.dietary_restrictions?.length) {
    prompt += `\n\n⚠️ CRITICAL: User has these dietary restrictions that MUST be strictly followed: ${prefs.dietary_restrictions.join(", ")}. Never suggest foods that violate these.`;
  }
  if (prefs?.food_dislikes?.length) {
    prompt += `\nUser dislikes these foods (avoid suggesting): ${prefs.food_dislikes.join(", ")}`;
  }
  if (prefs?.favorite_cuisines?.length) {
    prompt += `\nUser's favorite cuisines (prefer when relevant): ${prefs.favorite_cuisines.join(", ")}`;
  }
  if (prefs?.cooking_skill) {
    prompt += `\nCooking skill level: ${prefs.cooking_skill}`;
  }
  if (prefs?.max_cooking_time_minutes) {
    prompt += `\nPreferred max cooking time: ${prefs.max_cooking_time_minutes} minutes`;
  }
  if (prefs?.calorie_target) {
    prompt += `\nDaily calorie target: ${prefs.calorie_target} kcal - include approximate calories`;
  }
  if (prefs?.protein_target_g) {
    prompt += `\nProtein target: ${prefs.protein_target_g}g - include approximate protein content`;
  }

  prompt += `\n\nMake suggestions varied in cuisine, cooking method, and complexity. Include a mix of options.`;

  return prompt;
}

function buildRecipePrompt(query: string, selectedMeal: { name: string; description: string } | undefined, prefs: UserPreferences | null): string {
  if (selectedMeal) {
    return `Provide a complete, detailed recipe for: ${selectedMeal.name}

Description: ${selectedMeal.description}

Original search context: "${query}"

Include:
- Complete list of ingredients with precise quantities
- Step-by-step cooking instructions
- Cooking tips and variations
- Nutritional information estimate (calories, protein, carbs, fat)
- Serving suggestions`;
  }

  return `Provide a complete, detailed recipe based on this request: "${query}"

Include:
- Complete list of ingredients with precise quantities
- Step-by-step cooking instructions
- Cooking tips and variations
- Nutritional information estimate
- Serving suggestions`;
}

function buildRecipeSystemPrompt(prefs: UserPreferences | null): string {
  const toneDescriptions: Record<string, string> = {
    friendly: "Be warm, encouraging, and conversational. Use emojis sparingly and make cooking feel fun and approachable.",
    expert: "Be professional and detailed. Provide precise measurements, techniques, and chef-level tips. Be thorough but efficient.",
    minimal: "Be concise and to the point. Focus on essential information only. No fluff.",
  };

  const tone = prefs?.ai_tone
    ? toneDescriptions[prefs.ai_tone] || toneDescriptions.friendly
    : toneDescriptions.friendly;

  return `You are What2Eat, an AI cooking assistant providing detailed recipes.

${tone}

ALWAYS format recipes using this markdown structure:

## 🍳 Recipe Name

Brief appetizing description.

**⏱️ Time:** X minutes | **📊 Difficulty:** Easy/Medium/Hard | **🍽️ Serves:** X

---

### 📝 Ingredients

- Ingredient with quantity
- Ingredient with quantity

---

### 👨‍🍳 Instructions

1. **Step name**: Detailed description
2. **Step name**: Detailed description

---

### 💡 Tips & Variations

- Helpful tip
- Variation idea

---

### 📊 Nutrition (per serving)

| Calories | Protein | Carbs | Fat |
|----------|---------|-------|-----|
| X kcal   | Xg      | Xg    | Xg  |

${prefs?.dietary_restrictions?.length
      ? `\n⚠️ CRITICAL: User has these dietary restrictions: ${prefs.dietary_restrictions.join(", ")}. Ensure the recipe complies.`
      : ""}
${prefs?.food_dislikes?.length
      ? `\nUser dislikes these foods (avoid using): ${prefs.food_dislikes.join(", ")}`
      : ""}
${prefs?.kitchen_equipment?.length
      ? `\nAvailable kitchen equipment: ${prefs.kitchen_equipment.join(", ")}`
      : ""}
${prefs?.cooking_skill
      ? `\nCooking skill level: ${prefs.cooking_skill} - adjust complexity accordingly`
      : ""}`;
}
