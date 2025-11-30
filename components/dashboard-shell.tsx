"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { SuggestionWizard } from "@/components/suggestion-wizard";
import { BottomNav, SidebarNav, TopNav } from "@/components/navigation";

type WizardContextType = {
  openWizard: (flow?: "what-to-cook" | "ingredients-needed") => void;
  nutritionRefreshKey: number;
  triggerNutritionRefresh: () => void;
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

const BACKGROUND_EMOJIS = ["🍣", "🥗", "🍜", "🍕", "🍔", "🍱", "🍩", "🥐"];

export function DashboardShell({ children }: DashboardShellProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [initialFlow, setInitialFlow] = useState<"what-to-cook" | "ingredients-needed" | undefined>();
  const [nutritionRefreshKey, setNutritionRefreshKey] = useState(0);

  const openWizard = (flow?: "what-to-cook" | "ingredients-needed") => {
    setInitialFlow(flow);
    setIsWizardOpen(true);
  };

  const triggerNutritionRefresh = useCallback(() => {
    setNutritionRefreshKey(prev => prev + 1);
  }, []);

  const handlePlusClick = () => {
    openWizard();
  };

  return (
    <WizardContext.Provider value={{ openWizard, nutritionRefreshKey, triggerNutritionRefresh }}>
      <div className="relative min-h-screen bg-background overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 z-0 select-none opacity-90 [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.45),transparent)]"
          aria-hidden
        >
          {BACKGROUND_EMOJIS.map((icon, index) => (
            <span
              key={`${icon}-${index}`}
              className="absolute text-[8rem] md:text-[11rem] text-muted-foreground/12 dark:text-white/15"
              style={{
                top: `${(index * 23 + 10) % 100}%`,
                left: `${(index * 31 + 5) % 100}%`,
                transform: index % 2 === 0 ? "rotate(-6deg)" : "rotate(4deg)",
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="relative z-10">
          <TopNav onPlusClick={handlePlusClick} />

          <SidebarNav />

          <main className="pt-24 pb-24 md:pt-24 md:pb-4 md:ml-[calc(18rem+1rem)] transition-[margin]">
            <div className="px-4 pb-4 pt-0 md:px-6">
              <div className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-[32px] border border-border/70 bg-card dark:bg-[#151515] shadow-[0_12px_35px_rgba(15,23,42,0.12)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
                <div className="p-4 md:p-8 bg-card dark:bg-[#151515]">
                  {children}
                </div>
              </div>
            </div>
          </main>

          <BottomNav onPlusClick={handlePlusClick} />

          <SuggestionWizard
            isOpen={isWizardOpen}
            onClose={(didSaveRecipe?: boolean) => {
              setIsWizardOpen(false);
              setInitialFlow(undefined);
              if (didSaveRecipe) {
                triggerNutritionRefresh();
              }
            }}
            initialFlow={initialFlow}
          />
        </div>
      </div>
    </WizardContext.Provider>
  );
}
