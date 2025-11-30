"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const leftNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/search", label: "Search", icon: Search },
];

const rightNavItems = [
  { href: "/dashboard/meal-planner", label: "Planner", icon: CalendarPlus },
  { href: "/dashboard/history", label: "Calendar", icon: Calendar },
];

interface BottomNavProps {
  onPlusClick: () => void;
}

export function BottomNav({ onPlusClick }: BottomNavProps) {
  const pathname = usePathname();

  const renderNavItem = (item: typeof leftNavItems[0]) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <item.icon className={cn("w-6 h-6", isActive && "text-[hsl(var(--brand-orange))]")} />
        <span className={cn("text-xs font-medium", isActive && "text-[hsl(var(--brand-orange))]")}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {leftNavItems.map(renderNavItem)}

        <button
          onClick={onPlusClick}
          className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>

        {rightNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
