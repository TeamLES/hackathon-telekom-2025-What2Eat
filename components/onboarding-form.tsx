"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { StepOne } from "./onboarding/step-one";
import { StepTwo } from "./onboarding/step-two";
import { StepThree } from "./onboarding/step-three";

// Types from database
type GenderType = Database["public"]["Enums"]["gender_type"];
type ActivityLevelType = Database["public"]["Enums"]["activity_level_type"];
type GoalType = Database["public"]["Enums"]["goal_type"];
type BudgetLevelType = Database["public"]["Enums"]["budget_level_type"];
type CookingSkillLevel = Database["public"]["Enums"]["cooking_skill_level"];
type AiToneType = Database["public"]["Enums"]["ai_tone_type"];
type FocusPriorityType = Database["public"]["Enums"]["focus_priority_type"];

// Zod schema for form validation
export const onboardingSchema = z.object({
  // Step 1: Basic Info + Eating Preferences (Required)
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
  meals_per_day: z.number().min(1).max(10),
  budget_level: z.enum(["low", "medium", "high", "no_preference"]),
  cooking_skill: z.enum(["beginner", "intermediate", "advanced"]),

  // Step 2: Cuisines (Required) + Lifestyle & Dietary Restrictions (Optional)
  favorite_cuisines: z
    .array(z.number())
    .min(1, "Please select at least one favorite cuisine"),
  is_morning_person: z.boolean().optional(),
  usually_rushed_mornings: z.boolean().optional(),
  snacks_included: z.boolean().optional(),
  snacks_often: z.boolean().optional(),
  dietary_restrictions: z.array(z.number()).optional(),

  // Step 3: Kitchen Equipment & AI Preferences (Optional)
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

const TOTAL_STEPS = 3;

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
    } else if (currentStep === 2) {
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
      // Calculate macros based on body weight
      // Protein: 1.6g per kg, Fat: 1g per kg, Carbs: remaining calories
      const proteinTarget = Math.round(data.weight_kg * 1.6);

      // 1. Upsert nutrition_profiles
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
          meals_per_day: data.meals_per_day,
          budget_level: data.budget_level as BudgetLevelType,
          cooking_skill: data.cooking_skill as CookingSkillLevel,
          is_morning_person: data.is_morning_person ?? false,
          usually_rushed_mornings: data.usually_rushed_mornings ?? false,
          snacks_included: data.snacks_included ?? false,
          snacks_often: data.snacks_often ?? false,
        });

      if (profileError) throw profileError;

      // 2. Handle user_favorite_cuisines
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

      // 3. Handle user_dietary_restrictions
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

      // 4. Handle user_kitchen_equipment
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

      // 5. Optionally upsert user_preferences
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

      // Redirect to dashboard
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
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Indicator */}
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

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
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
