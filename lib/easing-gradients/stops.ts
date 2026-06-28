import type { EasingFn } from "./easings";

export interface EasedStop {
  position: number;
  mixPercent: number;
}

export function buildEasedStops(
  easing: EasingFn,
  precision: number
): EasedStop[] {
  const stops: EasedStop[] = [];

  for (let i = 1; i < precision; i++) {
    const t = i / precision;
    stops.push({
      position: roundPercent(t * 100),
      mixPercent: roundPercent(easing(t) * 100),
    });
  }

  return stops;
}

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatPercent(value: number) {
  if (Number.isInteger(value)) return `${value}`;
  return value.toFixed(2);
}

export function curveLabelFromEasing(easingLabel: string) {
  return easingLabel.startsWith("cubic-bezier(")
    ? easingLabel
    : easingLabel.replace(/^ease-/, "");
}

export function formatCssStopList(stops: string[], indent = "      "): string {
  return stops.map((stop) => `${indent}${stop}`).join(",\n");
}

export function formatRelativeMixStop(
  stop: EasedStop,
  fromColor: string,
  toColor: string
) {
  return `oklch(from color-mix(in oklch, ${toColor} ${formatPercent(stop.mixPercent)}%, ${fromColor}) l c h / alpha) ${formatPercent(stop.position)}%`;
}

export function buildColorMixGradientStops(
  easing: EasingFn,
  precision: number,
  fromColor: string,
  toColor: string,
  indent = "      "
) {
  const stops = buildEasedStops(easing, precision);

  return formatCssStopList(
    [
      `${fromColor} 0%`,
      ...stops.map((stop) => formatRelativeMixStop(stop, fromColor, toColor)),
      `oklch(from ${toColor} l c h / alpha) 100%`,
    ],
    indent
  );
}
