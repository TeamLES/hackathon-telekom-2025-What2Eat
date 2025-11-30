"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Clock, Flame, Dumbbell } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

interface MealPlanCalendarProps {
  meals?: {
    date: string;
    meals: MealItem[];
  }[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MEAL_TYPE_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍿",
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Easy", color: "text-green-600 dark:text-green-400" },
  intermediate: { label: "Medium", color: "text-yellow-600 dark:text-yellow-400" },
  advanced: { label: "Hard", color: "text-red-600 dark:text-red-400" },
};

export function MealPlanCalendar({ meals = [] }: MealPlanCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Get the day of week for first day (0 = Sunday, we want Monday = 0)
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const getMealsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meals.find((m) => m.date === dateStr)?.meals || [];
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setSelectedMeal(null);
  };

  const handleMealClick = (meal: MealItem) => {
    setSelectedMeal(meal);
  };

  // Generate calendar grid
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const selectedDayMeals = selectedDate
    ? getMealsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="space-y-4">
      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-background p-4 border-b flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MEAL_TYPE_EMOJI[selectedMeal.type] || "🍽️"}</span>
                <div>
                  <h3 className="font-semibold text-lg">{selectedMeal.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedMeal.type}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMeal(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  {selectedMeal.cookTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedMeal.cookTime} min</span>
                    </div>
                  )}
                  {selectedMeal.calories && (
                    <div className="flex items-center gap-2 text-sm">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{selectedMeal.calories} kcal</span>
                    </div>
                  )}
                  {selectedMeal.protein && (
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-blue-500" />
                      <span>{selectedMeal.protein}g protein</span>
                    </div>
                  )}
                  {selectedMeal.carbs && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500">🍞</span>
                      <span>{selectedMeal.carbs}g carbs</span>
                    </div>
                  )}
                  {selectedMeal.fat && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">🥑</span>
                      <span>{selectedMeal.fat}g fat</span>
                    </div>
                  )}
                </div>

                {/* Difficulty */}
                {selectedMeal.difficulty && DIFFICULTY_LABELS[selectedMeal.difficulty] && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Difficulty:</span>
                    <span className={cn("text-sm font-medium", DIFFICULTY_LABELS[selectedMeal.difficulty].color)}>
                      {DIFFICULTY_LABELS[selectedMeal.difficulty].label}
                    </span>
                  </div>
                )}

                {/* Description/Recipe */}
                {selectedMeal.description && (
                  <div className="pt-4 border-t">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedMeal.description}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* No description fallback */}
                {!selectedMeal.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground italic">
                      No detailed recipe saved for this meal.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t bg-background">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedMeal(null)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayMeals = getMealsForDay(day);
              const hasMeals = dayMeals.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative",
                    isToday(day) && "bg-primary text-primary-foreground",
                    isSelected(day) && !isToday(day) && "bg-primary/20 text-primary",
                    !isToday(day) && !isSelected(day) && "hover:bg-muted",
                    hasMeals && "font-semibold"
                  )}
                >
                  {day}
                  {hasMeals && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayMeals.slice(0, 3).map((meal, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isToday(day) ? "bg-primary-foreground" : "bg-[hsl(var(--brand-orange))]"
                          )}
                          title={meal.name}
                        />
                      ))}
                      {dayMeals.length > 3 && (
                        <span className={cn(
                          "text-[8px] ml-0.5",
                          isToday(day) ? "text-primary-foreground" : "text-muted-foreground"
                        )}>
                          +{dayMeals.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day meals */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <span>📅</span>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {selectedDayMeals.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-muted-foreground text-sm">
                  No meals planned for this day.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Use the Search to find and add meals!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => handleMealClick(meal)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{MEAL_TYPE_EMOJI[meal.type] || "🍽️"}</span>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {meal.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{meal.type}</span>
                          {meal.cookTime && (
                            <>
                              <span>•</span>
                              <span>{meal.cookTime} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {meal.calories && (
                        <span className="text-sm text-muted-foreground">
                          {meal.calories} kcal
                        </span>
                      )}
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
