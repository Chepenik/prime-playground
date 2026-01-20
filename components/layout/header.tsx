"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline-block">Prime Playground</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
