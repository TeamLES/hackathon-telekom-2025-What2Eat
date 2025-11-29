"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  onWhatToCookClick: () => void;
  onGetRecipeClick: () => void;
}

export function QuickActions({ onWhatToCookClick, onGetRecipeClick }: QuickActionsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">What do you need?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={onWhatToCookClick}
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
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={onGetRecipeClick}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Get a recipe
            </CardTitle>
            <CardDescription>
              Already know what to cook? Get detailed ingredients and steps
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
