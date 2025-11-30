"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChefHat,
  Loader2,
  Sparkles,
  Check,
  Coffee,
  Sun,
  Moon,
  Cookie,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings2,
  Target,
  Flame,
  Dumbbell,
  Clock,
  DollarSign,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveAiRecipeAction } from "@/app/actions/recipes";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface MealPlanMeal {
  name: string;
  description: string;
  type: MealType;
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  emoji: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
}

interface MealPlanDay {
  dayIndex: number;
  meals: MealPlanMeal[];
}

interface MealPlannerProps {
  userProfile: {
    mealsPerDay?: number | null;
    cookingSkill?: string | null;
    calorieTarget?: number | null;
    proteinTarget?: number | null;
    carbsTarget?: number | null;
    fatTarget?: number | null;
    primaryGoal?: string | null;
    budgetLevel?: string | null;
    cuisines?: string[];
    restrictions?: string[];
    flavorPreferences?: string[];
    foodDislikes?: string[];
  };
}

const MEAL_TYPE_CONFIG: Record<MealType, { icon: React.ElementType; label: string; emoji: string }> = {
  breakfast: { icon: Coffee, label: "Breakfast", emoji: "🌅" },
  lunch: { icon: Sun, label: "Lunch", emoji: "☀️" },
  dinner: { icon: Moon, label: "Dinner", emoji: "🌙" },
  snack: { icon: Cookie, label: "Snack", emoji: "🍿" },
};

const COOKING_SKILLS = [
  { value: "beginner", label: "Beginner", description: "Simple recipes" },
  { value: "intermediate", label: "Intermediate", description: "Moderate complexity" },
  { value: "advanced", label: "Advanced", description: "Complex techniques" },
];

const BUDGET_LEVELS = [
  { value: "low", label: "Budget", icon: "💰" },
  { value: "medium", label: "Moderate", icon: "💵" },
  { value: "high", label: "Premium", icon: "💎" },
];

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", icon: "⚖️" },
  { value: "gain_muscle", label: "Build Muscle", icon: "💪" },
  { value: "maintain", label: "Maintain", icon: "🎯" },
  { value: "eat_healthier", label: "Eat Healthier", icon: "🥗" },
];

const CUISINES = [
  { value: "slovak", label: "Slovak" },
  { value: "italian", label: "Italian" },
  { value: "asian", label: "Asian" },
  { value: "american", label: "American" },
  { value: "mexican", label: "Mexican" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "fitness", label: "Fitness" },
];

const RESTRICTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "nut_allergy", label: "No nuts" },
  { value: "no_pork", label: "No pork" },
  { value: "no_seafood", label: "No seafood" },
];

