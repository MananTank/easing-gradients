export type BezierEasingName =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-in-quart"
  | "ease-out-quart"
  | "ease-in-expo"
  | "ease-out-expo"
  | "ease-in-circ"
  | "ease-out-circ";

export type FunctionEasingName =
  | "ease-in-sine"
  | "ease-out-sine"
  | "ease-in-out-sine"
  | "in-quad"
  | "out-quad"
  | "in-out-quad"
  | "in-cubic"
  | "out-cubic"
  | "in-out-cubic"
  | "in-quart"
  | "out-quart"
  | "in-expo"
  | "out-expo"
  | "in-circ"
  | "out-circ";

export type EasingName = BezierEasingName | FunctionEasingName | "custom";

export type EasingFn = (t: number) => number;

export interface CubicBezierPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface EasingOption<T extends string = EasingName> {
  value: T;
  label: string;
}

export const FUNCTION_EASING_OPTIONS: EasingOption<FunctionEasingName>[] = [
  { value: "ease-out-sine", label: "Ease out sine" },
  { value: "ease-in-out-sine", label: "Ease in out sine" },
  { value: "ease-in-sine", label: "Ease in sine" },
  { value: "out-quad", label: "Ease out quad" },
  { value: "in-out-quad", label: "Ease in out quad" },
  { value: "in-quad", label: "Ease in quad" },
  { value: "out-cubic", label: "Ease out cubic" },
  { value: "in-out-cubic", label: "Ease in out cubic" },
  { value: "in-cubic", label: "Ease in cubic" },
  { value: "out-quart", label: "Ease out quart" },
  { value: "in-quart", label: "Ease in quart" },
  { value: "out-expo", label: "Ease out expo" },
  { value: "in-expo", label: "Ease in expo" },
  { value: "out-circ", label: "Ease out circ" },
  { value: "in-circ", label: "Ease in circ" },
];

export const BEZIER_EASING_OPTIONS: EasingOption<
  BezierEasingName | "custom"
>[] = [
  { value: "custom", label: "Custom" },
  { value: "ease-in-out", label: "Ease in out" },
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease", label: "Ease" },
  { value: "linear", label: "Linear" },
  { value: "ease-in-out-quad", label: "Ease in out quad" },
  { value: "ease-out-quad", label: "Ease out quad" },
  { value: "ease-in-quad", label: "Ease in quad" },
  { value: "ease-in-out-cubic", label: "Ease in out cubic" },
  { value: "ease-out-cubic", label: "Ease out cubic" },
  { value: "ease-in-cubic", label: "Ease in cubic" },
  { value: "ease-out-quart", label: "Ease out quart" },
  { value: "ease-in-quart", label: "Ease in quart" },
  { value: "ease-out-expo", label: "Ease out expo" },
  { value: "ease-in-expo", label: "Ease in expo" },
  { value: "ease-out-circ", label: "Ease out circ" },
  { value: "ease-in-circ", label: "Ease in circ" },
];

export function isFunctionPreset(
  preset: EasingName
): preset is FunctionEasingName {
  return FUNCTION_EASING_OPTIONS.some((option) => option.value === preset);
}

/** @deprecated Use isFunctionPreset */
export function isSinePreset(preset: EasingName): preset is FunctionEasingName {
  return isFunctionPreset(preset);
}

export function isBezierPreset(
  preset: EasingName
): preset is BezierEasingName | "custom" {
  return !isFunctionPreset(preset);
}

export function createCubicBezier({
  x1,
  y1,
  x2,
  y2,
}: CubicBezierPoints): EasingFn {
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    let start = 0;
    let end = 1;

    for (let i = 0; i < 12; i++) {
      const mid = (start + end) / 2;
      const x =
        3 * (1 - mid) * (1 - mid) * mid * x1 +
        3 * (1 - mid) * mid * mid * x2 +
        mid * mid * mid;

      if (x < t) start = mid;
      else end = mid;
    }

    const mid = (start + end) / 2;
    return (
      3 * (1 - mid) * (1 - mid) * mid * y1 +
      3 * (1 - mid) * mid * mid * y2 +
      mid * mid * mid
    );
  };
}

