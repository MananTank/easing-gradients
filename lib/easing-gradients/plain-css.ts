import { formatColor, parseHexColor } from "./colors";
import type { EasingFn } from "./easings";
import type { GradientType } from "./gradient-types";
import { plainCssBackgroundImage } from "./gradient-types";
import { buildColorMixGradientStops } from "./stops";

const GRADIENT_FROM = "var(--gradient-from)";
const GRADIENT_TO =
  "var(--gradient-to, oklch(from var(--gradient-from) l c h / 0))";

export interface PlainCssOptions {
  className: string;
  easing: EasingFn;
  easingLabel: string;
  colorFrom?: string;
  colorTo?: string;
  opacityFrom?: number;
  opacityTo?: number;
  precision?: number;
}

export interface PlainCssResult {
  css: string;
  example: string;
  className: string;
}

export function formatPlainCssUsage(
  className: string,
  type: GradientType,
  {
    colorFrom = "#000000",
    colorTo = "#000000",
    opacityFrom = 1,
    opacityTo = 0,
  }: Pick<
    PlainCssOptions,
    "colorFrom" | "colorTo" | "opacityFrom" | "opacityTo"
  > = {}
) {
  const from =
    colorFrom === "#000000" && opacityFrom === 1
      ? "black"
      : formatColor(parseHexColor(colorFrom, opacityFrom));
  const backgroundImage = plainCssBackgroundImage(type);

  if (opacityTo === 0 && colorFrom === colorTo) {
    return `<div
  className="${className}"
  style={{
    "--gradient-from": "${from}",
    "--gradient-to": "transparent",
    backgroundImage: "${backgroundImage}",
  }}
/>`;
  }

  const to = formatColor(parseHexColor(colorTo, opacityTo));
  return `<div
  className="${className}"
  style={{
    "--gradient-from": "${from}",
    "--gradient-to": "${to}",
    backgroundImage: "${backgroundImage}",
  }}
/>`;
}

export function generatePlainCssGradient({
  className,
  easing,
  colorFrom = "#000000",
  colorTo = "#000000",
  opacityFrom = 1,
  opacityTo = 0,
  precision = 12,
}: PlainCssOptions): PlainCssResult {
  const stopLines = buildColorMixGradientStops(
    easing,
    precision,
    GRADIENT_FROM,
    GRADIENT_TO,
    "    "
  );

  const css = `.${className} {
  --eased-gradient-stops:
${stopLines};
}`;

  return {
    css,
    example: formatPlainCssUsage(className, "linear", {
      colorFrom,
      colorTo,
      opacityFrom,
      opacityTo,
    }),
    className,
  };
}
