"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GroceryItem {
  id: number;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  is_checked: boolean;
}

interface GroceryList {
  id: number;
  title: string;
  status: string;
  for_date_range: string | null;
  created_at: string;
  grocery_list_items: GroceryItem[];
}

export function ShoppingList() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedListId, setExpandedListId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/grocery-list");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setLists(data.lists || []);
      // Auto-expand first list if exists
      if (data.lists?.length > 0 && !expandedListId) {
        setExpandedListId(data.lists[0].id);
      }
    } catch (err) {
      console.error("Error fetching grocery lists:", err);
      setError("Failed to load shopping lists");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = async (listId: number, itemId: number) => {
    try {
      const response = await fetch("/api/grocery-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-item", itemId }),
      });

      if (!response.ok) throw new Error("Failed to toggle");

      // Update local state
      setLists((prev) =>
        prev.map((list) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            grocery_list_items: list.grocery_list_items.map((item) =>
              item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
            ),
          };
        })
      );
    } catch (err) {
      console.error("Error toggling item:", err);
    }
  };

  const deleteList = async (listId: number) => {
    try {
      const response = await fetch("/api/grocery-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-list", listId }),
      });

      if (!response.ok) throw new Error("Failed to delete");

      setLists((prev) => prev.filter((list) => list.id !== listId));
    } catch (err) {
      console.error("Error deleting list:", err);
    }
  };

  const completeList = async (listId: number) => {
    try {
      const response = await fetch("/api/grocery-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete-list", listId }),
      });

      if (!response.ok) throw new Error("Failed to complete");

      setLists((prev) => prev.filter((list) => list.id !== listId));
    } catch (err) {
      console.error("Error completing list:", err);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (lists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Lists
          </CardTitle>
          <CardDescription>Your shopping lists will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-sm text-muted-foreground">
              No active shopping lists.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use &quot;What ingredients do I need?&quot; to create one!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping Lists
        </CardTitle>
        <CardDescription>
          {lists.length} active list{lists.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lists.map((list) => {
          const isExpanded = expandedListId === list.id;
          const checkedCount = list.grocery_list_items.filter((i) => i.is_checked).length;
          const totalCount = list.grocery_list_items.length;
          const allChecked = checkedCount === totalCount && totalCount > 0;

          return (
            <div key={list.id} className="border rounded-lg overflow-hidden">
              {/* List Header */}
              <button
                onClick={() => setExpandedListId(isExpanded ? null : list.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  <div className="text-left">
                    <p className="font-medium">{list.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {checkedCount}/{totalCount} items checked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {allChecked && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                      Complete!
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Items List */}
              {isExpanded && (
                <div className="border-t">
                  <div className="max-h-64 overflow-y-auto">
                    {list.grocery_list_items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(list.id, item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors border-b last:border-b-0",
                          item.is_checked && "bg-muted/20"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            item.is_checked
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground"
                          )}
                        >
                          {item.is_checked && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span
                          className={cn(
                            "flex-1 text-left text-sm",
                            item.is_checked && "line-through text-muted-foreground"
                          )}
                        >
                          {item.item_name}
                        </span>
                        {(item.quantity || item.unit) && (
                          <span className="text-xs text-muted-foreground">
                            {item.quantity && item.quantity}
                            {item.unit && ` ${item.unit}`}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 p-3 border-t bg-muted/30">
                    {allChecked ? (
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => completeList(list.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Done
                      </Button>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteList(list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
