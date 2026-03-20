"use client";

import { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MathRenderer } from "@/components/math-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ImagePlus, X, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Message } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: conv } = await supabase
        .from("conversations")
        .select("title")
        .eq("id", id)
        .single();
      if (conv) setTitle(conv.title);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(
          msgs.map((m: Message) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }
      setPageLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed && !imageFile) return;
    if (isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed || "Solve this problem from the image",
      imagePreview: imagePreview || undefined,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let imageData: string | undefined;
    let imageMimeType: string | undefined;

    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      imageData = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      imageMimeType = imageFile.type;
      clearImage();
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          conversationId: id,
          imageData,
          imageMimeType,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        const displayText = fullText.replace(/\n\n<!--CONV_ID:.+?-->/, "");
        setMessages([...newMessages, { role: "assistant", content: displayText }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-3/4" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="truncate font-semibold">{title}</h1>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-7 p-5">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-primary shadow-sm">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[88%] rounded-2xl px-5 py-4 ${
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                      : "unimath-panel rounded-bl-md text-card-foreground"
                  }`}
                >
                  {msg.imagePreview && (
                    <img src={msg.imagePreview} alt="Uploaded" className="max-h-48 rounded-lg mb-2" />
                  )}
                  {msg.role === "assistant" ? (
                    <MathRenderer content={msg.content} className="text-[15px]" />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-7">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-primary shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="unimath-panel rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/60 bg-background/70 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          {imagePreview && (
            <div className="relative mb-3 inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-border" />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <Button
              variant="outline"
              size="icon"
              className="unimath-input h-10 w-10 flex-shrink-0 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Continue the conversation..."
              className="unimath-input min-h-[44px] max-h-32 resize-none rounded-xl"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !imageFile)}
              size="icon"
              className="h-10 w-10 flex-shrink-0 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
