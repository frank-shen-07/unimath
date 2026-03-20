import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Camera, Dumbbell, Layers, Map, MessageSquare, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Tutor",
    description: "Explain any proof, derivation, or calculation with calm step-by-step help.",
  },
  {
    icon: Camera,
    title: "Photo Solve",
    description: "Upload problem sheets and turn them into structured worked solutions.",
  },
  {
    icon: Dumbbell,
    title: "Practice Problems",
    description: "Generate targeted drills by topic and difficulty, then track accuracy.",
  },
  {
    icon: BookOpen,
    title: "Formula Sheets",
    description: "Build elegant notes sheets you can save, reopen, and export to PDF.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Generate Quizlet-style flip cards from topics or lecture notes.",
  },
  {
    icon: Map,
    title: "Knowledge Map",
    description: "See your practice history as a connected map of university mathematics.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#090a0f_0%,#07080c_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.08]" />

      <header className="fixed top-0 z-50 w-full border-b border-white/8 bg-[#090a0f]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-[#13161d]">
              <span className="font-serif text-xl font-semibold text-white">U</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">Study OS</p>
              <span className="font-serif text-2xl leading-none tracking-[-0.04em]">UniMath</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/8 bg-[#13161d] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-[#171b23]"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="px-6 pb-20 pt-32">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-[#12151b] px-4 py-2 text-sm text-white/75">
                <Sparkles className="h-4 w-4 text-primary" />
                Powered by Gemini Flash AI
              </div>
              <h1 className="font-serif text-6xl leading-none tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                Study university maths in one calm workspace.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                Tutoring chat, photo solve, topic drills, formula sheets, a knowledge map, and flashcards, designed as one cohesive product instead of a pile of tools.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-black transition hover:bg-white/90"
                >
                  Start learning free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-base font-medium text-white/80 transition hover:bg-white/[0.08]"
                >
                  Open app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Tutor", "Step-by-step explanations"],
                  ["Map", "Connected topic memory"],
                  ["Cards", "Flip-card study mode"],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-[1.5rem] border border-white/8 bg-[#11141a] p-4">
                    <p className="font-serif text-3xl leading-none tracking-[-0.04em]">{label}</p>
                    <p className="mt-2 text-sm text-white/45">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-white/[0.02] blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.25rem] border border-white/8 bg-[#111319] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.45)]">
                <div className="grid gap-4">
                  <div className="rounded-[1.75rem] border border-white/8 bg-[#0c0f14] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Flashcards</p>
                        <h2 className="mt-2 font-serif text-4xl leading-none tracking-[-0.05em]">Flip to recall</h2>
                      </div>
                      <Layers className="h-5 w-5 text-white/35" />
                    </div>
                    <div className="mt-5 [perspective:2000px]">
                      <div className="relative min-h-[250px] rounded-[2rem] border border-white/8 bg-[#141821] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Front</p>
                        <div className="flex min-h-[180px] items-center justify-center">
                          <p className="max-w-md text-center font-serif text-3xl leading-tight tracking-[-0.04em] text-white">
                            What does a positive definite matrix guarantee about $x^TAx$?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.75rem] border border-white/8 bg-[#0c0f14] p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Chat tutor</p>
                      <p className="mt-3 text-lg leading-8 text-white/78">
                        “Show me why the substitution works, not just the final integral.”
                      </p>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/8 bg-[#0c0f14] p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Knowledge map</p>
                      <p className="mt-3 text-lg leading-8 text-white/78">
                        Track calculus, linear algebra, and differential equations as connected topics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/38">Everything you need</p>
              <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em]">
                A complete study system for university maths
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/55">
                Inspired by modern study products: crisp hierarchy, fewer distractions, and interactions that feel built for learning.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-[1.9rem] border border-white/8 bg-[#101218] p-6 transition duration-200 hover:-translate-y-1 hover:bg-[#141820]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-[#171b23] text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-3xl leading-none tracking-[-0.04em]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/52">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2.25rem] border border-white/8 bg-[#101218] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.35)] sm:p-10 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-white/38">Ready to level up?</p>
                  <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em]">
                    Build a study loop that actually sticks
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/55">
                    Learn with the tutor, reinforce with flashcards, drill weak areas, and watch your topic graph grow.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:bg-white/90"
                >
                  Create free account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-white/40">
          <p>UniMath — AI Math Tutor for University Students</p>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <p>Powered by Gemini Flash</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
