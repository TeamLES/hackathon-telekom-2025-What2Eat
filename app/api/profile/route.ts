import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ProfilePayload = {
  // profiles
  full_name?: string | null;
  username?: string | null;

  // nutrition_profiles
  gender?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  activity_level?: string | null;
  is_morning_person?: boolean | null;
  usually_rushed_mornings?: boolean | null;
  primary_goal?: string | null;
  calorie_target?: number | null;
  protein_target_g?: number | null;
  meals_per_day?: number | null;
  budget_level?: string | null;
  cooking_skill?: string | null;
  snacks_included?: boolean | null;
  snacks_often?: boolean | null;

  // relations (arrays of ids)
  favorite_cuisines?: number[] | null;
  dietary_restrictions?: number[] | null;
  kitchen_equipment?: number[] | null;

  // preferences
  ai_tone?: string | null;
  focus_priorities?: string[] | null;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body: ProfilePayload = await req.json();

  try {
    // 0) Update profiles table (full_name / username)
    if (body.full_name !== undefined || body.username !== undefined) {
      const update: any = {};
      if (body.full_name !== undefined) update.full_name = body.full_name;
      if (body.username !== undefined) update.username = body.username;

      const { error: pError } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", user.id);

      if (pError) throw pError;
    }

    // 1) Upsert nutrition_profiles
    const npayload: any = {
      user_id: user.id,
      gender: body.gender ?? null,
      age: body.age ?? null,
      height_cm: body.height_cm ?? null,
      weight_kg: body.weight_kg ?? null,
      activity_level: body.activity_level ?? null,
      is_morning_person: body.is_morning_person ?? null,
      usually_rushed_mornings: body.usually_rushed_mornings ?? null,
      primary_goal: body.primary_goal ?? null,
      calorie_target: body.calorie_target ?? null,
      protein_target_g: body.protein_target_g ?? null,
      meals_per_day: body.meals_per_day ?? null,
      budget_level: body.budget_level ?? null,
      cooking_skill: body.cooking_skill ?? null,
      snacks_included: body.snacks_included ?? null,
      snacks_often: body.snacks_often ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: npData, error: npError } = await supabase
      .from("nutrition_profiles")
      .upsert(npayload, { onConflict: "user_id" })
      .select()
      .single();

    if (npError) throw npError;

    // 2) Relations: favorite_cuisines, dietary_restrictions, kitchen_equipment
    if (Array.isArray(body.favorite_cuisines)) {
      await supabase.from("user_favorite_cuisines").delete().eq("user_id", user.id);
      if (body.favorite_cuisines.length > 0) {
        const rows = body.favorite_cuisines.map((c) => ({ user_id: user.id, cuisine_id: c }));
        const { error: fcError } = await supabase.from("user_favorite_cuisines").insert(rows);
        if (fcError) throw fcError;
      }
    }

    if (Array.isArray(body.dietary_restrictions)) {
      await supabase.from("user_dietary_restrictions").delete().eq("user_id", user.id);
      if (body.dietary_restrictions.length > 0) {
        const rows = body.dietary_restrictions.map((r) => ({ user_id: user.id, restriction_id: r }));
        const { error: drError } = await supabase.from("user_dietary_restrictions").insert(rows);
        if (drError) throw drError;
      }
    }

    if (Array.isArray(body.kitchen_equipment)) {
      await supabase.from("user_kitchen_equipment").delete().eq("user_id", user.id);
      if (body.kitchen_equipment.length > 0) {
        const rows = body.kitchen_equipment.map((e) => ({ user_id: user.id, equipment_id: e }));
        const { error: keError } = await supabase.from("user_kitchen_equipment").insert(rows);
        if (keError) throw keError;
      }
    }

    // 3) user_preferences
    if (body.ai_tone !== undefined || Array.isArray(body.focus_priorities)) {
      const upayload: any = { user_id: user.id };
      if (body.ai_tone !== undefined) upayload.ai_tone = body.ai_tone ?? null;
      if (Array.isArray(body.focus_priorities)) upayload.focus_priorities = body.focus_priorities.length > 0 ? body.focus_priorities : null;

      const { error: upError } = await supabase.from("user_preferences").upsert(upayload);
      if (upError) throw upError;
    }

    return NextResponse.json({ profile: npData });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
