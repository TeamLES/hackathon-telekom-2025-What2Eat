import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return Response.json({ error: "Missing item id" }, { status: 400 });
    }

    // First verify the item belongs to the user
    const { data: mealPlanItem, error: fetchError } = await supabase
      .from("meal_plan_items")
      .select(`
        id,
        meal_plan_id,
        meal_plans!inner (
          user_id
        )
      `)
      .eq("id", parseInt(itemId))
      .single();

    if (fetchError || !mealPlanItem) {
      return Response.json({ error: "Meal not found" }, { status: 404 });
    }

    // Check ownership
    const mealPlan = mealPlanItem.meal_plans as unknown as { user_id: string };
    if (mealPlan.user_id !== authData.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the meal plan item
    const { error: deleteError } = await supabase
      .from("meal_plan_items")
      .delete()
      .eq("id", parseInt(itemId));

    if (deleteError) {
      console.error("Error deleting meal plan item:", deleteError);
      return Response.json({ error: "Failed to delete meal" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE meal-plan-item:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
