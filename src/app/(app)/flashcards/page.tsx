"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TOPICS } from "@/lib/topics";
import { TopicAutocomplete } from "@/components/topic-autocomplete";
import { EditorialPage, EditorialPanel } from "@/components/editorial";
import { VisualEquationButton } from "@/components/visual-equation-button";
import { insertLatexAtCursor } from "@/lib/insert-latex";
import type { FlashcardDeck, GeneratedFlashcard } from "@/lib/types";
import { BookCopy, FileText, Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function FlashcardsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [notes, setNotes] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

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
    }

    setLoadingDecks(false);
  }, [supabase]);

  useEffect(() => {
    void loadDecks();
  }, [loadDecks]);

  const saveDeck = useCallback(async (title: string, cards: GeneratedFlashcard[], sourceText: string | null) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      throw new Error("You need to be logged in");
    }

    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: auth.user.id,
        title,
        topic: topic || null,
        source_text: sourceText,
        card_count: cards.length,
      })
      .select()
      .single();

    if (deckError || !deck) {
      throw deckError || new Error("Could not save deck");
    }

    const payload = cards.map((card, index) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      sort_order: index,
    }));

    const { error: cardsError } = await supabase.from("flashcards").insert(payload);
    if (cardsError) {
      throw cardsError;
    }

    return deck.id;
  }, [supabase, topic]);

  async function handleGenerate() {
    if (!topic.trim() && !notes.trim() && !documentFile) {
      toast.error("Add a topic, notes, or a document first");
      return;
    }

    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("notes", notes);
      formData.append("count", String(count));
      if (documentFile) {
        formData.append("document", documentFile);
      }

      const response = await fetch("/api/flashcards", {
        method: "POST",
        body: formData,
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

      const deckId = await saveDeck(
        payload.title || `${topic || "Math"} flashcards`,
        cards,
        payload.sourceText || notes || (documentFile ? `Document: ${documentFile.name}` : null)
      );

      toast.success("Flashcards generated and saved");
      setNotes("");
      setDocumentFile(null);
      setTopic("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadDecks();
      router.push(`/flashcards/${deckId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  }

  const handleInsertEquation = (latex: string) => {
    const { nextValue, selectionStart } = insertLatexAtCursor(
      notesRef.current,
      notes,
      latex
    );
    setNotes(nextValue);
    window.requestAnimationFrame(() => {
      notesRef.current?.focus();
      notesRef.current?.setSelectionRange(selectionStart, selectionStart);
    });
  };

  return (
    <EditorialPage>
      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <EditorialPanel>
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <p className="font-label text-xs text-muted-foreground">Deck generator</p>
          </div>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr,120px]">
              <TopicAutocomplete
                value={topic}
                onChange={setTopic}
                options={DEFAULT_TOPICS.map((item) => item.name)}
                placeholder="Choose a topic like Eigenvalues and Eigenvectors"
              />
              <Input
                value={String(count)}
                onChange={(event) =>
                  setCount(Math.max(4, Math.min(24, Number(event.target.value) || 10)))
                }
                type="number"
                min={4}
                max={24}
                className="unimath-input h-11 rounded-md text-foreground"
                placeholder="10"
              />
            </div>

            <div className="flex items-start gap-2">
              <Textarea
                ref={notesRef}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Paste lecture notes, worked examples, or a syllabus chunk."
                className="unimath-input min-h-40 rounded-md px-4 py-4 text-foreground placeholder:text-muted-foreground/60"
              />
              <VisualEquationButton
                onInsert={handleInsertEquation}
                title="Insert equation into notes"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setDocumentFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="unimath-pill h-11 rounded-sm px-4 text-foreground hover:bg-accent/70"
              >
                <Upload className="h-4 w-4" />
                Upload document
              </Button>
              {documentFile ? (
                <div className="unimath-panel-muted inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[260px] truncate">{documentFile.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOCX, TXT, and Markdown.
                </p>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="h-11 rounded-sm bg-primary px-5 text-primary-foreground hover:opacity-90"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate and save flashcards
            </Button>
          </div>
        </EditorialPanel>

        <EditorialPanel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-label text-xs text-muted-foreground">Saved library</p>
              <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
                Your decks
              </h2>
            </div>
            <BookCopy className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-3">
            {loadingDecks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 rounded-md bg-foreground/6" />
                ))}
              </div>
            ) : decks.length === 0 ? (
              <div className="unimath-panel-muted rounded-md border-dashed p-6 text-sm text-muted-foreground">
                No saved decks yet. Generate one and it will be saved automatically.
              </div>
            ) : (
              decks.map((deck) => {
                const percentage =
                  deck.studied_count > 0
                    ? Math.round((deck.known_count / deck.studied_count) * 100)
                    : 0;

                return (
                  <Link
                    key={deck.id}
                    href={`/flashcards/${deck.id}`}
                    className="unimath-panel-muted block rounded-md p-4 transition hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium text-foreground">{deck.title}</p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {deck.topic || "Custom notes"}
                        </p>
                      </div>
                      <div className="unimath-panel-muted rounded-sm px-2.5 py-1 text-xs text-muted-foreground">
                        {deck.card_count} cards
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>{deck.studied_count} reviews</span>
                      <span>{percentage}% known</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </EditorialPanel>
      </div>
    </EditorialPage>
  );
}
