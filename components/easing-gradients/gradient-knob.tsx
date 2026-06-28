"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { useUiSound } from "./sound-provider";

const TICK_MIN_INTERVAL_MS = 14;

function angleFromPointer(clientX: number, clientY: number, rect: DOMRect) {
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  let degrees = Math.round((Math.atan2(x, -y) * 180) / Math.PI);

  if (degrees < 0) {
    degrees += 360;
  }

  return degrees;
}

interface GradientKnobProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function GradientKnob({
  value,
  onChange,
  className,
}: GradientKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastValueRef = useRef(value);
  const lastTickAtRef = useRef(0);
  const { playTick } = useUiSound();

  useEffect(() => {
    lastValueRef.current = value;
  }, [value]);

  const setValue = useCallback(
    (next: number) => {
      if (next === lastValueRef.current) {
        return;
      }

      const now = performance.now();
      if (now - lastTickAtRef.current >= TICK_MIN_INTERVAL_MS) {
        playTick();
        lastTickAtRef.current = now;
      }

      lastValueRef.current = next;
      onChange(next);
    },
    [onChange, playTick]
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const element = knobRef.current;
      if (!element) return;

      setValue(
        angleFromPointer(clientX, clientY, element.getBoundingClientRect())
      );
    },
    [setValue]
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 15 : 1;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setValue((value + 360 - step) % 360);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setValue((value + step) % 360);
    }
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        ref={knobRef}
        role="slider"
        tabIndex={0}
        aria-label="Gradient rotation"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={value}
        aria-valuetext={`${value} degrees`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-secondary/50 focus-ring relative size-10 shrink-0 touch-none rounded-full",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${value}deg)` }}
        >
          <span className="bg-foreground/70 block h-3 w-0.5 -translate-y-1.5 rounded-full" />
        </div>
        <span
          aria-hidden
          className="bg-foreground/25 absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      </div>
      <span className="text-muted-foreground w-8 font-mono text-xs tabular-nums">
        {value}°
      </span>
    </div>
  );
}
