import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard-client";

async function getUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("nutrition_profiles")
    .select("calorie_target, weight_kg")
    .eq("user_id", user.id)
    .single();

  return { user, profile };
}

export default async function DashboardPage() {
  const data = await getUserData();
  const profile = data?.profile || null;

  return <DashboardClient profile={profile} />;
}
