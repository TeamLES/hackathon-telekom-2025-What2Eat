"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id?: string | number;
  user_id?: string;
  full_name?: string | null;
  username?: string | null;
  age?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  calorie_target?: number | null;
  activity_level?: string | null;
  primary_goal?: string | null;
  meals_per_day?: number | null;
  cooking_skill?: string | null;
  gender?: string | null;
  budget_level?: string | null;
  is_morning_person?: boolean | null;
  usually_rushed_mornings?: boolean | null;
  snacks_included?: boolean | null;
  snacks_often?: boolean | null;
  protein_target_g?: number | null;
  favorite_cuisines?: number[] | null;
  dietary_restrictions?: number[] | null;
  kitchen_equipment?: number[] | null;
  ai_tone?: string | null;
  focus_priorities?: string[] | null;
};

export default function ProfileForm({ initialProfile, showHeader = true }: { initialProfile: Profile | null; showHeader?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Profile>({
    full_name: "",
    username: "",
    gender: initialProfile?.gender ?? "",
    age: initialProfile?.age ?? null,
    weight_kg: initialProfile?.weight_kg ?? null,
    height_cm: initialProfile?.height_cm ?? null,
    calorie_target: initialProfile?.calorie_target ?? null,
    protein_target_g: initialProfile?.protein_target_g ?? null,
    activity_level: initialProfile?.activity_level ?? "",
    primary_goal: initialProfile?.primary_goal ?? "",
    meals_per_day: initialProfile?.meals_per_day ?? null,
    budget_level: initialProfile?.budget_level ?? "",
    cooking_skill: initialProfile?.cooking_skill ?? "",
    is_morning_person: initialProfile?.is_morning_person ?? false,
    usually_rushed_mornings: initialProfile?.usually_rushed_mornings ?? false,
    snacks_included: initialProfile?.snacks_included ?? false,
    snacks_often: initialProfile?.snacks_often ?? false,
    favorite_cuisines: [],
    dietary_restrictions: [],
    kitchen_equipment: [],
    ai_tone: "",
    focus_priorities: [],
  });
  const [error, setError] = useState<string | null>(null);

  const [cuisines, setCuisines] = useState<{ id: number; name: string }[]>([]);
  const [dietaryOptions, setDietaryOptions] = useState<{ id: number; label: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: number; label: string }[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function loadLookups() {
      try {
        const [cRes, dRes, eRes] = await Promise.all([
          supabase.from("cuisines").select("id,name").order("name"),
          supabase.from("dietary_restrictions").select("id,label").order("label"),
          supabase.from("kitchen_equipment").select("id,label").order("label"),
        ]);

        if (cRes.data) setCuisines(cRes.data as { id: number; name: string }[]);
        if (dRes.data) setDietaryOptions(dRes.data as { id: number; label: string }[]);
        if (eRes.data) setEquipmentOptions(eRes.data as { id: number; label: string }[]);
      } catch (err) {
        console.error("Error loading lookups:", err);
      }
    }

    loadLookups();
  }, [supabase]);

  // load user's related rows & profile (full_name/username/preferences)
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) return;

        const [{ data: profileRow }, { data: favCuisines }, { data: dietRestr }, { data: equip }, { data: prefs }] = await Promise.all([
          supabase.from("profiles").select("full_name,username").eq("id", userId).single(),
          supabase.from("user_favorite_cuisines").select("cuisine_id").eq("user_id", userId),
          supabase.from("user_dietary_restrictions").select("restriction_id").eq("user_id", userId),
          supabase.from("user_kitchen_equipment").select("equipment_id").eq("user_id", userId),
          supabase.from("user_preferences").select("ai_tone,focus_priorities").eq("user_id", userId).single(),
        ]);

        if (profileRow?.full_name || profileRow?.username) setForm((s) => ({ ...s, full_name: profileRow.full_name ?? s.full_name, username: profileRow.username ?? s.username }));

        if (Array.isArray(favCuisines)) setForm((s) => ({ ...s, favorite_cuisines: favCuisines.map((r: { cuisine_id: number }) => r.cuisine_id) }));
        if (Array.isArray(dietRestr)) setForm((s) => ({ ...s, dietary_restrictions: dietRestr.map((r: { restriction_id: number }) => r.restriction_id) }));
        if (Array.isArray(equip)) setForm((s) => ({ ...s, kitchen_equipment: equip.map((r: { equipment_id: number }) => r.equipment_id) }));
        if (prefs) setForm((s) => ({ ...s, ai_tone: prefs.ai_tone ?? s.ai_tone, focus_priorities: prefs.focus_priorities ?? s.focus_priorities }));
      } catch (err) {
        // ignore missing rows
        console.error("loadUserData error:", err);
      }
    }

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to save profile");
      } else {
        setEditing(false);
        // refresh server data
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function openEditor() {
      setEditing(true);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("profile-open-edit", openEditor as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("profile-open-edit", openEditor as EventListener);
      }
    };
  }, []);

  if (!initialProfile) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          {showHeader && (
            <div>
              <h3 className="text-lg font-medium">Nutrition Profile</h3>
              <p className="text-sm text-muted-foreground">You have not set up a nutrition profile yet.</p>
            </div>
          )}
          {editing && (
            <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Full name</Label>
                <Input value={form.full_name ?? ""} onChange={(e) => updateField("full_name", e.target.value)} />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={form.username ?? ""} onChange={(e) => updateField("username", e.target.value)} />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" value={form.age ?? ""} onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight_kg ?? ""} onChange={(e) => updateField("weight_kg", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input type="number" value={form.height_cm ?? ""} onChange={(e) => updateField("height_cm", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label>Calorie Target (kcal)</Label>
                <Input type="number" value={form.calorie_target ?? ""} onChange={(e) => updateField("calorie_target", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label>Activity Level</Label>
                <Select value={String(form.activity_level ?? "")} onValueChange={(v) => updateField("activity_level", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="lightly_active">Lightly active</SelectItem>
                    <SelectItem value="moderately_active">Moderately active</SelectItem>
                    <SelectItem value="very_active">Very active</SelectItem>
                    <SelectItem value="athlete">Athlete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={String(form.gender ?? "")} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Goal</Label>
                <Select value={String(form.primary_goal ?? "")} onValueChange={(v) => updateField("primary_goal", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintain_weight">Maintain weight</SelectItem>
                    <SelectItem value="lose_weight">Lose weight</SelectItem>
                    <SelectItem value="gain_weight">Gain weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meals per day</Label>
                <Input type="number" value={form.meals_per_day ?? ""} onChange={(e) => updateField("meals_per_day", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <Label>Cooking skill</Label>
                <Select value={String(form.cooking_skill ?? "")} onValueChange={(v) => updateField("cooking_skill", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extended onboarding fields - also show in edit mode */}
              <div>
                <Label>Budget level</Label>
                <Select value={String(form.budget_level ?? "")} onValueChange={(v) => updateField("budget_level", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="no_preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Protein target (g)</Label>
                <Input type="number" value={form.protein_target_g ?? ""} onChange={(e) => updateField("protein_target_g", e.target.value ? Number(e.target.value) : null)} />
              </div>

              <div>
                <Label>Is morning person</Label>
                <label className="flex items-center space-x-2">
                  <Checkbox checked={!!form.is_morning_person} onCheckedChange={(v) => updateField("is_morning_person", !!v)} />
                  <span className="text-sm">Yes</span>
                </label>
              </div>

              <div>
                <Label>Usually rushed mornings</Label>
                <label className="flex items-center space-x-2">
                  <Checkbox checked={!!form.usually_rushed_mornings} onCheckedChange={(v) => updateField("usually_rushed_mornings", !!v)} />
                  <span className="text-sm">Yes</span>
                </label>
              </div>

              <div>
                <Label>Include snacks</Label>
                <label className="flex items-center space-x-2">
                  <Checkbox checked={!!form.snacks_included} onCheckedChange={(v) => updateField("snacks_included", !!v)} />
                  <span className="text-sm">Yes</span>
                </label>
              </div>

              <div>
                <Label>Snack often</Label>
                <label className="flex items-center space-x-2">
                  <Checkbox checked={!!form.snacks_often} onCheckedChange={(v) => updateField("snacks_often", !!v)} />
                  <span className="text-sm">Yes</span>
                </label>
              </div>

              <div className="col-span-full">
                <CardHeader>
                  <CardTitle className="text-base">Favorite cuisines</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-3 gap-2">
                  {cuisines.map((c) => (
                    <label key={c.id} className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer ${form.favorite_cuisines?.includes(c.id) ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}>
                      <Checkbox checked={form.favorite_cuisines?.includes(c.id)} onCheckedChange={() => {
                        const current = form.favorite_cuisines ?? [];
                        const updated = current.includes(c.id) ? current.filter((i) => i !== c.id) : [...current, c.id];
                        updateField("favorite_cuisines", updated);
                      }} />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-full">
                <CardHeader>
                  <CardTitle className="text-base">Dietary restrictions</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-3 gap-2">
                  {dietaryOptions.map((d) => (
                    <label key={d.id} className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer ${form.dietary_restrictions?.includes(d.id) ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}>
                      <Checkbox checked={form.dietary_restrictions?.includes(d.id)} onCheckedChange={() => {
                        const current = form.dietary_restrictions ?? [];
                        const updated = current.includes(d.id) ? current.filter((i) => i !== d.id) : [...current, d.id];
                        updateField("dietary_restrictions", updated);
                      }} />
                      <span className="text-sm">{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-full">
                <CardHeader>
                  <CardTitle className="text-base">Kitchen equipment</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-3 gap-2">
                  {equipmentOptions.map((e) => (
                    <label key={e.id} className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer ${form.kitchen_equipment?.includes(e.id) ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}>
                      <Checkbox checked={form.kitchen_equipment?.includes(e.id)} onCheckedChange={() => {
                        const current = form.kitchen_equipment ?? [];
                        const updated = current.includes(e.id) ? current.filter((i) => i !== e.id) : [...current, e.id];
                        updateField("kitchen_equipment", updated);
                      }} />
                      <span className="text-sm">{e.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-full flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setEditing(false)} type="button">Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
              </div>
              {error && <p className="text-sm text-destructive col-span-full">{error}</p>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {showHeader && (
          <div>
            <h3 className="text-lg font-medium">Nutrition Profile</h3>
            <p className="text-sm text-muted-foreground">Your dietary settings</p>
          </div>
        )}

      </div>

      {!editing ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-medium">{initialProfile.age ?? "—"} years</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weight</p>
            <p className="font-medium">{initialProfile.weight_kg ?? "—"} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Height</p>
            <p className="font-medium">{initialProfile.height_cm ?? "—"} cm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calorie Target</p>
            <p className="font-medium">{initialProfile.calorie_target ?? "—"} kcal</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Activity Level</p>
            <p className="font-medium capitalize">{String(initialProfile.activity_level ?? "").replace("_", " ") || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Goal</p>
            <p className="font-medium capitalize">{String(initialProfile.primary_goal ?? "").replace("_", " ") || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Meals per Day</p>
            <p className="font-medium">{initialProfile.meals_per_day ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cooking Skill</p>
            <p className="font-medium capitalize">{initialProfile.cooking_skill ?? "—"}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Full name</Label>
            <Input value={form.full_name ?? ""} onChange={(e) => updateField("full_name", e.target.value)} />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={form.username ?? ""} onChange={(e) => updateField("username", e.target.value)} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={form.age ?? ""} onChange={(e) => updateField("age", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={form.weight_kg ?? ""} onChange={(e) => updateField("weight_kg", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={form.height_cm ?? ""} onChange={(e) => updateField("height_cm", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <Label>Calorie Target (kcal)</Label>
            <Input type="number" value={form.calorie_target ?? ""} onChange={(e) => updateField("calorie_target", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <Label>Activity Level</Label>
            <Select value={String(form.activity_level ?? "")} onValueChange={(v) => updateField("activity_level", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="lightly_active">Lightly active</SelectItem>
                <SelectItem value="moderately_active">Moderately active</SelectItem>
                <SelectItem value="very_active">Very active</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Goal</Label>
            <Select value={String(form.primary_goal ?? "")} onValueChange={(v) => updateField("primary_goal", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintain_weight">Maintain weight</SelectItem>
                <SelectItem value="lose_weight">Lose weight</SelectItem>
                <SelectItem value="gain_weight">Gain weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Meals per day</Label>
            <Input type="number" value={form.meals_per_day ?? ""} onChange={(e) => updateField("meals_per_day", e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div>
            <Label>Cooking skill</Label>
            <Select value={String(form.cooking_skill ?? "")} onValueChange={(v) => updateField("cooking_skill", v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setEditing(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
          {error && <p className="text-sm text-destructive col-span-full">{error}</p>}
        </form>
      )}
    </div>
  );
}
