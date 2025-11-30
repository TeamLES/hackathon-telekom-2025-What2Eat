import { HistoryClient } from "@/components/history-client";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/utils";

interface Recipe {
  id: number;
  title: string;
  description: string | null;
  total_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
}

interface MealPlanItem {
  id: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  recipe_id: number | null;
  recipes: Recipe | null;
}

interface MealPlan {
  id: number;
  plan_date: string;
  meal_plan_items: MealPlanItem[];
}

async function getMealPlans() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user?.id) {
    return [];
  }

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const { data: mealPlans, error } = await supabase
    .from("meal_plans")
    .select(`
      id,
      plan_date,
      meal_plan_items (
        id,
        meal_type,
        recipe_id,
        recipes (
          id,
          title,
          description,
          total_calories,
          protein_g,
          carbs_g,
          fat_g,
          cook_time_minutes,
          difficulty
        )
      )
    `)
    .eq("user_id", authData.user.id)
    .gte("plan_date", getLocalDateString(startDate))
    .lte("plan_date", getLocalDateString(endDate))
    .order("plan_date", { ascending: true });

  if (error) {
    console.error("Error fetching meal plans:", error);
    return [];
  }

  const formattedMeals = (mealPlans as any[] || []).map((plan) => ({
    date: plan.plan_date,
    meals: plan.meal_plan_items.map((item: any) => {
      const recipe = Array.isArray(item.recipes) ? item.recipes[0] : item.recipes;
      return {
        id: String(item.id),
        recipeId: recipe?.id || null,
        name: recipe?.title || "Unnamed meal",
        description: recipe?.description || null,
        type: item.meal_type,
        calories: recipe?.total_calories || undefined,
        protein: recipe?.protein_g || undefined,
        carbs: recipe?.carbs_g || undefined,
        fat: recipe?.fat_g || undefined,
        cookTime: recipe?.cook_time_minutes || undefined,
        difficulty: recipe?.difficulty || undefined,
      };
    }),
  }));

  return formattedMeals;
}

export default async function HistoryPage() {
  const meals = await getMealPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Calendar</h1>
        <p className="text-muted-foreground">
          Track your meals and plan ahead
        </p>
      </div>

      <HistoryClient meals={meals} />
    </div>
  );
}
