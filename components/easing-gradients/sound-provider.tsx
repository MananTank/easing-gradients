"use client";

import type { SoundPatch } from "@web-kits/audio";
import { SoundProvider, usePatch } from "@web-kits/audio/react";
import { createContext, useContext, useMemo } from "react";

import corePatch from "./patches/core.json";

type UiSounds = {
  playClick: () => void;
  playCopy: () => void;
  playTick: () => void;
  playSync: () => void;
  playToggleOn: () => void;
};

const UiSoundContext = createContext<UiSounds | null>(null);

function UiSoundInner({ children }: { children: React.ReactNode }) {
  const patch = usePatch(corePatch as SoundPatch);

  const sounds = useMemo(
    () => ({
      playClick: () => {
        patch.play("click");
      },
      playCopy: () => {
        patch.play("copy");
      },
      playTick: () => {
        patch.play("tick");
      },
      playSync: () => {
        patch.play("sync");
      },
      playToggleOn: () => {
        patch.play("toggle-on");
      },
    }),
    [patch]
  );

  return (
    <UiSoundContext.Provider value={sounds}>{children}</UiSoundContext.Provider>
  );
}

export function EasingGradientsSoundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider volume={0.55}>
      <UiSoundInner>{children}</UiSoundInner>
    </SoundProvider>
  );
}

export function useUiSound() {
  const context = useContext(UiSoundContext);

  if (!context) {
    throw new Error(
      "useUiSound must be used within EasingGradientsSoundProvider"
    );
  }

  return context;
}
