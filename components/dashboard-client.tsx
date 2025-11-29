"use client";

import { useWizard } from "@/components/dashboard-shell";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DashboardClientProps {
  profile: {
    calorie_target: number;
    weight_kg: number;
  } | null;
}

export function DashboardClient({ profile }: DashboardClientProps) {
  const { openWizard } = useWizard();

  // Calculate macros if profile exists
  const proteinTarget = profile?.weight_kg ? Math.round(profile.weight_kg * 1.6) : 0;
  const fatTarget = profile?.weight_kg ? Math.round(profile.weight_kg * 1) : 0;
  const proteinCalories = proteinTarget * 4;
  const fatCalories = fatTarget * 9;
  const remainingCalories = profile?.calorie_target ? profile.calorie_target - proteinCalories - fatCalories : 0;
  const carbsTarget = remainingCalories > 0 ? Math.round(remainingCalories / 4) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
        <p className="text-muted-foreground">
          Ready to discover what to eat today?
        </p>
      </div>

      {/* Quick stats */}
      {profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[hsl(var(--brand-orange))]">
                {profile.calorie_target}
              </div>
              <p className="text-xs text-muted-foreground">Daily Calories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[hsl(var(--brand-green))]">
                {proteinTarget}g
              </div>
              <p className="text-xs text-muted-foreground">Protein Target</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {carbsTarget}g
              </div>
              <p className="text-xs text-muted-foreground">Carbs Target</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {fatTarget}g
              </div>
              <p className="text-xs text-muted-foreground">Fat Target</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">What do you need?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => openWizard("what-to-cook")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤔</span>
                What should I cook?
              </CardTitle>
              <CardDescription>
                Get meal suggestions based on your preferences and ingredients
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => openWizard("ingredients-needed")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Get a recipe
              </CardTitle>
              <CardDescription>
                Already know what to cook? Get detailed ingredients and steps
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-[hsl(var(--brand-orange))]/10 to-[hsl(280,70%,50%)]/10">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tip of the day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tap the <span className="font-bold text-[hsl(var(--brand-orange))]">+</span> button to get personalized meal suggestions based on what ingredients you have!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
