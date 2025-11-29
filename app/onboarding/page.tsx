import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/supabase/onboarding";
import { OnboardingForm } from "@/components/onboarding-form";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default async function OnboardingPage() {
  const { isAuthenticated, hasCompletedOnboarding, userId } =
    await checkOnboardingStatus();

  // Not logged in -> redirect to login
  if (!isAuthenticated || !userId) {
    redirect("/auth/login");
  }

  // Already completed onboarding -> redirect to dashboard
  if (hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/" className="text-lg">🍽️ What2Eat</Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              We need a few details to create your personalized meal plan.
            </p>
          </div>

          <OnboardingForm userId={userId} />
        </div>
      </div>
    </main>
  );
}
