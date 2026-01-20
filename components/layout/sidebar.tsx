"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Circle,
  TreeDeciduous,
  Footprints,
  Shield,
  KeyRound,
  Music,
  Palette,
  Home,
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/spiral", icon: Circle, label: "Prime Spiral" },
  { href: "/factorization", icon: TreeDeciduous, label: "Factor Tree" },
  { href: "/hunt", icon: Footprints, label: "Prime Hunt" },
  { href: "/defense", icon: Shield, label: "Prime Defense" },
  { href: "/cryptarithm", icon: KeyRound, label: "Cryptarithm" },
  { href: "/soundscape", icon: Music, label: "Soundscape" },
  { href: "/art", icon: Palette, label: "Prime Art" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
