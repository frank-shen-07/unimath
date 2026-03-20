"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MathRenderer } from "@/components/math-renderer";
import { EditorialHeader, EditorialPage } from "@/components/editorial";
import { motion } from "framer-motion";
import { Camera, Upload, X, Loader2, Sparkles, ImagePlus } from "lucide-react";

export default function SolvePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setSolution("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setSolution("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSolve = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setSolution("");

    const buffer = await imageFile.arrayBuffer();
    const imageData = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Look at this image of a math problem. ${
                additionalContext
                  ? `Additional context: ${additionalContext}. `
                  : ""
              }Please:
1. Identify the problem shown
2. Solve it step by step
3. Provide the final answer clearly`,
            },
          ],
          imageData,
          imageMimeType: imageFile.type,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        const displayText = fullText.replace(/\n\n<!--CONV_ID:.+?-->/, "");
        setSolution(displayText);
      }
    } catch (error) {
      console.error(error);
      setSolution("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditorialPage className="max-w-none">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <EditorialHeader
          eyebrow="Photo Solve"
          title="Turn images into worked solutions"
          description="Upload or capture a photo of a problem and UniMath will identify it, solve it step by step, and render the maths cleanly."
        />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/60 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-primary/40 hover:bg-accent/50"
              >
                <ImagePlus className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium mb-1">Drop an image here or click to upload</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, WEBP</p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Problem"
                    width={1200}
                    height={900}
                    unoptimized
                    className="max-h-80 w-auto rounded-xl border border-border shadow-sm"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="(Optional) Add context, e.g., 'Use integration by parts' or 'This is from Chapter 5'"
              className="rounded-xl border-border/50 bg-card resize-none"
              rows={2}
            />

            <Button
              onClick={handleSolve}
              disabled={!imageFile || isLoading}
              className="w-full rounded-xl h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Solving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Solve Problem
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {solution && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MathRenderer content={solution} className="text-[15px]" />
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>
    </EditorialPage>
  );
}
