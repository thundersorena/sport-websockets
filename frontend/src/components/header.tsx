"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Trophy, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <span className="text-xl font-bold">Sport Live</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Matches
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
