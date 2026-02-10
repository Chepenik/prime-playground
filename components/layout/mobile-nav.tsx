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
  Globe,
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
  { href: "/universe", icon: Globe, label: "3D" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around px-1 py-1.5 safe-area-pb">
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
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 min-w-[44px] transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground active:bg-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
