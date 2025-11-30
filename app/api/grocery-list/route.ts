import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export interface GroceryListRequest {
  title: string;
  forDate?: string;
  mealPlanId?: number;
  items: {
    name: string;
    quantity: number | null;
    unit: string | null;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GroceryListRequest = await req.json();
    const userId = authData.user.id;

    const { data: groceryList, error: listError } = await supabase
      .from("grocery_lists")
      .insert({
        user_id: userId,
        title: body.title,
        status: "active",
        for_date_range: body.forDate
          ? `[${body.forDate},${body.forDate}]`
          : null,
        created_from_meal_plan_id: body.mealPlanId || null,
      })
      .select("id")
      .single();

    if (listError || !groceryList) {
      console.error("Error creating grocery list:", listError);
      return Response.json({ error: "Failed to create grocery list" }, { status: 500 });
    }

    if (body.items.length > 0) {
      const itemsToInsert = body.items.map((item) => ({
        grocery_list_id: groceryList.id,
        item_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        is_checked: false,
      }));

      const { error: itemsError } = await supabase
        .from("grocery_list_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error inserting items:", itemsError);
      }
    }

    return Response.json({
      success: true,
      groceryListId: groceryList.id,
      itemCount: body.items.length,
    });
  } catch (error) {
    console.error("Error in grocery-list API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;

    const { data: lists, error } = await supabase
      .from("grocery_lists")
      .select(`
        id,
        title,
        status,
        for_date_range,
        created_at,
        grocery_list_items (
          id,
          item_name,
          quantity,
          unit,
          is_checked
        )
      `)
      .eq("user_id", userId)
      .in("status", ["active", "draft"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching grocery lists:", error);
      return Response.json({ error: "Failed to fetch grocery lists" }, { status: 500 });
    }

    return Response.json({ lists: lists || [] });
  } catch (error) {
    console.error("Error in grocery-list GET:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "toggle-item" && body.itemId) {
      const { data: item, error: fetchError } = await supabase
        .from("grocery_list_items")
        .select("is_checked")
        .eq("id", body.itemId)
        .single();

      if (fetchError) {
        return Response.json({ error: "Item not found" }, { status: 404 });
      }

      const { error: updateError } = await supabase
        .from("grocery_list_items")
        .update({ is_checked: !item.is_checked })
        .eq("id", body.itemId);

      if (updateError) {
        return Response.json({ error: "Failed to update item" }, { status: 500 });
      }

      return Response.json({ success: true, checked: !item.is_checked });
    }

    if (body.action === "complete-list" && body.listId) {
      const { error } = await supabase
        .from("grocery_lists")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", body.listId);

      if (error) {
        return Response.json({ error: "Failed to complete list" }, { status: 500 });
      }

      return Response.json({ success: true });
    }

    if (body.action === "delete-list" && body.listId) {
      const { error } = await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", body.listId);

      if (error) {
        return Response.json({ error: "Failed to delete list" }, { status: 500 });
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in grocery-list PATCH:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
