"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { Conversation, PracticeSession } from "@/lib/types";
import {
  MessageSquare,
  Camera,
  Dumbbell,
  BookOpen,
  Map,
  ArrowRight,
  Target,
  TrendingUp,
  Clock,
} from "lucide-react";

const quickActions = [
  { href: "/chat", icon: MessageSquare, label: "New Chat", color: "from-violet-500 to-purple-600" },
  { href: "/solve", icon: Camera, label: "Photo Solve", color: "from-rose-500 to-pink-600" },
  { href: "/practice", icon: Dumbbell, label: "Practice", color: "from-amber-500 to-orange-600" },
  { href: "/formulas", icon: BookOpen, label: "Formulas", color: "from-emerald-500 to-green-600" },
  { href: "/map", icon: Map, label: "Knowledge Map", color: "from-cyan-500 to-blue-600" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
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
      }
      setLoading(false);
    };
    load();
  }, []);

  const totalSessions = sessions.length;
  const totalQuestions = sessions.reduce((a, s) => a + s.total_questions, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.correct_answers, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to work on today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {quickActions.map((action) => (
          <motion.div key={action.href} variants={item}>
            <Link href={action.href}>
              <Card className="group cursor-pointer border-border/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:scale-[1.02]">
                <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Practice Stats
          </h2>
          <div className="space-y-3">
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Practice sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy rate</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Problems solved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Conversations
            </h2>
            <Link
              href="/history"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No conversations yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Start a chat to get help with any math problem
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Start your first chat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <Card className="border-border/50 transition-all duration-200 hover:shadow-sm hover:border-primary/20 cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {conv.topic_summary && (
                        <Badge variant="secondary" className="ml-3 flex-shrink-0">
                          {conv.topic_summary}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
