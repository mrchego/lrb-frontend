// lib/menu-placement.ts
"use client";

// Where to put a dropdown panel so it always fits on screen, on phones too.
//
// The panel is positioned `absolute` inside the trigger's wrapper (NOT portaled, so it
// keeps working inside Radix Dialog/Sheet). We only decide three things, in pixels:
//   - left / width  : as wide as wanted, but never wider than the screen, and shifted
//                     left or right so neither edge leaves the screen
//   - dropUp        : open upward when there is more room above than below
//   - listMaxHeight : shrink the scrolling list to the room actually available
// It uses the *visual* viewport, which shrinks when a phone's on-screen keyboard opens
// (the search box opens it), so the panel stays above the keyboard.

import { useCallback, useEffect, useState, type RefObject } from "react";

export type Placement = {
  /** px offset from the trigger wrapper's left edge (negative = shifted left) */
  left: number;
  width: number;
  dropUp: boolean;
  /** max height for the scrolling list, in px */
  listMaxHeight: number;
};

type Rect = { left: number; top: number; bottom: number; width: number };
type Viewport = { width: number; height: number; offsetLeft: number; offsetTop: number };
type Options = {
  /** Panel is at least this wide when there's room (e.g. a narrow trigger). */
  minWidth: number;
  maxWidth: number;
  /** Height of everything in the panel except the list (search box etc.), px. */
  chrome: number;
};

const MARGIN = 8; // keep this far from every screen edge
const LIST_MIN = 120;
const LIST_MAX = 256; // 16rem, the desktop height
const ROOM_WANTED = 220; // open downward only if at least this much room below

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

/** Pure maths, no DOM: easy to test. */
export function computePlacement(rect: Rect, vp: Viewport, opts: Options): Placement {
  const width = Math.min(
    Math.max(rect.width, opts.minWidth),
    opts.maxWidth,
    vp.width - 2 * MARGIN,
  );
  const minLeft = vp.offsetLeft + MARGIN;
  const maxLeft = vp.offsetLeft + vp.width - MARGIN - width;
  const left = clamp(rect.left, minLeft, maxLeft) - rect.left;

  const below = vp.offsetTop + vp.height - rect.bottom - MARGIN;
  const above = rect.top - vp.offsetTop - MARGIN;
  const dropUp = below < ROOM_WANTED && above > below;
  const room = (dropUp ? above : below) - opts.chrome - MARGIN;

  return { left, width, dropUp, listMaxHeight: clamp(room, LIST_MIN, LIST_MAX) };
}

function viewport(): Viewport {
  const v = window.visualViewport;
  return {
    width: v?.width ?? window.innerWidth,
    height: v?.height ?? window.innerHeight,
    offsetLeft: v?.offsetLeft ?? 0,
    offsetTop: v?.offsetTop ?? 0,
  };
}

/**
 * `measure()` computes the placement from the anchor's current position; call it right
 * before opening. While `open`, it re-measures on resize, rotation, scroll and when the
 * on-screen keyboard appears.
 */
export function useMenuPlacement(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  opts: Options,
) {
  const { minWidth, maxWidth, chrome } = opts;
  const [placement, setPlacement] = useState<Placement | null>(null);

  const measure = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const next = computePlacement(el.getBoundingClientRect(), viewport(), { minWidth, maxWidth, chrome });
    setPlacement((prev) =>
      prev &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.dropUp === next.dropUp &&
      prev.listMaxHeight === next.listMaxHeight
        ? prev
        : next,
    );
  }, [anchorRef, minWidth, maxWidth, chrome]);

  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true); // any scroll container
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
    };
  }, [open, measure]);

  return { placement, measure };
}