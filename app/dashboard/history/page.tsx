import { MealPlanCalendar } from "@/components/meal-plan-calendar";
import { createClient } from "@/lib/supabase/server";

interface Recipe {
  id: number;
  title: string;
  description: string | null;
  total_calories: number | null;
  protein_g: number | null;
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

  // Get meal plans for current month and surrounding months
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
          cook_time_minutes,
          difficulty
        )
      )
    `)
    .eq("user_id", authData.user.id)
    .gte("plan_date", startDate.toISOString().split("T")[0])
    .lte("plan_date", endDate.toISOString().split("T")[0])
    .order("plan_date", { ascending: true });

  if (error) {
    console.error("Error fetching meal plans:", error);
    return [];
  }

  // Transform data to match calendar component format
  const formattedMeals = (mealPlans as MealPlan[] || []).map((plan) => ({
    date: plan.plan_date,
    meals: plan.meal_plan_items.map((item) => ({
      id: String(item.id),
      recipeId: item.recipes?.id || null,
      name: item.recipes?.title || "Unnamed meal",
      description: item.recipes?.description || null,
      type: item.meal_type,
      calories: item.recipes?.total_calories || undefined,
      protein: item.recipes?.protein_g || undefined,
      cookTime: item.recipes?.cook_time_minutes || undefined,
      difficulty: item.recipes?.difficulty || undefined,
    })),
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

      <MealPlanCalendar meals={meals} />
    </div>
  );
}
