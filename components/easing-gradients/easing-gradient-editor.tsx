"use client";

import { useMemo, useState } from "react";

import {
  BEZIER_PRESETS,
  type CubicBezierPoints,
  createCubicBezier,
  EASINGS,
  type EasingName,
  isFunctionPreset,
} from "@/lib/easing-gradients/easings";
import type { GradientType } from "@/lib/easing-gradients/gradient-types";
import { GRADIENT_TYPE_TABS } from "@/lib/easing-gradients/gradient-types";
import { getPresetById } from "@/lib/easing-gradients/presets";
import { generateEasedPreviewGradient } from "@/lib/easing-gradients/preview";
import {
  easingLabelForCss,
  tailwindClassNameForEasing,
} from "@/lib/easing-gradients/tailwind";

import { GradientPreviewSurface } from "./check-pattern";
import { EasingControls } from "./easing-controls";
import { OutputTabs } from "./output-tabs";
import { EDITOR_PAGE, PageHeader, SectionLabel } from "./ui";
import { useEasingGradientsRoutes } from "./use-routes";

const DEFAULT_BEZIER: CubicBezierPoints = {
  x1: 0.42,
  y1: 0,
  x2: 0.58,
  y2: 1,
};

interface EasingGradientEditorProps {
  presetId: EasingName;
}

export function EasingGradientEditor({ presetId }: EasingGradientEditorProps) {
  const routes = useEasingGradientsRoutes();
  const presetMeta = getPresetById(presetId);

  const [preset, setPreset] = useState<EasingName>(presetId);
  const [bezier, setBezier] = useState<CubicBezierPoints>(() => {
    if (presetId !== "custom" && !isFunctionPreset(presetId)) {
      return BEZIER_PRESETS[presetId];
    }
    return DEFAULT_BEZIER;
  });
  const [precision, setPrecision] = useState(12);

  const easingFn = useMemo(() => {
    if (isFunctionPreset(preset)) {
      return EASINGS[preset];
    }

    return createCubicBezier(bezier);
  }, [bezier, preset]);

  const cssEasingLabel = easingLabelForCss(
    preset === "custom" ? "custom" : preset,
    isFunctionPreset(preset) ? undefined : bezier
  );

  const className = tailwindClassNameForEasing(
    preset === "custom" ? "custom" : preset,
    isFunctionPreset(preset) ? undefined : bezier
  );

  const previews = useMemo(
    () =>
      Object.fromEntries(
        GRADIENT_TYPE_TABS.map(({ value: type }) => [
          type,
          generateEasedPreviewGradient({
            type,
            easing: easingFn,
            precision,
          }).backgroundImage,
        ])
      ) as Record<GradientType, string>,
    [easingFn, precision]
  );

  return (
    <div className={EDITOR_PAGE}>
      <PageHeader
        title={presetMeta?.label ?? "Custom"}
        description="Tune the easing and copy the output."
        backHref={routes.home}
      />

      <div className="flex flex-col gap-10">
        <section>
          <EasingControls
            preset={preset}
            bezier={bezier}
            onBezierChange={setBezier}
            onBezierCustomize={() => setPreset("custom")}
            precision={precision}
            onPrecisionChange={setPrecision}
          />
        </section>

        <section className="flex flex-col gap-10">
          <section className="grid gap-6 sm:grid-cols-3">
            {GRADIENT_TYPE_TABS.map((tab) => (
              <PreviewPanel
                key={tab.value}
                label={tab.label}
                gradient={previews[tab.value]}
              />
            ))}
          </section>

          <OutputTabs
            className={className}
            easingLabel={cssEasingLabel}
            easingFn={easingFn}
            precision={precision}
          />
        </section>
      </div>
    </div>
  );
}

function PreviewPanel({
  label,
  gradient,
}: {
  label: string;
  gradient: string;
}) {
  return (
    <div className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <GradientPreviewSurface
        gradient={gradient}
        className="aspect-square rounded-lg"
      />
    </div>
  );
}
