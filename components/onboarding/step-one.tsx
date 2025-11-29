"use client";

import { useFormContext } from "react-hook-form";
import { OnboardingFormData } from "../onboarding-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const ACTIVITY_LEVEL_OPTIONS = [
  { value: "sedentary", label: "Sedentary (little to no exercise)" },
  { value: "lightly_active", label: "Lightly active (1-2x per week)" },
  { value: "moderately_active", label: "Moderately active (3-5x per week)" },
  { value: "very_active", label: "Very active (6-7x per week)" },
  { value: "athlete", label: "Athlete (intense training)" },
] as const;

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain_muscle", label: "Build muscle" },
  { value: "eat_healthier", label: "Eat healthier" },
  { value: "save_time", label: "Save time" },
  { value: "save_money", label: "Save money" },
] as const;

const BUDGET_OPTIONS = [
  { value: "low", label: "Low budget" },
  { value: "medium", label: "Medium budget" },
  { value: "high", label: "High budget" },
  { value: "no_preference", label: "No preference" },
] as const;

const COOKING_SKILL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export function StepOne() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const gender = watch("gender");
  const activityLevel = watch("activity_level");
  const primaryGoal = watch("primary_goal");
  const budgetLevel = watch("budget_level");
  const cookingSkill = watch("cooking_skill");
  const weightKg = watch("weight_kg");
  const calorieTarget = watch("calorie_target");

  // Calculate macros based on body weight
  // Protein: 1.6g per kg, Fat: 1g per kg, Carbs: remaining calories
  const proteinTarget = weightKg ? Math.round(weightKg * 1.6) : 0;
  const fatTarget = weightKg ? Math.round(weightKg * 1) : 0;
  
  // Calculate carbs from remaining calories
  // Protein = 4 cal/g, Fat = 9 cal/g, Carbs = 4 cal/g
  const proteinCalories = proteinTarget * 4;
  const fatCalories = fatTarget * 9;
  const remainingCalories = calorieTarget ? calorieTarget - proteinCalories - fatCalories : 0;
  const carbsTarget = remainingCalories > 0 ? Math.round(remainingCalories / 4) : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Step 1: About You</h2>
        <p className="text-muted-foreground">
          Tell us about yourself so we can personalize your experience
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            We need this information to calculate your nutritional needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={gender}
                onValueChange={(value) =>
                  setValue("gender", value as OnboardingFormData["gender"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={errors.gender ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                placeholder="e.g. 30"
                {...register("age", { valueAsNumber: true })}
                className={errors.age ? "border-destructive" : ""}
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <Label htmlFor="height_cm">
                Height (cm) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="height_cm"
                type="number"
                min={50}
                max={300}
                placeholder="e.g. 175"
                {...register("height_cm", { valueAsNumber: true })}
                className={errors.height_cm ? "border-destructive" : ""}
              />
              {errors.height_cm && (
                <p className="text-sm text-destructive">
                  {errors.height_cm.message}
                </p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight_kg">
                Weight (kg) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="weight_kg"
                type="number"
                min={20}
                max={500}
                step={0.1}
                placeholder="e.g. 70"
                {...register("weight_kg", { valueAsNumber: true })}
                className={errors.weight_kg ? "border-destructive" : ""}
              />
              {errors.weight_kg && (
                <p className="text-sm text-destructive">
                  {errors.weight_kg.message}
                </p>
              )}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activity_level">
              Activity Level <span className="text-destructive">*</span>
            </Label>
            <Select
              value={activityLevel}
              onValueChange={(value) =>
                setValue(
                  "activity_level",
                  value as OnboardingFormData["activity_level"],
                  { shouldValidate: true }
                )
              }
            >
              <SelectTrigger
                className={errors.activity_level ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activity_level && (
              <p className="text-sm text-destructive">
                {errors.activity_level.message}
              </p>
            )}
          </div>

          {/* Primary Goal */}
          <div className="space-y-2">
            <Label htmlFor="primary_goal">
              Primary Goal <span className="text-destructive">*</span>
            </Label>
            <Select
              value={primaryGoal}
              onValueChange={(value) =>
                setValue(
                  "primary_goal",
                  value as OnboardingFormData["primary_goal"],
                  { shouldValidate: true }
                )
              }
            >
              <SelectTrigger
                className={errors.primary_goal ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primary_goal && (
              <p className="text-sm text-destructive">
                {errors.primary_goal.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calorie & Macro Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Calorie & Macro Targets</CardTitle>
          <CardDescription>
            Set your daily calorie target. Protein, fat, and carbs will be calculated automatically based on your weight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calorie Target */}
          <div className="space-y-2">
            <Label htmlFor="calorie_target">
              Daily Calorie Target <span className="text-destructive">*</span>
            </Label>
            <Input
              id="calorie_target"
              type="number"
              min={500}
              max={10000}
              placeholder="e.g. 2000"
              {...register("calorie_target", { valueAsNumber: true })}
              className={errors.calorie_target ? "border-destructive" : ""}
            />
            {errors.calorie_target && (
              <p className="text-sm text-destructive">
                {errors.calorie_target.message}
              </p>
            )}
          </div>

          {/* Calculated Macros Display */}
          {weightKg && calorieTarget && calorieTarget >= 500 && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-3">Your Calculated Macros</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Based on {weightKg}kg body weight: 1.6g protein/kg, 1g fat/kg, remaining calories as carbs
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-md bg-background p-3">
                  <p className="text-2xl font-bold text-primary">{proteinTarget}g</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xs text-muted-foreground">{proteinCalories} kcal</p>
                </div>
                <div className="rounded-md bg-background p-3">
                  <p className="text-2xl font-bold text-primary">{fatTarget}g</p>
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-xs text-muted-foreground">{fatCalories} kcal</p>
                </div>
                <div className="rounded-md bg-background p-3">
                  <p className="text-2xl font-bold text-primary">{carbsTarget}g</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xs text-muted-foreground">{remainingCalories > 0 ? remainingCalories : 0} kcal</p>
                </div>
              </div>
              {remainingCalories < 0 && (
                <p className="text-sm text-destructive mt-3">
                  ⚠️ Your calorie target is too low for the protein and fat requirements. Consider increasing it.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eating Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Eating Preferences</CardTitle>
          <CardDescription>
            These will help us create a meal plan tailored to your lifestyle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meals per day */}
            <div className="space-y-2">
              <Label htmlFor="meals_per_day">
                Meals per day <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meals_per_day"
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 3"
                {...register("meals_per_day", { valueAsNumber: true })}
                className={errors.meals_per_day ? "border-destructive" : ""}
              />
              {errors.meals_per_day && (
                <p className="text-sm text-destructive">
                  {errors.meals_per_day.message}
                </p>
              )}
            </div>

            {/* Budget Level */}
            <div className="space-y-2">
              <Label htmlFor="budget_level">
                Budget <span className="text-destructive">*</span>
              </Label>
              <Select
                value={budgetLevel}
                onValueChange={(value) =>
                  setValue(
                    "budget_level",
                    value as OnboardingFormData["budget_level"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger
                  className={errors.budget_level ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budget_level && (
                <p className="text-sm text-destructive">
                  {errors.budget_level.message}
                </p>
              )}
            </div>

            {/* Cooking Skill */}
            <div className="space-y-2">
              <Label htmlFor="cooking_skill">
                Cooking Skill <span className="text-destructive">*</span>
              </Label>
              <Select
                value={cookingSkill}
                onValueChange={(value) =>
                  setValue(
                    "cooking_skill",
                    value as OnboardingFormData["cooking_skill"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger
                  className={errors.cooking_skill ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  {COOKING_SKILL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cooking_skill && (
                <p className="text-sm text-destructive">
                  {errors.cooking_skill.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
