"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleMathShortcutKeyDown } from "@/lib/math-input-shortcuts";
import {
  CATEGORY_TO_TOPICS,
  DEFAULT_TOPICS,
  resolveTopicScope,
} from "@/lib/topics";

interface TopicAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function TopicAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Search topics...",
  className,
}: TopicAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const normalizedQuery = normalizeSearch(trimmed);
    const directMatches = options.filter((option) =>
      normalizeSearch(option).includes(normalizedQuery)
    );

    const categoryMatches = Object.entries(CATEGORY_TO_TOPICS)
      .filter(([category]) =>
        normalizeSearch(category).includes(normalizedQuery)
      )
      .flatMap(([, categoryTopics]) => categoryTopics);

    const mergedMatches = Array.from(
      new Set([...directMatches, ...categoryMatches])
    );

    return mergedMatches
      .sort((a, b) => {
        const aStarts = normalizeSearch(a).startsWith(normalizedQuery);
        const bStarts = normalizeSearch(b).startsWith(normalizedQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10);
  }, [options, query]);

  const showDropdown = focused && query.trim().length > 0 && filteredOptions.length > 0;

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            const nextValue = e.target.value;
            setQuery(nextValue);
            onChange(nextValue);
          }}
          onKeyDown={(event) => {
            handleMathShortcutKeyDown(event);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="flex h-11 w-full rounded-xl border border-border/50 bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border/60 bg-popover p-1 shadow-2xl">
          {filteredOptions.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setQuery(option);
                  setFocused(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="truncate">{option}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {resolveTopicScope(option).isCategory
                      ? "Category"
                      : DEFAULT_TOPICS.find((topic) => topic.name === option)?.category}
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/maths/g, "math")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
