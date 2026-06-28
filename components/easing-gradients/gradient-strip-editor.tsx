"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { sampleEasingCurve } from "@/lib/easing-gradients/curve";
import type {
  CubicBezierPoints,
  EasingFn,
} from "@/lib/easing-gradients/easings";
import {
  generateEasedPreviewGradient,
  generateLinearPreviewGradient,
} from "@/lib/easing-gradients/preview";
import { cn } from "@/lib/utils";

import { GradientPreviewSurface } from "./check-pattern";
import { SectionLabel } from "./ui";

const STRIP_DIRECTION = "to right";
const WIDTH = 640;
const PLOT_H = 112;
const OVERFLOW_Y = 32;
const HEIGHT = PLOT_H + OVERFLOW_Y * 2;
const PAD_Y = OVERFLOW_Y;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function toPlotX(value: number) {
  return clamp(value, 0, 1) * WIDTH;
}

function toPlotY(value: number) {
  return PAD_Y + value * PLOT_H;
}

function fromPlotX(coordinate: number) {
  return round(clamp(coordinate / WIDTH, 0, 1));
}

function fromPlotY(coordinate: number, allowOverflow = false) {
  const value = round((coordinate - PAD_Y) / PLOT_H);
  if (allowOverflow) return value;
  return round(clamp(value, 0, 1));
}

interface GradientStripEditorProps {
  bezier: CubicBezierPoints;
  onBezierChange: (value: CubicBezierPoints) => void;
  onCustomize: () => void;
  easing: EasingFn;
  precision: number;
  editable?: boolean;
  className?: string;
}

export function GradientStripEditor({
  bezier,
  onBezierChange,
  onCustomize,
  easing,
  precision,
  editable = true,
  className,
}: GradientStripEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"p1" | "p2" | null>(null);

  const easedGradient = useMemo(
    () =>
      generateEasedPreviewGradient({
        type: "linear",
        direction: STRIP_DIRECTION,
        easing,
        precision,
      }),
    [easing, precision]
  );

  const linearGradient = useMemo(
    () =>
      generateLinearPreviewGradient({
        type: "linear",
        direction: STRIP_DIRECTION,
      }),
    []
  );

  const curvePath = useMemo(() => {
    return sampleEasingCurve(easing, 64)
      .map(({ x, y }, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${toPlotX(x)} ${toPlotY(y)}`;
      })
      .join(" ");
  }, [easing]);

  const startX = 0;
  const startY = toPlotY(0);
  const endX = WIDTH;
  const endY = toPlotY(1);
  const p1x = toPlotX(bezier.x1);
  const p1y = toPlotY(bezier.y1);
  const p2x = toPlotX(bezier.x2);
  const p2y = toPlotY(bezier.y2);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number, handle: "p1" | "p2") => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * WIDTH;
      const y = ((clientY - rect.top) / rect.height) * HEIGHT;

      onCustomize();

      if (handle === "p1") {
        onBezierChange({
          ...bezier,
          x1: fromPlotX(x),
          y1: fromPlotY(y, true),
        });
        return;
      }

      onBezierChange({
        ...bezier,
        x2: fromPlotX(x),
        y2: fromPlotY(y, true),
      });
    },
    [bezier, onBezierChange, onCustomize]
  );

  function handlePointerDown(handle: "p1" | "p2") {
    return (event: React.PointerEvent<SVGCircleElement>) => {
      if (!editable) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(handle);
    };
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    updateFromPointer(event.clientX, event.clientY, dragging);
  }

  function handlePointerUp() {
    setDragging(null);
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <div className="relative overflow-visible px-1 pt-8 pb-8">
          <GradientPreviewSurface
            gradient={easedGradient.backgroundImage}
            className="ring-border/60 h-28 rounded-lg ring-1"
          />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            overflow="visible"
            className="absolute inset-x-1 top-0 bottom-0 h-full w-[calc(100%-0.5rem)] touch-none overflow-visible select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            aria-label="Easing gradient editor"
            role="img"
          >
            <path
              d={curvePath}
              fill="none"
              className="stroke-foreground/90"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {editable ? (
              <>
                <line
                  x1={startX}
                  y1={startY}
                  x2={p1x}
                  y2={p1y}
                  className="stroke-foreground/35"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={endX}
                  y1={endY}
                  x2={p2x}
                  y2={p2y}
                  className="stroke-foreground/35"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />

                <circle
                  cx={p1x}
                  cy={p1y}
                  r="8"
                  className="stroke-background fill-foreground/85 cursor-grab active:cursor-grabbing"
                  strokeWidth="2"
                  onPointerDown={handlePointerDown("p1")}
                />
                <circle
                  cx={p2x}
                  cy={p2y}
                  r="8"
                  className="stroke-background fill-foreground/85 cursor-grab active:cursor-grabbing"
                  strokeWidth="2"
                  onPointerDown={handlePointerDown("p2")}
                />
              </>
            ) : null}

            <circle
              cx={startX}
              cy={startY}
              r="3.5"
              className="fill-foreground/70"
            />
            <circle
              cx={endX}
              cy={endY}
              r="3.5"
              className="fill-foreground/70"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Linear reference</SectionLabel>
        <GradientPreviewSurface
          gradient={linearGradient.backgroundImage}
          className="ring-border/40 h-10 rounded-lg opacity-70 ring-1"
        />
      </div>
    </div>
  );
}
