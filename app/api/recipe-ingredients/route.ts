import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 60;

export interface RecipeIngredientsRequest {
  mealName: string;
  portions: number;
  selectedRestrictions?: string[];
  selectedCuisines?: string[];
  selectedEquipment?: string[];
  spicyLevel?: string;
}

// Schema for parsed ingredients - simplified and explicit
const recipeResponseSchema = z.object({
  recipeName: z.string().describe("Name of the dish"),
  recipeDescription: z.string().describe("Brief description of the dish"),
  cookingTimeMinutes: z.number().describe("Total cooking time in minutes"),
  difficultyLevel: z.enum(["Easy", "Medium", "Hard"]).describe("Difficulty level"),
  servings: z.number().describe("Number of servings this recipe makes"),
  ingredientsList: z.array(
    z.object({
      ingredientName: z.string().describe("Name of the ingredient"),
      amount: z.number().nullable().describe("Numeric quantity"),
      measurementUnit: z.string().nullable().describe("Unit like g, kg, ml, cups, tbsp, pieces"),
      ingredientCategory: z.enum([
        "meat",
        "seafood",
        "dairy",
        "vegetables",
        "fruits",
        "grains",
        "spices",
        "condiments",
        "oils",
        "other"
      ]).describe("Category for shopping organization"),
    })
  ).describe("Complete list of all ingredients needed"),
  cookingInstructions: z.string().describe("Step-by-step cooking instructions in markdown format. DO NOT include ingredients list here - only cooking steps like '1. Heat oil in pan', '2. Add onions and sauté', etc."),
  nutritionPerServing: z.object({
    caloriesKcal: z.number().nullable(),
    proteinGrams: z.number().nullable(),
    carbsGrams: z.number().nullable(),
    fatGrams: z.number().nullable(),
  }).describe("Estimated nutrition per serving"),
});

export type RecipeResponse = z.infer<typeof recipeResponseSchema>;

function buildSystemPrompt(): string {
  return `You are What2Eat, a helpful AI cooking assistant. Generate complete recipes with detailed ingredient lists.

CRITICAL REQUIREMENTS:
1. You MUST include an "ingredientsList" array with ALL ingredients
2. Each ingredient needs: ingredientName, amount (number or null), measurementUnit (string or null), ingredientCategory
3. Include EVERY ingredient - even salt, pepper, oil, water
4. Use standard units: g, kg, ml, L, cups, tbsp, tsp, pieces
5. Provide realistic nutritional estimates
6. In "cookingInstructions", write ONLY the step-by-step cooking steps. DO NOT include an ingredients list there - ingredients are provided separately in ingredientsList.

Example ingredient format:
{ "ingredientName": "olive oil", "amount": 2, "measurementUnit": "tbsp", "ingredientCategory": "oils" }
{ "ingredientName": "salt", "amount": null, "measurementUnit": "to taste", "ingredientCategory": "spices" }`;
}

function buildRecipePrompt(request: RecipeIngredientsRequest): string {
  const parts: string[] = [];

  parts.push(`Generate a complete recipe for "${request.mealName}" for ${request.portions} portion(s).`);

  if (request.selectedRestrictions && request.selectedRestrictions.length > 0) {
    parts.push(`\nDietary restrictions: ${request.selectedRestrictions.join(", ")}.`);
  }

  if (request.selectedCuisines && request.selectedCuisines.length > 0) {
    parts.push(`\nCuisine style: ${request.selectedCuisines.join(", ")}.`);
  }

  if (request.selectedEquipment && request.selectedEquipment.length > 0) {
    parts.push(`\nAvailable equipment: ${request.selectedEquipment.join(", ")}.`);
  }

  if (request.spicyLevel && request.spicyLevel !== "none") {
    parts.push(`\nSpice level: ${request.spicyLevel}.`);
  }

  parts.push(`\n\nIMPORTANT: Include ALL ingredients in the ingredientsList array.`);

  return parts.join("");
}

export async function POST(req: Request) {
  try {
    const body: RecipeIngredientsRequest = await req.json();

    console.log("[recipe-ingredients] Request:", JSON.stringify(body, null, 2));

    const prompt = buildRecipePrompt(body);

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(),
      prompt,
      schema: recipeResponseSchema,
      temperature: 0.7,
    });

    const data = result.object;

    console.log("[recipe-ingredients] Generated recipe with", data.ingredientsList?.length || 0, "ingredients");

    // Transform to expected format for frontend
    const response = {
      ingredients: (data.ingredientsList || []).map(ing => ({
        name: ing.ingredientName,
        quantity: ing.amount,
        unit: ing.measurementUnit,
        category: ing.ingredientCategory,
      })),
      recipe: {
        name: data.recipeName,
        description: data.recipeDescription,
        cookTime: data.cookingTimeMinutes,
        difficulty: data.difficultyLevel,
        servings: data.servings,
        calories: data.nutritionPerServing?.caloriesKcal,
        protein: data.nutritionPerServing?.proteinGrams,
        carbs: data.nutritionPerServing?.carbsGrams,
        fat: data.nutritionPerServing?.fatGrams,
        instructions: data.cookingInstructions,
      },
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error in recipe-ingredients API:", error);
    return Response.json(
      { error: "Failed to generate recipe", details: String(error) },
      { status: 500 }
    );
  }
}