export const BEZIER_PRESETS: Record<BezierEasingName, CubicBezierPoints> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  "ease-in": { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  "ease-out": { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  "ease-in-out": { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  "ease-in-quad": { x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 },
  "ease-out-quad": { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 },
  "ease-in-out-quad": { x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 },
  "ease-in-cubic": { x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 },
  "ease-out-cubic": { x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 },
  "ease-in-out-cubic": { x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 },
  "ease-in-quart": { x1: 0.895, y1: 0.03, x2: 0.685, y2: 0.22 },
  "ease-out-quart": { x1: 0.165, y1: 0.84, x2: 0.44, y2: 1 },
  "ease-in-expo": { x1: 0.95, y1: 0.05, x2: 0.795, y2: 0.035 },
  "ease-out-expo": { x1: 0.19, y1: 1, x2: 0.22, y2: 1 },
  "ease-in-circ": { x1: 0.6, y1: 0.04, x2: 0.98, y2: 0.335 },
  "ease-out-circ": { x1: 0.075, y1: 0.82, x2: 0.165, y2: 1 },
};

const FUNCTION_EASINGS: Record<FunctionEasingName, EasingFn> = {
  "ease-in-sine": (t) => 1 - Math.cos((t * Math.PI) / 2),
  "ease-out-sine": (t) => Math.sin((t * Math.PI) / 2),
  "ease-in-out-sine": (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  "in-quad": (t) => t * t,
  "out-quad": (t) => 1 - (1 - t) * (1 - t),
  "in-out-quad": (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  "in-cubic": (t) => t * t * t,
  "out-cubic": (t) => 1 - (1 - t) ** 3,
  "in-out-cubic": (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  "in-quart": (t) => t * t * t * t,
  "out-quart": (t) => 1 - (1 - t) ** 4,
  "in-expo": (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  "out-expo": (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  "in-circ": (t) => 1 - Math.sqrt(1 - t ** 2),
  "out-circ": (t) => Math.sqrt(1 - (t - 1) ** 2),
};

const BEZIER_EASINGS = Object.fromEntries(
  Object.entries(BEZIER_PRESETS).map(([name, points]) => [
    name,
    createCubicBezier(points),
  ])
) as Record<BezierEasingName, EasingFn>;

export const EASINGS: Record<Exclude<EasingName, "custom">, EasingFn> = {
  ...BEZIER_EASINGS,
  ...FUNCTION_EASINGS,
};

export const EASING_OPTIONS: EasingOption<EasingName>[] = [
  ...BEZIER_EASING_OPTIONS,
  ...FUNCTION_EASING_OPTIONS,
];

export function formatCubicBezier({ x1, y1, x2, y2 }: CubicBezierPoints) {
  return `cubic-bezier(${formatCoord(x1)}, ${formatCoord(y1)}, ${formatCoord(x2)}, ${formatCoord(y2)})`;
}

function formatCoord(value: number) {
  return Number.parseFloat(value.toFixed(2)).toString();
}

export function sampleBezierCurve(
  points: CubicBezierPoints,
  samples = 64
): { x: number; y: number }[] {
  const easing = createCubicBezier(points);
  return Array.from({ length: samples + 1 }, (_, index) => {
    const t = index / samples;
    return { x: t, y: easing(t) };
  });
}

export function getFunctionFormula(preset: FunctionEasingName): string {
  const formulas: Record<FunctionEasingName, string> = {
    "ease-in-sine": "1 - cos(t × π / 2)",
    "ease-out-sine": "sin(t × π / 2)",
    "ease-in-out-sine": "-(cos(t × π) - 1) / 2",
    "in-quad": "t²",
    "out-quad": "1 - (1 - t)²",
    "in-out-quad": "t < 0.5 ? 2t² : 1 - (-2t + 2)² / 2",
    "in-cubic": "t³",
    "out-cubic": "1 - (1 - t)³",
    "in-out-cubic": "t < 0.5 ? 4t³ : 1 - (-2t + 2)³ / 2",
    "in-quart": "t⁴",
    "out-quart": "1 - (1 - t)⁴",
    "in-expo": "t = 0 ? 0 : 2^(10t - 10)",
    "out-expo": "t = 1 ? 1 : 1 - 2^(-10t)",
    "in-circ": "1 - √(1 - t²)",
    "out-circ": "√(1 - (t - 1)²)",
  };

  return formulas[preset];
}
