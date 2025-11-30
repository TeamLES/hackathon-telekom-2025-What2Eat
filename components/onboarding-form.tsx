"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { StepProfile } from "./onboarding/step-profile";
import { StepOne } from "./onboarding/step-one";
import { StepTwo } from "./onboarding/step-two";
import { StepThree } from "./onboarding/step-three";

type GenderType = Database["public"]["Enums"]["gender_type"];
type ActivityLevelType = Database["public"]["Enums"]["activity_level_type"];
type GoalType = Database["public"]["Enums"]["goal_type"];
type BudgetLevelType = Database["public"]["Enums"]["budget_level_type"];
type CookingSkillLevel = Database["public"]["Enums"]["cooking_skill_level"];
type AiToneType = Database["public"]["Enums"]["ai_tone_type"];
type FocusPriorityType = Database["public"]["Enums"]["focus_priority_type"];

export const onboardingSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  age: z.number().min(1).max(120),
  height_cm: z.number().min(50).max(300),
  weight_kg: z.number().min(20).max(500),
  activity_level: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "athlete",
  ]),
  primary_goal: z.enum([
    "lose_weight",
    "maintain",
    "gain_muscle",
    "eat_healthier",
    "save_time",
    "save_money",
  ]),
  calorie_target: z.number().min(500).max(10000),
  protein_target_g: z.number().optional(),
  carbs_target_g: z.number().optional(),
  fat_target_g: z.number().optional(),
  meals_per_day: z.number().min(1).max(10),
  budget_level: z.enum(["low", "medium", "high", "no_preference"]),
  cooking_skill: z.enum(["beginner", "intermediate", "advanced"]),

  favorite_cuisines: z
    .array(z.number())
    .min(1, "Please select at least one favorite cuisine"),
  is_morning_person: z.boolean().optional(),
  usually_rushed_mornings: z.boolean().optional(),
  snacks_included: z.boolean().optional(),
  snacks_often: z.boolean().optional(),
  dietary_restrictions: z.array(z.number()).optional(),

  kitchen_equipment: z.array(z.number()).optional(),
  ai_tone: z.enum(["friendly", "expert", "minimal"]).optional(),
  focus_priorities: z
    .array(
      z.enum([
        "health",
        "convenience",
        "saving_time",
        "saving_money",
        "taste",
      ])
    )
    .optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  userId: string;
}

const TOTAL_STEPS = 4;

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      favorite_cuisines: [],
      is_morning_person: false,
      usually_rushed_mornings: false,
      snacks_included: false,
      snacks_often: false,
      dietary_restrictions: [],
      kitchen_equipment: [],
      focus_priorities: [],
    },
    mode: "onChange",
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger(["full_name", "username"]);
    } else if (currentStep === 2) {
      isValid = await trigger([
        "gender",
        "age",
        "height_cm",
        "weight_kg",
        "activity_level",
        "primary_goal",
        "calorie_target",
        "meals_per_day",
        "budget_level",
        "cooking_skill",
      ]);
    } else if (currentStep === 3) {
      isValid = await trigger(["favorite_cuisines"]);
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          username: data.username,
        })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      const proteinTarget = data.protein_target_g ?? Math.round(data.weight_kg * 2);
      const fatTarget = data.fat_target_g ?? Math.round((data.calorie_target * 0.25) / 9);
      const carbsTarget = data.carbs_target_g ?? Math.round((data.calorie_target - proteinTarget * 4 - fatTarget * 9) / 4);

      const { error: profileError } = await supabase
        .from("nutrition_profiles")
        .upsert({
          user_id: userId,
          gender: data.gender as GenderType,
          age: data.age,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          activity_level: data.activity_level as ActivityLevelType,
          primary_goal: data.primary_goal as GoalType,
          calorie_target: data.calorie_target,
          protein_target_g: proteinTarget,
          carbs_target_g: carbsTarget,
          fat_target_g: fatTarget,
          meals_per_day: data.meals_per_day,
          budget_level: data.budget_level as BudgetLevelType,
          cooking_skill: data.cooking_skill as CookingSkillLevel,
          is_morning_person: data.is_morning_person ?? false,
          usually_rushed_mornings: data.usually_rushed_mornings ?? false,
          snacks_included: data.snacks_included ?? false,
          snacks_often: data.snacks_often ?? false,
        });

      if (profileError) throw profileError;

      await supabase
        .from("user_favorite_cuisines")
        .delete()
        .eq("user_id", userId);

      if (data.favorite_cuisines.length > 0) {
        const cuisineRows = data.favorite_cuisines.map((cuisine_id) => ({
          user_id: userId,
          cuisine_id,
        }));
        const { error: cuisineError } = await supabase
          .from("user_favorite_cuisines")
          .insert(cuisineRows);
        if (cuisineError) throw cuisineError;
      }

      await supabase
        .from("user_dietary_restrictions")
        .delete()
        .eq("user_id", userId);

      if (data.dietary_restrictions && data.dietary_restrictions.length > 0) {
        const restrictionRows = data.dietary_restrictions.map(
          (restriction_id) => ({
            user_id: userId,
            restriction_id,
          })
        );
        const { error: restrictionError } = await supabase
          .from("user_dietary_restrictions")
          .insert(restrictionRows);
        if (restrictionError) throw restrictionError;
      }

      await supabase
        .from("user_kitchen_equipment")
        .delete()
        .eq("user_id", userId);

      if (data.kitchen_equipment && data.kitchen_equipment.length > 0) {
        const equipmentRows = data.kitchen_equipment.map((equipment_id) => ({
          user_id: userId,
          equipment_id,
        }));
        const { error: equipmentError } = await supabase
          .from("user_kitchen_equipment")
          .insert(equipmentRows);
        if (equipmentError) throw equipmentError;
      }

      if (
        data.ai_tone ||
        (data.focus_priorities && data.focus_priorities.length > 0)
      ) {
        const { error: preferencesError } = await supabase
          .from("user_preferences")
          .upsert({
            user_id: userId,
            ai_tone: (data.ai_tone as AiToneType) || null,
            focus_priorities:
              data.focus_priorities && data.focus_priorities.length > 0
                ? (data.focus_priorities as FocusPriorityType[])
                : null,
          });
        if (preferencesError) throw preferencesError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error saving onboarding data:", err);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepProfile />;
      case 2:
        return <StepOne />;
      case 3:
        return <StepTwo />;
      case 4:
        return <StepThree />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {step}
              </div>
              {step < TOTAL_STEPS && (
                <div
                  className={`w-12 h-1 mx-1 rounded ${step < currentStep ? "bg-primary/20" : "bg-muted"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
