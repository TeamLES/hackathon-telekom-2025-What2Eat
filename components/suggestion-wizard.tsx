"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Camera, Upload, Flame, Leaf, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

interface SuggestionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlow?: "what-to-cook" | "ingredients-needed";
}

type FlowType = "what-to-cook" | "ingredients-needed" | null;
type IngredientSource = "use-my-ingredients" | "go-shopping" | null;
type Cuisine = Database["public"]["Tables"]["cuisines"]["Row"];
type DietaryRestriction = Database["public"]["Tables"]["dietary_restrictions"]["Row"];
type KitchenEquipment = Database["public"]["Tables"]["kitchen_equipment"]["Row"];

// Spicy level options
const SPICY_LEVELS = [
  { value: "none", label: "No spice", icon: "🚫" },
  { value: "mild", label: "Mild", icon: "🌶️" },
  { value: "medium", label: "Medium", icon: "🌶️🌶️" },
  { value: "hot", label: "Hot", icon: "🌶️🌶️🌶️" },
] as const;

// Quick preference tags
const QUICK_PREFERENCES = [
  { value: "healthy", label: "Healthy", icon: "🥗" },
  { value: "quick", label: "Quick & Easy", icon: "⚡" },
  { value: "comfort", label: "Comfort Food", icon: "🍲" },
  { value: "light", label: "Light", icon: "🥬" },
  { value: "filling", label: "Filling", icon: "🍖" },
  { value: "sweet", label: "Sweet", icon: "🍰" },
] as const;

// Step definitions
const STEPS = {
  initial: 0,
  ingredientSource: 1,
  ingredients: 2,
  preferences: 3,
  details: 4,
  portions: 5,
} as const;

