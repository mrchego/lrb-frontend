// components/phone-country-select.tsx
"use client";

// A replacement for react-phone-number-input's country picker, which is a native
// <select>. Native option lists are drawn by the browser/OS and ignore our dark theme
// (white list, light text = invisible countries), and they can't be searched.
// This one is built from our theme tokens (bg-popover, text-popover-foreground, ...), so
// it follows light/dark automatically, and it has a search box.
//
// Deliberately NOT portaled: inside a Radix Dialog/Sheet, content portaled to <body>
// is outside the focus trap and gets pointer-events: none. It renders in place instead.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentType, KeyboardEvent } from "react";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js/max";

import { useMenuPlacement } from "@/lib/menu-placement";

type Option = { value?: string; label: string; divider?: boolean };

type Props = {
  value?: string;
  onChange: (country: string | undefined) => void;
  options: Option[];
  disabled?: boolean;
  readOnly?: boolean;
  iconComponent: ComponentType<{ country?: string; label: string; aspectRatio?: number }>;
  onFocus?: () => void;
  onBlur?: () => void;
  "aria-label"?: string;
};

// "côte" matches "Cote d'Ivoire"; "ivoire" matches both.
const fold = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function callingCode(country: string): string {
  try {
    return getCountryCallingCode(country as CountryCode);
  } catch {
    return "";
  }
}

export function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  iconComponent: Icon,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const { placement, measure } = useMenuPlacement(open, rootRef, {
    minWidth: 288,
    maxWidth: 384,
    chrome: 56,
  });

  const countries = useMemo(
    () =>
      options
        .filter((o) => !o.divider && o.value)
        .map((o) => ({ code: o.value as string, name: o.label, dial: callingCode(o.value as string) })),
    [options],
  );
  const selected = countries.find((c) => c.code === value);

  const results = useMemo(() => {
    const q = fold(query.trim().replace(/^\+/, ""));
    if (!q) return countries;
    const hits = countries.filter(
      (c) =>
        fold(c.name).includes(q) || c.code.toLowerCase() === q || c.dial.startsWith(q),
    );
    // Best matches first: exact code ("ke"), then names that START with the query
    // ("uga" -> Uganda before Portugal), then everything else in the original order.
    const rank = (c: (typeof hits)[number]) =>
      c.code.toLowerCase() === q ? 0 : fold(c.name).startsWith(q) ? 1 : 2;
    return [...hits].sort((a, b) => rank(a) - rank(b));
  }, [countries, query]);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  const choose = useCallback(
    (code: string) => {
      onChange(code);
      close(false); // the library moves focus to the number input after a pick
    },
    [onChange, close],
  );

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  // On open: focus the search box and start on the current country.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted row in view while arrowing through the list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open, results]);

  const openList = () => {
    if (disabled || readOnly) return;
    measure(); // place the panel before it appears
    const start = countries.findIndex((c) => c.code === value);
    setActive(Math.max(start, 0));
    setOpen(true);
  };

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // never submit the surrounding form from here
      const pick = results[active];
      if (pick) choose(pick.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't also close a Dialog/Sheet around us
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || readOnly}
        onClick={() => (open ? close(false) : openList())}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={rest["aria-label"] ?? "Country"}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        {selected ? (
          <>
            <Icon country={selected.code} label={selected.name} />
            <span className="text-muted-foreground tabular-nums">+{selected.dial}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Country</span>
        )}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={placement ? { left: placement.left, width: placement.width } : undefined}
          className={`absolute z-50 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md ${
            placement?.dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="border-b border-border p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Search country or code…"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${results[active].code}` : undefined}
              className="h-10 w-full rounded-md border border-input bg-transparent px-2 text-base text-foreground sm:h-8 sm:text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            style={{ maxHeight: placement?.listMaxHeight ?? 256 }}
            className="overflow-y-auto overscroll-contain p-1"
          >
            {results.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No country found.
              </li>
            )}
            {results.map((c, i) => (
              <li
                key={c.code}
                id={`${listId}-${c.code}`}
                data-index={i}
                role="option"
                aria-selected={c.code === value}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the search box
                onClick={() => choose(c.code)}
                className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2.5 text-sm sm:py-1.5 ${
                  i === active ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <Icon country={c.code} label={c.name} />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground tabular-nums">+{c.dial}</span>
                {c.code === value && (
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}