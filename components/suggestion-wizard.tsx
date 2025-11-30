"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Flame,
  Leaf,
  Loader2,
  Sparkles,
  Clock,
  Check,
  RotateCcw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { saveAiRecipeAction } from "@/app/actions/recipes";
import { CookingAnimation } from "@/components/cooking-animation";

interface SuggestionWizardProps {
  isOpen: boolean;
  onClose: (didSaveRecipe?: boolean) => void;
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
  aiResults: 6,
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

export function SuggestionWizard({
  isOpen,
  onClose,
  initialFlow,
}: SuggestionWizardProps) {
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [flowType, setFlowType] = useState<FlowType>(null);
  const [ingredientSource, setIngredientSource] =
    useState<IngredientSource>(null);
  const [currentStep, setCurrentStep] = useState<StepType>(STEPS.initial);

  // Database data
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<
    DietaryRestriction[]
  >([]);
  const [kitchenEquipment, setKitchenEquipment] = useState<KitchenEquipment[]>(
    []
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form data
  const [ingredients, setIngredients] = useState("");
  const [additionalPreferences, setAdditionalPreferences] = useState("");
  const [cookingTime, setCookingTime] = useState(30);
  const [mealType, setMealType] = useState<
    "snack" | "breakfast" | "lunch" | "dinner"
  >("lunch");
  const [extraInfo, setExtraInfo] = useState("");
  const [portions, setPortions] = useState(1);
  const [mealName, setMealName] = useState("");

  // Preference selections
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>(
    []
  );
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [spicyLevel, setSpicyLevel] = useState<string>("none");
  const [quickPreferences, setQuickPreferences] = useState<string[]>([]);

  // Camera and image state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI state
  const [completion, setCompletion] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<Error | null>(null);
  const abortControllerRef = { current: null as AbortController | null };
  
  // Meal suggestions (structured data from AI)
  type MealSuggestion = {
    name: string;
    description: string;
    estimatedTime: string;
    difficulty: "Easy" | "Medium" | "Hard";
    emoji: string;
  };
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null);
  const [previouslyShownMeals, setPreviouslyShownMeals] = useState<string[]>([]);

  // Saving recipe state
  const [isSaving, startSaveTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Fetch structured meal suggestions (JSON)
  const fetchMealSuggestions = async (requestBody: Record<string, unknown>, excludeMeals: string[] = []) => {
    setIsAiLoading(true);
    setMealSuggestions([]);
    setSelectedSuggestion(null);
    setAiError(null);

    try {
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestBody, mode: "suggestions", excludeMeals }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = data.suggestions || [];
      setMealSuggestions(suggestions);
      
      // Track these meal names for future "Get Different Suggestions" requests
      if (suggestions.length > 0) {
        const newMealNames = suggestions.map((s: MealSuggestion) => s.name);
        setPreviouslyShownMeals(prev => [...prev, ...newMealNames]);
      }
    } catch (error) {
      console.error("AI suggestions error:", error);
      setAiError(error as Error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fetch full recipe (streamed)
  const fetchFullRecipe = async (requestBody: Record<string, unknown>) => {
    setIsAiLoading(true);
    setCompletion("");
    setAiError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestBody, mode: "full-recipe" }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        setCompletion((prev) => prev + text);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("AI recipe error:", error);
        setAiError(error as Error);
      }
    } finally {
      setIsAiLoading(false);
      abortControllerRef.current = null;
    }
  };

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
    // Reset AI state
    setCompletion("");
    setAiError(null);
    setMealSuggestions([]);
    setSelectedSuggestion(null);
    setPreviouslyShownMeals([]);
    setSaveSuccess(false);
    stopGeneration();
    // Reset camera state
    stopCamera();
    setCapturedImage(null);
    setUploadError(null);
    setIsUploading(false);
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

  // Save recipe and close
  const handleSaveAndClose = () => {
    // Only save if we have a recipe to save
    if (!completion) {
      handleClose();
      return;
    }

    // Build the meal object to save
    const mealToSave = selectedSuggestion 
      ? {
          name: selectedSuggestion.name,
          description: selectedSuggestion.description,
          estimatedTime: selectedSuggestion.estimatedTime,
          difficulty: selectedSuggestion.difficulty,
        }
      : {
          // For "ingredients-needed" flow, use the meal name they entered
          name: mealName || "AI Generated Recipe",
          description: "",
          estimatedTime: undefined,
          difficulty: undefined as "Easy" | "Medium" | "Hard" | undefined,
        };

    startSaveTransition(async () => {
      // Pass mealType to save to the correct meal plan slot
      const result = await saveAiRecipeAction(
        mealToSave, 
        completion,
        mealType, // breakfast, lunch, dinner, or snack
        undefined // planDate - defaults to today
      );
      
      if ("error" in result) {
        console.error("Failed to save recipe:", result.error);
        // Still close even if save fails
        handleClose();
        return;
      }

      setSaveSuccess(true);
      // Brief delay to show success state, then close with refresh signal
      setTimeout(() => {
        handleClose(true); // true = did save recipe, trigger refresh
      }, 500);
    });
  };

  const handleClose = (didSaveRecipe?: boolean) => {
    resetWizard();
    onClose(didSaveRecipe);
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
    if (source === "go-shopping") {
      // Skip ingredients step, go directly to preferences
      setCurrentStep(STEPS.preferences);
    } else {
      setCurrentStep(STEPS.ingredients);
    }
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
      if (ingredientSource === "go-shopping") {
        // Go back to ingredient source selection (skipping ingredients step)
        setCurrentStep(STEPS.ingredientSource);
        setIngredientSource(null);
      } else {
        setCurrentStep(STEPS.ingredients);
      }
    } else if (currentStep === STEPS.details) {
      setCurrentStep(STEPS.preferences);
    } else if (currentStep === STEPS.portions) {
      setCurrentStep(STEPS.initial);
      setFlowType(null);
    } else if (currentStep === STEPS.aiResults) {
      // Stop AI generation if running and go back
      stopGeneration();
      if (flowType === "what-to-cook") {
        setCurrentStep(STEPS.details);
      } else {
        setCurrentStep(STEPS.portions);
      }
    }
  };

