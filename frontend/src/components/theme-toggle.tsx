"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Render a stable placeholder before hydration to avoid a theme flash.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="sl-iconbtn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
    </button>
  );
}
