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
          <TabsList className="unimath-panel-muted grid h-12 w-full grid-cols-2 rounded-[1.25rem] p-1">
          <TabsTrigger value="conversations" className="rounded-[1rem] gap-2 text-muted-foreground data-active:bg-primary data-active:text-primary-foreground">
            <MessageSquare className="w-4 h-4" /> Conversations
          </TabsTrigger>
          <TabsTrigger value="practice" className="rounded-[1rem] gap-2 text-muted-foreground data-active:bg-primary data-active:text-primary-foreground">
            <Dumbbell className="w-4 h-4" /> Practice Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem] bg-foreground/8" />)}</div>
          ) : conversations.length === 0 ? (
            <div className="unimath-panel-muted rounded-[1.5rem] border-dashed p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">No conversations yet</p>
                <Link href="/chat" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start a chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="unimath-panel-muted cursor-pointer rounded-[1.5rem] p-4 transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="unimath-panel-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{conv.title}</p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-[1.5rem] bg-foreground/8" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="unimath-panel-muted rounded-[1.5rem] border-dashed p-8 text-center">
                <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-medium text-foreground">No practice sessions yet</p>
                <Link href="/practice" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start practicing <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
          ) : (
            sessions.map((session) => {
              const accuracy = session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0;
              return (
                <div key={session.id} className="unimath-panel-muted rounded-[1.5rem] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="unimath-panel-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
                        <Target className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">{session.topic}</p>
                          <Badge variant="outline" className="rounded-full border-border bg-accent/60 text-xs capitalize text-foreground">{session.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
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
