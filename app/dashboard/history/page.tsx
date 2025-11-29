import { MealPlanCalendar } from "@/components/meal-plan-calendar";
import { createClient } from "@/lib/supabase/server";

interface MealPlanItem {
  id: number;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  recipe_id: number | null;
  recipes: {
    title: string;
    total_calories: number | null;
  } | null;
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
          title,
          total_calories
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
      name: item.recipes?.title || "Unnamed meal",
      type: item.meal_type,
      calories: item.recipes?.total_calories || undefined,
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
