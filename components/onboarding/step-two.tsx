"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { OnboardingFormData } from "../onboarding-form";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Cuisine = Database["public"]["Tables"]["cuisines"]["Row"];
type DietaryRestriction =
  Database["public"]["Tables"]["dietary_restrictions"]["Row"];

export function StepTwo() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const supabase = createClient();
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<
    DietaryRestriction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const favoriteCuisines = watch("favorite_cuisines") || [];
  const selectedRestrictions = watch("dietary_restrictions") || [];
  const isMorningPerson = watch("is_morning_person");
  const usuallyRushedMornings = watch("usually_rushed_mornings");
  const snacksIncluded = watch("snacks_included");
  const snacksOften = watch("snacks_often");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cuisinesRes, restrictionsRes] = await Promise.all([
          supabase.from("cuisines").select("*").order("name"),
          supabase.from("dietary_restrictions").select("*").order("label"),
        ]);

        if (cuisinesRes.data) setCuisines(cuisinesRes.data);
        if (restrictionsRes.data) setDietaryRestrictions(restrictionsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const handleCuisineToggle = (cuisineId: number) => {
    const current = favoriteCuisines;
    const updated = current.includes(cuisineId)
      ? current.filter((id) => id !== cuisineId)
      : [...current, cuisineId];
    setValue("favorite_cuisines", updated, { shouldValidate: true });
  };

  const handleRestrictionToggle = (restrictionId: number) => {
    const current = selectedRestrictions;
    const updated = current.includes(restrictionId)
      ? current.filter((id) => id !== restrictionId)
      : [...current, restrictionId];
    setValue("dietary_restrictions", updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Step 3: Food Preferences</h2>
        <p className="text-muted-foreground">
          Tell us about your food preferences and lifestyle
        </p>
      </div>

      {/* Favorite Cuisines */}
      <Card>
        <CardHeader>
          <CardTitle>
            Favorite Cuisines <span className="text-destructive">*</span>
          </CardTitle>
          <CardDescription>
            Select at least one cuisine that you enjoy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.favorite_cuisines && (
            <p className="text-sm text-destructive mb-4">
              {errors.favorite_cuisines.message}
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cuisines.map((cuisine) => (
              <label
                key={cuisine.id}
                className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${
                  favoriteCuisines.includes(cuisine.id)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
              >
                <Checkbox
                  checked={favoriteCuisines.includes(cuisine.id)}
                  onCheckedChange={() => handleCuisineToggle(cuisine.id)}
                />
                <span className="text-sm">{cuisine.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle (optional)</CardTitle>
          <CardDescription>
            This information helps us better customize your meal plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={control}
              name="is_morning_person"
              render={({ field }) => (
                <label className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted">
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">I&apos;m a morning person</span>
                </label>
              )}
            />

            <Controller
              control={control}
              name="usually_rushed_mornings"
              render={({ field }) => (
                <label className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted">
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    I&apos;m usually rushed in the morning
                  </span>
                </label>
              )}
            />

            <Controller
              control={control}
              name="snacks_included"
              render={({ field }) => (
                <label className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted">
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">
                    Include snacks in my meal plan
                  </span>
                </label>
              )}
            />

            <Controller
              control={control}
              name="snacks_often"
              render={({ field }) => (
                <label className="flex items-center space-x-2 p-3 rounded-md border cursor-pointer hover:bg-muted">
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">I snack often</span>
                </label>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      {dietaryRestrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dietary Restrictions (optional)</CardTitle>
            <CardDescription>Select all that apply to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {dietaryRestrictions.map((restriction) => (
                <label
                  key={restriction.id}
                  className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedRestrictions.includes(restriction.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={selectedRestrictions.includes(restriction.id)}
                    onCheckedChange={() =>
                      handleRestrictionToggle(restriction.id)
                    }
                  />
                  <span className="text-sm">{restriction.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
