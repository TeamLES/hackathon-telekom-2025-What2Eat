"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/meal-planner", label: "Meal Planner", icon: CalendarPlus },
  { href: "/dashboard/history", label: "Calendar", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-[5.5rem] h-[calc(100vh-5.5rem)] w-72 p-4 z-40">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[32px] border border-border/70 bg-card dark:bg-[#151515] shadow-[0_12px_35px_rgba(15,23,42,0.12)] dark:shadow-[0_25px_70px_rgba(15,23,42,0.35)]">
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all hover:shadow-[inset_0_2px_8px_rgba(15,23,42,0.18)] active:shadow-[inset_0_4px_12px_rgba(15,23,42,0.28)] active:bg-muted/60",
                    isActive
                      ? "border-transparent bg-gradient-to-r from-[hsl(var(--brand-orange))]/15 to-[hsl(var(--brand-orange))]/5 text-foreground shadow-[0_8px_18px_rgba(0,0,0,0.15)]"
                      : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground dark:hover:bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-medium transition-all hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)]",
                      isActive
                        ? "border-transparent bg-gradient-to-br from-[hsl(var(--brand-orange))] to-[hsl(var(--brand-red))] text-white shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                        : "border-border/70 bg-transparent text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
