"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TOPICS } from "@/lib/topics";
import { TopicAutocomplete } from "@/components/topic-autocomplete";
import { MathRenderer } from "@/components/math-renderer";
import { EditorialHeader, EditorialPage, EditorialPanel, EditorialStat } from "@/components/editorial";
import type { Flashcard, FlashcardDeck, GeneratedFlashcard } from "@/lib/types";
import { motion } from "framer-motion";
import { BookCopy, Check, ChevronLeft, ChevronRight, Layers, Loader2, Plus, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";

type LoadedDeck = FlashcardDeck & { flashcards: Flashcard[] };

export default function FlashcardsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [notes, setNotes] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<LoadedDeck | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const loadDeckDetails = useCallback(async (deckId: string) => {
    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError || !deck) {
      toast.error("Could not open this deck");
      return;
    }

    const { data: cards, error: cardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId)
      .order("sort_order", { ascending: true });

    if (cardsError) {
      toast.error("Could not load flashcards");
      return;
    }

    setActiveDeck({
      ...(deck as FlashcardDeck),
      flashcards: (cards as Flashcard[]) || [],
    });
    setActiveIndex(0);
    setFlipped(false);
  }, [supabase]);

  const loadDecks = useCallback(async () => {
    setLoadingDecks(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoadingDecks(false);
      return;
    }

    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Could not load flashcard decks");
    } else {
      setDecks((data as FlashcardDeck[]) || []);
      if (data && data.length > 0) {
        await loadDeckDetails(data[0].id);
      }
    }

    setLoadingDecks(false);
  }, [loadDeckDetails, supabase]);

  useEffect(() => {
    void loadDecks();
  }, [loadDecks]);

  async function handleGenerate() {
    if (!topic.trim() && !notes.trim()) {
      toast.error("Add a topic or paste notes first");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          notes,
          count,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Generation failed");
      }

      const cards = Array.isArray(payload.flashcards)
        ? payload.flashcards.filter(
            (card: GeneratedFlashcard) => card?.front?.trim() && card?.back?.trim()
          )
        : [];

      if (cards.length === 0) {
        throw new Error("No flashcards were returned");
      }

      setGeneratedTitle(payload.title || `${topic || "Math"} flashcards`);
      setGeneratedCards(cards);
      toast.success("Flashcards generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveDeck() {
    if (generatedCards.length === 0) {
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("You need to be logged in");
      return;
    }

    setSaving(true);
    try {
      const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .insert({
          user_id: auth.user.id,
          title: generatedTitle || `${topic || "Math"} flashcards`,
          topic: topic || null,
          source_text: notes || null,
          card_count: generatedCards.length,
        })
        .select()
        .single();

      if (deckError || !deck) {
        throw deckError || new Error("Could not save deck");
      }

      const payload = generatedCards.map((card, index) => ({
        deck_id: deck.id,
        front: card.front,
        back: card.back,
        sort_order: index,
      }));

      const { error: cardsError } = await supabase.from("flashcards").insert(payload);
      if (cardsError) {
        throw cardsError;
      }

      toast.success("Deck saved");
      setGeneratedCards([]);
      setGeneratedTitle("");
      await loadDecks();
      await loadDeckDetails(deck.id);
    } catch {
      toast.error("Failed to save flashcard deck");
    } finally {
      setSaving(false);
    }
  }

  async function handleReview(result: "known" | "unknown") {
    if (!activeDeck) return;

    const currentCard = activeDeck.flashcards[activeIndex];
    if (!currentCard) return;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const nextStudied = activeDeck.studied_count + 1;
    const nextKnown = activeDeck.known_count + (result === "known" ? 1 : 0);
    const nextUnknown = activeDeck.unknown_count + (result === "unknown" ? 1 : 0);

    const [{ error: reviewError }, { error: updateError }] = await Promise.all([
      supabase.from("flashcard_reviews").insert({
        user_id: auth.user.id,
        deck_id: activeDeck.id,
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
        .eq("id", activeDeck.id),
    ]);

    if (reviewError || updateError) {
      toast.error("Could not record review");
      return;
    }

    const updatedDeck = {
      ...activeDeck,
      studied_count: nextStudied,
      known_count: nextKnown,
      unknown_count: nextUnknown,
    };
    setActiveDeck(updatedDeck);
    setDecks((current) =>
      current.map((deck) =>
        deck.id === updatedDeck.id
          ? {
              ...deck,
              studied_count: nextStudied,
              known_count: nextKnown,
              unknown_count: nextUnknown,
              updated_at: new Date().toISOString(),
            }
          : deck
      )
    );
    setFlipped(false);
    setActiveIndex((index) =>
      updatedDeck.flashcards.length === 0 ? 0 : (index + 1) % updatedDeck.flashcards.length
    );
  }

  const totalCards = useMemo(
    () => decks.reduce((sum, deck) => sum + deck.card_count, 0),
    [decks]
  );
  const totalReviews = useMemo(
    () => decks.reduce((sum, deck) => sum + deck.studied_count, 0),
    [decks]
  );

  const currentCard = activeDeck?.flashcards[activeIndex];
  const mastery =
    activeDeck && activeDeck.studied_count > 0
      ? Math.round((activeDeck.known_count / activeDeck.studied_count) * 100)
      : 0;

  useEffect(() => {
    if (!activeDeck || activeDeck.flashcards.length === 0) {
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
          activeDeck.flashcards.length === 0
            ? 0
            : (index - 1 + activeDeck.flashcards.length) % activeDeck.flashcards.length
        );
        setFlipped(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) =>
          activeDeck.flashcards.length === 0
            ? 0
            : (index + 1) % activeDeck.flashcards.length
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
  }, [activeDeck]);

  return (
    <EditorialPage>
      <EditorialHeader
        eyebrow="Flashcards"
        title="Generate, save, and study decks"
        description="Turn broad topics or your own notes into reusable university math flashcards, then study them in a dedicated flip-card flow with keyboard navigation and review tracking."
        aside={
          <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
            <EditorialStat label="Decks" value={decks.length} detail="Saved for later review" />
            <EditorialStat label="Reviews" value={totalReviews} detail={`${totalCards} cards across all decks`} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <EditorialPanel>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">Deck generator</p>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-[1fr,120px]">
                <TopicAutocomplete
                  value={topic}
                  onChange={setTopic}
                  options={DEFAULT_TOPICS.map((item) => item.name)}
                  placeholder="Choose a topic like Eigenvalues and Eigenvectors"
                  className="border-white/10 bg-black/20 text-white"
                />
                <Input
                  value={String(count)}
                  onChange={(event) =>
                    setCount(Math.max(4, Math.min(24, Number(event.target.value) || 10)))
                  }
                  type="number"
                  min={4}
                  max={24}
                  className="h-12 rounded-2xl border-white/10 bg-black/20 text-white"
                  placeholder="10"
                />
              </div>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Paste lecture notes, worked examples, or a syllabus chunk. The AI will compress this into study-worthy flashcards."
                className="min-h-40 rounded-[1.5rem] border-white/10 bg-black/20 px-4 py-4 text-white placeholder:text-white/30"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-11 rounded-full bg-white px-5 text-black hover:bg-white/90"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate flashcards
                </Button>
                <Button
                  onClick={handleSaveDeck}
                  disabled={saving || generatedCards.length === 0}
                  variant="outline"
                  className="h-11 rounded-full border-white/8 bg-[#141821] px-5 text-white hover:bg-[#181d27]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save deck
                </Button>
              </div>
            </div>
          </EditorialPanel>

          <EditorialPanel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/38">Preview</p>
                <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                  {generatedTitle || "Freshly generated cards"}
                </h2>
              </div>
              {generatedCards.length > 0 ? (
                <div className="rounded-full border border-white/8 bg-[#141821] px-3 py-1 text-sm text-white/65">
                  {generatedCards.length} cards
                </div>
              ) : null}
            </div>
            {generatedCards.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-8 text-center">
                <Layers className="mx-auto h-10 w-10 text-white/25" />
                <p className="mt-4 font-medium text-white">Generate a deck to preview it here</p>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  You can generate from a single topic, from pasted notes, or both together.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {generatedCards.slice(0, 4).map((card, index) => (
                  <div
                    key={`${card.front}-${index}`}
                    className="rounded-[1.75rem] border border-white/8 bg-[#0c0f14] p-5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Card {index + 1}</p>
                    <p className="mt-3 text-lg font-medium text-white">{card.front}</p>
                    <div className="mt-4 h-px bg-white/10" />
                    <MathRenderer content={card.back} className="mt-4 text-white/72 prose-p:text-white/72" />
                  </div>
                ))}
              </div>
            )}
          </EditorialPanel>
        </div>

        <div className="space-y-6">
          <EditorialPanel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/38">Saved library</p>
                <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                  Your decks
                </h2>
              </div>
              <BookCopy className="h-5 w-5 text-white/32" />
            </div>
            <div className="mt-5 space-y-3">
              {loadingDecks ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-24 rounded-[1.5rem] bg-white/6" />
                  ))}
                </div>
              ) : decks.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-6 text-sm text-white/52">
                  No saved decks yet. Generate one and save it to start reviewing later.
                </div>
              ) : (
                decks.map((deck) => {
                  const isActive = deck.id === activeDeck?.id;
                  const percentage =
                    deck.studied_count > 0
                      ? Math.round((deck.known_count / deck.studied_count) * 100)
                      : 0;

                  return (
                    <button
                      key={deck.id}
                      onClick={() => void loadDeckDetails(deck.id)}
                      className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                        isActive
                          ? "border-white/16 bg-[#181c24]"
                          : "border-white/8 bg-[#0b0d12] hover:bg-[#11151c]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-white">{deck.title}</p>
                          <p className="mt-1 truncate text-sm text-white/45">
                            {deck.topic || "Custom notes"}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/8 bg-[#141821] px-2.5 py-1 text-xs text-white/55">
                          {deck.card_count} cards
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-white/48">
                        <span>{deck.studied_count} reviews</span>
                        <span>{percentage}% known</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </EditorialPanel>

          <EditorialPanel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/38">Study mode</p>
                <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                  {activeDeck?.title || "Open a deck"}
                </h2>
              </div>
              {activeDeck ? (
                <div className="rounded-full border border-white/8 bg-[#141821] px-3 py-1 text-sm text-white/60">
                  {activeIndex + 1}/{activeDeck.flashcards.length}
                </div>
              ) : null}
            </div>

            {activeDeck && currentCard ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <EditorialStat label="Reviewed" value={activeDeck.studied_count} />
                  <EditorialStat label="Known" value={activeDeck.known_count} />
                  <EditorialStat label="Mastery" value={`${mastery}%`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-white/45">
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
                      className="relative min-h-[420px] rounded-[2.25rem] border border-white/10 bg-transparent text-left shadow-[0_30px_100px_rgba(0,0,0,0.35)] [transform-style:preserve-3d]"
                    >
                      <div className="absolute inset-0 rounded-[2.25rem] border border-white/8 bg-[#11151c] p-7 [backface-visibility:hidden]">
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Front</p>
                            <span className="rounded-full border border-white/8 bg-[#0b0d12] px-3 py-1 text-xs text-white/45">
                              Tap to reveal
                            </span>
                          </div>
                          <div className="flex flex-1 items-center justify-center py-10">
                            <MathRenderer
                              content={currentCard.front}
                              className="max-w-2xl text-center text-2xl text-white prose-p:text-white prose-p:leading-9"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 rounded-[2.25rem] border border-white/8 bg-[#141821] p-7 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Back</p>
                            <span className="rounded-full border border-white/8 bg-[#0b0d12] px-3 py-1 text-xs text-white/45">
                              Explanation
                            </span>
                          </div>
                          <div className="flex flex-1 items-center py-6">
                            <MathRenderer
                              content={currentCard.back}
                              className="mx-auto max-w-2xl text-lg text-white/80 prose-p:text-white/80 prose-p:leading-8"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </button>

                  <div className="flex justify-center gap-2">
                    {activeDeck.flashcards.map((card, index) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setActiveIndex(index);
                          setFlipped(false);
                        }}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/20 hover:bg-white/40"
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
                          activeDeck.flashcards.length === 0
                            ? 0
                            : (index - 1 + activeDeck.flashcards.length) % activeDeck.flashcards.length
                        );
                        setFlipped(false);
                      }}
                      variant="outline"
                      className="h-11 rounded-full border-white/8 bg-[#141821] px-4 text-white hover:bg-[#181d27]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveIndex((index) =>
                          activeDeck.flashcards.length === 0
                            ? 0
                            : (index + 1) % activeDeck.flashcards.length
                        );
                        setFlipped(false);
                      }}
                      variant="outline"
                      className="h-11 rounded-full border-white/8 bg-[#141821] px-4 text-white hover:bg-[#181d27]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => void handleReview("unknown")}
                      variant="outline"
                      className="h-11 rounded-full border-red-400/20 bg-red-400/10 px-4 text-red-100 hover:bg-red-400/15"
                    >
                      <X className="h-4 w-4" />
                      Unknown
                    </Button>
                    <Button
                      onClick={() => void handleReview("known")}
                      className="h-11 rounded-full bg-white px-4 text-black hover:bg-white/90"
                    >
                      <Check className="h-4 w-4" />
                      Known
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-8 text-center">
                <Layers className="mx-auto h-10 w-10 text-white/25" />
                <p className="mt-4 font-medium text-white">Select a saved deck to start studying</p>
                <p className="mt-2 text-sm text-white/48">
                  Tap the card to flip it, then mark it known or unknown to build review stats.
                </p>
              </div>
            )}
          </EditorialPanel>
        </div>
      </div>
    </EditorialPage>
  );
}
