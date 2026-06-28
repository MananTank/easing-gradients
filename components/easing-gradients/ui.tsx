"use client";

import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useUiSound } from "./sound-provider";

export const PAGE =
  "mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-14 sm:px-8";

export const EDITOR_PAGE =
  "mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-14 sm:px-8";

export const FIELD_LABEL = "text-muted-foreground text-xs tracking-wide";

export const CONTROL =
  "bg-secondary/50 focus-ring w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors";

export const CODE_BLOCK =
  "bg-secondary/40 overflow-x-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground/80";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "All presets",
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const { playClick } = useUiSound();

  return (
    <header className="space-y-3">
      {backHref ? (
        <Link
          href={backHref}
          onClick={playClick}
          className="text-muted-foreground hover:text-foreground focus-ring inline-flex items-center gap-1 text-xs transition-colors"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
      ) : null}
      <div className="space-y-1.5">
        <h1 className="text-lg font-normal tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function SegmentGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>{children}</div>
  );
}

export function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { playSync } = useUiSound();

  return (
    <button
      type="button"
      onClick={() => {
        playSync();
        onClick();
      }}
      className={cn(
        "focus-ring rounded-md px-2.5 py-1 text-[13px] transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className={FIELD_LABEL}>{label}</span>
      {children}
    </div>
  );
}

export function OptionSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs tracking-wide">{children}</p>
  );
}
