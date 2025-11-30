import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// GET - Get all checked (owned) ingredients from active shopping lists
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;

    // Get all checked items from active grocery lists
    const { data: lists, error } = await supabase
      .from("grocery_lists")
      .select(`
        grocery_list_items (
          item_name,
          is_checked
        )
      `)
      .eq("user_id", userId)
      .in("status", ["active", "draft"]);

    if (error) {
      console.error("Error fetching owned ingredients:", error);
      return Response.json({ error: "Failed to fetch" }, { status: 500 });
    }

    // Extract unique checked ingredient names
    const ownedIngredients = new Set<string>();

    for (const list of lists || []) {
      for (const item of list.grocery_list_items || []) {
        if (item.is_checked) {
          // Normalize ingredient name (lowercase, trim)
          ownedIngredients.add(item.item_name.toLowerCase().trim());
        }
      }
    }

    return Response.json({
      ownedIngredients: Array.from(ownedIngredients)
    });
  } catch (error) {
    console.error("Error in owned-ingredients API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
