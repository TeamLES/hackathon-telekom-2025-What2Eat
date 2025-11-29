import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export interface MealSuggestionRequest {
  flowType: "what-to-cook" | "ingredients-needed";
  ingredientSource?: "use-my-ingredients" | "go-shopping" | null;
  ingredients?: string;
  // Preferences
  selectedCuisines: string[];
  selectedRestrictions: string[];
  selectedEquipment: string[];
  spicyLevel: string;
  quickPreferences: string[];
  additionalPreferences?: string;
  // Details
  cookingTime?: number;
  mealType?: "snack" | "breakfast" | "lunch" | "dinner";
  extraInfo?: string;
  portions?: number;
  mealName?: string;
  // For getting full recipe
  mode?: "suggestions" | "full-recipe";
  selectedMeal?: {
    name: string;
    description: string;
  };
  // For getting different suggestions
  excludeMeals?: string[];
}

// Schema for meal suggestions
const mealSuggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string().describe("The name of the meal"),
      description: z.string().describe("A brief, appetizing description of the meal (1-2 sentences)"),
      estimatedTime: z.string().describe("Estimated cooking time (e.g., '25 minutes')"),
      difficulty: z.enum(["Easy", "Medium", "Hard"]).describe("Difficulty level"),
      emoji: z.string().describe("A single emoji that represents this dish"),
    })
  ).min(2).max(3),
});

export type MealSuggestion = z.infer<typeof mealSuggestionsSchema>["suggestions"][number];

function buildSystemPrompt(): string {
  return `You are What2Eat, a friendly and knowledgeable AI cooking assistant. Your goal is to help users discover delicious meals they can prepare based on their preferences, available ingredients, and dietary needs.

You should:
- Be enthusiastic and encouraging about cooking
- Provide practical, easy-to-follow recipes
- Consider the user's skill level and available equipment
- Respect all dietary restrictions strictly (this is critical for health reasons)
- Suggest creative alternatives when needed
- Include approximate cooking times and portion sizes
- Use emojis sparingly to make responses engaging

When providing full recipes, ALWAYS use proper markdown formatting:

## Recipe Name

Brief description of the dish.

### 🥘 Ingredients

- Ingredient 1 with quantity
- Ingredient 2 with quantity
- etc.

### 📝 Instructions

1. **Step title**: Step description with details.

2. **Step title**: Step description with details.

3. **Step title**: Step description with details.

### 💡 Pro Tips

- Tip 1
- Tip 2

### ⏱️ Time & Difficulty

- **Prep time**: X minutes
- **Cook time**: X minutes  
- **Difficulty**: Easy/Medium/Hard

Always use numbered lists for instructions, bullet points for ingredients, and bold text for emphasis. Add blank lines between sections for readability.`;
}

