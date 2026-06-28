"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { GradientType } from "@/lib/easing-gradients/gradient-types";
import { GRADIENT_TYPE_TABS } from "@/lib/easing-gradients/gradient-types";
import {
  GRADIENT_PRESETS,
  type PresetDefinition,
} from "@/lib/easing-gradients/presets";
import {
  DEFAULT_PREVIEW_ROTATION,
  generateEasedPreviewGradient,
  gradientDirectionFromDegrees,
} from "@/lib/easing-gradients/preview";
import { cn } from "@/lib/utils";

import { GradientPreviewSurface } from "./check-pattern";
import { GradientKnob } from "./gradient-knob";
import { useUiSound } from "./sound-provider";
import { PAGE, PageHeader, Segment, SegmentGroup } from "./ui";
import { useEasingGradientsRoutes } from "./use-routes";

export function PresetGrid() {
  const routes = useEasingGradientsRoutes();
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [rotation, setRotation] = useState(DEFAULT_PREVIEW_ROTATION);

  const presets = useMemo(
    () => GRADIENT_PRESETS.filter((preset) => preset.id !== "linear"),
    []
  );

  const direction = useMemo(
    () => gradientDirectionFromDegrees(rotation),
    [rotation]
  );

  return (
    <div className={PAGE}>
      <PageHeader
        title="Easing Gradients"
        description="Smooth gradient stops for Tailwind and CSS."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentGroup>
          {GRADIENT_TYPE_TABS.map((tab) => (
            <Segment
              key={tab.value}
              active={gradientType === tab.value}
              onClick={() => setGradientType(tab.value)}
            >
              {tab.label}
            </Segment>
          ))}
        </SegmentGroup>

        <GradientKnob
          value={rotation}
          onChange={setRotation}
          className={
            gradientType === "linear"
              ? undefined
              : "invisible pointer-events-none"
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            gradientType={gradientType}
            direction={direction}
            href={routes.preset(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  gradientType,
  direction,
  href,
}: {
  preset: PresetDefinition;
  gradientType: GradientType;
  direction: string;
  href: string;
}) {
  const { playToggleOn } = useUiSound();

  const gradient = useMemo(
    () =>
      generateEasedPreviewGradient({
        type: gradientType,
        direction,
        easing: preset.easing,
        precision: 12,
      }).backgroundImage,
    [direction, gradientType, preset.easing]
  );

  return (
    <Link
      href={href}
      onClick={playToggleOn}
      className={cn(
        "group focus-ring flex flex-col gap-2 rounded-xl p-2 transition-colors",
        "hover:bg-secondary/50"
      )}
    >
      <GradientPreviewSurface
        gradient={gradient}
        className="aspect-square rounded-lg"
      />
      <p className="text-muted-foreground group-hover:text-foreground truncate px-0.5 text-center text-xs transition-colors">
        {preset.label}
      </p>
    </Link>
  );
}
