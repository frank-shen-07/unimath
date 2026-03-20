"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground text-lg">Browse your past conversations and practice sessions.</p>
      </motion.div>

      <Tabs defaultValue="conversations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl h-11">
          <TabsTrigger value="conversations" className="rounded-lg gap-2">
            <MessageSquare className="w-4 h-4" /> Conversations
          </TabsTrigger>
          <TabsTrigger value="practice" className="rounded-lg gap-2">
            <Dumbbell className="w-4 h-4" /> Practice Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : conversations.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No conversations yet</p>
                <Link href="/chat" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start a chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conv) => (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <Card className="border-border/50 transition-all duration-200 hover:shadow-sm hover:border-primary/20 cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-2">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : sessions.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No practice sessions yet</p>
                <Link href="/practice" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                  Start practicing <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => {
              const accuracy = session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0;
              return (
                <Card key={session.id} className="border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{session.topic}</p>
                          <Badge variant="outline" className="rounded-full text-xs capitalize">{session.difficulty}</Badge>
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
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
