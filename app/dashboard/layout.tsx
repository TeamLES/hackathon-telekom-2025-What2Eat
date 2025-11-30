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

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  if (!hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
