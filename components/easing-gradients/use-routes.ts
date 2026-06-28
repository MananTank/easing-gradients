"use client";

export function useEasingGradientsRoutes() {
  return {
    home: "/",
    preset: (id: string) => `/${id}`,
  };
}
