"use client";

import { useMemo, useState } from "react";

import { HighlightedCodeBlock } from "@/components/highlighted-code-block";
import { GRADIENT_TYPE_TABS } from "@/lib/easing-gradients/gradient-types";
import {
  generatePlainCssGradient,
  generateTailwindEasingClass,
  usageExamplesForFormat,
} from "@/lib/easing-gradients/tailwind";

import { useUiSound } from "./sound-provider";
import { SectionLabel, Segment, SegmentGroup } from "./ui";

type OutputFormat = "tailwind4" | "tailwind3" | "css";

const OUTPUT_TABS: { value: OutputFormat; label: string }[] = [
  { value: "tailwind4", label: "Tailwind v4" },
  { value: "tailwind3", label: "Tailwind v3" },
  { value: "css", label: "CSS" },
];

interface OutputTabsProps {
  className: string;
  easingLabel: string;
  easingFn: (t: number) => number;
  precision: number;
}

export function OutputTabs({
  className,
  easingLabel,
  easingFn,
  precision,
}: OutputTabsProps) {
  const [format, setFormat] = useState<OutputFormat>("tailwind4");
  const { playCopy } = useUiSound();

  const generatorOptions = useMemo(
    () => ({
      className,
      easing: easingFn,
      easingLabel,
      precision,
    }),
    [className, easingFn, easingLabel, precision]
  );

  const tailwind = useMemo(
    () => generateTailwindEasingClass(generatorOptions),
    [generatorOptions]
  );

  const plain = useMemo(
    () =>
      generatePlainCssGradient({
        className: "eased-gradient",
        easing: easingFn,
        easingLabel,
        precision,
      }),
    [easingFn, easingLabel, precision]
  );

  const usageClassName = format === "css" ? "eased-gradient" : className;

  const usageExamples = useMemo(
    () => usageExamplesForFormat(usageClassName, format),
    [usageClassName, format]
  );

  const css = format === "css" ? plain.css : tailwind.css;

  return (
    <section className="space-y-6">
      <SegmentGroup>
        {OUTPUT_TABS.map((tab) => (
          <Segment
            key={tab.value}
            active={format === tab.value}
            onClick={() => setFormat(tab.value)}
          >
            {tab.label}
          </Segment>
        ))}
      </SegmentGroup>

      <div className="space-y-2">
        <SectionLabel>CSS</SectionLabel>
        <HighlightedCodeBlock
          code={css}
          lang="css"
          copyLabel="Copy CSS"
          onCopied={playCopy}
        />
      </div>

      <div className="space-y-4">
        <SectionLabel>Usage</SectionLabel>
        <div className="space-y-4">
          {usageExamples.map((example) => {
            const tab = GRADIENT_TYPE_TABS.find(
              (item) => item.value === example.type
            );

            return (
              <div key={example.type} className="space-y-2">
                <SectionLabel>{tab?.label ?? example.type}</SectionLabel>
                <HighlightedCodeBlock
                  code={example.code}
                  lang="tsx"
                  copyLabel="Copy"
                  onCopied={playCopy}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