export function MealPlanner({ userProfile }: MealPlannerProps) {
  const router = useRouter();

  // Days configuration
  const [customDays, setCustomDays] = useState(7);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Meal types
  const [includeBreakfast, setIncludeBreakfast] = useState(true);
  const [includeLunch, setIncludeLunch] = useState(true);
  const [includeDinner, setIncludeDinner] = useState(true);
  const [includeSnacks, setIncludeSnacks] = useState(false);

  // Preferences (editable, initialized from profile)
  const [cookingSkill, setCookingSkill] = useState(userProfile.cookingSkill || "intermediate");
  const [budgetLevel, setBudgetLevel] = useState(userProfile.budgetLevel || "medium");
  const [primaryGoal, setPrimaryGoal] = useState(userProfile.primaryGoal || "maintain");
  const [calorieTarget, setCalorieTarget] = useState(userProfile.calorieTarget || 2000);
  const [proteinTarget, setProteinTarget] = useState(userProfile.proteinTarget || 100);
  const [carbsTarget, setCarbsTarget] = useState(userProfile.carbsTarget || 250);
  const [fatTarget, setFatTarget] = useState(userProfile.fatTarget || 65);
  const [maxCookingTime, setMaxCookingTime] = useState(45);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(userProfile.cuisines || []);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(userProfile.restrictions || []);

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlanDay[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0 });
  const [saveComplete, setSaveComplete] = useState(false);

  // Calculate meals per day
  const mealsPerDay = [includeBreakfast, includeLunch, includeDinner, includeSnacks].filter(Boolean).length;

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction) ? prev.filter(r => r !== restriction) : [...prev, restriction]
    );
  };

  const generateMealPlan = async () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setSaveComplete(false);

    try {
      const response = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate-plan",
          days: customDays,
          mealsPerDay,
          includeBreakfast,
          includeLunch,
          includeDinner,
          includeSnacks,
          cuisines: selectedCuisines,
          restrictions: selectedRestrictions,
          cookingSkill,
          calorieTarget,
          proteinTarget,
          carbsTarget,
          fatTarget,
          primaryGoal,
          budgetLevel,
          maxCookingTime,
          flavorPreferences: userProfile.flavorPreferences,
          foodDislikes: userProfile.foodDislikes,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const data = await response.json();
      setGeneratedPlan(data.plan.days);
    } catch (error) {
      console.error("Error generating meal plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMealPlan = async () => {
    if (!generatedPlan) return;

    setIsSaving(true);
    const totalMeals = generatedPlan.reduce((acc, day) => acc + day.meals.length, 0);
    setSavingProgress({ current: 0, total: totalMeals });

    try {
      const start = new Date(startDate);
      let savedCount = 0;

      for (const day of generatedPlan) {
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + day.dayIndex);
        const dateStr = targetDate.toISOString().split("T")[0];

        for (const meal of day.meals) {
          const recipeResponse = await fetch("/api/meal-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "generate-recipe",
              meal,
              mealType: meal.type,
            }),
          });

          if (!recipeResponse.ok) {
            console.error("Failed to generate recipe for", meal.name);
            continue;
          }

          const reader = recipeResponse.body?.getReader();
          const decoder = new TextDecoder();
          let fullRecipe = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              fullRecipe += decoder.decode(value, { stream: true });
            }
            fullRecipe += decoder.decode();
          }

          await saveAiRecipeAction(
            {
              name: meal.name,
              description: meal.description,
              estimatedTime: meal.estimatedTime,
              difficulty: meal.difficulty,
            },
            fullRecipe,
            meal.type,
            dateStr
          );

          savedCount++;
          setSavingProgress({ current: savedCount, total: totalMeals });
        }
      }

      setSaveComplete(true);
      setTimeout(() => {
        router.push("/dashboard/history");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Error saving meal plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getDateForDay = (dayIndex: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      {!generatedPlan && (
        <div className="space-y-4">
          {/* Basic Settings Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Days and Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Number of days
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={customDays}
                      onChange={(e) => setCustomDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                      className="w-20"
                    />
                    <div className="flex gap-1">
                      {[3, 7, 14].map((d) => (
                        <Button
                          key={d}
                          variant={customDays === d ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomDays(d)}
                          className={cn(
                            "px-3",
                            customDays === d && "bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white border-0"
                          )}
                        >
                          {d}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Meal Types */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Meals to include
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => {
                    const config = MEAL_TYPE_CONFIG[type];
                    const isSelected =
                      type === "breakfast" ? includeBreakfast :
                        type === "lunch" ? includeLunch :
                          type === "dinner" ? includeDinner :
                            includeSnacks;
                    const toggle =
                      type === "breakfast" ? setIncludeBreakfast :
                        type === "lunch" ? setIncludeLunch :
                          type === "dinner" ? setIncludeDinner :
                            setIncludeSnacks;

                    return (
                      <button
                        key={type}
                        onClick={() => toggle(!isSelected)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border transition-all",
                          isSelected
                            ? "border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange))]/10"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <span className="text-xl">{config.emoji}</span>
                        <span className="text-sm font-medium">{config.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 ml-auto text-[hsl(var(--brand-orange))]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goal Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Your goal
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setPrimaryGoal(goal.value)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all",
                        primaryGoal === goal.value
                          ? "border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange))]/10"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <span className="text-lg">{goal.icon}</span>
                      <span className="text-sm font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preferences Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cooking Skill */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Skill level
                  </Label>
                  <div className="flex gap-1">
                    {COOKING_SKILLS.map((skill) => (
                      <Button
                        key={skill.value}
                        variant={cookingSkill === skill.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCookingSkill(skill.value)}
                        className={cn(
                          "flex-1 text-xs",
                          cookingSkill === skill.value && "bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white border-0"
                        )}
                      >
                        {skill.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget
                  </Label>
                  <div className="flex gap-1">
                    {BUDGET_LEVELS.map((budget) => (
                      <Button
                        key={budget.value}
                        variant={budgetLevel === budget.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBudgetLevel(budget.value)}
                        className={cn(
                          "flex-1 text-xs",
                          budgetLevel === budget.value && "bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white border-0"
                        )}
                      >
                        {budget.icon} {budget.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Cooking Time */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Max time per meal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      value={maxCookingTime}
                      onChange={(e) => setMaxCookingTime(parseInt(e.target.value) || 30)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                <span>Advanced preferences</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Nutrition Targets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Calories
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1000}
                          max={5000}
                          value={calorieTarget}
                          onChange={(e) => setCalorieTarget(parseInt(e.target.value) || 2000)}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">kcal</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-blue-500" />
                        Protein
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={30}
                          max={300}
                          value={proteinTarget}
                          onChange={(e) => setProteinTarget(parseInt(e.target.value) || 100)}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <span className="text-amber-500">🍞</span>
                        Carbs
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={50}
                          max={500}
                          value={carbsTarget}
                          onChange={(e) => setCarbsTarget(parseInt(e.target.value) || 250)}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <span className="text-green-500">🥑</span>
                        Fat
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={20}
                          max={200}
                          value={fatTarget}
                          onChange={(e) => setFatTarget(parseInt(e.target.value) || 65)}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preferred cuisines</Label>
                    <div className="flex flex-wrap gap-2">
                      {CUISINES.map((cuisine) => (
                        <button
                          key={cuisine.value}
                          onClick={() => toggleCuisine(cuisine.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm border transition-all",
                            selectedCuisines.includes(cuisine.value)
                              ? "border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange))]/10 text-foreground"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          )}
                        >
                          {cuisine.label}
                          {selectedCuisines.includes(cuisine.value) && (
                            <X className="w-3 h-3 ml-1 inline" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Dietary restrictions</Label>
                    <div className="flex flex-wrap gap-2">
                      {RESTRICTIONS.map((restriction) => (
                        <button
                          key={restriction.value}
                          onClick={() => toggleRestriction(restriction.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm border transition-all",
                            selectedRestrictions.includes(restriction.value)
                              ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          )}
                        >
                          {restriction.label}
                          {selectedRestrictions.includes(restriction.value) && (
                            <X className="w-3 h-3 ml-1 inline" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{customDays} days</span> ×
                  <span className="font-medium text-foreground"> {mealsPerDay} meals/day</span> =
                  <span className="font-medium text-foreground"> {customDays * mealsPerDay} meals</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Starting from {new Date(startDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
                {(selectedCuisines.length > 0 || selectedRestrictions.length > 0) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCuisines.length > 0 && `Cuisines: ${selectedCuisines.join(", ")}`}
                    {selectedCuisines.length > 0 && selectedRestrictions.length > 0 && " • "}
                    {selectedRestrictions.length > 0 && `Restrictions: ${selectedRestrictions.join(", ")}`}
                  </p>
                )}
              </div>

              {/* Generate button */}
              <Button
                onClick={generateMealPlan}
                disabled={isGenerating || mealsPerDay === 0}
                className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] hover:opacity-90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating your meal plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Plan Preview */}
      {generatedPlan && (
        <div className="space-y-4">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your {customDays}-Day Meal Plan</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeneratedPlan(null);
                  setSaveComplete(false);
                }}
                disabled={isSaving}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Start Over
              </Button>
            </div>
          </div>

          {/* Days */}
          <div className="grid gap-4">
            {generatedPlan.map((day) => (
              <Card key={day.dayIndex}>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                    📅 {getDateForDay(day.dayIndex)}
                  </h3>
                  <div className="grid gap-2">
                    {day.meals.map((meal, mealIndex) => {
                      const config = MEAL_TYPE_CONFIG[meal.type];
                      return (
                        <div
                          key={mealIndex}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                        >
                          <span className="text-xl">{meal.emoji || config.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{meal.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {config.label} • {meal.estimatedTime} • {meal.difficulty}
                            </p>
                          </div>
                          {meal.estimatedCalories && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              ~{meal.estimatedCalories} kcal
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save button */}
          <Card className="border-[hsl(var(--brand-orange))]/50">
            <CardContent className="p-4">
              {saveComplete ? (
                <div className="flex items-center justify-center gap-2 py-2 text-green-600 dark:text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Meal plan saved! Redirecting to calendar...</span>
                </div>
              ) : isSaving ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating recipes and saving...</span>
                    <span className="font-medium">
                      {savingProgress.current} / {savingProgress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] transition-all"
                      style={{ width: `${(savingProgress.current / savingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={saveMealPlan}
                  className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] hover:opacity-90"
                  size="lg"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Save to Calendar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
