-- Create a table for public profiles
create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    updated_at timestamp
    with
        time zone,
        username text unique,
        full_name text,
        avatar_url text,
        constraint username_length check (char_length(username) >= 3)
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select using (true);

create policy "Users can insert their own profile." on profiles for
insert
with
    check (
        (
            select auth.uid ()
        ) = id
    );

create policy "Users can update own profile." on profiles for
update using (
    (
        select auth.uid ()
    ) = id
);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into
    storage.buckets (id, name)
values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are publicly accessible." on storage.objects for
select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects for
insert
with
    check (bucket_id = 'avatars');

-- =========================================
-- ENUM TYPES
-- =========================================

create type gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');

create type activity_level_type as enum (
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'athlete'
);

create type goal_type as enum (
  'lose_weight',
  'maintain',
  'gain_muscle',
  'eat_healthier',
  'save_time',
  'save_money'
);

create type budget_level_type as enum ('low', 'medium', 'high', 'no_preference');

create type cooking_skill_level as enum ('beginner', 'intermediate', 'advanced');

create type ai_tone_type as enum ('friendly', 'expert', 'minimal');

create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

create type grocery_list_status as enum ('draft', 'active', 'completed', 'archived');

create type recipe_source_type as enum ('ai_generated', 'user_created', 'imported');

create type focus_priority_type as enum ('health', 'convenience', 'saving_time', 'saving_money', 'taste');

-- =========================================
-- 1) NUTRITION PROFILE / ONBOARDING CORE
-- =========================================

create table public.nutrition_profiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    gender gender_type,
    age integer,
    height_cm numeric(5, 2),
    weight_kg numeric(5, 2),
    activity_level activity_level_type,
    is_morning_person boolean,
    is_night_person boolean,
    usually_rushed_mornings boolean default false,
    primary_goal goal_type,
    calorie_target integer,
    is_calorie_target_manual boolean default false,
    protein_target_g integer,
    is_protein_target_manual boolean default false,
    carbs_target_g integer,
    is_carbs_target_manual boolean default false,
    fat_target_g integer,
    is_fat_target_manual boolean default false,
    meals_per_day smallint,
    breakfast_heavy boolean default false,
    lunch_heavy boolean default false,
    dinner_heavy boolean default false,
    snacks_included boolean default true,
    snacks_often boolean default false,
    budget_level budget_level_type,
    cooking_skill cooking_skill_level,
    other_allergy_notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =========================================
-- 2) LOOKUP TABLES & USER PREFERENCES
-- =========================================

-- ---------- Cuisines ----------
create table public.cuisines (
    id serial primary key,
    code text unique not null,
    name text not null
);

insert into
    public.cuisines (code, name)
values ('slovak', 'Slovak'),
    ('italian', 'Italian'),
    ('asian', 'Asian'),
    ('american', 'American'),
    ('mexican', 'Mexican'),
    (
        'mediterranean',
        'Mediterranean'
    ),
    (
        'fitness',
        'Fitness / Healthy'
    ),
    (
        'vegetarian_vegan',
        'Vegetarian / Vegan'
    ) on conflict (code) do nothing;

create table public.user_favorite_cuisines (
    user_id uuid references auth.users (id) on delete cascade,
    cuisine_id int references public.cuisines (id) on delete cascade,
    primary key (user_id, cuisine_id)
);

-- ---------- Preferred meal types ----------
create table public.meal_type_presets (
    id serial primary key,
    code text unique not null,
    label text not null
);

insert into
    public.meal_type_presets (code, label)
values (
        'quick',
        'Quick meals (under 10 min)'
    ),
    ('budget', 'Budget meals'),
    (
        'high_protein',
        'High-protein meals'
    ),
    ('comfort', 'Comfort food'),
    (
        'low_calorie',
        'Low-calorie meals'
    ) on conflict (code) do nothing;

create table public.user_preferred_meal_types (
    user_id uuid references auth.users (id) on delete cascade,
    meal_type_id int references public.meal_type_presets (id) on delete cascade,
    primary key (user_id, meal_type_id)
);

-- ---------- Flavor preferences ----------
create table public.flavor_profiles (
    id serial primary key,
    code text unique not null,
    label text not null
);

insert into
    public.flavor_profiles (code, label)
values ('spicy', 'Spicy'),
    ('mild', 'Mild'),
    ('sweet', 'Sweet'),
    ('savory', 'Savory') on conflict (code) do nothing;

create table public.user_flavor_preferences (
    user_id uuid references auth.users (id) on delete cascade,
    flavor_id int references public.flavor_profiles (id) on delete cascade,
    primary key (user_id, flavor_id)
);

-- ---------- Dietary restrictions ----------
create table public.dietary_restrictions (
    id serial primary key,
    code text unique not null,
    label text not null
);

insert into
    public.dietary_restrictions (code, label)
values ('vegetarian', 'Vegetarian'),
    ('vegan', 'Vegan'),
    ('gluten_free', 'Gluten-free'),
    ('dairy_free', 'Dairy-free'),
    ('nut_allergy', 'Nut allergy'),
    ('no_pork', 'No pork'),
    ('no_seafood', 'No seafood') on conflict (code) do nothing;

create table public.user_dietary_restrictions (
    user_id uuid references auth.users (id) on delete cascade,
    restriction_id int references public.dietary_restrictions (id) on delete cascade,
    primary key (user_id, restriction_id)
);

-- ---------- Kitchen equipment ----------
create table public.kitchen_equipment (
    id serial primary key,
    code text unique not null,
    label text not null
);

insert into
    public.kitchen_equipment (code, label)
