"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { EditorialHeader, EditorialPage, EditorialPanel } from "@/components/editorial";
import { MessageSquare, Dumbbell, Clock, Target, ArrowRight } from "lucide-react";
import type { Conversation, PracticeSession } from "@/lib/types";

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [convs, sess] = await Promise.all([
        supabase.from("conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("practice_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setConversations(convs.data || []);
      setSessions(sess.data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <EditorialPage>
      <EditorialHeader
        eyebrow="Archive"
        title="Your study history"
        description="Browse past tutoring threads and practice sessions without leaving the new workspace."
      />

      <EditorialPanel>
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-[1.25rem] bg-white/[0.05] p-1">
          <TabsTrigger value="conversations" className="rounded-[1rem] gap-2 text-white/65 data-active:bg-white data-active:text-black">
            <MessageSquare className="w-4 h-4" /> Conversations
          </TabsTrigger>
          <TabsTrigger value="practice" className="rounded-[1rem] gap-2 text-white/65 data-active:bg-white data-active:text-black">
            <Dumbbell className="w-4 h-4" /> Practice Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem] bg-white/8" />)}</div>
          ) : conversations.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-white">No conversations yet</p>
                <Link href="/chat" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start a chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="cursor-pointer rounded-[1.5rem] border border-white/10 bg-black/20 p-4 transition-all duration-200 hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-white">{conv.title}</p>
                        <p className="text-sm text-white/48 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/32 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem] bg-white/8" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 p-8 text-center">
                <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-white">No practice sessions yet</p>
                <Link href="/practice" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start practicing <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
          ) : (
            sessions.map((session) => {
              const accuracy = session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0;
              return (
                <div key={session.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate text-white">{session.topic}</p>
                          <Badge variant="outline" className="rounded-full border-white/10 bg-white/[0.04] text-xs capitalize text-white/70">{session.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-white/48">
                          {session.correct_answers}/{session.total_questions} correct &middot;{" "}
                          {new Date(session.created_at).toLocaleDateString(undefined, {
                            month: "short", day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${accuracy >= 80 ? "text-emerald-500" : accuracy >= 50 ? "text-amber-500" : "text-destructive"}`}>
                      {accuracy}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
        </Tabs>
      </EditorialPanel>
    </EditorialPage>
  );
}
