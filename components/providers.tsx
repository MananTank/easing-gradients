"use client";

import { EasingGradientsSoundProvider } from "@/components/easing-gradients/sound-provider";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <EasingGradientsSoundProvider>{children}</EasingGradientsSoundProvider>
    </ThemeProvider>
  );
}
