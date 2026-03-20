"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MathRenderer } from "@/components/math-renderer";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ImagePlus, X, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
          conversationId,
          imageData,
          imageMimeType,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

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

        const convIdMatch = fullText.match(/<!--CONV_ID:(.+?)-->/);
        const displayText = fullText.replace(/\n\n<!--CONV_ID:.+?-->/, "");

        if (convIdMatch && !conversationId) {
          setConversationId(convIdMatch[1]);
          router.replace(`/chat/${convIdMatch[1]}`, { scroll: false });
        }

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

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-primary shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="mb-2 font-serif text-4xl leading-none tracking-[-0.04em] text-foreground">Ask me anything about math</h2>
          </div>
        ) : (
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
                      <img
                        src={msg.imagePreview}
                        alt="Uploaded"
                        className="max-h-48 rounded-lg mb-2"
                      />
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-primary shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="unimath-panel rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </div>
        )}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              className="unimath-input h-12 w-12 flex-shrink-0 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-[18px] h-[18px]" />
            </Button>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your math question..."
              className="unimath-input min-h-[60px] max-h-40 resize-none rounded-xl px-4 py-4"
              rows={2}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !imageFile)}
              size="icon"
              className="h-12 w-12 flex-shrink-0 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <Send className="w-[18px] h-[18px]" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
