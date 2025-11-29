import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/supabase/onboarding";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const { isAuthenticated, hasCompletedOnboarding, userId } =
    await checkOnboardingStatus();

  // Not logged in -> redirect to login
  if (!isAuthenticated || !userId) {
    redirect("/auth/login");
  }

  // Already completed onboarding -> redirect to dashboard
  if (hasCompletedOnboarding) {
    redirect("/protected");
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            We need a few details to create your personalized meal plan.
          </p>
        </div>

        <OnboardingForm userId={userId} />
      </div>
    </main>
  );
}
