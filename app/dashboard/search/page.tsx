"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { CookingAnimation } from "@/components/cooking-animation";

interface MealSuggestion {
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  emoji: string;
  calories?: number;
  protein?: number;
}

const EXAMPLE_QUERIES = [
  "🍝 Something Italian for dinner",
  "🥗 Quick healthy lunch under 20 minutes",
  "🍗 Simple chicken dish",
  "🥦 Vegetarian dinner high in protein",
  "🍲 Something warm for a cold day",
  "🥚 Quick high-protein breakfast",
  "🌮 Something spicy and tasty",
  "🍜 Quick Asian meal",
];

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍿" },
] as const;

type Step = "search" | "suggestions" | "recipe" | "schedule";
type MealType = (typeof MEAL_TYPES)[number]["value"];

export default function SearchPage() {
  const supabase = createClient();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("search");

  // Search state
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealSuggestion | null>(null);

  // Recipe state
  const [recipeContent, setRecipeContent] = useState("");
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [isSaving, startSaveTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Search for meal suggestions
  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setSuggestions([]);
    setError(null);

    try {
      const response = await fetch("/api/quick-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery, mode: "suggestions" }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setCurrentStep("suggestions");
      } else {
        setError("No suggestions found. Try a different search.");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get full recipe for selected meal
  const handleSelectMeal = async (meal: MealSuggestion) => {
    setSelectedMeal(meal);
    setRecipeContent("");
    setIsLoadingRecipe(true);
    setCurrentStep("recipe");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/quick-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          mode: "full-recipe",
          selectedMeal: {
            name: meal.name,
            description: meal.description,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setRecipeContent((prev) => prev + text);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Recipe error:", err);
        setError("Failed to load recipe. Please try again.");
      }
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  // Save to calendar
  const handleSaveToCalendar = () => {
    if (!selectedDate || !selectedMeal) return;

    startSaveTransition(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) {
          setError("You must be logged in to save to calendar");
          return;
        }

        // Check if meal plan exists for this date
        const { data: existingPlan } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("plan_date", selectedDate)
          .single();

        let mealPlanId: number;

        if (existingPlan) {
          mealPlanId = existingPlan.id;
        } else {
          // Create new meal plan
          const { data: newPlan, error: planError } = await supabase
            .from("meal_plans")
            .insert({
              user_id: userData.user.id,
              plan_date: selectedDate,
            })
            .select("id")
            .single();

          if (planError || !newPlan) {
            throw new Error("Failed to create meal plan");
          }
          mealPlanId = newPlan.id;
        }

        // Map difficulty to database enum
        const difficultyMap: Record<string, "beginner" | "intermediate" | "advanced"> = {
          "Easy": "beginner",
          "Medium": "intermediate",
          "Hard": "advanced",
        };

        // Combine short description with full recipe markdown
        // Truncate if needed (description field may have limits)
        const fullDescription = recipeContent
          ? `${selectedMeal.description}\n\n---\n\n${recipeContent}`.slice(0, 10000)
          : selectedMeal.description;

        // First, save the recipe to recipes table (or find existing)
        // For now, we'll create a simple recipe entry
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert({
            title: selectedMeal.name,
            description: fullDescription,
            cook_time_minutes: parseInt(selectedMeal.estimatedTime) || 30,
            difficulty: difficultyMap[selectedMeal.difficulty] || "beginner",
            source: "ai_generated",
            is_public: false,
            user_id: userData.user.id,
            total_calories: selectedMeal.calories || null,
            protein_g: selectedMeal.protein || null,
          })
          .select("id")
          .single();

        if (recipeError) {
          console.error("Recipe save error:", recipeError);
          // Recipe might already exist or have constraint issues - continue anyway
        }

        // Add meal plan item
        const { error: itemError } = await supabase
          .from("meal_plan_items")
          .insert({
            meal_plan_id: mealPlanId,
            meal_type: selectedMealType,
            recipe_id: recipe?.id || null,
            servings: 1,
          });

        if (itemError) {
          throw new Error("Failed to save to calendar");
        }

        setSaveSuccess(true);
        setTimeout(() => {
          setCurrentStep("search");
          resetAll();
        }, 1500);
      } catch (err) {
        console.error("Save error:", err);
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const resetAll = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedMeal(null);
    setRecipeContent("");
    setError(null);
    setSelectedDate("");
    setSaveSuccess(false);
    setCurrentStep("search");
  };

  const goBack = () => {
    if (currentStep === "schedule") {
      setCurrentStep("recipe");
    } else if (currentStep === "recipe") {
      setSelectedMeal(null);
      setRecipeContent("");
      setCurrentStep("suggestions");
    } else if (currentStep === "suggestions") {
      setSuggestions([]);
      setCurrentStep("search");
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        {currentStep !== "search" && (
          <Button variant="ghost" size="icon" onClick={goBack}>
            <span className="text-xl">←</span>
          </Button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {currentStep === "search" && "🔍 Quick Recipe Search"}
            {currentStep === "suggestions" && "🍽️ Choose a Meal"}
            {currentStep === "recipe" && `📖 ${selectedMeal?.emoji || "🍳"} ${selectedMeal?.name || "Recipe"}`}
            {currentStep === "schedule" && "📅 Add to Calendar"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentStep === "search" && "Tell me what you're craving and I'll find the perfect recipes"}
            {currentStep === "suggestions" && "Select a meal to see the full recipe"}
            {currentStep === "recipe" && "Full recipe with ingredients and instructions"}
            {currentStep === "schedule" && "Schedule this meal for a specific day"}
          </p>
        </div>
        {currentStep !== "search" && <div className="w-10" />}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive bg-destructive/10 mb-6">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Search */}
      {currentStep === "search" && (
        <>
          {/* Search Input with nicer styling */}
          <Card className="mb-6 overflow-hidden border-2 border-primary/20 focus-within:border-primary transition-colors">
            <CardContent className="p-0">
              <div className="flex items-center">
                <span className="pl-4 text-2xl">🔍</span>
                <Input
                  placeholder="What are you craving? Try 'quick pasta' or 'healthy dinner'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg py-6 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={isLoading || !query.trim()}
                  size="lg"
                  className="m-2 px-6 bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example queries in a nicer grid */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              ✨ Try one of these ideas:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EXAMPLE_QUERIES.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  className="text-sm whitespace-normal text-center leading-tight h-auto min-h-[2.5rem] px-3 py-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setQuery(example);
                    handleSearch(example);
                  }}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading Animation */}
          {isLoading && (
            <Card className="border-dashed">
              <CardContent className="py-4">
                <CookingAnimation message="Finding delicious recipes for you..." />
              </CardContent>
            </Card>
          )}

          {/* Empty state with tips */}
          {!isLoading && !error && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-dashed">
              <CardContent className="py-8 text-center">
                <div className="text-4xl mb-3">👨‍🍳</div>
                <h3 className="font-semibold mb-2">AI-Powered Recipe Search</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Just describe what you want to eat and I&apos;ll suggest personalized recipes
                  based on your dietary preferences and cooking skill!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 2: Suggestions */}
      {currentStep === "suggestions" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Found <strong>{suggestions.length}</strong> meals matching &quot;{query}&quot;
            </p>
          </div>

          <div className="grid gap-4">
            {suggestions.map((meal, index) => (
              <button
                key={index}
                onClick={() => handleSelectMeal(meal)}
                className="w-full text-left p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent/50 transition-all duration-200 group"
              >
                <div className="flex gap-4">
                  <div className="text-4xl flex-shrink-0">{meal.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {meal.name}
                      </h4>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                          meal.difficulty === "Easy" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          meal.difficulty === "Medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                          meal.difficulty === "Hard" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {meal.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {meal.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>⏱️ {meal.estimatedTime}</span>
                      {meal.calories && <span>🔥 {meal.calories} kcal</span>}
                      {meal.protein && <span>💪 {meal.protein}g protein</span>}
                    </div>
                  </div>
                  <span className="text-muted-foreground group-hover:text-primary transition-colors self-center">→</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t flex justify-center">
            <Button variant="outline" onClick={() => handleSearch()}>
              🔄 Get Different Suggestions
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Full Recipe */}
      {currentStep === "recipe" && selectedMeal && (
        <div className="space-y-6">
          {/* Meal header card */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{selectedMeal.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-primary">{selectedMeal.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedMeal.estimatedTime} • {selectedMeal.difficulty}
                  {selectedMeal.calories && ` • ${selectedMeal.calories} kcal`}
                </p>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingRecipe && !recipeContent && (
            <CookingAnimation message="Preparing your delicious recipe..." />
          )}

          {/* Recipe content with markdown */}
          {recipeContent && (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-table:border-collapse prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:p-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipeContent}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streaming indicator */}
          {isLoadingRecipe && recipeContent && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-spin">⏳</span>
              <span>Still generating...</span>
            </div>
          )}

          {/* Action buttons */}
          {!isLoadingRecipe && recipeContent && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => setCurrentStep("schedule")}
                className="flex-1 bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90"
                size="lg"
              >
                📅 Add to Calendar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMeal(null);
                  setRecipeContent("");
                  setCurrentStep("suggestions");
                }}
                className="flex-1"
              >
                ← Back to Suggestions
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Schedule */}
      {currentStep === "schedule" && selectedMeal && (
        <div className="space-y-6">
          {saveSuccess ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Saved to Calendar!</h3>
              <p className="text-muted-foreground mt-2">
                {selectedMeal.name} has been added to your meal plan.
              </p>
            </div>
          ) : (
            <>
              {/* Selected meal summary */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{selectedMeal.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{selectedMeal.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMeal.description}</p>
                  </div>
                </div>
              </div>

              {/* Date picker */}
              <div className="space-y-3">
                <Label htmlFor="date">When do you want to make this?</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              {/* Meal type */}
              <div className="space-y-3">
                <Label>Which meal?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedMealType(type.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors",
                        selectedMealType === type.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleSaveToCalendar}
                  disabled={!selectedDate || isSaving}
                  className="flex-1 bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    "✓ Save to Calendar"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("recipe")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  ← Back to Recipe
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* New Search Button (visible in all steps except search) */}
      {currentStep !== "search" && !saveSuccess && (
        <div className="mt-8 pt-4 border-t text-center">
          <Button variant="ghost" onClick={resetAll}>
            🔍 Start New Search
          </Button>
        </div>
      )}
    </div>
  );
}
