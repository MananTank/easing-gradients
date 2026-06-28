import type { CubicBezierPoints, EasingFn } from "./easings";
import { formatCubicBezier } from "./easings";
import type { GradientType, TailwindVersion } from "./gradient-types";
import { tailwindGradientClass } from "./gradient-types";
import { formatPlainCssUsage, generatePlainCssGradient } from "./plain-css";
import { buildColorMixGradientStops } from "./stops";

const TW_GRADIENT_FROM = "var(--tw-gradient-from)";
const TW_GRADIENT_TO =
  "var(--tw-gradient-to, oklch(from var(--tw-gradient-from) l c h / 0))";

export type { GradientType, TailwindVersion } from "./gradient-types";

export interface TailwindGradientOptions {
  className: string;
  easing: EasingFn;
  easingLabel: string;
  precision?: number;
}

export interface GeneratedOutput {
  css: string;
  example: string;
  className: string;
}

export function generateTailwindEasingClass(
  options: TailwindGradientOptions
): Pick<GeneratedOutput, "css" | "className"> {
  const { className } = options;
  const body = buildTailwindGradientBody(options);

  const css = `@layer utilities {
${body.rule}
}`;

  return { css, className };
}

export function formatTailwindUsage(
  className: string,
  version: TailwindVersion,
  type: GradientType = "linear"
) {
  const gradientClass = tailwindGradientClass(type, version);

  return `<div className="${gradientClass} from-black to-transparent ${className}" />`;
}

const ALL_GRADIENT_TYPES: GradientType[] = ["linear", "radial", "conic"];

export function formatUsageExample(
  className: string,
  format: "tailwind4" | "tailwind3" | "css",
  type: GradientType
) {
  if (format === "css") {
    return formatPlainCssUsage(className, type);
  }

  return formatTailwindUsage(className, format, type);
}

export function usageExamplesForFormat(
  className: string,
  format: "tailwind4" | "tailwind3" | "css"
) {
  return ALL_GRADIENT_TYPES.map((type) => ({
    type,
    code: formatUsageExample(className, format, type),
  }));
}

function buildTailwindGradientBody({
  className,
  easing,
  precision = 12,
}: TailwindGradientOptions) {
  const mixStops = buildColorMixGradientStops(
    easing,
    precision,
    TW_GRADIENT_FROM,
    TW_GRADIENT_TO
  );

  const rule = `  .${className} {
    --tw-gradient-stops:
${mixStops};
  }`;

  return { rule };
}

export function tailwindClassNameForEasing(
  easingLabel: string,
  bezier?: CubicBezierPoints
) {
  if (easingLabel === "custom" && bezier) {
    return "gradient-ease-custom";
  }

  return `gradient-${easingLabel}`;
}

export function easingLabelForCss(
  easingLabel: string,
  bezier?: CubicBezierPoints
) {
  if (easingLabel === "custom" && bezier) {
    return formatCubicBezier(bezier);
  }

  return easingLabel;
}

export { generatePlainCssGradient };
