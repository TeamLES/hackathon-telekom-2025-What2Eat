export type ProfileData = {
  email: string;
  full_name: string | null;
  username: string | null;
  gender: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  primary_goal: string | null;
  calorie_target: number | null;
  is_calorie_target_manual: boolean;
  protein_target_g: number | null;
  is_protein_target_manual: boolean;
  carbs_target_g: number | null;
  is_carbs_target_manual: boolean;
  fat_target_g: number | null;
  is_fat_target_manual: boolean;
  meals_per_day: number | null;
  budget_level: string | null;
  cooking_skill: string | null;
  is_morning_person: boolean;
  is_night_person: boolean;
  usually_rushed_mornings: boolean;
  breakfast_heavy: boolean;
  lunch_heavy: boolean;
  dinner_heavy: boolean;
  snacks_included: boolean;
  snacks_often: boolean;
  other_allergy_notes: string | null;
  favorite_cuisines: number[];
  dietary_restrictions: number[];
  kitchen_equipment: number[];
  preferred_meal_types: number[];
  flavor_preferences: number[];
  food_dislikes: string[];
  ai_tone: string | null;
  focus_priorities: string[];
  allow_meal_notifications: boolean;
  allow_grocery_notifications: boolean;
  allow_macro_notifications: boolean;
  max_cooking_time_minutes: number | null;
  chooses_based_on_mood: boolean;
  chooses_based_on_time: boolean;
  chooses_based_on_convenience: boolean;
};

export type LookupData = {
  cuisines: { id: number; name: string }[];
  dietaryOptions: { id: number; label: string }[];
  equipmentOptions: { id: number; label: string }[];
  mealTypePresets: { id: number; label: string }[];
  flavorProfiles: { id: number; label: string }[];
};

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const ACTIVITY_LEVEL_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Lightly active" },
  { value: "moderately_active", label: "Moderately active" },
  { value: "very_active", label: "Very active" },
  { value: "athlete", label: "Athlete" },
];

export const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain_muscle", label: "Build muscle" },
  { value: "eat_healthier", label: "Eat healthier" },
  { value: "save_time", label: "Save time" },
  { value: "save_money", label: "Save money" },
];

export const BUDGET_OPTIONS = [
  { value: "low", label: "Low budget" },
  { value: "medium", label: "Medium budget" },
  { value: "high", label: "High budget" },
  { value: "no_preference", label: "No preference" },
];

export const COOKING_SKILL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const AI_TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "expert", label: "Expert" },
  { value: "minimal", label: "Minimal" },
];

export const FOCUS_PRIORITY_OPTIONS = [
  { value: "health", label: "Health" },
  { value: "convenience", label: "Convenience" },
  { value: "saving_time", label: "Saving time" },
  { value: "saving_money", label: "Saving money" },
  { value: "taste", label: "Taste" },
];

export const MAX_COOKING_TIME_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2+ hours" },
];

export function formatLabel(value: string | null): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getOptionLabel(
  options: { value: string; label: string }[],
  value: string | null
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label || formatLabel(value);
}
