"use client";

import { Undo2Icon } from "lucide-react";
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

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const { playClick } = useUiSound();

  return (
    <header className="space-y-8">
      {backHref ? (
        <Link
          href={backHref}
          onClick={playClick}
          className="focus-ring inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Undo2Icon className="size-3.5" />
          {backLabel}
        </Link>
      ) : null}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight capitalize">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-normal text-muted-foreground">
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
      <span className="text-muted-foreground text-xs tracking-wide">
        {label}
      </span>
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
    <p className="text-xs tracking-wide text-muted-foreground">{children}</p>
  );
}
