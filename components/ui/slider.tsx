"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { decimalsForStep, roundValue, snapToDecile } from "@/lib/slider-utils";
import { cn } from "@/lib/utils";

const CLICK_THRESHOLD = 3;
const DEAD_ZONE = 32;
const MAX_CURSOR_RANGE = 200;
const MAX_STRETCH = 8;

export interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatDisplayValue?: (value: number) => string;
  className?: string;
  "aria-label"?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  formatDisplayValue,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueSpanRef = useRef<HTMLButtonElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isValueHovered, setIsValueHovered] = useState(false);
  const [isValueEditable, setIsValueEditable] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const isClickRef = useRef(true);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const wrapperRectRef = useRef<DOMRect | null>(null);
  const scaleRef = useRef(1);

  const percentage = ((value - min) / (max - min)) * 100;
  const isActive = isInteracting || isHovered;

  const fillPercent = useMotionValue(percentage);
  const fillWidth = useTransform(fillPercent, (pct) => `${pct}%`);
  const handleLeft = useTransform(
    fillPercent,
    (pct) => `max(5px, calc(${pct}% - 9px))`
  );

  const rubberStretchPx = useMotionValue(0);
  const rubberBandWidth = useTransform(
    rubberStretchPx,
    (stretch) => `calc(100% + ${Math.abs(stretch)}px)`
  );
  const rubberBandX = useTransform(rubberStretchPx, (stretch) =>
    stretch < 0 ? stretch : 0
  );

  useEffect(() => {
    if (!isInteracting && !animRef.current) {
      fillPercent.jump(percentage);
    }
  }, [percentage, isInteracting, fillPercent]);

  const positionToValue = useCallback(
    (clientX: number) => {
      const rect = wrapperRectRef.current;
      if (!rect) return value;
      const screenX = clientX - rect.left;
      const sceneX = screenX / scaleRef.current;
      const nativeWidth = wrapperRef.current
        ? wrapperRef.current.offsetWidth
        : rect.width;
      const percent = Math.max(0, Math.min(1, sceneX / nativeWidth));
      const rawValue = min + percent * (max - min);
      return Math.max(min, Math.min(max, rawValue));
    },
    [min, max, value]
  );

  const percentFromValue = useCallback(
    (next: number) => ((next - min) / (max - min)) * 100,
    [min, max]
  );

  const computeRubberStretch = useCallback((clientX: number, sign: number) => {
    const rect = wrapperRectRef.current;
    if (!rect) return 0;
    const distancePast = sign < 0 ? rect.left - clientX : clientX - rect.right;
    const overflow = Math.max(0, distancePast - DEAD_ZONE);
    return (
      sign * MAX_STRETCH * Math.sqrt(Math.min(overflow / MAX_CURSOR_RANGE, 1))
    );
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (showInput) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerDownPos.current = { x: event.clientX, y: event.clientY };
      isClickRef.current = true;
      setIsInteracting(true);

      if (wrapperRef.current) {
        wrapperRectRef.current = wrapperRef.current.getBoundingClientRect();
        const nativeWidth = wrapperRef.current.offsetWidth;
        scaleRef.current = wrapperRectRef.current.width / nativeWidth;
      }
    },
    [showInput]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isInteracting || !pointerDownPos.current) return;

      const dx = event.clientX - pointerDownPos.current.x;
      const dy = event.clientY - pointerDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (isClickRef.current && distance > CLICK_THRESHOLD) {
        isClickRef.current = false;
        setIsDragging(true);
      }

      if (!isClickRef.current) {
        const rect = wrapperRectRef.current;
        if (rect) {
          if (event.clientX < rect.left) {
            rubberStretchPx.jump(computeRubberStretch(event.clientX, -1));
          } else if (event.clientX > rect.right) {
            rubberStretchPx.jump(computeRubberStretch(event.clientX, 1));
          } else {
            rubberStretchPx.jump(0);
          }
        }

        const newValue = positionToValue(event.clientX);
        const newPct = percentFromValue(newValue);
        if (animRef.current) {
          animRef.current.stop();
          animRef.current = null;
        }
        fillPercent.jump(newPct);
        onChange(roundValue(newValue, step));
      }
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      onChange,
      step,
      fillPercent,
      rubberStretchPx,
      computeRubberStretch,
    ]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isInteracting) return;

      if (isClickRef.current) {
        const rawValue = positionToValue(event.clientX);
        const discreteSteps = (max - min) / step;
        const snappedValue =
          discreteSteps <= 10
            ? Math.max(
                min,
                Math.min(max, min + Math.round((rawValue - min) / step) * step)
              )
            : snapToDecile(rawValue, min, max);

        const newPct = percentFromValue(snappedValue);

        if (animRef.current) {
          animRef.current.stop();
        }
        animRef.current = animate(fillPercent, newPct, {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
          onComplete: () => {
            animRef.current = null;
          },
        });
        onChange(roundValue(snappedValue, step));
      }

      if (rubberStretchPx.get() !== 0) {
        animate(rubberStretchPx, 0, {
          type: "spring",
          visualDuration: 0.35,
          bounce: 0.15,
        });
      }

      setIsInteracting(false);
      setIsDragging(false);
      pointerDownPos.current = null;
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      onChange,
      min,
      max,
      step,
      fillPercent,
      rubberStretchPx,
    ]
  );

  useEffect(() => {
    if (isValueHovered && !showInput && !isValueEditable) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsValueEditable(true);
      }, 800);
    } else if (!isValueHovered && !showInput) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setIsValueEditable(false);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isValueHovered, showInput, isValueEditable]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  const handleInputSubmit = () => {
    const parsed = parseFloat(inputValue);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(roundValue(clamped, step));
    }
    setShowInput(false);
    setIsValueHovered(false);
    setIsValueEditable(false);
  };

  const handleValueClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isValueEditable) {
      event.stopPropagation();
      event.preventDefault();
      setShowInput(true);
      setInputValue(value.toFixed(decimalsForStep(step)));
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleInputSubmit();
    } else if (event.key === "Escape") {
      setShowInput(false);
      setIsValueHovered(false);
    }
  };

  const displayValue = formatDisplayValue
    ? formatDisplayValue(value)
    : value.toFixed(decimalsForStep(step));

  const HANDLE_BUFFER = 8;
  const LABEL_CSS_LEFT = 10;
  const VALUE_CSS_RIGHT = 10;
  let leftThreshold = 30;
  let rightThreshold = 78;
  const trackWidth = wrapperRef.current?.offsetWidth;
  if (trackWidth && trackWidth > 0) {
    if (labelRef.current) {
      leftThreshold =
        ((LABEL_CSS_LEFT + labelRef.current.offsetWidth + HANDLE_BUFFER) /
          trackWidth) *
        100;
    }
    if (valueSpanRef.current) {
      rightThreshold =
        ((trackWidth -
          VALUE_CSS_RIGHT -
          valueSpanRef.current.offsetWidth -
          HANDLE_BUFFER) /
          trackWidth) *
        100;
    }
  }

  const valueDodge = percentage < leftThreshold || percentage > rightThreshold;
  const handleOpacity = !isActive
    ? 0
    : valueDodge
      ? 0.1
      : isDragging
        ? 0.9
        : 0.5;

  const discreteSteps = (max - min) / step;
  const hashMarks =
    discreteSteps <= 10
      ? Array.from({ length: discreteSteps - 1 }, (_, index) => {
          const pct = (((index + 1) * step) / (max - min)) * 100;
          return (
            <div
              key={`step-${pct}`}
              className={cn(
                "absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 motion-reduce:transition-none",
                isActive ? "bg-muted-foreground/25" : "bg-transparent"
              )}
              style={{ left: `${pct}%` }}
            />
          );
        })
      : Array.from({ length: 9 }, (_, index) => {
          const pct = (index + 1) * 10;
          return (
            <div
              key={`decile-${pct}`}
              className={cn(
                "absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 motion-reduce:transition-none",
                isActive ? "bg-muted-foreground/25" : "bg-transparent"
              )}
              style={{ left: `${pct}%` }}
            />
          );
        });

  return (
    <div ref={wrapperRef} className={cn("relative h-9", className)}>
      <motion.div
        ref={trackRef}
        className="absolute inset-0 w-full cursor-pointer touch-none overflow-hidden rounded-md bg-muted select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: rubberBandWidth, x: rubberBandX }}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel ?? label}
      >
        <div className="pointer-events-none absolute inset-0">{hashMarks}</div>

        <motion.div
          className={cn(
            "pointer-events-none absolute inset-y-0 start-0 transition-colors duration-150 motion-reduce:transition-none",
            isActive ? "bg-primary" : "bg-primary/25"
          )}
          style={{ width: fillWidth }}
        />

        <motion.div
          className="pointer-events-none absolute top-1/2 h-5 w-[3px] rounded-full bg-background ring-1 ring-ring"
          style={{
            left: handleLeft,
            y: "-50%",
          }}
          animate={{
            opacity: handleOpacity,
            scaleX: isActive ? 1 : 0.25,
            scaleY: isActive && valueDodge ? 0.75 : 1,
          }}
          transition={{
            scaleX: { type: "spring", visualDuration: 0.25, bounce: 0.15 },
            scaleY: { type: "spring", visualDuration: 0.2, bounce: 0.1 },
            opacity: { duration: 0.15 },
          }}
        />

        {label ? (
          <span
            ref={labelRef}
            className="pointer-events-none absolute top-1/2 start-2.5 inline-flex -translate-y-[calc(50%+0.5px)] items-center text-[0.8125rem] font-medium text-muted-foreground transition-colors duration-150 motion-reduce:transition-none"
          >
            {label}
          </span>
        ) : null}

        {showInput ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="absolute top-1/2 end-2.5 w-[4ch] min-w-[3ch] max-w-[6ch] -translate-y-1/2 border-0 border-b border-input bg-transparent p-0 pb-px text-right font-mono text-[0.8125rem] font-medium text-muted-foreground tabular-nums outline-none focus:border-ring focus:text-foreground"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputSubmit}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={ariaLabel ?? label ?? "Slider value"}
          />
        ) : (
          <button
            ref={valueSpanRef}
            type="button"
            tabIndex={isValueEditable ? 0 : -1}
            disabled={!isValueEditable}
            className={cn(
              "pointer-events-auto absolute top-1/2 end-2.5 m-0 translate-y-[calc(-50%+0.5px)] border-0 border-b bg-transparent p-0 pb-px font-mono text-[0.8125rem] font-medium text-muted-foreground tabular-nums transition-[color,border-color] duration-150 motion-reduce:transition-none disabled:cursor-default",
              isActive && "text-foreground",
              isValueEditable
                ? "cursor-text border-border"
                : "cursor-default border-transparent"
            )}
            onMouseEnter={() => setIsValueHovered(true)}
            onMouseLeave={() => setIsValueHovered(false)}
            onClick={handleValueClick}
            onMouseDown={(event) => isValueEditable && event.stopPropagation()}
            aria-label={
              isValueEditable
                ? `Edit ${ariaLabel ?? label ?? "slider"} value`
                : undefined
            }
          >
            {displayValue}
          </button>
        )}
      </motion.div>
    </div>
  );
}
