"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MathFieldElement = HTMLElement & {
  value: string;
  focus: () => void;
  setOptions?: (options: Record<string, unknown>) => void;
};

const MathFieldTag = "math-field" as React.ElementType;

export function VisualEquationButton({
  onInsert,
  title = "Insert equation",
}: {
  onInsert: (latex: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<MathFieldElement | null>(null);

  useEffect(() => {
    void import("mathlive");
  }, []);

  useEffect(() => {
    if (!open || !fieldRef.current) {
      return;
    }

    fieldRef.current.setOptions?.({
      smartMode: true,
      smartFence: true,
      smartSuperscript: true,
      virtualKeyboardMode: "manual",
      mathVirtualKeyboardPolicy: "manual",
    });

    window.requestAnimationFrame(() => {
      fieldRef.current?.focus();
    });
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="unimath-pill h-12 w-12 flex-shrink-0 rounded-sm text-foreground hover:bg-accent/70"
        onClick={() => setOpen(true)}
        aria-label={title}
      >
        <Sigma className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-border/60 bg-background">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Build an equation visually, then insert its LaTeX into the current field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <MathFieldTag
              ref={(node: MathFieldElement | null) => {
                fieldRef.current = node as MathFieldElement | null;
              }}
              placeholder="Type or build an equation"
              className="unimath-input block min-h-[180px] w-full rounded-sm px-4 py-4 text-lg text-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Supports fractions, roots, superscripts, subscripts, matrices, vectors, and the virtual math keyboard.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="unimath-pill rounded-sm px-4 text-foreground hover:bg-accent/70"
              onClick={() => {
                if (fieldRef.current) {
                  fieldRef.current.value = "";
                  fieldRef.current.focus();
                }
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="rounded-sm px-4"
              onClick={() => {
                const latex = fieldRef.current?.value?.trim();
                if (!latex) {
                  return;
                }

                onInsert(latex);
                if (fieldRef.current) {
                  fieldRef.current.value = "";
                }
                setOpen(false);
              }}
            >
              Insert equation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
