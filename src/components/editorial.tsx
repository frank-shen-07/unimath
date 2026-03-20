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
    <div
      className={cn(
        "relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#090a0f_0%,#07080c_100%)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08]" />
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
      className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111319] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] lg:p-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr),auto]">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/45">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="font-serif text-4xl leading-none tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
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
      </div>
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
        "relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#101218] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/7" />
      <div className="relative">{children}</div>
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
    <div className="rounded-[1.5rem] border border-white/7 bg-[#0b0d12] p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-white/52">{detail}</p> : null}
    </div>
  );
}
