"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ingredientsSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe("Name of the ingredient"),
      quantity: z.number().nullable().describe("Quantity needed"),
      unit: z.string().nullable().describe("Unit of measurement"),
      category: z.string().optional().describe("Category like proteins, vegetables, etc."),
      isOptional: z.boolean().optional().describe("Whether ingredient is optional"),
    })
  ),
});

// GET - Parse ingredients from a meal's description
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mealPlanId = request.nextUrl.searchParams.get("mealPlanId");
    const recipeId = request.nextUrl.searchParams.get("recipeId");
    const description = request.nextUrl.searchParams.get("description");
    const name = request.nextUrl.searchParams.get("name");

    // If description is provided directly, parse it
    if (description && name) {
      const ingredients = await parseIngredientsFromDescription(name, description);
      return NextResponse.json({ ingredients, source: "description" });
    }

    // If recipeId is provided, get recipe details
    if (recipeId) {
      const { data: recipe, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error || !recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      }

      const ingredients = await parseIngredientsFromDescription(
        recipe.name,
        recipe.description || ""
      );
      return NextResponse.json({ ingredients, source: "recipe" });
    }

    // If mealPlanId is provided, get from meal plan
    if (mealPlanId) {
      const { data: mealPlan, error } = await supabase
        .from("meal_plans")
        .select(`
          id,
          recipe_id,
          meal_name,
          meal_description,
          recipes:recipe_id (
            id,
            name,
            description
          )
        `)
        .eq("id", mealPlanId)
        .eq("user_id", user.id)
        .single();

      if (error || !mealPlan) {
        return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
      }

      // Use recipe description if available, otherwise use meal description
      // recipes is an array due to join, take first element
      const recipesArray = mealPlan.recipes as unknown as { id: number; name: string; description: string | null }[] | null;
      const recipe = recipesArray?.[0] || null;
      const mealName = recipe?.name || mealPlan.meal_name || "Meal";
      const mealDescription = recipe?.description || mealPlan.meal_description || "";

      if (!mealDescription) {
        return NextResponse.json({
          ingredients: [],
          source: "none",
          message: "No recipe details available to extract ingredients"
        });
      }

      const ingredients = await parseIngredientsFromDescription(mealName, mealDescription);
      return NextResponse.json({ ingredients, source: "meal_plan" });
    }

    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

async function parseIngredientsFromDescription(name: string, description: string): Promise<z.infer<typeof ingredientsSchema>["ingredients"]> {
  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ingredientsSchema,
      prompt: `Extract all ingredients from this recipe. Look for an "Ingredients" section or list.

Recipe Name: ${name}

Recipe Description/Instructions:
${description}

Extract each ingredient with:
- name: The ingredient name (e.g., "chicken breast", "olive oil")
- quantity: The numeric amount (e.g., 2, 0.5, null if not specified)
- unit: The unit of measurement (e.g., "cups", "tbsp", "g", null if count-based like "2 eggs")
- category: One of: "proteins", "vegetables", "fruits", "dairy", "grains", "oils", "spices", "other"
- isOptional: true if marked as optional

If no clear ingredients list is found, try to extract ingredients from the cooking instructions.
Return an empty array if no ingredients can be identified.`,
    });

    return result.object.ingredients;
  } catch (error) {
    console.error("Error parsing ingredients:", error);
    return [];
  }
}