function buildUserPrompt(request: MealSuggestionRequest): string {
  const parts: string[] = [];

  // Flow type context
  if (request.flowType === "what-to-cook") {
    if (request.ingredientSource === "use-my-ingredients") {
      parts.push(
        "I want to cook something using some of the ingredients I have at home."
      );
      if (request.ingredients) {
        parts.push(`\nIngredients I have available: ${request.ingredients}`);
        parts.push(`\nIMPORTANT: You do NOT need to use all of these ingredients. Pick a sensible selection that works well together for each dish. Feel free to suggest recipes that only use 3-6 main ingredients from my list. It's better to make a delicious dish with fewer ingredients than to force all of them into one recipe.`);
      }
    } else {
      parts.push(
        "I'm planning to go shopping and want meal suggestions. I'm open to buying whatever ingredients are needed."
      );
      if (request.ingredients) {
        parts.push(
          `\nI'd prefer to include some of these ingredients if possible: ${request.ingredients}`
        );
      }
    }
  } else if (request.flowType === "ingredients-needed") {
    parts.push(
      `I want to cook "${request.mealName || "a specific dish"}" and need the full recipe with ingredients list.`
    );
    if (request.portions && request.portions > 1) {
      parts.push(`\nI need the recipe for ${request.portions} portions.`);
    }
  }

  // Meal type
  if (request.mealType) {
    parts.push(`\nThis is for ${request.mealType}.`);
  }

  // Cooking time constraint
  if (request.cookingTime) {
    parts.push(
      `\nI have about ${request.cookingTime} minutes available for cooking.`
    );
  }

  // Cuisine preferences
  if (request.selectedCuisines.length > 0) {
    parts.push(
      `\nPreferred cuisines: ${request.selectedCuisines.join(", ")}.`
    );
  }

  // Dietary restrictions (IMPORTANT - must be strictly followed)
  if (request.selectedRestrictions.length > 0) {
    parts.push(
      `\n⚠️ IMPORTANT - Dietary restrictions (must be strictly followed): ${request.selectedRestrictions.join(", ")}.`
    );
  }

  // Spicy level
  if (request.spicyLevel && request.spicyLevel !== "none") {
    const spicyDescriptions: Record<string, string> = {
      mild: "mildly spiced",
      medium: "moderately spicy",
      hot: "very spicy/hot",
    };
    parts.push(
      `\nSpice preference: I like my food ${spicyDescriptions[request.spicyLevel] || request.spicyLevel}.`
    );
  } else if (request.spicyLevel === "none") {
    parts.push("\nSpice preference: I prefer no spice/heat in my food.");
  }

  // Quick preferences (mood)
  if (request.quickPreferences.length > 0) {
    const moodDescriptions: Record<string, string> = {
      healthy: "something healthy and nutritious",
      quick: "something quick and easy to prepare",
      comfort: "comfort food that's satisfying",
      light: "something light and not too heavy",
      filling: "something filling and substantial",
      sweet: "something sweet",
    };
    const moods = request.quickPreferences
      .map((p) => moodDescriptions[p] || p)
      .join(", ");
    parts.push(`\nI'm in the mood for: ${moods}.`);
  }

  // Kitchen equipment
  if (request.selectedEquipment.length > 0) {
    parts.push(
      `\nKitchen equipment I can use: ${request.selectedEquipment.join(", ")}.`
    );
  }

  // Additional preferences
  if (request.additionalPreferences) {
    parts.push(`\nAdditional preferences: ${request.additionalPreferences}`);
  }

  // Extra info
  if (request.extraInfo) {
    parts.push(`\nExtra notes: ${request.extraInfo}`);
  }

  return parts.join("");
}

function buildSuggestionsPrompt(request: MealSuggestionRequest): string {
  const basePrompt = buildUserPrompt(request);
  
  let excludeNote = "";
  if (request.excludeMeals && request.excludeMeals.length > 0) {
    excludeNote = `\n\n⚠️ IMPORTANT: Do NOT suggest any of these meals as they were already suggested: ${request.excludeMeals.join(", ")}. Provide completely DIFFERENT meal ideas.`;
  }
  
  return `${basePrompt}${excludeNote}

Based on the above preferences and constraints, suggest 2-3 DIVERSE and CREATIVE meal options. Each suggestion MUST:
- Be a DIFFERENT type of dish (don't suggest 3 similar dishes)
- Fit within the cooking time constraint if specified
- Strictly adhere to all dietary restrictions
- Match the preferred cuisine styles if specified
- Be achievable with the available kitchen equipment
- Match the desired spice level and mood preferences
- Only use a sensible selection of available ingredients (not all of them)

Be creative and suggest varied options - for example, if one dish is a soup, make another a stir-fry or salad.`;
}

