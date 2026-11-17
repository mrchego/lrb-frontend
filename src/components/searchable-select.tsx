// components/searchable-select.tsx
"use client";

// A theme-aware replacement for the native <select>, with optional search and groups.
// Native option lists are drawn by the browser/OS, ignore our dark theme and can't be
// searched. This is built from theme tokens (bg-popover, text-popover-foreground, ...).
//
// Same behaviour as the phone country picker (components/phone-country-select.tsx):
// not portaled (so it works inside Radix Dialog/Sheet focus traps), Escape closes only
// this list, Enter never submits the surrounding form, arrow keys + type-to-search.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { useMenuPlacement } from "@/lib/menu-placement";

export type SelectItem = {
  value: string;
  /** Main text of the row. */
  label: string;
  /** Muted text on the right of the row (a code, an offset...). Also searchable. */
  hint?: string;
  /** Group heading; rows with the same group should be adjacent. */
  group?: string;
  /** Extra words that should match the search but are not shown. */
  keywords?: string;
  /** Text shown in the closed button. Defaults to `label`. */
  triggerLabel?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: SelectItem[];
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Show the search box. Default: only when there are more than 8 items. */
  searchable?: boolean;
  "aria-label"?: string;
};

// "côte" matches "Cote d'Ivoire".
const fold = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const MENU_CHROME_PX = 56; // search box + padding above the list

export function SearchableSelect({
  value,
  onChange,
  items,
  id,
  disabled,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  searchable,
  ...rest
}: Props) {
  const showSearch = searchable ?? items.length > 8;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const { placement, measure } = useMenuPlacement(open, rootRef, {
    minWidth: 256,
    maxWidth: 384,
    chrome: showSearch ? MENU_CHROME_PX : 0,
  });

  const selected = items.find((i) => i.value === value);

  // Pre-fold once per items change, not on every keystroke.
  const searchIndex = useMemo(
    () =>
      items.map((item) => ({
        item,
        haystack: fold(`${item.label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.value}`),
        name: fold(item.label),
        hint: fold(item.hint ?? ""),
      })),
    [items],
  );

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return items;
    // Best matches first: exact hint/code ("kes"), then labels that START with the
    // query, then anything else that contains it.
    const rank = (e: (typeof searchIndex)[number]) =>
      e.hint === q ? 0 : e.name.startsWith(q) ? 1 : 2;
    return searchIndex
      .filter((e) => e.haystack.includes(q))
      .sort((a, b) => rank(a) - rank(b))
      .map((e) => e.item);
  }, [items, searchIndex, query]);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  const choose = useCallback(
    (next: string) => {
      onChange(next);
      close(true);
    },
    [onChange, close],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  // The (possibly visually hidden) search input always takes focus, so typing and arrow
  // keys work the same for short and long lists.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open, results]);

  const openList = () => {
    if (disabled) return;
    measure(); // place the panel before it appears
    setActive(Math.max(items.findIndex((i) => i.value === value), 0));
    setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault(); // never submit the surrounding form from here
      const pick = results[active];
      if (pick) choose(pick.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't also close a Dialog/Sheet around us
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const grouped = query.trim() === ""; // headings only make sense in the natural order

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={rest["aria-label"]}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      >
        <span className={`truncate ${selected ? "" : "text-muted-foreground"}`}>
          {selected ? (selected.triggerLabel ?? selected.label) : value || placeholder}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-muted-foreground"
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
          <div className={showSearch ? "border-b border-border p-2" : "sr-only"}>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
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
                Nothing found.
              </li>
            )}
            {results.map((item, i) => (
              <li key={item.value} role="presentation">
                {grouped && item.group && item.group !== results[i - 1]?.group && (
                  <div className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                    {item.group}
                  </div>
                )}
                <div
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={item.value === value}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()} // keep focus in the search box
                  onClick={() => choose(item.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2.5 text-sm sm:py-1.5 ${
                    i === active ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="text-muted-foreground tabular-nums">{item.hint}</span>
                  )}
                  {item.value === value && (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}