values ('microwave', 'Microwave'),
    ('oven', 'Oven'),
    ('stove', 'Stove'),
    ('air_fryer', 'Air fryer'),
    ('blender', 'Blender') on conflict (code) do nothing;

create table public.user_kitchen_equipment (
    user_id uuid references auth.users (id) on delete cascade,
    equipment_id int references public.kitchen_equipment (id) on delete cascade,
    primary key (user_id, equipment_id)
);

-- ---------- Personalization settings ----------

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,

  ai_tone ai_tone_type default 'friendly',

  allow_meal_notifications boolean default true,
  allow_grocery_notifications boolean default true,
  allow_macro_notifications boolean default true,

  focus_priorities focus_priority_type[] default '{"health","convenience"}',

  max_cooking_time_minutes integer,

  chooses_based_on_mood boolean default false,
  chooses_based_on_time boolean default true,
  chooses_based_on_convenience boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Food dislikes ----------
create table public.user_food_dislikes (
    id bigserial primary key,
    user_id uuid references auth.users (id) on delete cascade,
    food_name text not null,
    created_at timestamptz default now()
);

-- =========================================
-- 3) PANTRY / FRIDGE (DATA)
-- =========================================

create table public.ingredients_catalog (
    id bigserial primary key,
    name text not null,
    category text,
    default_unit text,
    created_at timestamptz default now()
);

create table public.pantry_items (
    id bigserial primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    ingredient_id bigint references public.ingredients_catalog (id) on delete set null,
    name text not null,
    quantity numeric(10, 2),
    unit text,
    usually_have boolean default false,
    expires_at date,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index pantry_items_user_idx on public.pantry_items (user_id);

-- =========================================
-- 4) FRIDGE PHOTO SNAPSHOTS (SUPABASE BUCKETS)
-- =========================================

create table public.fridge_snapshots (
    id bigserial primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    bucket_id text not null default 'fridge-photos', -- Supabase storage bucket name
    object_path text not null, -- e.g. 'userId/2025-11-29T12:34:56Z.jpg'
    detected_raw jsonb, -- optional: raw AI detection output
    created_at timestamptz default now()
);

create table public.fridge_snapshot_items (
    id bigserial primary key,
    snapshot_id bigint not null references public.fridge_snapshots (id) on delete cascade,
    ingredient_id bigint references public.ingredients_catalog (id) on delete set null,
    detected_name text not null,
    confidence numeric(4, 3),
    matched_pantry_item_id bigint references public.pantry_items (id) on delete set null,
    created_at timestamptz default now()
);

create index fridge_snapshot_items_snapshot_idx on public.fridge_snapshot_items (snapshot_id);

-- =========================================
-- 5) RECIPES & INGREDIENTS
-- =========================================

create table public.recipes (
    id bigserial primary key,
    user_id uuid references auth.users (id) on delete set null,
    title text not null,
    description text,
    cuisine_id int references public.cuisines (id),
    source recipe_source_type not null default 'ai_generated',
    is_public boolean default false,
    total_calories integer,
    protein_g numeric(10, 2),
    carbs_g numeric(10, 2),
    fat_g numeric(10, 2),
    cook_time_minutes integer,
    difficulty cooking_skill_level,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.recipe_ingredients (
    id bigserial primary key,
    recipe_id bigint not null references public.recipes (id) on delete cascade,
    ingredient_id bigint references public.ingredients_catalog (id) on delete set null,
    ingredient_name text not null,
    quantity numeric(10, 2),
    unit text,
    pantry_item_id bigint references public.pantry_items (id) on delete set null
);

create index recipe_ingredients_recipe_idx on public.recipe_ingredients (recipe_id);

-- =========================================
-- 6) MEAL PLANS (DAILY)
-- =========================================

create table public.meal_plans (
    id bigserial primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    plan_date date not null,
    total_calories_target integer,
    total_calories_planned integer,
    protein_target_g integer,
    protein_planned_g integer,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (user_id, plan_date)
);

create table public.meal_plan_items (
    id bigserial primary key,
    meal_plan_id bigint not null references public.meal_plans (id) on delete cascade,
    recipe_id bigint references public.recipes (id) on delete set null,
    meal_type meal_type not null,
    servings numeric(5, 2) default 1,
    position smallint,
    created_at timestamptz default now()
);

create index meal_plan_items_plan_idx on public.meal_plan_items (meal_plan_id);

-- =========================================
-- 7) GROCERY LISTS
-- =========================================

create table public.grocery_lists (
    id bigserial primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    title text,
    status grocery_list_status default 'draft',
    for_date_range daterange,
    created_from_meal_plan_id bigint references public.meal_plans (id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.grocery_list_items (
    id bigserial primary key,
    grocery_list_id bigint not null references public.grocery_lists (id) on delete cascade,
    ingredient_id bigint references public.ingredients_catalog (id) on delete set null,
    item_name text not null,
    quantity numeric(10, 2),
    unit text,
    pantry_item_id bigint references public.pantry_items (id) on delete set null,
    is_checked boolean default false,
    created_at timestamptz default now()
);

create index grocery_list_items_list_idx on public.grocery_list_items (grocery_list_id);

-- =========================================
-- 8) DAILY NUTRITION LOGS
-- =========================================

create table public.daily_nutrition_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users (id) on delete cascade,
    log_date date not null,
    calories_consumed integer,
    protein_g numeric(10, 2),
    carbs_g numeric(10, 2),
    fat_g numeric(10, 2),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (user_id, log_date)
);

create index daily_nutrition_logs_user_idx on public.daily_nutrition_logs (user_id, log_date);