"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { OnboardingFormData } from "../onboarding-form";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type KitchenEquipment =
  Database["public"]["Tables"]["kitchen_equipment"]["Row"];
type FocusPriorityType = Database["public"]["Enums"]["focus_priority_type"];

const AI_TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "expert", label: "Expert" },
  { value: "minimal", label: "Minimal" },
] as const;

const FOCUS_PRIORITY_OPTIONS: { value: FocusPriorityType; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "convenience", label: "Convenience" },
  { value: "saving_time", label: "Saving time" },
  { value: "saving_money", label: "Saving money" },
  { value: "taste", label: "Taste" },
];

export function StepThree() {
  const { control, watch, setValue } = useFormContext<OnboardingFormData>();

  const supabase = createClient();
  const [kitchenEquipment, setKitchenEquipment] = useState<KitchenEquipment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const selectedEquipment = watch("kitchen_equipment") || [];
  const aiTone = watch("ai_tone");
  const focusPriorities = watch("focus_priorities") || [];

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("kitchen_equipment")
          .select("*")
          .order("label");

        if (data) setKitchenEquipment(data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const handleEquipmentToggle = (equipmentId: number) => {
    const current = selectedEquipment;
    const updated = current.includes(equipmentId)
      ? current.filter((id) => id !== equipmentId)
      : [...current, equipmentId];
    setValue("kitchen_equipment", updated);
  };

  const handlePriorityToggle = (priority: FocusPriorityType) => {
    const current = focusPriorities;
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    setValue("focus_priorities", updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Step 4: Final Touches</h2>
        <p className="text-muted-foreground">
          Almost done! These optional settings help us personalize your
          experience even more.
        </p>
      </div>

      {kitchenEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Equipment (optional)</CardTitle>
            <CardDescription>
              What equipment do you have available?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {kitchenEquipment.map((equipment) => (
                <label
                  key={equipment.id}
                  className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedEquipment.includes(equipment.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={selectedEquipment.includes(equipment.id)}
                    onCheckedChange={() => handleEquipmentToggle(equipment.id)}
                  />
                  <span className="text-sm">{equipment.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Preferences (optional)</CardTitle>
          <CardDescription>
            How should the AI assistant communicate with you?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai_tone">Communication Tone</Label>
            <Controller
              control={control}
              name="ai_tone"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(
                      value as OnboardingFormData["ai_tone"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Focus Priorities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FOCUS_PRIORITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${
                    focusPriorities.includes(option.value)
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    checked={focusPriorities.includes(option.value)}
                    onCheckedChange={() => handlePriorityToggle(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
