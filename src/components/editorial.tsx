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
        "unimath-shell relative min-h-full overflow-hidden",
        className
      )}
    >
      <div className="editorial-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(232,216,204,0.12),transparent_68%)]" />
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
      className="unimath-panel relative overflow-hidden rounded-[2rem] p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8 dark:bg-white/6" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr),auto]">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="font-label text-[11px] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="font-serif text-4xl leading-none tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
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
        "unimath-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8 dark:bg-white/6" />
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
    <div className="unimath-panel-muted rounded-[1.5rem] p-4">
      <p className="font-label text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}
    </div>
  );
}
