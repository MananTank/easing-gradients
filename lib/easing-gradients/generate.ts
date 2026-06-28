import { formatColor, mixColors, parseHexColor } from "./colors";
import type { EasingFn } from "./easings";

export interface GradientStop {
  color: string;
  position: number;
}

export interface GeneratedGradient {
  css: string;
  backgroundImage: string;
  stops: GradientStop[];
}

export const GRADIENT_VARS = {
  from: "--gradient-from",
  to: "--gradient-to",
  scrim: "--scrim-color",
} as const;

export function generateEasingGradient({
  direction,
  colorA,
  colorB,
  opacityA,
  opacityB,
  easing,
  precision,
  alphaDecimals = 3,
  output = "resolved",
}: {
  direction: string;
  colorA: string;
  colorB: string;
  opacityA: number;
  opacityB: number;
  easing: EasingFn;
  precision: number;
  alphaDecimals?: number;
  output?: "resolved" | "variables";
}): GeneratedGradient {
  const from = parseHexColor(colorA, opacityA);
  const to = parseHexColor(colorB, opacityB);
  const stops: GradientStop[] = [];

  for (let i = 0; i <= precision; i++) {
    const x = i / precision;
    const y = easing(x);
    const position = roundPosition(y * 100);
    const color =
      output === "variables"
        ? formatMixVariable(x)
        : formatColor(mixColors(from, to, x), alphaDecimals);

    stops.push({ color, position });
  }

  return formatGradient(direction, stops, output);
}

export function generateTailwindPreviewGradient({
  direction,
  colorA,
  colorB,
  opacityA,
  opacityB,
  easing,
  precision,
  alphaDecimals = 3,
}: {
  direction: string;
  colorA: string;
  colorB: string;
  opacityA: number;
  opacityB: number;
  easing: EasingFn;
  precision: number;
  alphaDecimals?: number;
}): GeneratedGradient {
  const from = parseHexColor(colorA, opacityA);
  const to = parseHexColor(colorB, opacityB);
  const stops: GradientStop[] = [
    { color: formatColor(from, alphaDecimals), position: 0 },
  ];

  for (let i = 1; i < precision; i++) {
    const t = i / precision;
    stops.push({
      color: formatColor(mixColors(from, to, easing(t)), alphaDecimals),
      position: roundPosition(t * 100),
    });
  }

  stops.push({ color: formatColor(to, alphaDecimals), position: 100 });

  return formatGradient(direction, stops, "resolved");
}

export function generateLinearGradient({
  direction,
  colorA,
  colorB,
  opacityA,
  opacityB,
  output = "resolved",
}: {
  direction: string;
  colorA: string;
  colorB: string;
  opacityA: number;
  opacityB: number;
  output?: "resolved" | "variables";
}): GeneratedGradient {
  const stops =
    output === "variables"
      ? [
          { color: `var(${GRADIENT_VARS.from})`, position: 0 },
          { color: `var(${GRADIENT_VARS.to})`, position: 100 },
        ]
      : [
          {
            color: formatColor(parseHexColor(colorA, opacityA)),
            position: 0,
          },
          {
            color: formatColor(parseHexColor(colorB, opacityB)),
            position: 100,
          },
        ];

  return formatGradient(direction, stops, output);
}

function formatMixVariable(mixRatio: number) {
  if (mixRatio <= 0) return `var(${GRADIENT_VARS.from})`;
  if (mixRatio >= 1) return `var(${GRADIENT_VARS.to})`;

  const fromPercent = roundPosition((1 - mixRatio) * 100);
  return `color-mix(in srgb, var(${GRADIENT_VARS.from}) ${fromPercent}%, var(${GRADIENT_VARS.to}))`;
}

function formatGradient(
  direction: string,
  stops: GradientStop[],
  output: "resolved" | "variables"
): GeneratedGradient {
  const uniqueStops = dedupeStops(stops);
  const gradient = `linear-gradient(${direction}, ${uniqueStops
    .map(({ color, position }) => `${color} ${position}%`)
    .join(", ")})`;

  return {
    css:
      output === "variables"
        ? formatVariableCss(gradient, {
            [GRADIENT_VARS.from]: "#000000",
            [GRADIENT_VARS.to]: "transparent",
          })
        : gradient,
    backgroundImage: gradient,
    stops: uniqueStops,
  };
}

export function formatVariableCss(
  gradient: string,
  variables: Record<string, string>
) {
  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${declarations}\n\n  background-image: ${gradient};`;
}

function dedupeStops(stops: GradientStop[]) {
  const merged = new Map<number, string>();

  for (const stop of stops) {
    merged.set(stop.position, stop.color);
  }

  return [...merged.entries()]
    .sort(([a], [b]) => a - b)
    .map(([position, color]) => ({ position, color }));
}

function roundPosition(value: number) {
  return Math.round(value * 10) / 10;
}
