"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none text-[15px] leading-8 dark:prose-invert",
        "prose-p:my-3 prose-p:leading-8",
        "prose-li:my-1.5 prose-li:leading-8",
        "prose-ul:my-4 prose-ol:my-4",
        "prose-hr:my-6 prose-strong:font-semibold",
        "prose-headings:mb-3 prose-headings:mt-6",
        "[&_ol]:pl-5 [&_ul]:pl-5 [&_li>p]:my-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          hr: () => <hr className="border-border/60" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
