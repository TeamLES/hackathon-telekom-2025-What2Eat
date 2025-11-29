import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/lib/supabase/onboarding";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasCompletedOnboarding } =
    await checkOnboardingStatus();

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  // Not completed onboarding -> redirect to onboarding
  if (!hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
