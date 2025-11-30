import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const features = [
  {
    icon: "🤔",
    title: "Can't decide what to eat?",
    description: "AI gives you personalized suggestions based on your mood, time, and what you're craving right now."
  },
  {
    icon: "🧊",
    title: "What's in my fridge?",
    description: "Tell us what ingredients you have and we'll suggest what you can make with them."
  },
  {
    icon: "🔥",
    title: "Track your calories",
    description: "Know how many calories you're missing today and get suggestions to hit your daily goals."
  },
  {
    icon: "💪",
    title: "Hit your protein goals",
    description: "Whether you exercise or not, we'll help you meet your protein targets with smart food tips."
  },
  {
    icon: "⚡",
    title: "Quick or elaborate?",
    description: "In a rush? Get quick meal ideas. Want to cook? We've got detailed suggestions too."
  },
  {
    icon: "💰",
    title: "Budget-friendly tips",
    description: "Eating healthy doesn't have to be expensive. Get suggestions that fit your budget."
  }
];

const steps = [
  {
    number: "1",
    title: "Tell us about you",
    description: "Share your age, weight, height, activity level, and dietary preferences."
  },
  {
    number: "2",
    title: "Set your goals",
    description: "Choose your favorite cuisines, restrictions, and what you want to achieve."
  },
  {
    number: "3",
    title: "Get suggestions",
    description: "AI will give you personalized tips on what to eat right now."
  }
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-b from-background/95 via-background/90 to-background/75 dark:from-[#141414]/85 dark:via-[#141414]/70 dark:to-[#141414]/55 backdrop-blur supports-[backdrop-filter]:bg-background/65 ring-1 ring-black/5 dark:ring-white/12 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
        <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[hsl(var(--brand-orange))] via-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white text-2xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              🍽️
            </div>
            <span className="text-xl font-semibold">What2Eat</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto px-5 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted">
            🏆 Telekom Hackathon 2025
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
            Never wonder{" "}
            <span className="text-primary bg-gradient-to-r from-brand-orange to-brand-red bg-clip-text text-transparent">
              "What should I eat?"
            </span>{" "}
            again
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            What2Eat helps you decide what to eat based on your goals, preferences, and what's in your fridge.
            AI-powered suggestions when you're stuck.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
          <div className="flex items-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-brand-green">✓</span> Free to use
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-green">✓</span> Personalized
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-green">✓</span> AI-powered
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-background">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to eat smarter
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our AI analyzes your profile and gives you personalized food suggestions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How does it work?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to get personalized food suggestions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute transform translate-x-[200%] translate-y-8">
                    <span className="text-muted-foreground text-2xl">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">AI</div>
              <div className="text-muted-foreground mt-2">Powered by GPT</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">∞</div>
              <div className="text-muted-foreground mt-2">Food ideas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">5+</div>
              <div className="text-muted-foreground mt-2">Diet types</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground mt-2">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-brand-orange/10 to-brand-red/10">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to stop wondering what to eat?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up and get personalized food suggestions today.
            Your next meal is just a click away!
          </p>
          <Button size="lg" asChild className="text-base px-10 py-6 text-lg">
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-12 bg-background">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              🍽️ What2Eat
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              Telekom Hackathon 2025
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Built with ❤️ by: TEAM LES</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
