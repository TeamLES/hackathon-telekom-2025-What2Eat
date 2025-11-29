import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard-client";

async function getUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch both nutrition profile and user profile (for name)
  const [nutritionRes, profileRes] = await Promise.all([
    supabase
      .from("nutrition_profiles")
      .select("calorie_target, weight_kg")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  return { 
    user, 
    profile: nutritionRes.data,
    firstName: profileRes.data?.full_name?.split(" ")[0] || null,
  };
}

async function getTodayNutrition(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get today's meal plan
  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("plan_date", today)
    .single();

  if (!mealPlan) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
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
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
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

  return totals;
}

export default async function DashboardPage() {
  const data = await getUserData();
  const profile = data?.profile || null;
  const firstName = data?.firstName || null;
  
  // Get today's consumed nutrition
  const todayNutrition = data?.user 
    ? await getTodayNutrition(data.user.id)
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <DashboardClient 
      profile={profile} 
      todayNutrition={todayNutrition} 
      firstName={firstName}
    />
  );
}
