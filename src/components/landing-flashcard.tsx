"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
        className="mt-5 block w-full text-left [perspective:2000px]"
        aria-label="Flip example flashcard"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[250px] [transform-style:preserve-3d]"
        >
          <div className="unimath-panel-muted absolute inset-0 rounded-lg p-6 [backface-visibility:hidden]">
            <p className="font-label text-[11px] text-muted-foreground">Front</p>
            <div className="mt-5 flex min-h-[170px] items-center justify-center">
              <MathRenderer
                content={
                  "What does a positive definite matrix guarantee about $\\vec{x}^{\\mathsf T}A\\vec{x}$ for every non-zero vector $\\vec{x}$?"
                }
                className="mx-auto max-w-md text-center font-serif text-2xl leading-relaxed tracking-[-0.03em] text-foreground sm:text-3xl"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">Click to reveal the answer.</p>
          </div>

          <div className="unimath-panel-muted absolute inset-0 rounded-lg p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="font-label text-[11px] text-muted-foreground">Back</p>
            <div className="mt-5 flex min-h-[170px] items-center justify-center">
              <MathRenderer
                content={
                  "For every non-zero vector $\\vec{x}$, a positive definite matrix satisfies $\\vec{x}^{\\mathsf T}A\\vec{x} > 0$."
                }
                className="mx-auto max-w-md text-center font-serif text-2xl leading-relaxed tracking-[-0.03em] text-foreground sm:text-3xl"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">Click to return to the prompt.</p>
          </div>
        </motion.div>
      </button>
    </div>
  );
}
