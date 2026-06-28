"use client";

import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";

import { cn } from "@/lib/utils";
import "./code-block.css";

const THEMES = {
  dark: "vesper" as const,
  light: "github-light" as const,
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEMES.dark, THEMES.light],
      langs: ["css", "html", "text", "tsx"],
    });
  }

  return highlighterPromise;
}

interface HighlightedCodeBlockProps {
  code: string;
  lang: "css" | "html" | "text" | "tsx";
  className?: string;
  copyLabel?: string;
  onCopied?: () => void;
}

export function HighlightedCodeBlock({
  code,
  lang,
  className,
  copyLabel,
  onCopied,
}: HighlightedCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      const highlighter = await getHighlighter();
      const result = highlighter.codeToHtml(code, {
        lang,
        themes: THEMES,
        defaultColor: false,
      });

      if (!cancelled) {
        setHtml(result);
      }
    }

    void highlight();

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  async function copy() {
    await navigator.clipboard.writeText(code);
    onCopied?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const blockClassName = cn(
    "code-block overflow-x-auto rounded-lg bg-secondary/40 p-4 font-mono text-[13px] leading-relaxed",
    "[&>pre]:bg-transparent! [&>pre>code]:font-mono [&>pre>code]:text-[13px] [&>pre>code]:leading-relaxed",
    className
  );

  const content = !html ? (
    <pre className={blockClassName}>
      <code>{code}</code>
    </pre>
  ) : (
    <div
      className={blockClassName}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  if (!copyLabel) {
    return content;
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => void copy()}
        className={cn(
          "focus-ring absolute top-2.5 right-2.5 z-10 rounded-md px-2 py-1 text-xs text-muted-foreground transition-opacity hover:text-foreground",
          copied
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        )}
      >
        {copied ? "Copied" : copyLabel}
      </button>
      {content}
    </div>
  );
}
