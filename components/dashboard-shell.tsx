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
        <main className="pt-20 md:pt-24 pb-20 md:pb-12 md:ml-72 transition-[margin]">
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
