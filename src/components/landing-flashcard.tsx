"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { MathRenderer } from "@/components/math-renderer";

export function LandingFlashcard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="unimath-panel-muted rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-label text-[11px] text-muted-foreground">Flashcards</p>
          <h2 className="mt-2 font-serif text-4xl leading-none tracking-[-0.05em]">Flip to recall</h2>
        </div>
        <Layers className="h-5 w-5 text-muted-foreground" />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="mt-5 block w-full text-left"
        aria-label="Flip example flashcard"
      >
        <div className="unimath-panel-muted min-h-[250px] rounded-lg p-6 transition hover:border-foreground/20">
          <p className="font-label text-[11px] text-muted-foreground">
            {flipped ? "Back" : "Front"}
          </p>
          <div className="mt-5 flex min-h-[170px] items-center justify-center">
            <div className="max-w-md text-center">
              {flipped ? (
                <MathRenderer
                  content={
                    "For every non-zero vector $x$, a positive definite matrix satisfies $x^T A x > 0$."
                  }
                  className="font-serif text-2xl leading-relaxed tracking-[-0.03em] text-foreground sm:text-3xl"
                />
              ) : (
                <MathRenderer
                  content={
                    "What does a positive definite matrix guarantee about $x^T A x$ for every non-zero vector $x$?"
                  }
                  className="font-serif text-2xl leading-relaxed tracking-[-0.03em] text-foreground sm:text-3xl"
                />
              )}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Click to {flipped ? "return to the prompt" : "reveal the answer"}.
          </p>
        </div>
      </button>
    </div>
  );
}
