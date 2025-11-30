"use client";

import { MealPlanCalendar } from "@/components/meal-plan-calendar";
import { useRouter } from "next/navigation";

interface MealItem {
  id: string;
  recipeId?: number | null;
  name: string;
  description?: string | null;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  cookTime?: number;
  difficulty?: string;
}

interface HistoryClientProps {
  meals: {
    date: string;
    meals: MealItem[];
  }[];
}

export function HistoryClient({ meals }: HistoryClientProps) {
  const router = useRouter();

  const handleMealDeleted = () => {
    router.refresh();
  };

  return (
    <MealPlanCalendar meals={meals} onMealDeleted={handleMealDeleted} />
  );
}
