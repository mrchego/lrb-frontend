"use client";

import { useEffect, useMemo, useState } from "react";
import { Lottie } from "lottie-react";
import { useTheme } from "next-themes";

import loaderAnimation from "@/components/animations/loader.json";

type Rgb = [number, number, number];

const NAVY: Rgb = [0.0078, 0.102, 0.1922];
const DARK_MODE_NAVY: Rgb = [1, 1, 1];

function isSameColor(value: unknown, target: Rgb): boolean {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((channel, index) => channel === target[index])
  );
}

function recolorNavyToWhite(node: unknown): void {
  if (!node || typeof node !== "object") return;

  const record = node as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const value = record[key];

    if (isSameColor(value, NAVY)) {
      record[key] = [...DARK_MODE_NAVY];
      continue;
    }

    recolorNavyToWhite(value);
  }
}

export function Loading() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animation = useMemo(() => {
    if (resolvedTheme !== "dark") return loaderAnimation;

    const copy = structuredClone(loaderAnimation);
    recolorNavyToWhite(copy);
    return copy;
  }, [resolvedTheme]);

  if (!mounted) {
    return <div className="h-24 w-24" />;
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
    >
      <Lottie src={animation} loop autoplay className="h-24 w-24" />
    </div>
  );
}