"use client";

import { useEffect, useState } from "react";
import { EditorialHeader, EditorialPage, EditorialPanel, EditorialStat } from "@/components/editorial";
import type { FlashcardDeck, PracticeSession } from "@/lib/types";
import { MATH_QUOTES } from "@/lib/math-quotes";
import { TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [userName, setUserName] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * MATH_QUOTES.length)
  );
  const [typedQuote, setTypedQuote] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/dashboard");
      const data = await response.json();

      if (response.ok) {
        setUserName(data.userName || "Student");
        setSessions((data.sessions as PracticeSession[]) || []);
        setDecks((data.decks as FlashcardDeck[]) || []);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fullQuote = (MATH_QUOTES[quoteIndex] ?? "").trimEnd();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const typeNext = (index: number) => {
      if (index <= fullQuote.length) {
        setTypedQuote(fullQuote.slice(0, index));
        timeoutId = setTimeout(() => typeNext(index + 1), index < 12 ? 24 : 16);
      } else {
        timeoutId = setTimeout(() => {
          setQuoteIndex((prev) => (prev + 1) % MATH_QUOTES.length);
        }, 4500);
      }
    };

    timeoutId = setTimeout(() => typeNext(1), 24);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [quoteIndex]);

  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((a, s) => a + s.total_questions, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.correct_answers, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalDecks = decks.length;
  const studiedCards = decks.reduce((sum, deck) => sum + deck.studied_count, 0);

  return (
    <EditorialPage>
      <EditorialHeader
        eyebrow="Dashboard"
        title={`Welcome back${userName ? `, ${userName}` : ""}`}
        description={
          <>
            {typedQuote}
            <span className="ml-1 inline-block h-5 w-px animate-pulse bg-foreground/40 align-[-3px]" />
          </>
        }
      />

      <section>
        <EditorialPanel className="space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="font-label text-xs text-muted-foreground">Study snapshot</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <EditorialStat label="Practice sessions" value={totalSessions} detail="All recorded drill sessions" />
            <EditorialStat label="Accuracy" value={`${accuracy}%`} detail="Across saved practice attempts" />
            <EditorialStat label="Problems solved" value={totalQuestions} detail="Questions attempted so far" />
            <EditorialStat label="Flashcard decks" value={totalDecks} detail={`${studiedCards} card reviews logged`} />
          </div>
        </EditorialPanel>
      </section>
    </EditorialPage>
  );
}
