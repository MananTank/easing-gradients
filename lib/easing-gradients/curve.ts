export const CURVE_SIZE = 280;
export const CURVE_INSET = 32;
export const CURVE_PLOT = CURVE_SIZE - CURVE_INSET * 2;

/** @deprecated Use CURVE_INSET */
export const CURVE_PAD = CURVE_INSET;

export const curveEndpoints = {
  startX: CURVE_INSET,
  startY: CURVE_INSET + CURVE_PLOT,
  endX: CURVE_INSET + CURVE_PLOT,
  endY: CURVE_INSET,
};

export function toPlotX(value: number) {
  return CURVE_INSET + Math.min(1, Math.max(0, value)) * CURVE_PLOT;
}

export function toPlotY(value: number) {
  return CURVE_INSET + (1 - value) * CURVE_PLOT;
}

export function sampleEasingCurve(easing: (t: number) => number, samples = 64) {
  return Array.from({ length: samples + 1 }, (_, index) => {
    const t = index / samples;
    return { x: t, y: easing(t) };
  });
}

export function pathFromSamples(samples: { x: number; y: number }[]) {
  return samples
    .map(({ x, y }, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${toPlotX(x)} ${toPlotY(y)}`;
    })
    .join(" ");
}