export function SuggestionWizard({ isOpen, onClose, initialFlow }: SuggestionWizardProps) {
  const supabase = createClient();
  
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [ingredientSource, setIngredientSource] = useState<IngredientSource>(null);
  const [currentStep, setCurrentStep] = useState(STEPS.initial);

  // Database data
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [kitchenEquipment, setKitchenEquipment] = useState<KitchenEquipment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form data
  const [ingredients, setIngredients] = useState("");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [cookingTime, setCookingTime] = useState(30);
  const [mealType, setMealType] = useState<"snack" | "breakfast" | "lunch" | "dinner">("lunch");
  const [extraInfo, setExtraInfo] = useState("");
  const [portions, setPortions] = useState(1);
  const [mealName, setMealName] = useState("");

  // Preference selections
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [spicyLevel, setSpicyLevel] = useState<string>("none");
  const [quickPreferences, setQuickPreferences] = useState<string[]>([]);

  // Load data from database
  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      
      setIsLoadingData(true);
      try {
        const [cuisinesRes, restrictionsRes, equipmentRes] = await Promise.all([
          supabase.from("cuisines").select("*").order("name"),
          supabase.from("dietary_restrictions").select("*").order("label"),
          supabase.from("kitchen_equipment").select("*").order("label"),
        ]);

        if (cuisinesRes.data) setCuisines(cuisinesRes.data);
        if (restrictionsRes.data) setDietaryRestrictions(restrictionsRes.data);
        if (equipmentRes.data) setKitchenEquipment(equipmentRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [isOpen, supabase]);

  // Handle initial flow when wizard opens
  useEffect(() => {
    if (isOpen && initialFlow) {
      setFlowType(initialFlow);
      if (initialFlow === "what-to-cook") {
        setCurrentStep(STEPS.ingredientSource);
      } else if (initialFlow === "ingredients-needed") {
        setCurrentStep(STEPS.portions);
      }
    }
  }, [isOpen, initialFlow]);

  const resetWizard = () => {
    setFlowType(null);
    setIngredientSource(null);
    setCurrentStep(STEPS.initial);
    setIngredients("");
    setAdditionalPreferences("");
    setCookingTime(30);
    setMealType("lunch");
    setExtraInfo("");
    setPortions(1);
    setMealName("");
    // Reset preference selections
    setSelectedCuisines([]);
    setSelectedRestrictions([]);
    setSelectedEquipment([]);
    setSpicyLevel("none");
    setQuickPreferences([]);
  };

  // Toggle functions for selections
  const toggleCuisine = (id: number) => {
    setSelectedCuisines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleRestriction = (id: number) => {
    setSelectedRestrictions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEquipment = (id: number) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleQuickPreference = (value: string) => {
    setQuickPreferences((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleFlowSelect = (flow: FlowType) => {
    setFlowType(flow);
    if (flow === "what-to-cook") {
      setCurrentStep(STEPS.ingredientSource);
    } else if (flow === "ingredients-needed") {
      setCurrentStep(STEPS.portions);
    }
  };

  const handleIngredientSourceSelect = (source: IngredientSource) => {
    setIngredientSource(source);
    setCurrentStep(STEPS.ingredients);
  };

  const handleNext = () => {
    if (currentStep === STEPS.ingredients) {
      setCurrentStep(STEPS.preferences);
    } else if (currentStep === STEPS.preferences) {
      setCurrentStep(STEPS.details);
    } else if (currentStep === STEPS.details) {
      // Submit and close
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === STEPS.ingredientSource) {
      setCurrentStep(STEPS.initial);
      setFlowType(null);
    } else if (currentStep === STEPS.ingredients) {
      setCurrentStep(STEPS.ingredientSource);
      setIngredientSource(null);
    } else if (currentStep === STEPS.preferences) {
      setCurrentStep(STEPS.ingredients);
    } else if (currentStep === STEPS.details) {
      setCurrentStep(STEPS.preferences);
    } else if (currentStep === STEPS.portions) {
      setCurrentStep(STEPS.initial);
      setFlowType(null);
    }
  };

  const handleSubmit = () => {
    // TODO: Submit to API
    console.log({
      flowType,
      ingredientSource,
      ingredients,
      // Preference selections
      selectedCuisines,
      selectedRestrictions,
      selectedEquipment,
      spicyLevel,
      quickPreferences,
      additionalPreferences,
      // Details
      cookingTime,
      mealType,
      extraInfo,
      portions,
      mealName,
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 md:inset-4 md:m-auto md:max-w-2xl md:h-fit md:max-h-[90vh] bg-background md:rounded-xl md:border md:shadow-lg overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            {currentStep > STEPS.initial && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              {currentStep === STEPS.initial && "What do you need?"}
              {currentStep === STEPS.ingredientSource && "Choose your approach"}
              {currentStep === STEPS.ingredients && "Your ingredients"}
              {currentStep === STEPS.preferences && "Your preferences"}
              {currentStep === STEPS.details && "Final details"}
              {currentStep === STEPS.portions && "What do you want to cook?"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Step 0: Initial choice */}
          {currentStep === STEPS.initial && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center mb-6">
                Choose what kind of help you need
              </p>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  flowType === "what-to-cook" && "border-primary bg-primary/5"
                )}
                onClick={() => handleFlowSelect("what-to-cook")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">🤔 What should I cook?</CardTitle>
                  <CardDescription>
                    Don't know what to eat, but you want to cook yourself?
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  flowType === "ingredients-needed" && "border-primary bg-primary/5"
                )}
                onClick={() => handleFlowSelect("ingredients-needed")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">📝 What ingredients do I need?</CardTitle>
                  <CardDescription>
                    Already chose your meal but don't know the ingredients or recipe?
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Step 1: Ingredient source */}
          {currentStep === STEPS.ingredientSource && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center mb-6">
                How do you want to get ingredients?
              </p>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  ingredientSource === "use-my-ingredients" && "border-primary bg-primary/5"
                )}
                onClick={() => handleIngredientSourceSelect("use-my-ingredients")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">🧊 I want to use my ingredients</CardTitle>
                  <CardDescription>
                    Tell us what you have and we'll suggest what you can make
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  ingredientSource === "go-shopping" && "border-primary bg-primary/5"
                )}
                onClick={() => handleIngredientSourceSelect("go-shopping")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">🛒 I will go shopping</CardTitle>
                  <CardDescription>
                    We'll suggest meals and give you a shopping list
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Step 2: Ingredients */}
          {currentStep === STEPS.ingredients && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">
                  {ingredientSource === "use-my-ingredients"
                    ? "What ingredients do you have?"
                    : "Any ingredients you want to include?"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {ingredientSource === "use-my-ingredients"
                    ? "List the ingredients you have in your fridge/pantry"
                    : "Optional: specify ingredients you'd like to use"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Take photo
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload image
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or type</span>
                  </div>
                </div>

                <Textarea
                  placeholder="e.g. chicken, rice, tomatoes, onion, garlic..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleNext} className="w-full" size="lg">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === STEPS.preferences && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Your preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Your dietary restrictions and preferences from your profile will be applied automatically.
                </p>
              </div>

              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading preferences...</p>
                </div>
              ) : (
                <>
                  {/* Quick Preferences */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What are you in the mood for?</Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PREFERENCES.map((pref) => (
                        <button
                          key={pref.value}
                          type="button"
                          onClick={() => toggleQuickPreference(pref.value)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm transition-colors",
                            quickPreferences.includes(pref.value)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <span>{pref.icon}</span>
                          <span>{pref.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spicy Level */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Spice level
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {SPICY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setSpicyLevel(level.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors",
                            spicyLevel === level.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          <span className="text-lg">{level.icon}</span>
                          <span className="text-xs">{level.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Preferred cuisines (optional)</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine.id}
                          type="button"
                          onClick={() => toggleCuisine(cuisine.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-sm transition-colors",
                            selectedCuisines.includes(cuisine.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          {cuisine.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      Dietary restrictions (optional)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictions.map((restriction) => (
                        <button
                          key={restriction.id}
                          type="button"
                          onClick={() => toggleRestriction(restriction.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-sm transition-colors",
                            selectedRestrictions.includes(restriction.id)
                              ? "bg-green-500 text-white border-green-500"
                              : "hover:bg-muted"
                          )}
                        >
                          {restriction.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kitchen Equipment */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">What can you use?</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {kitchenEquipment.map((equipment) => (
                        <button
                          key={equipment.id}
                          type="button"
                          onClick={() => toggleEquipment(equipment.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-sm transition-colors",
                            selectedEquipment.includes(equipment.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          {equipment.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Preferences */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Any additional preferences?</Label>
                    <Textarea
                      placeholder="e.g. I want something spicy, no raw fish, prefer grilled..."
                      value={additionalPreferences}
                      onChange={(e) => setAdditionalPreferences(e.target.value)}
                      rows={2}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleNext} className="w-full" size="lg">
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === STEPS.details && (
            <div className="space-y-6">
              {/* Cooking time */}
              <div className="space-y-3">
                <Label>Max cooking time</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-12">5min</span>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                    className="flex-1 accent-[hsl(var(--brand-orange))]"
                  />
                  <span className="text-sm text-muted-foreground w-16">120+min</span>
                </div>
                <p className="text-center font-medium">{cookingTime} minutes</p>
              </div>

              {/* Meal type */}
              <div className="space-y-3">
                <Label>Type of meal</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["snack", "breakfast", "lunch", "dinner"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={mealType === type ? "default" : "outline"}
                      onClick={() => setMealType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Extra information */}
              <div className="space-y-3">
                <Label>Extra information (optional)</Label>
                <Textarea
                  placeholder="Any other details you want to share..."
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90" size="lg">
                Get Suggestions ✨
              </Button>
            </div>
          )}

          {/* Step: Portions (for "ingredients needed" flow) */}
          {currentStep === STEPS.portions && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>What meal do you want to cook?</Label>
                <Input
                  placeholder="e.g. Spaghetti Carbonara, Chicken Curry..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>How many portions?</Label>
                <div className="flex items-center gap-4 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPortions(Math.max(1, portions - 1))}
                  >
                    -
                  </Button>
                  <span className="text-3xl font-bold w-16 text-center">{portions}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPortions(portions + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90"
                size="lg"
                disabled={!mealName.trim()}
              >
                Get Recipe & Ingredients ✨
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
