type TextInputElement = HTMLInputElement | HTMLTextAreaElement;

export function insertLatexAtCursor(
  element: TextInputElement | null,
  currentValue: string,
  latex: string
) {
  const insertion = currentValue ? ` $${latex}$ ` : `$${latex}$`;

  if (!element) {
    return {
      nextValue: `${currentValue}${insertion}`,
      selectionStart: currentValue.length + insertion.length,
    };
  }

  const start = element.selectionStart ?? currentValue.length;
  const end = element.selectionEnd ?? start;
  const nextValue =
    currentValue.slice(0, start) + insertion + currentValue.slice(end);

  return {
    nextValue,
    selectionStart: start + insertion.length,
  };
}
