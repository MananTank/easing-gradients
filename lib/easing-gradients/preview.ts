import type { EasingFn } from "./easings";
import type { GeneratedGradient } from "./generate";
import type { GradientType } from "./gradient-types";
import { formatPreviewGradient } from "./gradient-types";
import { buildEasedStops, formatPercent } from "./stops";

/** CSS variable reference for gradient preview swatches. */
export const GRADIENT_PREVIEW_COLOR = "var(--color-gradient-preview)";

/** Default gradient angle: solid color at the top, fading downward. */
export const DEFAULT_PREVIEW_ROTATION = 180;

const PREVIEW_FROM = GRADIENT_PREVIEW_COLOR;
const PREVIEW_TO = "transparent";

export function gradientDirectionFromDegrees(degrees: number) {
  return `${Math.round(degrees)}deg`;
}

function formatMixPreviewColor(mixPercent: number) {
  if (mixPercent <= 0) return PREVIEW_FROM;
  if (mixPercent >= 100) return PREVIEW_TO;

  return `color-mix(in oklab, ${PREVIEW_TO} ${formatPercent(mixPercent)}%, ${PREVIEW_FROM})`;
}

function roundPosition(value: number) {
  return Math.round(value * 10) / 10;
}

function formatGradient(
  type: GradientType,
  stops: { color: string; position: number }[],
  direction = "to bottom"
): GeneratedGradient {
  const stopList = stops
    .map(({ color, position }) => `${color} ${position}%`)
    .join(", ");
  const backgroundImage = formatPreviewGradient(type, stopList, direction);

  return {
    css: backgroundImage,
    backgroundImage,
    stops,
  };
}

export function generateEasedPreviewGradient({
  type = "linear",
  direction = "to bottom",
  easing,
  precision = 12,
}: {
  type?: GradientType;
  direction?: string;
  easing: EasingFn;
  precision?: number;
}): GeneratedGradient {
  const stops = buildEasedStops(easing, precision);

  return formatGradient(
    type,
    [
      { color: PREVIEW_FROM, position: 0 },
      ...stops.map((stop) => ({
        color: formatMixPreviewColor(stop.mixPercent),
        position: roundPosition(stop.position),
      })),
      { color: PREVIEW_TO, position: 100 },
    ],
    direction
  );
}

export function generateLinearPreviewGradient({
  type = "linear",
  direction = "to bottom",
}: {
  type?: GradientType;
  direction?: string;
}): GeneratedGradient {
  return formatGradient(
    type,
    [
      { color: PREVIEW_FROM, position: 0 },
      { color: PREVIEW_TO, position: 100 },
    ],
    direction
  );
}
