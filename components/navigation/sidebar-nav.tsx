"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/history", label: "Calendar", icon: Calendar },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface SidebarNavProps {
  onPlusClick: () => void;
}

export function SidebarNav({ onPlusClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-background border-r border-border z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <span>🍽️</span>
          <span>What2Eat</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-[hsl(var(--brand-orange))]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Plus button */}
        <div className="mt-6 px-2">
          <Button
            onClick={onPlusClick}
            className="w-full bg-gradient-to-r from-[hsl(var(--brand-orange))] to-[hsl(280,70%,50%)] hover:opacity-90 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Suggestion
          </Button>
        </div>
      </nav>

      {/* Footer with theme */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Telekom Hackathon 2025
        </p>
      </div>
    </aside>
  );
}
