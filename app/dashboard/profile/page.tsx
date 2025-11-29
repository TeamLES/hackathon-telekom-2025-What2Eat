import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProfileForm from "@/components/profile-form";
import ProfileEditButton from "@/components/profile-edit-button";

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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <CardTitle>Nutrition Profile</CardTitle>
              <CardDescription>Your dietary settings</CardDescription>
            </div>
            <ProfileEditButton />
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm initialProfile={profile} showHeader={false} />
        </CardContent>
      </Card>

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
