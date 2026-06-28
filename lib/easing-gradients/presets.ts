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

const PRESET_PRIORITY: EasingName[] = ["linear", "ease", "ease-out", "ease-in"];

function orderPresets(presets: PresetDefinition[]): PresetDefinition[] {
  const byId = new Map(presets.map((preset) => [preset.id, preset]));
  const priority = PRESET_PRIORITY.flatMap((id) => {
    const preset = byId.get(id);
    return preset ? [preset] : [];
  });
  const rest = presets.filter((preset) => !PRESET_PRIORITY.includes(preset.id));

  return [...priority, ...rest];
}

const ALL_GRADIENT_PRESETS: PresetDefinition[] = [
  ...BEZIER_EASING_OPTIONS.filter(
    (option): option is { value: BezierEasingName; label: string } =>
      option.value !== "custom"
  ).map((option) => ({
    id: option.value,
    label: option.label,
    category: getCategory(option.value),
    curveType: "bezier" as const,
    easing: EASINGS[option.value],
  })),
  ...FUNCTION_EASING_OPTIONS.map((option) => ({
    id: option.value,
    label: option.label,
    category: getCategory(option.value),
    curveType: "function" as const,
    easing: EASINGS[option.value],
  })),
];

export const GRADIENT_PRESETS = orderPresets(ALL_GRADIENT_PRESETS);

export const ALL_PRESET_IDS = GRADIENT_PRESETS.map(
  (preset) => preset.id
) as EasingName[];

export function getPresetById(id: string): PresetDefinition | null {
  return GRADIENT_PRESETS.find((preset) => preset.id === id) ?? null;
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
