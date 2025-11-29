# 🍽️ What2Eat – Telekom Hackathon 2025
Inteligentný generátor personalizovaných jedálničkov, ktorý na základe tvojich preferencií, cieľov a diétnych obmedzení navrhne jedlá aj celý denný plán stravovania. Projekt vznikol počas Telekom Hackathon 2025 a demonštruje, ako môže AI uľahčiť každodenné rozhodovanie – od plánovania jedál, cez zdravší životný štýl, až po šetrenie času a peňazí.

---

## 🚀 Funkcionalita

Systém umožňuje používateľovi zadať široké spektrum údajov o sebe a následne mu odporučí:
- denné kalorické ciele,
- odporúčaný príjem bielkovín,
- personalizované jedlá a recepty,
- rýchle, lacné, fitness alebo iné preferované jedlá,
- vynechanie potravín podľa alergií a obmedzení,
- automatické plánovanie jedál na celý deň alebo týždeň.

---

## 🧩 Zber údajov od používateľa

### 1. Basic Personal Info
- Gender: male / female / other / prefer not to say
- Age: number
- Height: cm
- Weight: kg

### 2. Lifestyle & Activity
- Activity level: Sedentary, Lightly active, Moderately active, Very active, Athlete
- Daily schedule: Morning person / Night person
- Usually rushed in mornings: yes/no

### 3. Goals
- Primary goal: Lose weight, Maintain, Gain muscle, Eat healthier, Save time, Save money
- Calorie target: Auto-calculate / Manual input
- Protein goal: Auto (based on weight) / Manual input

### 4. Eating Preferences
- Favorite cuisines: Slovak, Italian, Asian, American, Mexican, Mediterranean, Fitness/healthy, Vegetarian/vegan
- Meal types: Quick meals, Budget meals, High-protein, Comfort food, Low-calorie
- Flavor profile: Spicy, Mild, Sweet, Savory

### 5. Dietary Restrictions
- Vegetarian, Vegan, Gluten-free, Dairy-free, Nut allergy, No pork, No seafood, Other allergy

---

## 🧮 Ako funguje odporúčanie?

1. Základné údaje → výpočet BMR a odporúčaných kalórií  
2. Ciele → prispôsobenie kalorického a proteínového príjmu  
3. Preferencie → výber vhodných receptov  
4. Obmedzenia → filtrovanie nevhodných potravín  
5. AI generovanie → odporúčané recepty a celý denný plán  

---

## 🛠️ Tech stack

Projekt využíva moderný full-stack JavaScript ekosystém:

- **Next.js 15** – App Router, Server Actions, API Routes  
- **Supabase** – databáza, autentifikácia a perzistencia dát  
- **Vercel** – hosting, CI/CD, edge runtime  
- **TypeScript** – typová bezpečnosť  
- **TailwindCSS** – UI styling  
- **OpenAI GPT (Telekom Hackathon project)** – generovanie jedálničkov a odporúčaní  

---

## 📦 Inštalácia a spustenie

1. Klonovanie repozitára  
   git clone https://github.com/<your-team>/<project>.git  
   cd project

2. Inštalácia závislostí  
   npm install

3. Environment variables  
   cp .env.example .env  
   doplň Supabase + OpenAI kľúče

4. Spustenie projektu  
   npm run dev

---

## 🤝 Tím

- Meno 1 – Miroslav Hanisko  
- Meno 2 – Matej Bendík
- Meno 3 – Oliver Fecko
- Meno 4 – Jakub Janok
- Meno 5 – Lukáš Čeč

---

## 🏁 Stav projektu

Prototyp vyvinutý počas Telekom Hackathon 2025.  
Možné rozšírenia:
- generovanie nákupného zoznamu,
- prepojenie s fitness trackermi,
- týždenný meal plan,
- notifikácie,
- adaptívny jedálniček.