  const handleSubmit = async () => {
    // Build request body with resolved names from IDs
    const requestBody = {
      flowType: flowType as "what-to-cook" | "ingredients-needed",
      ingredientSource,
      ingredients,
      // Resolve cuisine names from IDs
      selectedCuisines: selectedCuisines
        .map((id) => cuisines.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[],
      // Resolve restriction labels from IDs
      selectedRestrictions: selectedRestrictions
        .map((id) => dietaryRestrictions.find((r) => r.id === id)?.label)
        .filter(Boolean) as string[],
      // Resolve equipment labels from IDs
      selectedEquipment: selectedEquipment
        .map((id) => kitchenEquipment.find((e) => e.id === id)?.label)
        .filter(Boolean) as string[],
      spicyLevel,
      quickPreferences,
      additionalPreferences,
      // Details
      cookingTime,
      mealType,
      extraInfo,
      portions,
      mealName,
    };

    // Move to AI results step
    setCurrentStep(STEPS.aiResults);

    // Different flow based on what user is looking for
    if (flowType === "what-to-cook") {
      // Get structured suggestions first, excluding previously shown meals
      await fetchMealSuggestions(requestBody, previouslyShownMeals);
    } else {
      // Directly get the recipe for a specific meal
      await fetchFullRecipe(requestBody);
    }
  };

  // Handle when user selects a meal suggestion
  const handleSelectMeal = async (meal: typeof mealSuggestions[0]) => {
    setSelectedSuggestion(meal);
    
    // Build request with the selected meal
    const requestBody = {
      flowType,
      ingredientSource,
      ingredients,
      selectedCuisines: selectedCuisines
        .map((id) => cuisines.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[],
      selectedRestrictions: selectedRestrictions
        .map((id) => dietaryRestrictions.find((r) => r.id === id)?.label)
        .filter(Boolean) as string[],
      selectedEquipment: selectedEquipment
        .map((id) => kitchenEquipment.find((e) => e.id === id)?.label)
        .filter(Boolean) as string[],
      spicyLevel,
      quickPreferences,
      additionalPreferences,
      cookingTime,
      mealType,
      extraInfo,
      portions,
      selectedMeal: {
        name: meal.name,
        description: meal.description,
      },
    };

    await fetchFullRecipe(requestBody);
  };

  const startCamera = async () => {
    stopCamera(); // Stop any existing stream
    setCapturedImage(null);
    setUploadError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const handleImageUpload = async (imageDataUrl: string) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: imageDataUrl,
          saveToStorage: true, // Save to Supabase storage and database
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image.");
      }

      // Prepend new ingredients to existing ones, avoiding duplicates
      const existingIngredients = ingredients
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const newIngredients = (data.ingredients as string[]).filter(
        (ing: string) => !existingIngredients.includes(ing.toLowerCase())
      );

      if (newIngredients.length > 0) {
        setIngredients((prev) =>
          [
            ...prev
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            ...newIngredients,
          ].join(", ")
        );
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setUploadError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        stopCamera();
        handleImageUpload(imageDataUrl);
      }
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => handleClose()}
    >
      <div 
        className="fixed inset-0 md:inset-4 md:m-auto md:max-w-2xl md:h-fit md:max-h-[90vh] bg-background md:rounded-xl md:border md:shadow-lg overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden canvas for capturing photo */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="absolute inset-0 z-20 bg-black flex flex-col">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center items-center gap-4">
              <Button variant="secondary" onClick={stopCamera}>Cancel</Button>
              <Button onClick={capturePhoto} size="lg">Snap Photo</Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            {currentStep > STEPS.initial && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={isAiLoading}
              >
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
              {currentStep === STEPS.aiResults && "✨ Your Suggestions"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleClose()}>
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
                    Don&apos;t know what to eat, but you want to cook yourself?
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
                    Already chose your meal but don&apos;t know the ingredients or recipe?
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
                    Tell us what you have and we&apos;ll suggest what you can make
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
                    We&apos;ll suggest meals and give you a shopping list
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
                {/* Image Preview & Uploading State */}
                {capturedImage && (
                  <div className="relative group">
                    <img src={capturedImage} alt="Captured ingredients" className="rounded-lg w-full" />
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                        <p className="text-white mt-2">Analyzing ingredients...</p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Button variant="secondary" onClick={startCamera} className="mr-2">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        <Button variant="destructive" onClick={() => setCapturedImage(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Buttons */}
                {!capturedImage && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={startCamera}>
                      <Camera className="w-4 h-4 mr-2" />
                      Take photo
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload image
                    </Button>
                  </div>
                )}

                {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

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
                Get Recipe &amp; Ingredients ✨
              </Button>
            </div>
          )}

          {/* Step: AI Results */}
          {currentStep === STEPS.aiResults && (
            <div className="space-y-6">
              {/* Loading state - fetching suggestions */}
              {isAiLoading && mealSuggestions.length === 0 && !completion && !selectedSuggestion && (
                <CookingAnimation 
                  message={flowType === "what-to-cook" ? "Cooking up some ideas..." : "Preparing your recipe..."}
                />
              )}

              {/* Error state */}
              {aiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive font-medium">
                    Oops! Something went wrong
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {aiError.message || "Failed to generate suggestions. Please try again."}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setAiError(null);
                      if (flowType === "what-to-cook") {
                        setCurrentStep(STEPS.details);
                      } else {
                        setCurrentStep(STEPS.portions);
                      }
                    }}
                  >
                    Go Back
                  </Button>
                </div>
              )}

              {/* Meal suggestion cards - show when we have suggestions but no selected meal yet */}
              {mealSuggestions.length > 0 && !selectedSuggestion && !completion && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-1">Pick a meal! 🍽️</h3>
                    <p className="text-sm text-muted-foreground">
                      Here are some delicious options based on your preferences
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {mealSuggestions.map((meal, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectMeal(meal)}
                        disabled={isAiLoading}
                        className="w-full text-left p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex gap-4">
                          <div className="text-4xl flex-shrink-0">{meal.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {meal.name}
                              </h4>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                                meal.difficulty === "Easy" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                meal.difficulty === "Medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                meal.difficulty === "Hard" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}>
                                {meal.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {meal.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{meal.estimatedTime}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 self-center" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleSubmit()}
                      className="w-full"
                      disabled={isAiLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Different Suggestions
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected meal header + streaming recipe */}
              {selectedSuggestion && (
                <div className="space-y-4">
                  {/* Selected meal card (compact) */}
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedSuggestion.emoji}</span>
                      <div>
                        <h4 className="font-semibold text-primary">{selectedSuggestion.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedSuggestion.estimatedTime} • {selectedSuggestion.difficulty}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loading recipe */}
                  {isAiLoading && !completion && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Getting your recipe ready...</span>
                    </div>
                  )}

                  {/* Recipe content */}
                  {completion && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{completion}</ReactMarkdown>
                    </div>
                  )}

                  {isAiLoading && completion && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Direct recipe flow (ingredients-needed) - no cards, just streaming */}
              {flowType === "ingredients-needed" && completion && !selectedSuggestion && (
                <div className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{completion}</ReactMarkdown>
                  </div>

                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!isAiLoading && mealSuggestions.length === 0 && !completion && !aiError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No suggestions received. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Action buttons when recipe is done */}
              {!isAiLoading && completion && (
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSaveAndClose}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      "Save & Done"
                    )}
                  </Button>
                  {selectedSuggestion && !isSaving && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSuggestion(null);
                        setCompletion("");
                      }}
                      className="w-full"
                    >
                      ← Back to Suggestions
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    disabled={isSaving}
                    onClick={() => {
                      setMealSuggestions([]);
                      setSelectedSuggestion(null);
                      setCompletion("");
                      handleSubmit();
                    }}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
