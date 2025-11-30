import { MealPlanner } from "@/components/meal-planner";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getUserProfile() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch nutrition profile
  const { data: profile } = await supabase
    .from("nutrition_profiles")
    .select("meals_per_day, cooking_skill, calorie_target, protein_target_g, carbs_target_g, fat_target_g, primary_goal, budget_level")
    .eq("user_id", authData.user.id)
    .single();

  // Fetch cuisines
  const { data: cuisines } = await supabase
    .from("user_favorite_cuisines")
    .select("cuisines(code)")
    .eq("user_id", authData.user.id);

  // Fetch restrictions
  const { data: restrictions } = await supabase
    .from("user_dietary_restrictions")
    .select("dietary_restrictions(code)")
    .eq("user_id", authData.user.id);

  // Fetch flavor preferences
  const { data: flavors } = await supabase
    .from("user_flavor_preferences")
    .select("flavor_profiles(code)")
    .eq("user_id", authData.user.id);

  // Fetch food dislikes
  const { data: dislikes } = await supabase
    .from("user_food_dislikes")
    .select("food_name")
    .eq("user_id", authData.user.id);

  return {
    mealsPerDay: profile?.meals_per_day || 3,
    cookingSkill: profile?.cooking_skill || null,
    calorieTarget: profile?.calorie_target || null,
    proteinTarget: profile?.protein_target_g || null,
    carbsTarget: profile?.carbs_target_g || null,
    fatTarget: profile?.fat_target_g || null,
    primaryGoal: profile?.primary_goal || null,
    budgetLevel: profile?.budget_level || null,
    cuisines: cuisines?.map((c) => (c.cuisines as unknown as { code: string })?.code).filter(Boolean) || [],
    restrictions: restrictions?.map((r) => (r.dietary_restrictions as unknown as { code: string })?.code).filter(Boolean) || [],
    flavorPreferences: flavors?.map((f) => (f.flavor_profiles as unknown as { code: string })?.code).filter(Boolean) || [],
    foodDislikes: dislikes?.map((d) => d.food_name).filter(Boolean) || [],
  };
}

export default async function MealPlannerPage() {
  const userProfile = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Planner</h1>
        <p className="text-muted-foreground">
          Generate a personalized meal plan for the upcoming days
        </p>
      </div>

      <MealPlanner userProfile={userProfile} />
    </div>
  );
}
