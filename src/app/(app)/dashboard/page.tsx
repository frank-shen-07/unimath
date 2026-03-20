"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { EditorialHeader, EditorialPage, EditorialPanel, EditorialStat } from "@/components/editorial";
import type { Conversation, FlashcardDeck, PracticeSession } from "@/lib/types";
import {
  MessageSquare,
  Camera,
  Dumbbell,
  BookOpen,
  Layers,
  Map,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

const quickActions = [
  { href: "/chat", icon: MessageSquare, label: "New Chat", detail: "Ask, upload, and solve" },
  { href: "/solve", icon: Camera, label: "Photo Solve", detail: "Turn images into steps" },
  { href: "/practice", icon: Dumbbell, label: "Practice", detail: "Drill by topic and difficulty" },
  { href: "/formulas", icon: BookOpen, label: "Formulas", detail: "Build printable notes" },
  { href: "/flashcards", icon: Layers, label: "Flashcards", detail: "Generate and review decks" },
  { href: "/map", icon: Map, label: "Knowledge Map", detail: "See your topic graph" },
];

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Student"
        );

        const { data: convs } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(5);
        setConversations(convs || []);

        const { data: sess } = await supabase
          .from("practice_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        setSessions(sess || []);

        const { data: savedDecks } = await supabase
          .from("flashcard_decks")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(6);
        setDecks(savedDecks || []);
      }
      setLoading(false);
    };
    load();
  }, []);

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
        description="Choose how you want to study today. Your tutor, drills, notes, map, and flashcards now share one darker editorial workspace."
        aside={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
            <Sparkles className="h-4 w-4 text-primary" />
            Ready for your next theorem
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={action.href} className="block">
              <EditorialPanel className="group h-full transition duration-200 hover:-translate-y-1 hover:bg-white/[0.07]">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                        {action.label}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/52">{action.detail}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-white/80" />
                </div>
              </EditorialPanel>
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,1.6fr]">
        <EditorialPanel>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Study snapshot</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <EditorialStat label="Practice sessions" value={totalSessions} detail="All recorded drill sessions" />
            <EditorialStat label="Accuracy" value={`${accuracy}%`} detail="Across saved practice attempts" />
            <EditorialStat label="Problems solved" value={totalQuestions} detail="Questions attempted so far" />
            <EditorialStat label="Flashcard decks" value={totalDecks} detail={`${studiedCards} card reviews logged`} />
          </div>
        </EditorialPanel>

        <EditorialPanel>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">Continue learning</p>
              <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
                Recent conversations
              </h2>
            </div>
            <Link href="/history" className="inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-white">
              View history <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-[1.5rem] bg-white/8" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-8 text-center">
              <MessageSquare className="mx-auto mb-4 h-10 w-10 text-white/25" />
              <p className="font-medium text-white">No conversations yet</p>
              <p className="mt-2 text-sm text-white/52">Start a new tutoring chat and your recent work will appear here.</p>
              <Link href="/chat" className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
                Start chatting <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link key={conv.id} href={`/chat/${conv.id}`} className="block">
                  <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4 transition hover:bg-white/[0.05]">
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-white">{conv.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/48">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {conv.topic_summary ? (
                          <Badge className="border-white/10 bg-white/[0.06] text-white/74 hover:bg-white/[0.06]">
                            {conv.topic_summary}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/30" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </EditorialPanel>
      </section>
    </EditorialPage>
  );
}