function buildFullRecipePrompt(request: MealSuggestionRequest): string {
  const parts: string[] = [];
  
  parts.push(`Please provide the complete recipe for "${request.selectedMeal?.name}".`);
  parts.push(`\nDescription: ${request.selectedMeal?.description}`);
  
  if (request.portions && request.portions > 1) {
    parts.push(`\nPlease scale the recipe for ${request.portions} portions.`);
  }
  
  // Include all the constraints that must be followed
  if (request.selectedRestrictions.length > 0) {
    parts.push(`\n⚠️ IMPORTANT - Dietary restrictions (must be strictly followed): ${request.selectedRestrictions.join(", ")}.`);
  }
  
  if (request.selectedEquipment.length > 0) {
    parts.push(`\nAvailable kitchen equipment: ${request.selectedEquipment.join(", ")}.`);
  }
  
  if (request.spicyLevel && request.spicyLevel !== "none") {
    const spicyDescriptions: Record<string, string> = {
      mild: "mildly spiced",
      medium: "moderately spicy", 
      hot: "very spicy/hot",
    };
    parts.push(`\nSpice level: ${spicyDescriptions[request.spicyLevel] || request.spicyLevel}.`);
  }
  
  if (request.ingredients && request.ingredientSource === "use-my-ingredients") {
    parts.push(`\nPlease prioritize using these available ingredients: ${request.ingredients}`);
  }

  parts.push(`\n\nProvide the complete recipe with:
1. A brief introduction
2. Full ingredients list with exact quantities
3. Detailed step-by-step cooking instructions
4. Pro tips for best results
5. Suggested variations or substitutions`);

  return parts.join("");
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log("[meal-suggestions] Received request:", JSON.stringify(json, null, 2));
    
    const body: MealSuggestionRequest = {
      flowType: json.flowType,
      ingredientSource: json.ingredientSource,
      ingredients: json.ingredients,
      selectedCuisines: json.selectedCuisines || [],
      selectedRestrictions: json.selectedRestrictions || [],
      selectedEquipment: json.selectedEquipment || [],
      spicyLevel: json.spicyLevel,
      quickPreferences: json.quickPreferences || [],
      additionalPreferences: json.additionalPreferences,
      cookingTime: json.cookingTime,
      mealType: json.mealType,
      extraInfo: json.extraInfo,
      portions: json.portions,
      mealName: json.mealName,
      mode: json.mode || "suggestions",
      selectedMeal: json.selectedMeal,
      excludeMeals: json.excludeMeals || [],
    };

    console.log("[meal-suggestions] Mode:", body.mode);
    console.log("[meal-suggestions] OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY);

    // Mode 1: Get structured meal suggestions (JSON)
    if (body.mode === "suggestions" && body.flowType === "what-to-cook") {
      const prompt = buildSuggestionsPrompt(body);
      console.log("[meal-suggestions] Suggestions prompt:", prompt);

      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        system: buildSystemPrompt(),
        prompt,
        schema: mealSuggestionsSchema,
        temperature: 0.9,
      });

      console.log("[meal-suggestions] Generated suggestions:", result.object);
      return Response.json(result.object);
    }

    // Mode 2: Get full recipe (streamed)
    let prompt: string;
    if (body.mode === "full-recipe" && body.selectedMeal) {
      prompt = buildFullRecipePrompt(body);
    } else if (body.flowType === "ingredients-needed") {
      // Direct recipe request for a specific meal name
      prompt = `Please provide the complete recipe for "${body.mealName}".`;
      if (body.portions && body.portions > 1) {
        prompt += `\nPlease scale the recipe for ${body.portions} portions.`;
      }
      if (body.selectedRestrictions.length > 0) {
        prompt += `\n⚠️ IMPORTANT - Dietary restrictions: ${body.selectedRestrictions.join(", ")}.`;
      }
      prompt += `\n\nProvide the complete recipe with ingredients list and step-by-step instructions.`;
    } else {
      prompt = buildUserPrompt(body);
    }

    console.log("[meal-suggestions] Recipe prompt:", prompt);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(),
      prompt,
      temperature: 0.7,
    });

    console.log("[meal-suggestions] Streaming response...");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in meal suggestion API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate meal suggestions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
