"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function EditorialPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-full bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.16),transparent_32%),linear-gradient(180deg,#0b0c14_0%,#090a11_100%)]", className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        {children}
      </div>
    </div>
  );
}

export function EditorialHeader({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr),auto] lg:p-8"
    >
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/45">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {aside ? <div className="flex items-start justify-start lg:justify-end">{aside}</div> : null}
    </motion.div>
  );
}

export function EditorialPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function EditorialStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-white/52">{detail}</p> : null}
    </div>
  );
}
