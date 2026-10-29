"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import loaderAnimation from "@/components/animations/loader.json";

type Rgb = [number, number, number];

const NAVY: Rgb = [0.0078, 0.102, 0.1922];
const DARK_MODE_NAVY: Rgb = [1, 1, 1];

const SIZES = {
  sm: 48, // table overlays, cards, buttons
  md: 120, // default, page sections
  lg: 200, // full-screen
} as const;

const VARIANTS = {
  // Covers the whole viewport (initial auth check, no sidebar yet)
  screen: "fixed inset-0 z-50 bg-background",
  // Fills the content area next to the sidebar
  section: "min-h-[60vh] w-full flex-1",
  // Takes only the space the animation needs (cells, cards, buttons)
  inline: "",
} as const;

type LoadingProps = {
  size?: keyof typeof SIZES;
  variant?: keyof typeof VARIANTS;
  className?: string;
};

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

// Built once, on first use, then shared by every <Loading /> on the page.
let darkAnimation: typeof loaderAnimation | null = null;

function getDarkAnimation() {
  if (!darkAnimation) {
    darkAnimation = structuredClone(loaderAnimation);
    recolorNavyToWhite(darkAnimation);
  }
  return darkAnimation;
}

export function Loading({
  size = "md",
  variant = "section",
  className,
}: LoadingProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const px = SIZES[size];
  const boxStyle = { width: px, height: px };
  const wrapperClass = cn(
    "flex items-center justify-center",
    VARIANTS[variant],
    className,
  );

  // Reserve the same space before mount so the layout doesn't jump
  if (!mounted) {
    return (
      <div className={wrapperClass}>
        <div style={boxStyle} className="shrink-0" />
      </div>
    );
  }

  const animation =
    resolvedTheme === "dark" ? getDarkAnimation() : loaderAnimation;

  return (
    <div role="status" aria-label="Loading" className={wrapperClass}>
      <div style={boxStyle} className="shrink-0 overflow-hidden">
        <Lottie
          src={animation}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        />
      </div>
    </div>
  );
}

/**
 * Dims a container while it refetches. The parent MUST be `relative`.
 * Use it for tables, lists and cards that already have layout around them.
 */
export function LoadingOverlay({ size = "sm" }: { size?: keyof typeof SIZES }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
      <Loading size={size} variant="inline" />
    </div>
  );
}