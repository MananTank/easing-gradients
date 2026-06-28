import { formatColor, parseHexColor } from "./colors";
import { formatVariableCss, GRADIENT_VARS } from "./generate";

export const SCRIM_STOPS = [
  { position: 0, alpha: 1 },
  { position: 19, alpha: 0.738 },
  { position: 34, alpha: 0.541 },
  { position: 47, alpha: 0.382 },
  { position: 56.5, alpha: 0.278 },
  { position: 65, alpha: 0.194 },
  { position: 73, alpha: 0.126 },
  { position: 80.2, alpha: 0.075 },
  { position: 86.1, alpha: 0.042 },
  { position: 91, alpha: 0.021 },
  { position: 95.2, alpha: 0.008 },
  { position: 98.2, alpha: 0.002 },
  { position: 100, alpha: 0 },
] as const;

export function generateScrimGradient(
  direction: string,
  color: string,
  opacity: number,
  alphaDecimals = 3,
  output: "resolved" | "variables" = "resolved"
) {
  const base = parseHexColor(color, opacity);

  const stops = SCRIM_STOPS.map(({ position, alpha }) => {
    const stopColor =
      output === "variables"
        ? formatScrimVariable(alpha)
        : formatColor({ ...base, a: base.a * alpha }, alphaDecimals);

    return `${stopColor} ${position}%`;
  });

  const gradient = `linear-gradient(${direction}, ${stops.join(", ")})`;

  return {
    css:
      output === "variables"
        ? formatVariableCss(gradient, {
            [GRADIENT_VARS.scrim]: "#000000",
          })
        : gradient,
    backgroundImage: gradient,
  };
}

function formatScrimVariable(alpha: number) {
  if (alpha <= 0) return "transparent";
  if (alpha >= 1) return `var(${GRADIENT_VARS.scrim})`;

  const percent = Math.round(alpha * 1000) / 10;
  return `color-mix(in srgb, var(${GRADIENT_VARS.scrim}) ${percent}%, transparent)`;
}
