import type * as React from "react";

type MathInputElement = HTMLInputElement | HTMLTextAreaElement;

const WORD_SHORTCUTS = [
  { trigger: "sqrt", replacement: "\\sqrt{}", cursorOffset: 6 },
  { trigger: "int", replacement: "\\int ", cursorOffset: 5 },
  { trigger: "sum", replacement: "\\sum ", cursorOffset: 5 },
  { trigger: "prod", replacement: "\\prod ", cursorOffset: 6 },
  { trigger: "lim", replacement: "\\lim ", cursorOffset: 5 },
  { trigger: "theta", replacement: "\\theta ", cursorOffset: 7 },
  { trigger: "alpha", replacement: "\\alpha ", cursorOffset: 7 },
  { trigger: "beta", replacement: "\\beta ", cursorOffset: 6 },
  { trigger: "gamma", replacement: "\\gamma ", cursorOffset: 7 },
  { trigger: "delta", replacement: "\\delta ", cursorOffset: 7 },
  { trigger: "lambda", replacement: "\\lambda ", cursorOffset: 8 },
  { trigger: "pi", replacement: "\\pi ", cursorOffset: 4 },
] as const;

function applyReplacement(
  element: MathInputElement,
  start: number,
  end: number,
  replacement: string,
  cursorPosition: number
) {
  element.setRangeText(replacement, start, end, "end");
  element.dispatchEvent(new Event("input", { bubbles: true }));

  window.requestAnimationFrame(() => {
    element.setSelectionRange(cursorPosition, cursorPosition);
  });
}

function insertTemplate(
  element: MathInputElement,
  prefix: "^" | "_"
) {
  const start = element.selectionStart ?? element.value.length;
  const end = element.selectionEnd ?? start;
  const selected = element.value.slice(start, end);
  const template = selected ? `${prefix}(${selected})` : `${prefix}()`;
  const cursorPosition = selected ? start + template.length : start + 2;

  applyReplacement(element, start, end, template, cursorPosition);
}

export function handleMathShortcutKeyDown(
  event: React.KeyboardEvent<MathInputElement>
) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  const element = event.currentTarget;
  if (element.readOnly || element.disabled) {
    return false;
  }

  if (event.key === "^" || event.key === "_") {
    event.preventDefault();
    insertTemplate(element, event.key);
    return true;
  }

  if (event.key !== " ") {
    return false;
  }

  const start = element.selectionStart ?? 0;
  const end = element.selectionEnd ?? start;
  if (start !== end) {
    return false;
  }

  const before = element.value.slice(0, start);

  for (const shortcut of WORD_SHORTCUTS) {
    if (!before.endsWith(shortcut.trigger)) {
      continue;
    }

    const wordStart = start - shortcut.trigger.length;
    const boundary = wordStart === 0 || /[\s([{=+\-*/,]/.test(before[wordStart - 1] ?? "");
    if (!boundary) {
      continue;
    }

    event.preventDefault();
    const replacement = `${shortcut.replacement} `;
    applyReplacement(
      element,
      wordStart,
      start,
      replacement,
      wordStart + shortcut.cursorOffset
    );
    return true;
  }

  return false;
}
