"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MathRenderer } from "@/components/math-renderer";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_TOPICS } from "@/lib/topics";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, Plus, Trash2, Sparkles } from "lucide-react";
import type { FormulaSheet, FormulaSection } from "@/lib/types";

export default function FormulasPage() {
  const [sheets, setSheets] = useState<FormulaSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [activeSheet, setActiveSheet] = useState<{ title: string; sections: FormulaSection[] } | null>(null);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("formula_sheets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSheets(data || []);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!topicInput.trim()) return;
    setGenerating(true);
    setActiveSheet(null);
    try {
      const res = await fetch("/api/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput }),
      });
      const data = await res.json();
      if (data.title && data.sections) {
        setActiveSheet(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!activeSheet) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("formula_sheets")
      .insert({
        user_id: user.id,
        title: activeSheet.title,
        topic: topicInput,
        formulas: activeSheet.sections,
      })
      .select()
      .single();

    if (data) {
      setSheets([data, ...sheets]);
      setActiveSheet(null);
      setTopicInput("");
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("formula_sheets").delete().eq("id", id);
    setSheets(sheets.filter((s) => s.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold">Formula Sheets</h1>
        <p className="text-muted-foreground text-lg">Generate and save formula sheets by topic.</p>
      </motion.div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter a topic, e.g. 'Integration techniques' or 'Linear Algebra'"
              className="rounded-xl border-border/50"
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
              list="topics"
            />
            <datalist id="topics">
              {PRACTICE_TOPICS.map((t) => <option key={t} value={t} />)}
            </datalist>
            <Button onClick={handleGenerate} disabled={!topicInput.trim() || generating} className="rounded-xl px-6">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Generate</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeSheet && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {activeSheet.title}
              </CardTitle>
              <Button onClick={handleSave} size="sm" className="rounded-lg">
                <Plus className="w-4 h-4 mr-1" /> Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSheet.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold mb-3">{section.heading}</h3>
                  <div className="space-y-3">
                    {section.formulas.map((f, j) => (
                      <div key={j} className="p-3 rounded-xl bg-accent/30 border border-border/30">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{f.name}</p>
                            <MathRenderer content={f.expression} className="my-1" />
                            <p className="text-sm text-muted-foreground">{f.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Saved Sheets
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : sheets.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No saved formula sheets</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Generate one above to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sheets.map((sheet) => (
              <Card key={sheet.id} className="border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sheet.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="rounded-full text-xs">{sheet.topic}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(sheet.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
