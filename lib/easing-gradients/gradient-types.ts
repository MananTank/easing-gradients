export type GradientType = "linear" | "radial" | "conic";

export type TailwindVersion = "tailwind3" | "tailwind4";

export const GRADIENT_TYPE_TABS: { value: GradientType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "radial", label: "Radial" },
  { value: "conic", label: "Conic" },
];

export function formatPreviewGradient(
  type: GradientType,
  stops: string,
  direction = "to bottom"
) {
  switch (type) {
    case "linear":
      return `linear-gradient(${direction}, ${stops})`;
    case "radial":
      return `radial-gradient(circle at center, ${stops})`;
    case "conic":
      return `conic-gradient(from 0deg at center, ${stops})`;
  }
}

export function plainCssBackgroundImage(type: GradientType) {
  switch (type) {
    case "linear":
      return "linear-gradient(to bottom, var(--eased-gradient-stops))";
    case "radial":
      return "radial-gradient(circle at center, var(--eased-gradient-stops))";
    case "conic":
      return "conic-gradient(from 0deg at center, var(--eased-gradient-stops))";
  }
}

export function tailwindGradientClass(
  type: GradientType,
  version: TailwindVersion
) {
  if (version === "tailwind3") {
    switch (type) {
      case "linear":
        return "bg-gradient-to-b";
      case "radial":
        return "bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))]";
      case "conic":
        return "bg-[conic-gradient(from_0deg_at_center,var(--tw-gradient-stops))]";
    }
  }

  switch (type) {
    case "linear":
      return "bg-linear-to-b";
    case "radial":
      return "bg-radial";
    case "conic":
      return "bg-conic";
  }
}
