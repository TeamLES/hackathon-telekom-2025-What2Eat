import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("nutrition_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return { user, profile: profile || null };
}

export default async function ProfilePage() {
  const data = await getProfile();

  if (!data || !data.user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition profile */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Profile</CardTitle>
            <CardDescription>Your dietary settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{profile.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium">{profile.weight_kg} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-medium">{profile.height_cm} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calorie Target</p>
                <p className="font-medium">{profile.calorie_target} kcal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activity Level</p>
                <p className="font-medium capitalize">{profile.activity_level?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="font-medium capitalize">{profile.primary_goal?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meals per Day</p>
                <p className="font-medium">{profile.meals_per_day}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cooking Skill</p>
                <p className="font-medium capitalize">{profile.cooking_skill}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/onboarding">Edit Preferences</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
