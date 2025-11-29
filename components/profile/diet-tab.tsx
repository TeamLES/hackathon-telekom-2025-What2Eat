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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { ProfileData, LookupData } from "./types";

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

export function DietTab({
  profile,
  editForm,
  isEditing,
  lookupData,
  updateField,
  toggleArrayField,
}: Props) {
  const [newDislike, setNewDislike] = useState("");

  const addFoodDislike = () => {
    if (newDislike.trim() && !editForm.food_dislikes.includes(newDislike.trim())) {
      updateField("food_dislikes", [...editForm.food_dislikes, newDislike.trim()]);
      setNewDislike("");
    }
  };

  const removeFoodDislike = (food: string) => {
    updateField(
      "food_dislikes",
      editForm.food_dislikes.filter((f) => f !== food)
    );
  };

  return (
    <div className="space-y-6">
      {/* Favorite Cuisines */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Favorite Cuisines</CardTitle>
          <CardDescription>Your preferred cuisine types</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lookupData.cuisines.map((cuisine) => (
                <label
                  key={cuisine.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.favorite_cuisines.includes(cuisine.id)
                      ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700"
                      : "hover:bg-muted border-border"
                    }`}
                >
                  <Checkbox
                    checked={editForm.favorite_cuisines.includes(cuisine.id)}
                    onCheckedChange={() =>
                      toggleArrayField("favorite_cuisines", cuisine.id)
                    }
                  />
                  <span className="text-sm font-medium">{cuisine.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.favorite_cuisines.length > 0 ? (
                profile.favorite_cuisines.map((id) => {
                  const cuisine = lookupData.cuisines.find((c) => c.id === id);
                  return cuisine ? (
                    <span
                      key={id}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-sm font-medium"
                    >
                      {cuisine.name}
                    </span>
                  ) : null;
                })
              ) : (
                <p className="text-muted-foreground">No cuisines selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferred Meal Types */}
      <Card>
        <CardHeader>
          <CardTitle>🍽️ Preferred Meal Types</CardTitle>
          <CardDescription>What types of meals do you prefer?</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {lookupData.mealTypePresets.map((mealType) => (
                <label
                  key={mealType.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.preferred_meal_types.includes(mealType.id)
                      ? "bg-violet-50 border-violet-300 dark:bg-violet-950/30 dark:border-violet-700"
                      : "hover:bg-muted border-border"
                    }`}
                >
                  <Checkbox
                    checked={editForm.preferred_meal_types.includes(mealType.id)}
                    onCheckedChange={() =>
                      toggleArrayField("preferred_meal_types", mealType.id)
                    }
                  />
                  <span className="text-sm font-medium">{mealType.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.preferred_meal_types.length > 0 ? (
                profile.preferred_meal_types.map((id) => {
                  const mealType = lookupData.mealTypePresets.find((m) => m.id === id);
                  return mealType ? (
                    <span
                      key={id}
                      className="px-3 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 rounded-full text-sm font-medium"
                    >
                      {mealType.label}
                    </span>
                  ) : null;
                })
              ) : (
                <p className="text-muted-foreground">No meal types selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flavor Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>😋 Flavor Preferences</CardTitle>
          <CardDescription>What flavors do you enjoy?</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lookupData.flavorProfiles.map((flavor) => (
                <label
                  key={flavor.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.flavor_preferences.includes(flavor.id)
                      ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                      : "hover:bg-muted border-border"
                    }`}
                >
                  <Checkbox
                    checked={editForm.flavor_preferences.includes(flavor.id)}
                    onCheckedChange={() =>
                      toggleArrayField("flavor_preferences", flavor.id)
                    }
                  />
                  <span className="text-sm font-medium">
                    {flavor.label === "Spicy" && "🌶️ "}
                    {flavor.label === "Mild" && "🌿 "}
                    {flavor.label === "Sweet" && "🍯 "}
                    {flavor.label === "Savory" && "🧂 "}
                    {flavor.label}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.flavor_preferences.length > 0 ? (
                profile.flavor_preferences.map((id) => {
                  const flavor = lookupData.flavorProfiles.find((f) => f.id === id);
                  return flavor ? (
                    <span
                      key={id}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full text-sm font-medium"
                    >
                      {flavor.label === "Spicy" && "🌶️ "}
                      {flavor.label === "Mild" && "🌿 "}
                      {flavor.label === "Sweet" && "🍯 "}
                      {flavor.label === "Savory" && "🧂 "}
                      {flavor.label}
                    </span>
                  ) : null;
                })
              ) : (
                <p className="text-muted-foreground">No flavor preferences selected</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>🚫 Dietary Restrictions & Allergies</CardTitle>
          <CardDescription>Any dietary restrictions or allergies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {lookupData.dietaryOptions.map((restriction) => (
                  <label
                    key={restriction.id}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.dietary_restrictions.includes(restriction.id)
                        ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.dietary_restrictions.includes(
                        restriction.id
                      )}
                      onCheckedChange={() =>
                        toggleArrayField("dietary_restrictions", restriction.id)
                      }
                    />
                    <span className="text-sm">{restriction.label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_allergy_notes">Other Allergies or Notes</Label>
                <Textarea
                  id="other_allergy_notes"
                  placeholder="List any other allergies or food sensitivities not covered above..."
                  value={editForm.other_allergy_notes ?? ""}
                  onChange={(e) =>
                    updateField("other_allergy_notes", e.target.value || null)
                  }
                  rows={3}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.dietary_restrictions.length > 0 ? (
                  profile.dietary_restrictions.map((id) => {
                    const restriction = lookupData.dietaryOptions.find(
                      (d) => d.id === id
                    );
                    return restriction ? (
                      <span
                        key={id}
                        className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full text-sm font-medium"
                      >
                        {restriction.label}
                      </span>
                    ) : null;
                  })
                ) : (
                  <p className="text-muted-foreground">No restrictions</p>
                )}
              </div>
              {profile.other_allergy_notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Other Notes</p>
                  <p className="text-sm">{profile.other_allergy_notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Dislikes */}
      <Card>
        <CardHeader>
          <CardTitle>👎 Foods You Dislike</CardTitle>
          <CardDescription>
            Specific foods you want to avoid (not allergies)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a food you dislike..."
                  value={newDislike}
                  onChange={(e) => setNewDislike(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFoodDislike();
                    }
                  }}
                />
                <Button type="button" onClick={addFoodDislike} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editForm.food_dislikes.map((food) => (
                  <span
                    key={food}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-sm font-medium"
                  >
                    {food}
                    <button
                      type="button"
                      onClick={() => removeFoodDislike(food)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.food_dislikes.length > 0 ? (
                profile.food_dislikes.map((food) => (
                  <span
                    key={food}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full text-sm font-medium"
                  >
                    {food}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">No food dislikes specified</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
