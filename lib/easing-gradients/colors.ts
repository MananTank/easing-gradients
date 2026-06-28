export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseHexColor(hex: string, alpha = 1): RGBA {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value.slice(0, 6);

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return { r, g, b, a: alpha };
}

export function mixColors(from: RGBA, to: RGBA, ratio: number): RGBA {
  const t = clamp(ratio, 0, 1);

  return {
    r: Math.round(from.r + (to.r - from.r) * t),
    g: Math.round(from.g + (to.g - from.g) * t),
    b: Math.round(from.b + (to.b - from.b) * t),
    a: roundAlpha(from.a + (to.a - from.a) * t),
  };
}

export function formatColor(color: RGBA, alphaDecimals = 3): string {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const alpha = roundAlpha(color.a, alphaDecimals);

  if (alpha >= 1) {
    return `hsl(${round(h)}, ${round(s)}%, ${round(l)}%)`;
  }

  return `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${alpha})`;
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / delta + 2) * 60;
        break;
      default:
        h = ((rn - gn) / delta + 4) * 60;
    }
  }

  return { h, s: s * 100, l: l * 100 };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function roundAlpha(value: number, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
