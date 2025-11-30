"use client";

import { useState } from "react";
import { Check, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  category?: string;
  isOptional?: boolean;
  userHasIt?: boolean;
}

interface IngredientChecklistProps {
  ingredients: Ingredient[];
  title?: string;
  /** Ingredients that user already has (for comparison) */
  userOwnedIngredients?: string[];
  /** Called when user saves selected ingredients to shopping list */
  onSaveToList?: (selectedIngredients: Ingredient[]) => Promise<void>;
  /** Initial selection - if not provided, selects items user doesn't have */
  initialSelection?: Set<number>;
  /** Controlled selection state */
  selectedIndices?: Set<number>;
  /** Called when selection changes (for controlled mode) */
  onSelectionChange?: (indices: Set<number>) => void;
  /** Show compact version without header */
  compact?: boolean;
  /** Custom class name */
  className?: string;
  /** Show optional badge */
  showOptionalBadge?: boolean;
}

export function IngredientChecklist({
  ingredients,
  title = "Shopping List",
  userOwnedIngredients = [],
  onSaveToList,
  initialSelection,
  selectedIndices: controlledIndices,
  onSelectionChange,
  compact = false,
  className,
  showOptionalBadge = false,
}: IngredientChecklistProps) {
  // Mark which ingredients user has
  const ingredientsWithOwnership = ingredients.map((ing) => {
    const userHasIt = ing.userHasIt ?? userOwnedIngredients.some((owned) =>
      ing.name.toLowerCase().includes(owned.toLowerCase()) ||
      owned.toLowerCase().includes(ing.name.toLowerCase())
    );
    return { ...ing, userHasIt };
  });

  // Initialize selection - by default select items user doesn't have
  const getDefaultSelection = () => {
    if (initialSelection) return initialSelection;
    const indices = ingredientsWithOwnership
      .map((ing, i) => (!ing.userHasIt ? i : -1))
      .filter((i) => i !== -1);
    return new Set(indices);
  };

  // Support both controlled and uncontrolled mode
  const [internalIndices, setInternalIndices] = useState<Set<number>>(getDefaultSelection);
  const selectedIndices = controlledIndices ?? internalIndices;
  const setSelectedIndices = (value: Set<number> | ((prev: Set<number>) => Set<number>)) => {
    const newValue = typeof value === 'function' ? value(selectedIndices) : value;
    if (onSelectionChange) {
      onSelectionChange(newValue);
    } else {
      setInternalIndices(newValue);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSelection = (index: number) => {
    setSelectedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    // Reset saved state when selection changes
    if (saved) setSaved(false);
  };

  const toggleAll = () => {
    if (selectedIndices.size === ingredients.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(ingredients.map((_, i) => i)));
    }
    if (saved) setSaved(false);
  };

  const handleSave = async () => {
    if (!onSaveToList || selectedIndices.size === 0) return;

    setIsSaving(true);
    try {
      const selectedIngredients = ingredientsWithOwnership.filter((_, i) => selectedIndices.has(i));
      await onSaveToList(selectedIngredients);
      setSaved(true);
    } catch (error) {
      console.error("Failed to save to shopping list:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (ingredients.length === 0) return null;

  const hasUserOwnedIngredients = ingredientsWithOwnership.some((ing) => ing.userHasIt);

  return (
    <div className={cn("bg-muted/50 rounded-lg p-4 space-y-3", className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {title} ({selectedIndices.size} to buy)
          </h4>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleAll}
              className="text-xs"
            >
              {selectedIndices.size === ingredients.length ? "Deselect All" : "Select All"}
            </Button>
            {onSaveToList && (
              <Button
                size="sm"
                variant={saved ? "outline" : "default"}
                onClick={handleSave}
                disabled={isSaving || saved || selectedIndices.size === 0}
                className={saved ? "text-green-600 border-green-600" : ""}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Saved!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Save Selected
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {hasUserOwnedIngredients && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px]">✓ have</span>
            <span>= you already have</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span>= will be added to list</span>
          </span>
        </div>
      )}

      {/* Ingredient Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ingredientsWithOwnership.map((ing, index) => {
          // Format quantity display
          const qtyDisplay = ing.quantity && ing.quantity > 0
            ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ''}`
            : ing.unit || '';

          return (
            <button
              key={index}
              onClick={() => toggleSelection(index)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border text-sm text-left transition-all min-h-[44px]",
                selectedIndices.has(index)
                  ? "bg-orange-50 dark:bg-orange-950/30 border-orange-500 shadow-sm"
                  : ing.userHasIt
                    ? "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900 hover:border-orange-300"
                    : "bg-background border-border hover:bg-muted/50 hover:border-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  selectedIndices.has(index)
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-400 dark:border-gray-500"
                )}
              >
                {selectedIndices.has(index) && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span className={cn(
                "flex-1 truncate",
                ing.userHasIt && !selectedIndices.has(index) && "text-muted-foreground"
              )}>
                {qtyDisplay && <span className="text-muted-foreground">{qtyDisplay} </span>}
                {ing.name}
              </span>
              {ing.userHasIt && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded flex-shrink-0">
                  ✓ have
                </span>
              )}
              {showOptionalBadge && ing.isOptional && (
                <span className="text-xs text-muted-foreground flex-shrink-0">(optional)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact save button */}
      {compact && onSaveToList && (
        <Button
          size="sm"
          variant={saved ? "outline" : "default"}
          onClick={handleSave}
          disabled={isSaving || saved || selectedIndices.size === 0}
          className={cn("w-full", saved && "text-green-600 border-green-600")}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Saved to Shopping List!
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add {selectedIndices.size} to Shopping List
            </>
          )}
        </Button>
      )}
    </div>
  );
}
