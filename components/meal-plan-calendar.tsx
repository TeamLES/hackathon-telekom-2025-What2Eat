"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Clock, Flame, Dumbbell, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IngredientChecklist, Ingredient } from "@/components/ingredient-checklist";

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
  onMealDeleted?: () => void;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

export function MealPlanCalendar({ meals = [], onMealDeleted }: MealPlanCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // Ingredients state for modal
  const [mealIngredients, setMealIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  // Owned ingredients from shopping lists (checked items)
  const [ownedIngredients, setOwnedIngredients] = useState<string[]>([]);

  // Fetch owned ingredients on mount
  useEffect(() => {
    const fetchOwnedIngredients = async () => {
      try {
        const response = await fetch("/api/owned-ingredients");
        if (response.ok) {
          const data = await response.json();
          setOwnedIngredients(data.ownedIngredients || []);
        }
      } catch (error) {
        console.error("Error fetching owned ingredients:", error);
      }
    };
    fetchOwnedIngredients();
  }, []);

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

  const handleMealClick = async (meal: MealItem) => {
    setSelectedMeal(meal);
    setMealIngredients([]);
    setShowIngredients(false);

    // Auto-load ingredients if meal has description
    if (meal.description) {
      setLoadingIngredients(true);
      try {
        const params = new URLSearchParams();
        if (meal.recipeId) {
          params.set("recipeId", meal.recipeId.toString());
        } else {
          params.set("description", meal.description);
          params.set("name", meal.name);
        }

        const response = await fetch(`/api/meal-ingredients?${params}`);
        if (response.ok) {
          const data = await response.json();
          setMealIngredients(data.ingredients || []);
          setShowIngredients(true);
        }
      } catch (error) {
        console.error("Error loading ingredients:", error);
      } finally {
        setLoadingIngredients(false);
      }
    }
  };

  // Delete a meal from the calendar
  const handleDeleteMeal = async (mealId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (deletingMealId) return; // Already deleting

    setDeletingMealId(mealId);

    try {
      const response = await fetch(`/api/meal-plan-item?id=${mealId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Close modal if open
        if (selectedMeal?.id === mealId) {
          setSelectedMeal(null);
        }
        // Notify parent to refresh data
        onMealDeleted?.();
      } else {
        console.error("Failed to delete meal");
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    } finally {
      setDeletingMealId(null);
    }
  };

  // Save ingredients to shopping list
  const saveToShoppingList = async (ingredients: Ingredient[]) => {
    const response = await fetch("/api/grocery-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selectedMeal?.name || "Shopping List",
        items: ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save");
    }

    // Refresh owned ingredients after saving
    const ownedResponse = await fetch("/api/owned-ingredients");
    if (ownedResponse.ok) {
      const data = await ownedResponse.json();
      setOwnedIngredients(data.ownedIngredients || []);
    }
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
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedMeal(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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

                {/* Ingredients Section - Show at top */}
                {selectedMeal.description && (
                  <div className="pt-4 border-t">
                    {loadingIngredients ? (
                      <div className="flex items-center justify-center py-4 text-muted-foreground">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting ingredients...
                      </div>
                    ) : mealIngredients.length > 0 ? (
                      <IngredientChecklist
                        ingredients={mealIngredients}
                        title={`Ingredients`}
                        userOwnedIngredients={ownedIngredients}
                        onSaveToList={saveToShoppingList}
                      />
                    ) : showIngredients ? (
                      <p className="text-sm text-muted-foreground italic text-center py-2">
                        Could not extract ingredients from this recipe.
                      </p>
                    ) : null}
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
            <div className="flex-shrink-0 p-4 border-t bg-background flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedMeal(null)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedMeal && handleDeleteMeal(selectedMeal.id)}
                disabled={deletingMealId === selectedMeal?.id}
              >
                {deletingMealId === selectedMeal?.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Compact Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-3">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPreviousMonth}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextMonth}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAYS.map((day, i) => (
                <div
                  key={day + i}
                  className="text-center text-xs font-medium text-muted-foreground py-1"
                  title={DAYS_FULL[i]}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days - Compact */}
            <div className="grid grid-cols-7 gap-0.5">
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
                      "aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all relative",
                      isToday(day) && "bg-primary text-primary-foreground font-bold",
                      isSelected(day) && !isToday(day) && "bg-[hsl(var(--brand-orange))] text-white font-semibold",
                      !isToday(day) && !isSelected(day) && "hover:bg-muted",
                      hasMeals && !isSelected(day) && !isToday(day) && "font-medium"
                    )}
                  >
                    {day}
                    {hasMeals && (
                      <div className="absolute bottom-0.5 flex gap-px">
                        {dayMeals.slice(0, 3).map((meal, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 h-1 rounded-full",
                              isToday(day) || isSelected(day)
                                ? "bg-current opacity-70"
                                : "bg-[hsl(var(--brand-orange))]"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Today
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--brand-orange))]" />
                Meals
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right: Selected Day Meals */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            {selectedDate ? (
              <>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                  <span>📅</span>
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>

                {selectedDayMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-muted-foreground text-sm">
                      No meals planned for this day.
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Use Search to find and add meals!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <button
                          onClick={() => handleMealClick(meal)}
                          className="flex-1 text-left flex items-center gap-3"
                        >
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
                        </button>
                        <div className="flex items-center gap-2">
                          {meal.calories && (
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                              {meal.calories} kcal
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteMeal(meal.id, e)}
                            disabled={deletingMealId === meal.id}
                            className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                            title="Delete meal"
                          >
                            {deletingMealId === meal.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <span className="text-muted-foreground group-hover:text-primary transition-colors">
                            →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👆</div>
                <p className="text-muted-foreground text-sm">
                  Select a day to see meals
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
