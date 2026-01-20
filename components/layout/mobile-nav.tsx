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
  { href: "/", icon: Home, label: "Home" },
  { href: "/spiral", icon: Circle, label: "Spiral" },
  { href: "/factorization", icon: TreeDeciduous, label: "Factor" },
  { href: "/hunt", icon: Footprints, label: "Hunt" },
  { href: "/defense", icon: Shield, label: "Defense" },
  { href: "/cryptarithm", icon: KeyRound, label: "Crypto" },
  { href: "/soundscape", icon: Music, label: "Sound" },
  { href: "/art", icon: Palette, label: "Art" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around px-2 py-2">
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
                "flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden xs:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
