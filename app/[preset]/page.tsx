import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EasingGradientEditor } from "@/components/easing-gradients/easing-gradient-editor";
import {
  ALL_PRESET_IDS,
  isValidPresetId,
} from "@/lib/easing-gradients/presets";

interface PresetPageProps {
  params: Promise<{ preset: string }>;
}

export function generateStaticParams() {
  return ALL_PRESET_IDS.map((preset) => ({ preset }));
}

export async function generateMetadata({
  params,
}: PresetPageProps): Promise<Metadata> {
  const { preset } = await params;

  if (!isValidPresetId(preset)) {
    return { title: "Not found" };
  }

  const title = preset.replaceAll("-", " ");

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
  };
}

export default async function PresetPage({ params }: PresetPageProps) {
  const { preset } = await params;

  if (!isValidPresetId(preset)) {
    notFound();
  }

  return <EasingGradientEditor presetId={preset} />;
}
