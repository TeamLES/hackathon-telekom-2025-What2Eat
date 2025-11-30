"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

const BACKGROUND_EMOJIS = ["🍣", "🥗", "🍜", "🍕", "🍔", "🍱", "🍩", "🥐"];

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Emoji Background */}
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

      <div className="relative z-10 flex flex-col min-h-svh">
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[32px] ">
            <div className="p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
