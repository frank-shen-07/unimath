"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/math-renderer";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_TOPICS } from "@/lib/topics";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Loader2, Check, X, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import type { GeneratedQuestion } from "@/lib/types";

type Phase = "setup" | "practice" | "results";

export default function PracticePage() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam && PRACTICE_TOPICS.includes(topicParam)) {
      setTopic(topicParam);
    }
  }, [searchParams]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !difficulty) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count: 5 }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setResults([]);
        setPhase("practice");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    setShowSolution(true);
    setIsChecking(true);
    const isCorrect = userAnswer.trim().length > 0;
    const newResults = [...results, isCorrect];
    setResults(newResults);

    try {
      await fetch("/api/topics/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[currentIndex].question, isCorrect }),
      });
    } catch {}

    setIsChecking(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowSolution(false);
    } else {
      savePracticeSession();
      setPhase("results");
    }
  };

  const savePracticeSession = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const correct = results.filter(Boolean).length;
      await supabase.from("practice_sessions").insert({
        user_id: user.id,
        topic,
        difficulty,
        total_questions: questions.length,
        correct_answers: correct,
      });
    } catch {}
  };

  const handleRestart = () => {
    setPhase("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setUserAnswer("");
    setShowSolution(false);
  };

  const currentQuestion = questions[currentIndex];
  const correctCount = results.filter(Boolean).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold">Practice Problems</h1>
        <p className="text-muted-foreground text-lg">Generate and solve problems tailored to your level.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" /> Configure Practice
                </CardTitle>
                <CardDescription>Choose a topic and difficulty to generate problems.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Select value={topic} onValueChange={(v) => setTopic(v ?? "")}>
                      <SelectTrigger className="rounded-xl border-border/50">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRACTICE_TOPICS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "")}>
                      <SelectTrigger className="rounded-xl border-border/50">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleGenerate} disabled={!topic || !difficulty || isLoading} className="w-full rounded-xl h-11">
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Dumbbell className="w-4 h-4 mr-2" /> Generate 5 Problems</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "practice" && currentQuestion && (
          <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">{topic}</Badge>
                <Badge variant="outline" className="rounded-full capitalize">{difficulty}</Badge>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentIndex + (showSolution ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Question {currentIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MathRenderer content={currentQuestion.question} />

                {!showSolution ? (
                  <div className="space-y-3">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="rounded-xl border-border/50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCheck();
                      }}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCheck} disabled={isChecking} className="flex-1 rounded-xl">
                        {isChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Check Answer
                      </Button>
                      <Button onClick={() => { setShowSolution(true); setResults([...results, false]); }} variant="outline" className="rounded-xl">
                        Show Solution
                      </Button>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
                      <p className="text-sm font-medium mb-2">Correct Answer:</p>
                      <MathRenderer content={currentQuestion.correctAnswer} />
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50">
                      <p className="text-sm font-medium mb-2">Explanation:</p>
                      <MathRenderer content={currentQuestion.explanation} />
                    </div>
                    <Button onClick={handleNext} className="w-full rounded-xl">
                      {currentIndex < questions.length - 1 ? (
                        <><ArrowRight className="w-4 h-4 mr-2" /> Next Question</>
                      ) : (
                        <><Trophy className="w-4 h-4 mr-2" /> View Results</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-border/50">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg">
                  <Trophy className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Practice Complete!</h2>
                  <p className="text-muted-foreground mt-1">{topic} - {difficulty}</p>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{correctCount}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">{questions.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-emerald-500">
                      {Math.round((correctCount / questions.length) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        r ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {r ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </div>
                  ))}
                </div>
                <Button onClick={handleRestart} className="rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
