import type { Metadata } from "next";

import { PresetGrid } from "./preset-grid";

export const metadata: Metadata = {
  title: "Easing Gradients",
  description:
    "Generate smooth CSS linear gradients with easing functions and scrim presets.",
  metadataBase: new URL("https://easing-gradients.manantank.dev"),
};

export default function EasingGradientsPage() {
  return <PresetGrid />;
}
