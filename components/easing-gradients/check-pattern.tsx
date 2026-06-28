import { cn } from "@/lib/utils";

const CHECK_SIZE = 8;
const TILE_SIZE = CHECK_SIZE * 2;
const SQUARE = "var(--check-pattern-square)";
const BASE = "var(--check-pattern-base)";

export function CheckPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0", className)}
      style={{
        backgroundColor: BASE,
        backgroundImage: [
          `linear-gradient(45deg, ${SQUARE} 25%, transparent 25%)`,
          `linear-gradient(-45deg, ${SQUARE} 25%, transparent 25%)`,
          `linear-gradient(45deg, transparent 75%, ${SQUARE} 75%)`,
          `linear-gradient(-45deg, transparent 75%, ${SQUARE} 75%)`,
        ].join(", "),
        backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
        backgroundPosition: [
          "0 0",
          `0 ${CHECK_SIZE}px`,
          `${CHECK_SIZE}px -${CHECK_SIZE}px`,
          `-${CHECK_SIZE}px 0`,
        ].join(", "),
      }}
    />
  );
}

export function GradientPreviewSurface({
  gradient,
  className,
  children,
}: {
  gradient: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <CheckPattern />
      <div className="absolute inset-0" style={{ backgroundImage: gradient }} />
      {children}
    </div>
  );
}
