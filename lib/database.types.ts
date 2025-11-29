export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cuisines: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      daily_nutrition_logs: {
        Row: {
          calories_consumed: number | null
          carbs_g: number | null
          created_at: string | null
          fat_g: number | null
          id: number
          log_date: string
          protein_g: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          id?: number
          log_date: string
          protein_g?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories_consumed?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          id?: number
          log_date?: string
          protein_g?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dietary_restrictions: {
        Row: {
          code: string
          id: number
          label: string
        }
        Insert: {
          code: string
          id?: number
          label: string
        }
        Update: {
          code?: string
          id?: number
          label?: string
        }
        Relationships: []
      }
      flavor_profiles: {
        Row: {
          code: string
          id: number
          label: string
        }
        Insert: {
          code: string
          id?: number
          label: string
        }
        Update: {
          code?: string
          id?: number
          label?: string
        }
        Relationships: []
      }
      fridge_snapshot_items: {
        Row: {
          confidence: number | null
          created_at: string | null
          detected_name: string
          id: number
          ingredient_id: number | null
          matched_pantry_item_id: number | null
          snapshot_id: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          detected_name: string
          id?: number
          ingredient_id?: number | null
          matched_pantry_item_id?: number | null
          snapshot_id: number
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          detected_name?: string
          id?: number
          ingredient_id?: number | null
          matched_pantry_item_id?: number | null
          snapshot_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fridge_snapshot_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fridge_snapshot_items_matched_pantry_item_id_fkey"
            columns: ["matched_pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fridge_snapshot_items_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "fridge_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      fridge_snapshots: {
        Row: {
          bucket_id: string
          created_at: string | null
          detected_raw: Json | null
          id: number
          object_path: string
          user_id: string
        }
        Insert: {
          bucket_id?: string
          created_at?: string | null
          detected_raw?: Json | null
          id?: number
          object_path: string
          user_id: string
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          detected_raw?: Json | null
          id?: number
          object_path?: string
          user_id?: string
        }
        Relationships: []
      }
      grocery_list_items: {
        Row: {
          created_at: string | null
          grocery_list_id: number
          id: number
          ingredient_id: number | null
          is_checked: boolean | null
          item_name: string
          pantry_item_id: number | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          grocery_list_id: number
          id?: number
          ingredient_id?: number | null
          is_checked?: boolean | null
          item_name: string
          pantry_item_id?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          grocery_list_id?: number
          id?: number
          ingredient_id?: number | null
          is_checked?: boolean | null
          item_name?: string
          pantry_item_id?: number | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_list_items_grocery_list_id_fkey"
            columns: ["grocery_list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_list_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_list_items_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string | null
          created_from_meal_plan_id: number | null
          for_date_range: unknown
          id: number
          status: Database["public"]["Enums"]["grocery_list_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_from_meal_plan_id?: number | null
          for_date_range?: unknown
          id?: number
          status?: Database["public"]["Enums"]["grocery_list_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_from_meal_plan_id?: number | null
          for_date_range?: unknown
          id?: number
          status?: Database["public"]["Enums"]["grocery_list_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_created_from_meal_plan_id_fkey"
            columns: ["created_from_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          default_unit: string | null
          id: number
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_unit?: string | null
          id?: number
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_unit?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      kitchen_equipment: {
        Row: {
          code: string
          id: number
          label: string
        }
        Insert: {
          code: string
          id?: number
          label: string
        }
        Update: {
          code?: string
          id?: number
          label?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string | null
          id: number
          meal_plan_id: number
          meal_type: Database["public"]["Enums"]["meal_type"]
          position: number | null
          recipe_id: number | null
          servings: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          meal_plan_id: number
          meal_type: Database["public"]["Enums"]["meal_type"]
          position?: number | null
          recipe_id?: number | null
          servings?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          meal_plan_id?: number
          meal_type?: Database["public"]["Enums"]["meal_type"]
          position?: number | null
          recipe_id?: number | null
          servings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          id: number
          plan_date: string
          protein_planned_g: number | null
          protein_target_g: number | null
          total_calories_planned: number | null
          total_calories_target: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          plan_date: string
          protein_planned_g?: number | null
          protein_target_g?: number | null
          total_calories_planned?: number | null
          total_calories_target?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          plan_date?: string
          protein_planned_g?: number | null
          protein_target_g?: number | null
          total_calories_planned?: number | null
          total_calories_target?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_type_presets: {
        Row: {
          code: string
          id: number
          label: string
        }
        Insert: {
          code: string
          id?: number
          label: string
        }
        Update: {
          code?: string
          id?: number
          label?: string
        }
        Relationships: []
      }
      nutrition_profiles: {
        Row: {
          activity_level:
            | Database["public"]["Enums"]["activity_level_type"]
            | null
          age: number | null
          breakfast_heavy: boolean | null
          budget_level: Database["public"]["Enums"]["budget_level_type"] | null
          calorie_target: number | null
          cooking_skill:
            | Database["public"]["Enums"]["cooking_skill_level"]
            | null
          created_at: string | null
          dinner_heavy: boolean | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          height_cm: number | null
          is_calorie_target_manual: boolean | null
          is_morning_person: boolean | null
          is_night_person: boolean | null
          is_protein_target_manual: boolean | null
          lunch_heavy: boolean | null
          meals_per_day: number | null
          other_allergy_notes: string | null
          primary_goal: Database["public"]["Enums"]["goal_type"] | null
          protein_target_g: number | null
          snacks_included: boolean | null
          snacks_often: boolean | null
          updated_at: string | null
          user_id: string
          usually_rushed_mornings: boolean | null
          weight_kg: number | null
        }
        Insert: {
          activity_level?:
            | Database["public"]["Enums"]["activity_level_type"]
            | null
          age?: number | null
          breakfast_heavy?: boolean | null
          budget_level?: Database["public"]["Enums"]["budget_level_type"] | null
          calorie_target?: number | null
          cooking_skill?:
            | Database["public"]["Enums"]["cooking_skill_level"]
            | null
          created_at?: string | null
          dinner_heavy?: boolean | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          is_calorie_target_manual?: boolean | null
          is_morning_person?: boolean | null
          is_night_person?: boolean | null
          is_protein_target_manual?: boolean | null
          lunch_heavy?: boolean | null
          meals_per_day?: number | null
          other_allergy_notes?: string | null
          primary_goal?: Database["public"]["Enums"]["goal_type"] | null
          protein_target_g?: number | null
          snacks_included?: boolean | null
          snacks_often?: boolean | null
          updated_at?: string | null
          user_id: string
          usually_rushed_mornings?: boolean | null
          weight_kg?: number | null
        }
        Update: {
          activity_level?:
            | Database["public"]["Enums"]["activity_level_type"]
            | null
          age?: number | null
          breakfast_heavy?: boolean | null
          budget_level?: Database["public"]["Enums"]["budget_level_type"] | null
          calorie_target?: number | null
          cooking_skill?:
            | Database["public"]["Enums"]["cooking_skill_level"]
            | null
          created_at?: string | null
          dinner_heavy?: boolean | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          height_cm?: number | null
          is_calorie_target_manual?: boolean | null
          is_morning_person?: boolean | null
          is_night_person?: boolean | null
          is_protein_target_manual?: boolean | null
          lunch_heavy?: boolean | null
          meals_per_day?: number | null
          other_allergy_notes?: string | null
          primary_goal?: Database["public"]["Enums"]["goal_type"] | null
          protein_target_g?: number | null
          snacks_included?: boolean | null
          snacks_often?: boolean | null
          updated_at?: string | null
          user_id?: string
          usually_rushed_mornings?: boolean | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: number
          ingredient_id: number | null
          name: string
          quantity: number | null
          unit: string | null
          updated_at: string | null
          user_id: string
          usually_have: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          ingredient_id?: number | null
          name: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
          usually_have?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          ingredient_id?: number | null
          name?: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          usually_have?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pantry_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: number
          ingredient_id: number | null
          ingredient_name: string
          pantry_item_id: number | null
          quantity: number | null
          recipe_id: number
          unit: string | null
        }
        Insert: {
          id?: number
          ingredient_id?: number | null
          ingredient_name: string
          pantry_item_id?: number | null
          quantity?: number | null
          recipe_id: number
          unit?: string | null
        }
        Update: {
          id?: number
          ingredient_id?: number | null
          ingredient_name?: string
          pantry_item_id?: number | null
          quantity?: number | null
          recipe_id?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_pantry_item_id_fkey"
            columns: ["pantry_item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          carbs_g: number | null
          cook_time_minutes: number | null
          created_at: string | null
          cuisine_id: number | null
          description: string | null
          difficulty: Database["public"]["Enums"]["cooking_skill_level"] | null
          fat_g: number | null
          id: number
          is_public: boolean | null
          protein_g: number | null
          source: Database["public"]["Enums"]["recipe_source_type"]
          title: string
          total_calories: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          carbs_g?: number | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine_id?: number | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["cooking_skill_level"] | null
          fat_g?: number | null
          id?: number
          is_public?: boolean | null
          protein_g?: number | null
          source?: Database["public"]["Enums"]["recipe_source_type"]
          title: string
          total_calories?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          carbs_g?: number | null
          cook_time_minutes?: number | null
          created_at?: string | null
          cuisine_id?: number | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["cooking_skill_level"] | null
          fat_g?: number | null
          id?: number
          is_public?: boolean | null
          protein_g?: number | null
          source?: Database["public"]["Enums"]["recipe_source_type"]
          title?: string
          total_calories?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dietary_restrictions: {
        Row: {
          restriction_id: number
          user_id: string
        }
        Insert: {
          restriction_id: number
          user_id: string
        }
        Update: {
          restriction_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dietary_restrictions_restriction_id_fkey"
            columns: ["restriction_id"]
            isOneToOne: false
            referencedRelation: "dietary_restrictions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_cuisines: {
        Row: {
          cuisine_id: number
          user_id: string
        }
        Insert: {
          cuisine_id: number
          user_id: string
        }
        Update: {
          cuisine_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_cuisines_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flavor_preferences: {
        Row: {
          flavor_id: number
          user_id: string
        }
        Insert: {
          flavor_id: number
          user_id: string
        }
        Update: {
          flavor_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flavor_preferences_flavor_id_fkey"
            columns: ["flavor_id"]
            isOneToOne: false
            referencedRelation: "flavor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_food_dislikes: {
        Row: {
          created_at: string | null
          food_name: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          food_name: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          food_name?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_kitchen_equipment: {
        Row: {
          equipment_id: number
          user_id: string
        }
        Insert: {
          equipment_id: number
          user_id: string
        }
        Update: {
          equipment_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_kitchen_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "kitchen_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_tone: Database["public"]["Enums"]["ai_tone_type"] | null
          allow_grocery_notifications: boolean | null
          allow_macro_notifications: boolean | null
          allow_meal_notifications: boolean | null
          chooses_based_on_convenience: boolean | null
          chooses_based_on_mood: boolean | null
          chooses_based_on_time: boolean | null
          created_at: string | null
          focus_priorities:
            | Database["public"]["Enums"]["focus_priority_type"][]
            | null
          max_cooking_time_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_tone?: Database["public"]["Enums"]["ai_tone_type"] | null
          allow_grocery_notifications?: boolean | null
          allow_macro_notifications?: boolean | null
          allow_meal_notifications?: boolean | null
          chooses_based_on_convenience?: boolean | null
          chooses_based_on_mood?: boolean | null
          chooses_based_on_time?: boolean | null
          created_at?: string | null
          focus_priorities?:
            | Database["public"]["Enums"]["focus_priority_type"][]
            | null
          max_cooking_time_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_tone?: Database["public"]["Enums"]["ai_tone_type"] | null
          allow_grocery_notifications?: boolean | null
          allow_macro_notifications?: boolean | null
          allow_meal_notifications?: boolean | null
          chooses_based_on_convenience?: boolean | null
          chooses_based_on_mood?: boolean | null
          chooses_based_on_time?: boolean | null
          created_at?: string | null
          focus_priorities?:
            | Database["public"]["Enums"]["focus_priority_type"][]
            | null
          max_cooking_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferred_meal_types: {
        Row: {
          meal_type_id: number
          user_id: string
        }
        Insert: {
          meal_type_id: number
          user_id: string
        }
        Update: {
          meal_type_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferred_meal_types_meal_type_id_fkey"
            columns: ["meal_type_id"]
            isOneToOne: false
            referencedRelation: "meal_type_presets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_level_type:
        | "sedentary"
        | "lightly_active"
        | "moderately_active"
        | "very_active"
        | "athlete"
      ai_tone_type: "friendly" | "expert" | "minimal"
      budget_level_type: "low" | "medium" | "high" | "no_preference"
      cooking_skill_level: "beginner" | "intermediate" | "advanced"
      focus_priority_type:
        | "health"
        | "convenience"
        | "saving_time"
        | "saving_money"
        | "taste"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      goal_type:
        | "lose_weight"
        | "maintain"
        | "gain_muscle"
        | "eat_healthier"
        | "save_time"
        | "save_money"
      grocery_list_status: "draft" | "active" | "completed" | "archived"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
      recipe_source_type: "ai_generated" | "user_created" | "imported"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_level_type: [
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "athlete",
      ],
      ai_tone_type: ["friendly", "expert", "minimal"],
      budget_level_type: ["low", "medium", "high", "no_preference"],
      cooking_skill_level: ["beginner", "intermediate", "advanced"],
      focus_priority_type: [
        "health",
        "convenience",
        "saving_time",
        "saving_money",
        "taste",
      ],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      goal_type: [
        "lose_weight",
        "maintain",
        "gain_muscle",
        "eat_healthier",
        "save_time",
        "save_money",
      ],
      grocery_list_status: ["draft", "active", "completed", "archived"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
      recipe_source_type: ["ai_generated", "user_created", "imported"],
    },
  },
} as const
