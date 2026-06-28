"use client";

import { Slider } from "@/components/ui/slider";
import type {
  CubicBezierPoints,
  EasingName,
  FunctionEasingName,
} from "@/lib/easing-gradients/easings";
import {
  createCubicBezier,
  EASINGS,
  getFunctionFormula,
  isFunctionPreset,
} from "@/lib/easing-gradients/easings";

import { GradientStripEditor } from "./gradient-strip-editor";

interface EasingControlsProps {
  preset: EasingName;
  bezier: CubicBezierPoints;
  onBezierChange: (bezier: CubicBezierPoints) => void;
  onBezierCustomize: () => void;
  precision: number;
  onPrecisionChange: (value: number) => void;
}

export function EasingControls({
  preset,
  bezier,
  onBezierChange,
  onBezierCustomize,
  precision,
  onPrecisionChange,
}: EasingControlsProps) {
  const isFunction = isFunctionPreset(preset);
  const easingFn = isFunction ? EASINGS[preset] : createCubicBezier(bezier);

  const functionPreset: FunctionEasingName = isFunction
    ? preset
    : "ease-out-sine";

  function updateBezierField(field: keyof CubicBezierPoints, next: number) {
    onBezierChange({
      ...bezier,
      [field]: Math.round(next * 100) / 100,
    });
    onBezierCustomize();
  }

  return (
    <div className="flex flex-col gap-8">
      <GradientStripEditor
        bezier={bezier}
        onBezierChange={onBezierChange}
        onCustomize={onBezierCustomize}
        easing={easingFn}
        precision={precision}
        editable={!isFunction}
      />

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {!isFunction ? (
          <>
            <BezierField
              label="x1"
              value={bezier.x1}
              min={0}
              max={1}
              onChange={(next) => updateBezierField("x1", next)}
            />
            <BezierField
              label="y1"
              value={bezier.y1}
              min={-0.5}
              max={1.5}
              onChange={(next) => updateBezierField("y1", next)}
            />
            <BezierField
              label="x2"
              value={bezier.x2}
              min={0}
              max={1}
              onChange={(next) => updateBezierField("x2", next)}
            />
            <BezierField
              label="y2"
              value={bezier.y2}
              min={-0.5}
              max={1.5}
              onChange={(next) => updateBezierField("y2", next)}
            />
          </>
        ) : (
          <div className="bg-secondary/40 rounded-lg px-3 py-2.5 sm:col-span-2 lg:col-span-3">
            <p className="text-muted-foreground mb-1 text-xs">Mix ratio at t</p>
            <p className="font-mono text-xs tabular-nums">
              {getFunctionFormula(functionPreset)}
            </p>
          </div>
        )}

        <Slider
          label="Stops"
          value={precision}
          min={5}
          max={24}
          step={1}
          onChange={onPrecisionChange}
          formatDisplayValue={(value) => String(value + 1)}
          className={!isFunction ? "sm:col-span-2 lg:col-span-1" : undefined}
        />
      </div>
    </div>
  );
}

function BezierField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      label={label}
      value={value}
      min={min}
      max={max}
      step={0.01}
      onChange={onChange}
    />
  );
}
