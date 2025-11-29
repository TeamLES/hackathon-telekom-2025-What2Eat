import { MealPlanCalendar } from "@/components/meal-plan-calendar";

export default function HistoryPage() {
  // TODO: Fetch meals from database
  // For now, using empty array - meals will be added when user saves them
  const meals: {
    date: string;
    meals: {
      id: string;
      name: string;
      type: "breakfast" | "lunch" | "dinner" | "snack";
      calories?: number;
    }[];
  }[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meal Calendar</h1>
        <p className="text-muted-foreground">
          Track your meals and plan ahead
        </p>
      </div>

      <MealPlanCalendar meals={meals} />
    </div>
  );
}
