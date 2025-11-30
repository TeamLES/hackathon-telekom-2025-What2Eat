"use client";

import { Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProfileData,
  GENDER_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  getOptionLabel,
} from "./types";

type Props = {
  profile: ProfileData;
  editForm: ProfileData;
  isEditing: boolean;
  updateFieldAction: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
};

export function AccountTab({ profile, editForm, isEditing, updateFieldAction }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📧 Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Email
            </Label>
            <p className="font-medium mt-1">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              🔒 Email cannot be changed
            </p>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={editForm.full_name ?? ""}
                  onChange={(e) => updateFieldAction("full_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={editForm.username ?? ""}
                  onChange={(e) => updateFieldAction("username", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Full Name
                </Label>
                <p className="font-medium mt-1">{profile.full_name || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Username
                </Label>
                <p className="font-medium mt-1">{profile.username || "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Basic Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={editForm.gender ?? ""}
                  onValueChange={(v) => updateFieldAction("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={editForm.age ?? ""}
                  onChange={(e) =>
                    updateFieldAction("age", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  placeholder="175"
                  value={editForm.height_cm ?? ""}
                  onChange={(e) =>
                    updateFieldAction(
                      "height_cm",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  placeholder="70"
                  value={editForm.weight_kg ?? ""}
                  onChange={(e) =>
                    updateFieldAction(
                      "weight_kg",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select
                  value={editForm.activity_level ?? ""}
                  onValueChange={(v) => updateFieldAction("activity_level", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Goal</Label>
                <Select
                  value={editForm.primary_goal ?? ""}
                  onValueChange={(v) => updateFieldAction("primary_goal", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Gender
                </p>
                <p className="font-medium mt-1">
                  {getOptionLabel(GENDER_OPTIONS, profile.gender)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Age
                </p>
                <p className="font-medium mt-1">
                  {profile.age ? `${profile.age} years` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Height
                </p>
                <p className="font-medium mt-1">
                  {profile.height_cm ? `${profile.height_cm} cm` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Weight
                </p>
                <p className="font-medium mt-1">
                  {profile.weight_kg ? `${profile.weight_kg} kg` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Activity
                </p>
                <p className="font-medium mt-1">
                  {getOptionLabel(ACTIVITY_LEVEL_OPTIONS, profile.activity_level)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Goal
                </p>
                <p className="font-medium mt-1">
                  {getOptionLabel(GOAL_OPTIONS, profile.primary_goal)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>🎯 Nutrition Targets</CardTitle>
            <CardDescription>Your daily nutrition goals</CardDescription>
          </div>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const weight = editForm.weight_kg;
                const height = editForm.height_cm;
                const age = editForm.age;
                const gender = editForm.gender;
                const activity = editForm.activity_level;
                const goal = editForm.primary_goal;

                if (!weight || !height || !age || !gender) {
                  alert("Please fill in your weight, height, age, and gender first.");
                  return;
                }

                let bmr: number;
                if (gender === "male") {
                  bmr = 10 * weight + 6.25 * height - 5 * age + 5;
                } else {
                  bmr = 10 * weight + 6.25 * height - 5 * age - 161;
                }

                const activityMultipliers: Record<string, number> = {
                  sedentary: 1.2,
                  lightly_active: 1.375,
                  moderately_active: 1.55,
                  very_active: 1.725,
                  athlete: 1.9,
                };
                const multiplier = activityMultipliers[activity || "sedentary"] || 1.2;
                let tdee = Math.round(bmr * multiplier);

                if (goal === "lose_weight") {
                  tdee = Math.round(tdee * 0.8);
                } else if (goal === "gain_muscle") {
                  tdee = Math.round(tdee * 1.1);
                }

                const proteinG = Math.round(weight * 2);
                const fatG = Math.round((tdee * 0.25) / 9);
                const proteinCals = proteinG * 4;
                const fatCals = fatG * 9;
                const carbsCals = tdee - proteinCals - fatCals;
                const carbsG = Math.round(carbsCals / 4);

                updateFieldAction("calorie_target", tdee);
                updateFieldAction("protein_target_g", proteinG);
                updateFieldAction("carbs_target_g", carbsG);
                updateFieldAction("fat_target_g", fatG);
                updateFieldAction("is_calorie_target_manual", false);
                updateFieldAction("is_protein_target_manual", false);
                updateFieldAction("is_carbs_target_manual", false);
                updateFieldAction("is_fat_target_manual", false);
              }}
              className="gap-2"
            >
              <Calculator className="h-4 w-4" />
              Auto-calculate
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calorie_target">🔥 Calories (kcal)</Label>
                  <Input
                    id="calorie_target"
                    placeholder="2000"
                    type="number"
                    value={editForm.calorie_target ?? ""}
                    onChange={(e) => {
                      updateFieldAction(
                        "calorie_target",
                        e.target.value ? Number(e.target.value) : null
                      );
                      updateFieldAction("is_calorie_target_manual", true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein_target_g">💪 Protein (g)</Label>
                  <Input
                    id="protein_target_g"
                    type="number"
                    placeholder="120"
                    value={editForm.protein_target_g ?? ""}
                    onChange={(e) => {
                      updateFieldAction(
                        "protein_target_g",
                        e.target.value ? Number(e.target.value) : null
                      );
                      updateFieldAction("is_protein_target_manual", true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs_target_g">🍞 Carbs (g)</Label>
                  <Input
                    id="carbs_target_g"
                    type="number"
                    placeholder="250"
                    value={editForm.carbs_target_g ?? ""}
                    onChange={(e) => {
                      updateFieldAction(
                        "carbs_target_g",
                        e.target.value ? Number(e.target.value) : null
                      );
                      updateFieldAction("is_carbs_target_manual", true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat_target_g">🥑 Fat (g)</Label>
                  <Input
                    id="fat_target_g"
                    type="number"
                    placeholder="65"
                    value={editForm.fat_target_g ?? ""}
                    onChange={(e) => {
                      updateFieldAction(
                        "fat_target_g",
                        e.target.value ? Number(e.target.value) : null
                      );
                      updateFieldAction("is_fat_target_manual", true);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meals_per_day">🍽️ Meals per Day</Label>
                <Input
                  id="meals_per_day"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="3"
                  className="w-32"
                  value={editForm.meals_per_day ?? ""}
                  onChange={(e) =>
                    updateFieldAction(
                      "meals_per_day",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Click &quot;Auto-calculate&quot; to compute targets based on your body metrics, activity level, and goals.
                You can also adjust values manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    🔥 Calories
                  </p>
                  <p className="font-bold text-2xl mt-1">
                    {profile.calorie_target ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal / day</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    💪 Protein
                  </p>
                  <p className="font-bold text-2xl mt-1">
                    {profile.protein_target_g ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">g / day</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    🍞 Carbs
                  </p>
                  <p className="font-bold text-2xl mt-1">
                    {profile.carbs_target_g ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">g / day</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    🥑 Fat
                  </p>
                  <p className="font-bold text-2xl mt-1">
                    {profile.fat_target_g ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">g / day</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200 dark:border-purple-800 w-fit">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  🍽️ Meals
                </p>
                <p className="font-bold text-2xl mt-1">
                  {profile.meals_per_day ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
