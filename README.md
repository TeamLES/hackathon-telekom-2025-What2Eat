# 🍽️ What2Eat – Telekom Hackathon 2025

**Never wonder "What should I eat?" again.**

What2Eat is an AI-powered web app that helps you decide what to eat when you're stuck. Based on your preferences, goals, dietary restrictions, and what's in your fridge – it gives you personalized suggestions and tips to make mealtime decisions effortless.

Built during Telekom Hackathon 2025, this project demonstrates how AI can solve an everyday problem we all face: **"I don't know what to eat."**

---

## 🚀 Features

- **Smart food suggestions** – Get personalized recommendations based on your mood, time, and ingredients
- **Fridge-based ideas** – Tell us what's in your fridge, we'll tell you what to make
- **Calorie & protein tracking** – Know how many calories you're missing today and hit your protein goals
- **Dietary preferences** – Respects your allergies, diet type, and favorite cuisines
- **Activity-aware** – Adjusts suggestions based on whether you exercise or not
- **Quick vs. detailed** – Need something fast? Or want to cook? We've got both
- **Budget-friendly options** – Suggestions that won't break the bank

---

## 🧩 User Data We Collect

### 1. Basic Personal Info
- Gender: male / female / other / prefer not to say
- Age
- Height (cm)
- Weight (kg)

### 2. Lifestyle & Activity
- Activity level: Sedentary, Lightly active, Moderately active, Very active, Athlete
- Daily schedule: Morning person / Night owl
- Usually rushed in mornings: yes/no

### 3. Goals
- Primary goal: Lose weight, Maintain weight, Gain muscle, Eat healthier, Save time, Save money
- Calorie target: Auto-calculate / Manual input
- Protein goal: Auto (based on weight) / Manual input

### 4. Eating Preferences
- Favorite cuisines: Slovak, Italian, Asian, American, Mexican, Mediterranean, Fitness/healthy, Vegetarian/vegan
- Meal types: Quick meals, Budget meals, High-protein, Comfort food, Low-calorie
- Flavor profile: Spicy, Mild, Sweet, Savory

### 5. Dietary Restrictions
- Vegetarian, Vegan, Gluten-free, Dairy-free, Nut allergy, No pork, No seafood, Other allergies

---

## 🧮 How It Works

1. **Your profile** → We calculate your BMR and recommended daily calories
2. **Your goals** → We adjust calorie and protein recommendations
3. **Your preferences** → We filter suggestions to match your taste
4. **Your restrictions** → We exclude anything you can't or won't eat
5. **AI magic** → We generate personalized "what to eat" suggestions and tips

---

## 🛠️ Tech Stack

- **Next.js 15** – App Router, Server Actions, API Routes
- **Supabase** – Database, authentication, and data persistence
- **Vercel** – Hosting, CI/CD, edge runtime
- **TypeScript** – Type safety
- **TailwindCSS** – UI styling
- **OpenAI GPT** – AI-powered food suggestions and recommendations

---

## 📦 Installation & Setup

1. Clone the repository
   ```bash
   git clone https://github.com/TeamLES/hackathon-telekom-2025-What2Eat.git
   cd hackathon-telekom-2025-What2Eat
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and OpenAI API keys.

4. Run the development server
   ```bash
   npm run dev
   ```

---

## 🤝 Team

- Miroslav Hanisko
- Matej Bendík
- Oliver Fecko
- Jakub Janok
- Lukáš Čeč

---

## 🏁 Project Status

Prototype developed during Telekom Hackathon 2025.

### Future Ideas
- 🛒 Generate shopping lists
- 📱 Connect with fitness trackers
- 📅 Weekly meal planning
- 🔔 Meal time notifications
- 🧠 Learn from your choices over time
