"use client";

import { useState, createContext, useContext } from "react";
import { BottomNav, SidebarNav, TopNav } from "@/components/navigation";
import { SuggestionWizard } from "@/components/suggestion-wizard";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";

// Context to share wizard state
type WizardContextType = {
  openWizard: (flow?: "what-to-cook" | "ingredients-needed") => void;
};

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within DashboardShell");
  }
  return context;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [initialFlow, setInitialFlow] = useState<"what-to-cook" | "ingredients-needed" | undefined>();

  const openWizard = (flow?: "what-to-cook" | "ingredients-needed") => {
    setInitialFlow(flow);
    setIsWizardOpen(true);
  };

  const handlePlusClick = () => {
    openWizard();
  };

  return (
    <WizardContext.Provider value={{ openWizard }}>
      <div className="min-h-screen bg-background">
        {/* Mobile top nav */}
        <TopNav />

        {/* Desktop sidebar */}
        <SidebarNav onPlusClick={handlePlusClick} />

        {/* Desktop header (right side) */}
        <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 items-center justify-end gap-4 px-6 border-b border-border bg-background z-30">
          <ThemeSwitcher />
          <LogoutButton />
        </header>

        {/* Main content */}
        <main className="md:ml-64 md:pt-16 pb-20 md:pb-8">
          <div className="p-4 md:p-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav onPlusClick={handlePlusClick} />

        {/* Suggestion wizard modal */}
        <SuggestionWizard
          isOpen={isWizardOpen}
          onClose={() => {
            setIsWizardOpen(false);
            setInitialFlow(undefined);
          }}
          initialFlow={initialFlow}
        />
      </div>
    </WizardContext.Provider>
  );
}
