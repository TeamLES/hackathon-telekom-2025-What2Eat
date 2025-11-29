"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";

interface TopNavProps {
  onPlusClick: () => void;
}

export function TopNav({ onPlusClick }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-b from-background/95 via-background/90 to-background/75 dark:from-[#141414]/85 dark:via-[#141414]/70 dark:to-[#141414]/55 backdrop-blur supports-[backdrop-filter]:bg-background/65 ring-1 ring-black/5 dark:ring-white/12 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[hsl(var(--brand-orange))] via-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white text-2xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            🍽️
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              What2Eat
            </span>
            <span className="text-xl font-semibold">Dashboard</span>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button
            onClick={onPlusClick}
            className="hidden md:inline-flex rounded-2xl bg-gradient-to-r from-[hsl(var(--brand-orange))] via-[hsl(var(--brand-red))] to-[hsl(280,70%,50%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(0,0,0,0.25)] hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">New Suggestion</span>
          </Button>
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
