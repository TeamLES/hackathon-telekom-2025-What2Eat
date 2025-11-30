"use client";

import { useState, useEffect } from "react";
import { useWizard } from "@/components/dashboard-shell";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShoppingList } from "@/components/shopping-list";
import { cn } from "@/lib/utils";

interface TodayNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DashboardClientProps {
  profile: {
    calorie_target: number;
    weight_kg: number;
  } | null;
  todayNutrition?: TodayNutrition;
  firstName?: string | null;
}

function CircularProgress({
  consumed,
  target,
  label,
  unit = "g",
  size = 100,
  mobileSize,
  strokeWidth = 8,
  mobileStrokeWidth,
  color = "stroke-primary"
}: {
  consumed: number;
  target: number;
  label: string;
  unit?: string;
  size?: number;
  mobileSize?: number;
  strokeWidth?: number;
  mobileStrokeWidth?: number;
  color?: string;
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const actualSize = isMobile && mobileSize ? mobileSize : size;
  const actualStrokeWidth = isMobile && mobileStrokeWidth ? mobileStrokeWidth : strokeWidth;
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const isOver = consumed > target;

  const radius = (actualSize - actualStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: actualSize, height: actualSize }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={actualStrokeWidth}
            className="text-muted/30"
          />
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            strokeWidth={actualStrokeWidth}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-out",
              isOver ? "stroke-red-500" : color
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-lg font-bold leading-none",
            isOver && "text-red-500"
          )}>
            {Math.round(consumed)}
          </span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{Math.round(target)}{unit}</p>
      </div>
    </div>
  );
}

export function DashboardClient({ profile, todayNutrition, firstName }: DashboardClientProps) {
  const { openWizard, nutritionRefreshKey } = useWizard();
  const [nutrition, setNutrition] = useState<TodayNutrition>(
    todayNutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const [shoppingListKey, setShoppingListKey] = useState(0);

  const proteinTarget = profile?.weight_kg ? Math.round(profile.weight_kg * 1.6) : 0;
  const fatTarget = profile?.weight_kg ? Math.round(profile.weight_kg * 1) : 0;
  const proteinCalories = proteinTarget * 4;
  const fatCalories = fatTarget * 9;
  const remainingCalories = profile?.calorie_target ? profile.calorie_target - proteinCalories - fatCalories : 0;
  const carbsTarget = remainingCalories > 0 ? Math.round(remainingCalories / 4) : 0;

  useEffect(() => {
    if (nutritionRefreshKey > 0) {
      fetch("/api/today-nutrition")
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setNutrition(data);
          }
        })
        .catch(console.error);

      setShoppingListKey(prev => prev + 1);
    }
  }, [nutritionRefreshKey]);

  useEffect(() => {
    if (todayNutrition) {
      setNutrition(todayNutrition);
    }
  }, [todayNutrition]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to discover what to eat today?
        </p>
      </div>

      {profile && (
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-lg">Today&apos;s Nutrition</CardTitle>
            <CardDescription>
              {nutrition.calories > 0 || nutrition.protein > 0
                ? "Track your daily intake from saved meals"
                : "Save meals to track your nutrition"}
            </CardDescription>
          </CardHeader>
          <CardContent className="my-2">
            <div className="grid grid-cols-4 gap-4 sm:gap-2">
              <CircularProgress
                consumed={nutrition.calories}
                target={profile.calorie_target}
                label="Calories"
                unit=" kcal"
                size={80}
                mobileSize={60}
                strokeWidth={6}
                mobileStrokeWidth={5}
                color="stroke-[hsl(var(--brand-orange))]"
              />
              <CircularProgress
                consumed={nutrition.protein}
                target={proteinTarget}
                label="Protein"
                unit="g"
                size={80}
                mobileSize={60}
                strokeWidth={6}
                mobileStrokeWidth={5}
                color="stroke-[hsl(var(--brand-green))]"
              />
              <CircularProgress
                consumed={nutrition.carbs}
                target={carbsTarget}
                label="Carbs"
                unit="g"
                size={80}
                mobileSize={60}
                strokeWidth={6}
                mobileStrokeWidth={5}
                color="stroke-blue-500"
              />
              <CircularProgress
                consumed={nutrition.fat}
                target={fatTarget}
                label="Fat"
                unit="g"
                size={80}
                mobileSize={60}
                strokeWidth={6}
                mobileStrokeWidth={5}
                color="stroke-yellow-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">What do you need?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-[hsl(var(--brand-orange))] transition-all duration-300 transform hover:scale-[101%]"
            onClick={() => openWizard("what-to-cook")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤔</span>
                What should I cook?
              </CardTitle>
              <CardDescription>
                Get meal suggestions based on your preferences and ingredients
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-[hsl(var(--brand-orange))] transition-all duration-300 transform hover:scale-[101%]"
            onClick={() => openWizard("ingredients-needed")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                What ingredients do I need?
              </CardTitle>
              <CardDescription>
                Already know what to cook? Get detailed ingredients and steps
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <ShoppingList key={shoppingListKey} />

      <Card className="bg-gradient-to-r from-[hsl(var(--brand-orange))]/10 to-[hsl(280,70%,50%)]/10">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tip of the day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tap the <span className="font-bold text-[hsl(var(--brand-orange))]">+</span> button to get personalized meal suggestions based on what ingredients you have!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
