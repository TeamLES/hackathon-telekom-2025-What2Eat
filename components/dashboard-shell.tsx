"use client";

import { useState, createContext, useContext } from "react";
import { SuggestionWizard } from "@/components/suggestion-wizard";
import { BottomNav, SidebarNav, TopNav } from "@/components/navigation";

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
        <TopNav onPlusClick={handlePlusClick} />

        {/* Desktop sidebar */}
        <SidebarNav />

        {/* Main content */}
        <main className="pt-2 pb-24 md:pt-2 md:pb-4 md:ml-[calc(18rem+1rem)] transition-[margin]">
          <div className="px-4 pb-4 pt-0 md:px-6">
            <div className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-[32px] border border-border/70 bg-card/95 dark:bg-secondary/40 shadow-[0_12px_35px_rgba(15,23,42,0.12)] dark:shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
              <div className="p-4 md:p-8">
                {children}
              </div>
            </div>
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
