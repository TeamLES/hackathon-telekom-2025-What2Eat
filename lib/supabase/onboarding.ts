import { createClient } from "./server";

/**
 * Check if the current user has completed onboarding by checking if they have a nutrition_profiles row.
 * Returns the user ID if authenticated, null otherwise.
 */
export async function checkOnboardingStatus(): Promise<{
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  userId: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      userId: null,
    };
  }

  const { data: nutritionProfile, error: profileError } = await supabase
    .from("nutrition_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error checking nutrition profile:", profileError);
    return {
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      userId: user.id,
    };
  }

  return {
    isAuthenticated: true,
    hasCompletedOnboarding: !!nutritionProfile,
    userId: user.id,
  };
}
