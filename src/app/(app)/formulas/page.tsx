"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MathRenderer } from "@/components/math-renderer";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_TOPICS, resolveTopicScope } from "@/lib/topics";
import { EditorialHeader, EditorialPage } from "@/components/editorial";
import { motion } from "framer-motion";
import {
  BookOpen,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Download,
  ChevronRight,
} from "lucide-react";
import type { FormulaSheet, FormulaSection } from "@/lib/types";
import { TopicAutocomplete } from "@/components/topic-autocomplete";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FormulasPage() {
  const [sheets, setSheets] = useState<FormulaSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [activeSheet, setActiveSheet] = useState<{ title: string; sections: FormulaSection[] } | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<FormulaSheet | null>(null);
  const [activeScopeLabel, setActiveScopeLabel] = useState("");

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
    const resolvedScope = resolveTopicScope(topicInput);
    setGenerating(true);
    setActiveSheet(null);
    setActiveScopeLabel(resolvedScope.label);
    setTopicInput(resolvedScope.label);
    try {
      const res = await fetch("/api/formulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: resolvedScope.promptTopic }),
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
        topic: activeScopeLabel || topicInput,
        formulas: activeSheet.sections,
      })
      .select()
      .single();

    if (data) {
      setSheets([data, ...sheets]);
      setActiveSheet(null);
      setActiveScopeLabel("");
      setTopicInput("");
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("formula_sheets").delete().eq("id", id);
    setSheets(sheets.filter((s) => s.id !== id));
    if (selectedSheet?.id === id) {
      setSelectedSheet(null);
    }
  };

  const downloadSheetPdf = async (title: string, sections: FormulaSection[]) => {
    const { jsPDF } = await import("jspdf/dist/jspdf.umd.min.js");
    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    let y = 60;

    const addWrappedText = (
      text: string,
      fontSize = 11,
      fontStyle: "normal" | "bold" = "normal",
      gapAfter = 10
    ) => {
      pdf.setFont("helvetica", fontStyle);
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, contentWidth);

      for (const line of lines) {
        if (y > pageHeight - 60) {
          pdf.addPage();
          y = 60;
        }
        pdf.text(line, margin, y);
        y += fontSize + 5;
      }

      y += gapAfter;
    };

    addWrappedText(title, 20, "bold", 16);

    sections.forEach((section) => {
      addWrappedText(section.heading, 15, "bold", 8);

      section.formulas.forEach((formula) => {
        addWrappedText(formula.name, 12, "bold", 4);
        addWrappedText(formula.expression.replace(/\$/g, ""), 11, "normal", 4);
        addWrappedText(formula.description, 10, "normal", 10);
      });

      y += 4;
    });

    pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
  };

  return (
    <EditorialPage className="max-w-none">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <EditorialHeader
          eyebrow="Formula Sheets"
          title="Build elegant note sheets"
          description="Generate formula collections, save them, reopen them, and export them as PDFs from the darker editorial layout."
        />

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <TopicAutocomplete
              value={topicInput}
              onChange={setTopicInput}
              options={PRACTICE_TOPICS}
              placeholder="Enter a topic, e.g. 'Integration techniques' or 'Linear Algebra'"
              className="flex-1"
            />
            <Button onClick={handleGenerate} disabled={!topicInput.trim() || generating} className="rounded-xl px-6 sm:self-start">
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
              {activeScopeLabel && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {activeScopeLabel}
                  </Badge>
                </div>
              )}
              {activeSheet.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold mb-3">{section.heading}</h3>
                  <div className="space-y-3">
                    {section.formulas.map((f, j) => (
                      <div key={j} className="rounded-2xl border border-border/40 bg-accent/20 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-2">
                            <p className="font-medium text-sm">{f.name}</p>
                            <MathRenderer content={f.expression} className="text-base" />
                            <p className="text-sm leading-6 text-muted-foreground">{f.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => downloadSheetPdf(activeSheet.title, activeSheet.sections)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Notes Sheet
                </Button>
              </div>
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
              <Card key={sheet.id} className="border-border/50 transition-colors hover:border-primary/20">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <button
                    type="button"
                    onClick={() => setSelectedSheet(sheet)}
                    className="flex min-w-0 flex-1 items-center justify-between text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{sheet.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full text-xs">{sheet.topic}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sheet.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="ml-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => setSelectedSheet(sheet)}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => downloadSheetPdf(sheet.title, sheet.formulas as FormulaSection[])}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(sheet.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedSheet} onOpenChange={(open) => !open && setSelectedSheet(null)}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl border-border/50 bg-background p-0">
          {selectedSheet && (
            <>
              <DialogHeader className="border-b border-border/50 px-6 py-5">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {selectedSheet.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="rounded-full text-xs">{selectedSheet.topic}</Badge>
                  <span>{new Date(selectedSheet.created_at).toLocaleDateString()}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  {(selectedSheet.formulas as FormulaSection[]).map((section, i) => (
                    <div key={i}>
                      <h3 className="mb-3 text-lg font-semibold">{section.heading}</h3>
                      <div className="space-y-3">
                        {section.formulas.map((formula, j) => (
                          <div key={j} className="rounded-2xl border border-border/40 bg-accent/20 p-4">
                            <p className="text-sm font-semibold">{formula.name}</p>
                            <MathRenderer content={formula.expression} className="mt-2 text-base" />
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{formula.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="border-t border-border/50 bg-background px-6 py-4">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => downloadSheetPdf(selectedSheet.title, selectedSheet.formulas as FormulaSection[])}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Notes Sheet
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </EditorialPage>
  );
}
