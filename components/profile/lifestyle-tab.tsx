"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProfileData,
  LookupData,
  BUDGET_OPTIONS,
  COOKING_SKILL_OPTIONS,
  getOptionLabel,
} from "./types";

type Props = {
  profile: ProfileData;
  editForm: ProfileData;
  isEditing: boolean;
  lookupData: LookupData;
  updateField: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
  toggleArrayField: (
    key: "favorite_cuisines" | "dietary_restrictions" | "kitchen_equipment" | "preferred_meal_types" | "flavor_preferences",
    id: number
  ) => void;
};

export function LifestyleTab({
  profile,
  editForm,
  isEditing,
  lookupData,
  updateField,
  toggleArrayField,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Eating Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Budget & Cooking</CardTitle>
          <CardDescription>Your cooking and budget preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Level</Label>
                <Select
                  value={editForm.budget_level ?? ""}
                  onValueChange={(v) => updateField("budget_level", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cooking Skill</Label>
                <Select
                  value={editForm.cooking_skill ?? ""}
                  onValueChange={(v) => updateField("cooking_skill", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cooking skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {COOKING_SKILL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  💵 Budget Level
                </p>
                <p className="font-medium text-lg mt-1">
                  {getOptionLabel(BUDGET_OPTIONS, profile.budget_level)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  👨‍🍳 Cooking Skill
                </p>
                <p className="font-medium text-lg mt-1">
                  {getOptionLabel(COOKING_SKILL_OPTIONS, profile.cooking_skill)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule & Routine */}
      <Card>
        <CardHeader>
          <CardTitle>⏰ Schedule & Routine</CardTitle>
          <CardDescription>Your daily routines and habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              {/* Time preferences */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  When are you most active?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.is_morning_person
                        ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.is_morning_person}
                      onCheckedChange={(v) => updateField("is_morning_person", !!v)}
                    />
                    <div>
                      <span className="font-medium">🌅 Morning person</span>
                      <p className="text-sm text-muted-foreground">
                        I&apos;m most energetic in the morning
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.is_night_person
                        ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.is_night_person}
                      onCheckedChange={(v) => updateField("is_night_person", !!v)}
                    />
                    <div>
                      <span className="font-medium">🌙 Night owl</span>
                      <p className="text-sm text-muted-foreground">
                        I&apos;m most productive at night
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.usually_rushed_mornings
                        ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.usually_rushed_mornings}
                      onCheckedChange={(v) =>
                        updateField("usually_rushed_mornings", !!v)
                      }
                    />
                    <div>
                      <span className="font-medium">⚡ Rushed mornings</span>
                      <p className="text-sm text-muted-foreground">
                        I usually don&apos;t have much time in the morning
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Meal distribution */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Which meals do you prefer heavier?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.breakfast_heavy
                        ? "bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.breakfast_heavy}
                      onCheckedChange={(v) => updateField("breakfast_heavy", !!v)}
                    />
                    <div>
                      <span className="font-medium">🍳 Breakfast</span>
                      <p className="text-sm text-muted-foreground">Larger breakfast</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.lunch_heavy
                        ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.lunch_heavy}
                      onCheckedChange={(v) => updateField("lunch_heavy", !!v)}
                    />
                    <div>
                      <span className="font-medium">🥗 Lunch</span>
                      <p className="text-sm text-muted-foreground">Larger lunch</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.dinner_heavy
                        ? "bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.dinner_heavy}
                      onCheckedChange={(v) => updateField("dinner_heavy", !!v)}
                    />
                    <div>
                      <span className="font-medium">🍽️ Dinner</span>
                      <p className="text-sm text-muted-foreground">Larger dinner</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Snacking */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Snacking preferences
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.snacks_included
                        ? "bg-teal-50 border-teal-300 dark:bg-teal-950/30 dark:border-teal-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.snacks_included}
                      onCheckedChange={(v) => updateField("snacks_included", !!v)}
                    />
                    <div>
                      <span className="font-medium">🍎 Include snacks</span>
                      <p className="text-sm text-muted-foreground">
                        Add snacks to my meal plans
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.snacks_often
                        ? "bg-pink-50 border-pink-300 dark:bg-pink-950/30 dark:border-pink-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.snacks_often}
                      onCheckedChange={(v) => updateField("snacks_often", !!v)}
                    />
                    <div>
                      <span className="font-medium">🍿 Frequent snacker</span>
                      <p className="text-sm text-muted-foreground">
                        I snack often throughout the day
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Morning Person</p>
                  <p className="font-medium flex items-center gap-2">
                    {profile.is_morning_person ? "🌅 Yes" : "No"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Night Owl</p>
                  <p className="font-medium flex items-center gap-2">
                    {profile.is_night_person ? "🌙 Yes" : "No"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Rushed Mornings</p>
                  <p className="font-medium flex items-center gap-2">
                    {profile.usually_rushed_mornings ? "⚡ Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Heavier Meals</p>
                <div className="flex flex-wrap gap-2">
                  {profile.breakfast_heavy && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-full text-sm">
                      🍳 Breakfast
                    </span>
                  )}
                  {profile.lunch_heavy && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-full text-sm">
                      🥗 Lunch
                    </span>
                  )}
                  {profile.dinner_heavy && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-full text-sm">
                      🍽️ Dinner
                    </span>
                  )}
                  {!profile.breakfast_heavy &&
                    !profile.lunch_heavy &&
                    !profile.dinner_heavy && (
                      <span className="text-muted-foreground">No preference</span>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Include Snacks</p>
                  <p className="font-medium">
                    {profile.snacks_included ? "🍎 Yes" : "No"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Snack Often</p>
                  <p className="font-medium">
                    {profile.snacks_often ? "🍿 Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kitchen Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>🍳 Kitchen Equipment</CardTitle>
          <CardDescription>Equipment you have available</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {lookupData.equipmentOptions.map((equipment) => (
                <label
                  key={equipment.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.kitchen_equipment.includes(equipment.id)
                      ? "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700"
                      : "hover:bg-muted border-border"
                    }`}
                >
                  <Checkbox
                    checked={editForm.kitchen_equipment.includes(equipment.id)}
                    onCheckedChange={() =>
                      toggleArrayField("kitchen_equipment", equipment.id)
                    }
                  />
                  <span className="text-sm font-medium">{equipment.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.kitchen_equipment.length > 0 ? (
                profile.kitchen_equipment.map((id) => {
                  const equipment = lookupData.equipmentOptions.find(
                    (e) => e.id === id
                  );
                  return equipment ? (
                    <span
                      key={id}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {equipment.label}
                    </span>
                  ) : null;
                })
              ) : (
                <p className="text-muted-foreground">No equipment selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
