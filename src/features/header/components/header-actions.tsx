"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, Languages } from "lucide-react";
// import AuthButton from "@/features/auth/components/auth-button";

type Props = {
  mounted: boolean;
  currentTheme: string | undefined;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
};

export default function HeaderActions({
  mounted,
  currentTheme,
  onToggleTheme,
  onOpenMobileMenu,
}: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {/* THEME TOGGLE */}
      <Button
        onClick={onToggleTheme}
        className="border-primary hover:bg-primary/10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-all hover:scale-110"
      >
        {mounted && currentTheme === "dark" ? (
          <Moon className="text-foreground h-4 w-4" />
        ) : (
          <Sun className="text-primary h-6 w-6" />
        )}
      </Button>

      {/* LANGUAGE */}
      <Button className="hidden h-12 w-12 rounded-full md:flex">
        <Languages className="h-4 w-4" />
      </Button>

      {/* LOGIN */}
      {/* <AuthButton /> */}

      {/* MOBILE MENU */}
      <button
        onClick={onOpenMobileMenu}
        className="glass-panel flex h-12 w-12 items-center justify-center hover:scale-110 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
