import {
  pathFromSamples,
  sampleEasingCurve,
} from "@/lib/easing-gradients/curve";
import type { EasingFn } from "@/lib/easing-gradients/easings";

const SIZE = 120;
const PAD = 10;
const PLOT = SIZE - PAD * 2;

function toThumbX(value: number) {
  return PAD + Math.min(1, Math.max(0, value)) * PLOT;
}

function toThumbY(value: number) {
  return PAD + (1 - value) * PLOT;
}

function thumbPathFromSamples(samples: { x: number; y: number }[]) {
  return samples
    .map(({ x, y }, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${toThumbX(x)} ${toThumbY(y)}`;
    })
    .join(" ");
}

interface CurveThumbnailProps {
  easing: EasingFn;
  className?: string;
}

export function CurveThumbnail({ easing, className }: CurveThumbnailProps) {
  const path = thumbPathFromSamples(sampleEasingCurve(easing, 48));

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden>
      <rect
        x={PAD}
        y={PAD}
        width={PLOT}
        height={PLOT}
        className="fill-secondary/40 stroke-border/60"
        rx="6"
      />
      <line
        x1={PAD}
        y1={PAD + PLOT}
        x2={PAD + PLOT}
        y2={PAD}
        className="stroke-border/60"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path
        d={path}
        fill="none"
        className="stroke-foreground/80"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle
        cx={PAD}
        cy={PAD + PLOT}
        r="2.5"
        className="fill-muted-foreground"
      />
      <circle cx={PAD + PLOT} cy={PAD} r="2.5" className="fill-foreground" />
    </svg>
  );
}

export function CurveThumbnailLarge({ easing }: { easing: EasingFn }) {
  const path = pathFromSamples(sampleEasingCurve(easing, 64));

  return (
    <svg viewBox="0 0 280 280" className="h-full w-full" aria-hidden>
      <path
        d={path}
        fill="none"
        className="stroke-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
