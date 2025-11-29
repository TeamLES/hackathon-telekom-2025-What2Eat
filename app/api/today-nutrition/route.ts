import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Get today's meal plan
    const { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_date", today)
      .single();

    if (!mealPlan) {
      return Response.json({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    // Get all meal plan items with their recipes
    const { data: items } = await supabase
      .from("meal_plan_items")
      .select(`
        servings,
        recipe:recipes(
          total_calories,
          protein_g,
          carbs_g,
          fat_g
        )
      `)
      .eq("meal_plan_id", mealPlan.id);

    if (!items || items.length === 0) {
      return Response.json({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    // Sum up all nutrition values
    const totals = items.reduce(
      (acc, item) => {
        // recipe can be an array due to Supabase join
        const recipeData = Array.isArray(item.recipe) ? item.recipe[0] : item.recipe;
        
        if (recipeData) {
          const servings = item.servings || 1;
          acc.calories += (recipeData.total_calories || 0) * servings;
          acc.protein += (recipeData.protein_g || 0) * servings;
          acc.carbs += (recipeData.carbs_g || 0) * servings;
          acc.fat += (recipeData.fat_g || 0) * servings;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return Response.json(totals);
  } catch (error) {
    console.error("Error fetching today's nutrition:", error);
    return Response.json({ error: "Failed to fetch nutrition" }, { status: 500 });
  }
}
