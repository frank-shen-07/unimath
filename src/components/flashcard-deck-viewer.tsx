"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/math-renderer";
import { EditorialPanel, EditorialStat } from "@/components/editorial";
import { createClient } from "@/lib/supabase/client";
import type { Flashcard, FlashcardDeck } from "@/lib/types";

type LoadedDeck = FlashcardDeck & { flashcards: Flashcard[] };

export function FlashcardDeckViewer({ deckId }: { deckId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [deck, setDeck] = useState<LoadedDeck | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDeck = useCallback(async () => {
    setLoading(true);

    const { data: deckData, error: deckError } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError || !deckData) {
      toast.error("Could not open this deck");
      setLoading(false);
      return;
    }

    const { data: cards, error: cardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId)
      .order("sort_order", { ascending: true });

    if (cardsError) {
      toast.error("Could not load flashcards");
      setLoading(false);
      return;
    }

    setDeck({
      ...(deckData as FlashcardDeck),
      flashcards: (cards as Flashcard[]) || [],
    });
    setActiveIndex(0);
    setFlipped(false);
    setLoading(false);
  }, [deckId, supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDeck();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDeck]);

  useEffect(() => {
    if (!deck || deck.flashcards.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) =>
          deck.flashcards.length === 0
            ? 0
            : (index - 1 + deck.flashcards.length) % deck.flashcards.length
        );
        setFlipped(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) =>
          deck.flashcards.length === 0 ? 0 : (index + 1) % deck.flashcards.length
        );
        setFlipped(false);
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deck]);

  async function handleReview(result: "known" | "unknown") {
    if (!deck) return;

    const currentCard = deck.flashcards[activeIndex];
    if (!currentCard) return;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const nextStudied = deck.studied_count + 1;
    const nextKnown = deck.known_count + (result === "known" ? 1 : 0);
    const nextUnknown = deck.unknown_count + (result === "unknown" ? 1 : 0);

    const [{ error: reviewError }, { error: updateError }] = await Promise.all([
      supabase.from("flashcard_reviews").insert({
        user_id: auth.user.id,
        deck_id: deck.id,
        flashcard_id: currentCard.id,
        result,
      }),
      supabase
        .from("flashcard_decks")
        .update({
          studied_count: nextStudied,
          known_count: nextKnown,
          unknown_count: nextUnknown,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deck.id),
    ]);

    if (reviewError || updateError) {
      toast.error("Could not record review");
      return;
    }

    setDeck((current) =>
      current
        ? {
            ...current,
            studied_count: nextStudied,
            known_count: nextKnown,
            unknown_count: nextUnknown,
          }
        : current
    );
    setFlipped(false);
    setActiveIndex((index) =>
      deck.flashcards.length === 0 ? 0 : (index + 1) % deck.flashcards.length
    );
  }

  const currentCard = deck?.flashcards[activeIndex];
  const mastery =
    deck && deck.studied_count > 0
      ? Math.round((deck.known_count / deck.studied_count) * 100)
      : 0;

  if (loading) {
    return (
      <EditorialPanel className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </EditorialPanel>
    );
  }

  if (!deck) {
    return (
      <EditorialPanel>
        <p className="text-sm text-muted-foreground">This deck could not be loaded.</p>
      </EditorialPanel>
    );
  }

  if (!currentCard) {
    return (
      <EditorialPanel>
        <p className="text-sm text-muted-foreground">This deck does not have any flashcards yet.</p>
      </EditorialPanel>
    );
  }

  return (
    <EditorialPanel>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-label text-xs text-muted-foreground">Flash Cards</p>
          <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
            {deck.title}
          </h2>
        </div>
        <div className="unimath-panel-muted rounded-sm px-3 py-1 text-sm text-muted-foreground">
          {activeIndex + 1}/{deck.flashcards.length}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <EditorialStat label="Reviewed" value={deck.studied_count} />
          <EditorialStat label="Known" value={deck.known_count} />
          <EditorialStat label="Mastery" value={`${mastery}%`} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Click card to flip</span>
            <span>Use `←`, `→`, and `space`</span>
          </div>

          <button
            onClick={() => setFlipped((value) => !value)}
            className="w-full [perspective:2200px]"
            aria-label="Flip flashcard"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0, y: flipped ? -4 : 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-[420px] rounded-lg border border-border bg-transparent text-left shadow-[0_30px_100px_rgba(0,0,0,0.35)] [transform-style:preserve-3d]"
            >
              <div className="unimath-panel absolute inset-0 rounded-lg p-7 [backface-visibility:hidden]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-label text-[11px] text-muted-foreground">Front</p>
                    <span className="unimath-panel-muted rounded-sm px-3 py-1 text-xs text-muted-foreground">
                      Tap to reveal
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center py-10">
                    <MathRenderer
                      content={currentCard.front}
                      className="max-w-2xl text-center text-2xl text-foreground prose-p:text-foreground prose-p:leading-9"
                    />
                  </div>
                </div>
              </div>

              <div className="unimath-panel absolute inset-0 rounded-lg p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-label text-[11px] text-muted-foreground">Back</p>
                    <span className="unimath-panel-muted rounded-sm px-3 py-1 text-xs text-muted-foreground">
                      Explanation
                    </span>
                  </div>
                  <div className="flex flex-1 items-center py-6">
                    <MathRenderer
                      content={currentCard.back}
                      className="mx-auto max-w-2xl text-lg text-foreground/80 prose-p:text-foreground/80 prose-p:leading-8"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </button>

          <div className="flex justify-center gap-2">
            {deck.flashcards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => {
                  setActiveIndex(index);
                  setFlipped(false);
                }}
                className={`h-2.5 transition-all ${
                  index === activeIndex ? "w-8 bg-foreground" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setActiveIndex((index) =>
                  deck.flashcards.length === 0
                    ? 0
                    : (index - 1 + deck.flashcards.length) % deck.flashcards.length
                );
                setFlipped(false);
              }}
              variant="outline"
              className="unimath-pill h-11 rounded-sm px-4 text-foreground hover:bg-accent/70"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={() => {
                setActiveIndex((index) =>
                  deck.flashcards.length === 0 ? 0 : (index + 1) % deck.flashcards.length
                );
                setFlipped(false);
              }}
              variant="outline"
              className="unimath-pill h-11 rounded-sm px-4 text-foreground hover:bg-accent/70"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => void handleReview("unknown")}
              variant="outline"
              className="h-11 rounded-sm border-red-400/20 bg-red-400/10 px-4 text-red-100 hover:bg-red-400/15"
            >
              <X className="h-4 w-4" />
              Unknown
            </Button>
            <Button
              onClick={() => void handleReview("known")}
              className="h-11 rounded-sm bg-primary px-4 text-primary-foreground hover:opacity-90"
            >
              <Check className="h-4 w-4" />
              Known
            </Button>
          </div>
        </div>
      </div>
    </EditorialPanel>
  );
}
