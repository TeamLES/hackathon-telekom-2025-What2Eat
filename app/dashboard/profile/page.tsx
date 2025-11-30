"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccountTab,
  DietTab,
  LifestyleTab,
  SettingsTab,
  ProfileData,
  LookupData,
} from "@/components/profile";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editForm, setEditForm] = useState<ProfileData | null>(null);

  const [lookupData, setLookupData] = useState<LookupData>({
    cuisines: [],
    dietaryOptions: [],
    equipmentOptions: [],
    mealTypePresets: [],
    flavorProfiles: [],
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const [cuisinesRes, dietaryRes, equipmentRes, mealTypesRes, flavorsRes] =
        await Promise.all([
          supabase.from("cuisines").select("id, name").order("name"),
          supabase
            .from("dietary_restrictions")
            .select("id, label")
            .order("label"),
          supabase.from("kitchen_equipment").select("id, label").order("label"),
          supabase.from("meal_type_presets").select("id, label").order("id"),
          supabase.from("flavor_profiles").select("id, label").order("id"),
        ]);

      setLookupData({
        cuisines: cuisinesRes.data ?? [],
        dietaryOptions: dietaryRes.data ?? [],
        equipmentOptions: equipmentRes.data ?? [],
        mealTypePresets: mealTypesRes.data ?? [],
        flavorProfiles: flavorsRes.data ?? [],
      });

      const [
        profileRes,
        nutritionRes,
        favCuisinesRes,
        dietRestrictionsRes,
        kitchenEquipRes,
        preferencesRes,
        mealTypesPrefsRes,
        flavorPrefsRes,
        foodDislikesRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", user.id)
          .single(),
        supabase
          .from("nutrition_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_favorite_cuisines")
          .select("cuisine_id")
          .eq("user_id", user.id),
        supabase
          .from("user_dietary_restrictions")
          .select("restriction_id")
          .eq("user_id", user.id),
        supabase
          .from("user_kitchen_equipment")
          .select("equipment_id")
          .eq("user_id", user.id),
        supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_preferred_meal_types")
          .select("meal_type_id")
          .eq("user_id", user.id),
        supabase
          .from("user_flavor_preferences")
          .select("flavor_id")
          .eq("user_id", user.id),
        supabase
          .from("user_food_dislikes")
          .select("food_name")
          .eq("user_id", user.id),
      ]);

      const profileData: ProfileData = {
        email: user.email || "",
        full_name: profileRes.data?.full_name ?? null,
        username: profileRes.data?.username ?? null,
        gender: nutritionRes.data?.gender ?? null,
        age: nutritionRes.data?.age ?? null,
        height_cm: nutritionRes.data?.height_cm ?? null,
        weight_kg: nutritionRes.data?.weight_kg ?? null,
        activity_level: nutritionRes.data?.activity_level ?? null,
        primary_goal: nutritionRes.data?.primary_goal ?? null,
        calorie_target: nutritionRes.data?.calorie_target ?? null,
        is_calorie_target_manual:
          nutritionRes.data?.is_calorie_target_manual ?? false,
        protein_target_g: nutritionRes.data?.protein_target_g ?? null,
        is_protein_target_manual:
          nutritionRes.data?.is_protein_target_manual ?? false,
        carbs_target_g: nutritionRes.data?.carbs_target_g ?? null,
        is_carbs_target_manual:
          nutritionRes.data?.is_carbs_target_manual ?? false,
        fat_target_g: nutritionRes.data?.fat_target_g ?? null,
        is_fat_target_manual:
          nutritionRes.data?.is_fat_target_manual ?? false,
        meals_per_day: nutritionRes.data?.meals_per_day ?? null,
        budget_level: nutritionRes.data?.budget_level ?? null,
        cooking_skill: nutritionRes.data?.cooking_skill ?? null,
        is_morning_person: nutritionRes.data?.is_morning_person ?? false,
        is_night_person: nutritionRes.data?.is_night_person ?? false,
        usually_rushed_mornings:
          nutritionRes.data?.usually_rushed_mornings ?? false,
        breakfast_heavy: nutritionRes.data?.breakfast_heavy ?? false,
        lunch_heavy: nutritionRes.data?.lunch_heavy ?? false,
        dinner_heavy: nutritionRes.data?.dinner_heavy ?? false,
        snacks_included: nutritionRes.data?.snacks_included ?? false,
        snacks_often: nutritionRes.data?.snacks_often ?? false,
        other_allergy_notes: nutritionRes.data?.other_allergy_notes ?? null,
        favorite_cuisines: favCuisinesRes.data?.map((r: { cuisine_id: number }) => r.cuisine_id) ?? [],
        dietary_restrictions:
          dietRestrictionsRes.data?.map((r: { restriction_id: number }) => r.restriction_id) ?? [],
        kitchen_equipment:
          kitchenEquipRes.data?.map((r: { equipment_id: number }) => r.equipment_id) ?? [],
        preferred_meal_types:
          mealTypesPrefsRes.data?.map((r: { meal_type_id: number }) => r.meal_type_id) ?? [],
        flavor_preferences:
          flavorPrefsRes.data?.map((r: { flavor_id: number }) => r.flavor_id) ?? [],
        food_dislikes:
          foodDislikesRes.data?.map((r: { food_name: string }) => r.food_name) ?? [],
        ai_tone: preferencesRes.data?.ai_tone ?? null,
        focus_priorities: preferencesRes.data?.focus_priorities ?? [],
        allow_meal_notifications:
          preferencesRes.data?.allow_meal_notifications ?? true,
        allow_grocery_notifications:
          preferencesRes.data?.allow_grocery_notifications ?? true,
        allow_macro_notifications:
          preferencesRes.data?.allow_macro_notifications ?? true,
        max_cooking_time_minutes:
          preferencesRes.data?.max_cooking_time_minutes ?? null,
        chooses_based_on_mood:
          preferencesRes.data?.chooses_based_on_mood ?? false,
        chooses_based_on_time:
          preferencesRes.data?.chooses_based_on_time ?? true,
        chooses_based_on_convenience:
          preferencesRes.data?.chooses_based_on_convenience ?? true,
      };

      setProfile(profileData);
      setEditForm(profileData);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!editForm) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        setError("Not authenticated");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      const { error: nutritionError } = await supabase
        .from("nutrition_profiles")
        .upsert({
          user_id: userId,
          gender: editForm.gender,
          age: editForm.age,
          height_cm: editForm.height_cm,
          weight_kg: editForm.weight_kg,
          activity_level: editForm.activity_level,
          primary_goal: editForm.primary_goal,
          calorie_target: editForm.calorie_target,
          is_calorie_target_manual: editForm.is_calorie_target_manual,
          protein_target_g: editForm.protein_target_g,
          is_protein_target_manual: editForm.is_protein_target_manual,
          carbs_target_g: editForm.carbs_target_g,
          is_carbs_target_manual: editForm.is_carbs_target_manual,
          fat_target_g: editForm.fat_target_g,
          is_fat_target_manual: editForm.is_fat_target_manual,
          meals_per_day: editForm.meals_per_day,
          budget_level: editForm.budget_level,
          cooking_skill: editForm.cooking_skill,
          is_morning_person: editForm.is_morning_person,
          is_night_person: editForm.is_night_person,
          usually_rushed_mornings: editForm.usually_rushed_mornings,
          breakfast_heavy: editForm.breakfast_heavy,
          lunch_heavy: editForm.lunch_heavy,
          dinner_heavy: editForm.dinner_heavy,
          snacks_included: editForm.snacks_included,
          snacks_often: editForm.snacks_often,
          other_allergy_notes: editForm.other_allergy_notes,
          updated_at: new Date().toISOString(),
        });

      if (nutritionError) throw nutritionError;

      await supabase
        .from("user_favorite_cuisines")
        .delete()
        .eq("user_id", userId);

      if (editForm.favorite_cuisines.length > 0) {
        const cuisineRows = editForm.favorite_cuisines.map((cuisine_id: number) => ({
          user_id: userId,
          cuisine_id,
        }));
        const { error: cuisineError } = await supabase
          .from("user_favorite_cuisines")
          .insert(cuisineRows);
        if (cuisineError) throw cuisineError;
      }

      await supabase
        .from("user_dietary_restrictions")
        .delete()
        .eq("user_id", userId);

      if (editForm.dietary_restrictions.length > 0) {
        const restrictionRows = editForm.dietary_restrictions.map(
          (restriction_id: number) => ({
            user_id: userId,
            restriction_id,
          })
        );
        const { error: restrictionError } = await supabase
          .from("user_dietary_restrictions")
          .insert(restrictionRows);
        if (restrictionError) throw restrictionError;
      }

      await supabase
        .from("user_kitchen_equipment")
        .delete()
        .eq("user_id", userId);

      if (editForm.kitchen_equipment.length > 0) {
        const equipmentRows = editForm.kitchen_equipment.map((equipment_id: number) => ({
          user_id: userId,
          equipment_id,
        }));
        const { error: equipmentError } = await supabase
          .from("user_kitchen_equipment")
          .insert(equipmentRows);
        if (equipmentError) throw equipmentError;
      }

      await supabase
        .from("user_preferred_meal_types")
        .delete()
        .eq("user_id", userId);

      if (editForm.preferred_meal_types.length > 0) {
        const mealTypeRows = editForm.preferred_meal_types.map(
          (meal_type_id: number) => ({
            user_id: userId,
            meal_type_id,
          })
        );
        const { error: mealTypeError } = await supabase
          .from("user_preferred_meal_types")
          .insert(mealTypeRows);
        if (mealTypeError) throw mealTypeError;
      }

      await supabase
        .from("user_flavor_preferences")
        .delete()
        .eq("user_id", userId);

      if (editForm.flavor_preferences.length > 0) {
        const flavorRows = editForm.flavor_preferences.map((flavor_id: number) => ({
          user_id: userId,
          flavor_id,
        }));
        const { error: flavorError } = await supabase
          .from("user_flavor_preferences")
          .insert(flavorRows);
        if (flavorError) throw flavorError;
      }

      await supabase.from("user_food_dislikes").delete().eq("user_id", userId);

      if (editForm.food_dislikes.length > 0) {
        const dislikeRows = editForm.food_dislikes.map((food_name: string) => ({
          user_id: userId,
          food_name,
        }));
        const { error: dislikeError } = await supabase
          .from("user_food_dislikes")
          .insert(dislikeRows);
        if (dislikeError) throw dislikeError;
      }

      const { error: preferencesError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          ai_tone: editForm.ai_tone,
          focus_priorities:
            editForm.focus_priorities.length > 0
              ? editForm.focus_priorities
              : null,
          allow_meal_notifications: editForm.allow_meal_notifications,
          allow_grocery_notifications: editForm.allow_grocery_notifications,
          allow_macro_notifications: editForm.allow_macro_notifications,
          max_cooking_time_minutes: editForm.max_cooking_time_minutes,
          chooses_based_on_mood: editForm.chooses_based_on_mood,
          chooses_based_on_time: editForm.chooses_based_on_time,
          chooses_based_on_convenience: editForm.chooses_based_on_convenience,
          updated_at: new Date().toISOString(),
        });

      if (preferencesError) throw preferencesError;

      setProfile(editForm);
      setIsEditing(false);
      setSuccessMessage("Profile saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditForm(profile);
    setIsEditing(false);
    setError(null);
  }

  function updateFieldAction<K extends keyof ProfileData>(
    key: K,
    value: ProfileData[K]
  ) {
    setEditForm((prev: ProfileData | null) => (prev ? { ...prev, [key]: value } : null));
  }

  function toggleArrayFieldAction(
    key:
      | "favorite_cuisines"
      | "dietary_restrictions"
      | "kitchen_equipment"
      | "preferred_meal_types"
      | "flavor_preferences",
    id: number
  ) {
    if (!editForm) return;
    const current = editForm[key];
    const updated = current.includes(id)
      ? current.filter((item: number) => item !== id)
      : [...current, id];
    updateFieldAction(key, updated);
  }

  function togglePriorityAction(priority: string) {
    if (!editForm) return;
    const current = editForm.focus_priorities;
    const updated = current.includes(priority)
      ? current.filter((p: string) => p !== priority)
      : [...current, priority];
    updateFieldAction("focus_priorities", updated);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile || !editForm) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="account" className="text-xs sm:text-sm px-1 sm:px-3">👤 Account</TabsTrigger>
          <TabsTrigger value="diet" className="text-xs sm:text-sm px-1 sm:px-3">🥗 Diet</TabsTrigger>
          <TabsTrigger value="lifestyle" className="text-xs sm:text-sm px-1 sm:px-3">⏰ Lifestyle</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-3">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountTab
            profile={profile}
            editForm={editForm}
            isEditing={isEditing}
            updateFieldAction={updateFieldAction}
          />
        </TabsContent>

        <TabsContent value="diet" className="mt-6">
          <DietTab
            profile={profile}
            editForm={editForm}
            isEditing={isEditing}
            lookupData={lookupData}
            updateFieldAction={updateFieldAction}
            toggleArrayFieldAction={toggleArrayFieldAction}
          />
        </TabsContent>

        <TabsContent value="lifestyle" className="mt-6">
          <LifestyleTab
            profile={profile}
            editForm={editForm}
            isEditing={isEditing}
            lookupData={lookupData}
            updateFieldAction={updateFieldAction}
            toggleArrayFieldAction={toggleArrayFieldAction}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab
            profile={profile}
            editForm={editForm}
            isEditing={isEditing}
            updateFieldAction={updateFieldAction}
            togglePriorityAction={togglePriorityAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
