"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProfileData,
  AI_TONE_OPTIONS,
  FOCUS_PRIORITY_OPTIONS,
  MAX_COOKING_TIME_OPTIONS,
  getOptionLabel,
  formatLabel,
} from "./types";

type Props = {
  profile: ProfileData;
  editForm: ProfileData;
  isEditing: boolean;
  updateField: <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => void;
  togglePriority: (priority: string) => void;
};

export function SettingsTab({
  profile,
  editForm,
  isEditing,
  updateField,
  togglePriority,
}: Props) {
  return (
    <div className="space-y-6">
      {/* AI Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI Assistant Preferences</CardTitle>
          <CardDescription>
            How should the AI assistant interact with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">Communication Tone</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AI_TONE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.ai_tone === opt.value
                          ? "bg-violet-50 border-violet-300 dark:bg-violet-950/30 dark:border-violet-700"
                          : "hover:bg-muted border-border"
                        }`}
                      onClick={() => updateField("ai_tone", opt.value)}
                    >
                      <span className="font-medium">
                        {opt.value === "friendly" && "😊 "}
                        {opt.value === "expert" && "🎓 "}
                        {opt.value === "minimal" && "📝 "}
                        {opt.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {opt.value === "friendly" && "Casual and encouraging"}
                        {opt.value === "expert" && "Detailed and professional"}
                        {opt.value === "minimal" && "Brief and to the point"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Focus Priorities</Label>
                <p className="text-sm text-muted-foreground">
                  What matters most to you?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FOCUS_PRIORITY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${editForm.focus_priorities.includes(option.value)
                          ? "bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700"
                          : "hover:bg-muted border-border"
                        }`}
                    >
                      <Checkbox
                        checked={editForm.focus_priorities.includes(option.value)}
                        onCheckedChange={() => togglePriority(option.value)}
                      />
                      <span className="text-sm font-medium">
                        {option.value === "health" && "💪 "}
                        {option.value === "convenience" && "✨ "}
                        {option.value === "saving_time" && "⏱️ "}
                        {option.value === "saving_money" && "💰 "}
                        {option.value === "taste" && "😋 "}
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Max Cooking Time</Label>
                <p className="text-sm text-muted-foreground">
                  How long are you willing to cook?
                </p>
                <Select
                  value={editForm.max_cooking_time_minutes?.toString() ?? ""}
                  onValueChange={(v) =>
                    updateField("max_cooking_time_minutes", v ? Number(v) : null)
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="No limit" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAX_COOKING_TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How do you choose meals?
                </Label>
                <p className="text-sm text-muted-foreground">
                  What factors influence your meal decisions?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.chooses_based_on_mood
                        ? "bg-pink-50 border-pink-300 dark:bg-pink-950/30 dark:border-pink-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.chooses_based_on_mood}
                      onCheckedChange={(v) =>
                        updateField("chooses_based_on_mood", !!v)
                      }
                    />
                    <div>
                      <span className="font-medium">😌 Mood</span>
                      <p className="text-sm text-muted-foreground">
                        Based on how I feel
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.chooses_based_on_time
                        ? "bg-cyan-50 border-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.chooses_based_on_time}
                      onCheckedChange={(v) =>
                        updateField("chooses_based_on_time", !!v)
                      }
                    />
                    <div>
                      <span className="font-medium">⏰ Time available</span>
                      <p className="text-sm text-muted-foreground">
                        Based on how much time I have
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.chooses_based_on_convenience
                        ? "bg-lime-50 border-lime-300 dark:bg-lime-950/30 dark:border-lime-700"
                        : "hover:bg-muted border-border"
                      }`}
                  >
                    <Checkbox
                      checked={editForm.chooses_based_on_convenience}
                      onCheckedChange={(v) =>
                        updateField("chooses_based_on_convenience", !!v)
                      }
                    />
                    <div>
                      <span className="font-medium">✨ Convenience</span>
                      <p className="text-sm text-muted-foreground">
                        Whatever is easiest
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">
                  Communication Tone
                </p>
                <p className="font-medium text-lg">
                  {profile.ai_tone === "friendly" && "😊 "}
                  {profile.ai_tone === "expert" && "🎓 "}
                  {profile.ai_tone === "minimal" && "📝 "}
                  {getOptionLabel(AI_TONE_OPTIONS, profile.ai_tone)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Focus Priorities
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.focus_priorities.length > 0 ? (
                    profile.focus_priorities.map((priority) => {
                      const opt = FOCUS_PRIORITY_OPTIONS.find(
                        (o) => o.value === priority
                      );
                      return (
                        <span
                          key={priority}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-full text-sm font-medium"
                        >
                          {priority === "health" && "💪 "}
                          {priority === "convenience" && "✨ "}
                          {priority === "saving_time" && "⏱️ "}
                          {priority === "saving_money" && "💰 "}
                          {priority === "taste" && "😋 "}
                          {opt?.label || formatLabel(priority)}
                        </span>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">No priorities set</p>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">
                  ⏱️ Max Cooking Time
                </p>
                <p className="font-medium">
                  {profile.max_cooking_time_minutes
                    ? `${profile.max_cooking_time_minutes} minutes`
                    : "No limit"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Meal Decision Factors
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.chooses_based_on_mood && (
                    <span className="px-3 py-1.5 bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 rounded-full text-sm font-medium">
                      😌 Mood
                    </span>
                  )}
                  {profile.chooses_based_on_time && (
                    <span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 rounded-full text-sm font-medium">
                      ⏰ Time
                    </span>
                  )}
                  {profile.chooses_based_on_convenience && (
                    <span className="px-3 py-1.5 bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300 rounded-full text-sm font-medium">
                      ✨ Convenience
                    </span>
                  )}
                  {!profile.chooses_based_on_mood &&
                    !profile.chooses_based_on_time &&
                    !profile.chooses_based_on_convenience && (
                      <span className="text-muted-foreground">
                        No preferences set
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.allow_meal_notifications
                    ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700"
                    : "hover:bg-muted border-border"
                  }`}
              >
                <Checkbox
                  checked={editForm.allow_meal_notifications}
                  onCheckedChange={(v) =>
                    updateField("allow_meal_notifications", !!v)
                  }
                />
                <div>
                  <span className="font-medium">🍽️ Meal Reminders</span>
                  <p className="text-sm text-muted-foreground">
                    Get notified about meals
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.allow_grocery_notifications
                    ? "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700"
                    : "hover:bg-muted border-border"
                  }`}
              >
                <Checkbox
                  checked={editForm.allow_grocery_notifications}
                  onCheckedChange={(v) =>
                    updateField("allow_grocery_notifications", !!v)
                  }
                />
                <div>
                  <span className="font-medium">🛒 Grocery Lists</span>
                  <p className="text-sm text-muted-foreground">
                    Shopping list updates
                  </p>
                </div>
              </label>

              <label
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${editForm.allow_macro_notifications
                    ? "bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700"
                    : "hover:bg-muted border-border"
                  }`}
              >
                <Checkbox
                  checked={editForm.allow_macro_notifications}
                  onCheckedChange={(v) =>
                    updateField("allow_macro_notifications", !!v)
                  }
                />
                <div>
                  <span className="font-medium">📊 Macro Tracking</span>
                  <p className="text-sm text-muted-foreground">
                    Nutrition goal updates
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl mb-1">
                  {profile.allow_meal_notifications ? "✅" : "❌"}
                </p>
                <p className="text-sm font-medium">Meal Reminders</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl mb-1">
                  {profile.allow_grocery_notifications ? "✅" : "❌"}
                </p>
                <p className="text-sm font-medium">Grocery Lists</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl mb-1">
                  {profile.allow_macro_notifications ? "✅" : "❌"}
                </p>
                <p className="text-sm font-medium">Macro Tracking</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
