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
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-lg">
                🍽️ What2Eat
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden">
            <div className="p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
