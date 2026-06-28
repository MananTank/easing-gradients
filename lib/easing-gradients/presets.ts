import {
  BEZIER_EASING_OPTIONS,
  type BezierEasingName,
  EASINGS,
  type EasingFn,
  type EasingName,
  FUNCTION_EASING_OPTIONS,
  isFunctionPreset,
} from "./easings";

export type CurveType = "bezier" | "function";

export type PresetCategory = "all" | "in" | "out" | "in-out" | "other";

export interface PresetDefinition {
  id: EasingName;
  label: string;
  category: PresetCategory;
  curveType: CurveType;
  easing: EasingFn;
}

export const PRESET_FILTERS: { value: PresetCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in", label: "In" },
  { value: "out", label: "Out" },
  { value: "in-out", label: "In-Out" },
  { value: "other", label: "Other" },
];

function getCategory(id: EasingName): PresetCategory {
  if (id === "linear" || id === "ease") return "other";
  if (id === "ease-in" || id.startsWith("ease-in-") || id.startsWith("in-")) {
    if (id.includes("in-out") || id.startsWith("in-out-")) return "in-out";
    return "in";
  }
  if (
    id === "ease-out" ||
    id.startsWith("ease-out-") ||
    id.startsWith("out-")
  ) {
    return "out";
  }
  if (id === "ease-in-out" || id.includes("in-out")) return "in-out";
  return "other";
}

/** Grid order: ease first, then in → out → in-out groups. */
const GRID_PRESET_ORDER: EasingName[] = [
  "ease",
  "ease-in",
  "ease-in-sine",
  "ease-in-quad",
  "ease-in-cubic",
  "ease-in-quart",
  "ease-out",
  "ease-out-sine",
  "ease-out-quad",
  "ease-out-cubic",
  "ease-out-quart",
  "ease-out-expo",
  "ease-in-out",
  "ease-in-out-sine",
  "ease-in-out-quad",
  "ease-in-out-cubic",
  "linear",
];

function orderPresets(presets: PresetDefinition[]): PresetDefinition[] {
  const byId = new Map(presets.map((preset) => [preset.id, preset]));
  const ordered = GRID_PRESET_ORDER.flatMap((id) => {
    const preset = byId.get(id);
    return preset ? [preset] : [];
  });
  const rest = presets.filter(
    (preset) => !GRID_PRESET_ORDER.includes(preset.id)
  );

  return [...ordered, ...rest];
}

const BEZIER_GRADIENT_PRESETS: PresetDefinition[] =
  BEZIER_EASING_OPTIONS.filter(
    (option): option is { value: BezierEasingName; label: string } =>
      option.value !== "custom"
  ).map((option) => ({
    id: option.value,
    label: option.label,
    category: getCategory(option.value),
    curveType: "bezier" as const,
    easing: EASINGS[option.value],
  }));

const FUNCTION_GRADIENT_PRESETS: PresetDefinition[] =
  FUNCTION_EASING_OPTIONS.map((option) => ({
    id: option.value,
    label: option.label,
    category: getCategory(option.value),
    curveType: "function" as const,
    easing: EASINGS[option.value],
  }));

const ALL_GRADIENT_PRESETS: PresetDefinition[] = [
  ...BEZIER_GRADIENT_PRESETS,
  ...FUNCTION_GRADIENT_PRESETS,
];

const BEZIER_PRESET_LABELS = new Set(
  BEZIER_GRADIENT_PRESETS.map((preset) => preset.label)
);

/** Presets shown in the grid — one entry per label (bezier wins over function). */
const GRID_EXCLUDED_PRESET_IDS = new Set<EasingName>([
  "ease-out-circ",
  "ease-in-expo",
  "ease-in-circ",
]);

export const GRADIENT_PRESETS = orderPresets([
  ...BEZIER_GRADIENT_PRESETS,
  ...FUNCTION_GRADIENT_PRESETS.filter(
    (preset) => !BEZIER_PRESET_LABELS.has(preset.label)
  ),
]).filter((preset) => !GRID_EXCLUDED_PRESET_IDS.has(preset.id));

export const ALL_PRESET_IDS = ALL_GRADIENT_PRESETS.map(
  (preset) => preset.id
) as EasingName[];

export function getPresetById(id: string): PresetDefinition | null {
  return ALL_GRADIENT_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function isValidPresetId(id: string): id is EasingName {
  return ALL_PRESET_IDS.includes(id as EasingName);
}

export function filterPresets(
  presets: PresetDefinition[],
  category: PresetCategory
) {
  if (category === "all") return presets;
  return presets.filter((preset) => preset.category === category);
}

export function getInitialCurveType(preset: EasingName): CurveType {
  return isFunctionPreset(preset) ? "function" : "bezier";
}
