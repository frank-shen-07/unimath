import Link from "next/link";
import { MessageSquare, Camera, Dumbbell, BookOpen, Map, Brain } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat Tutor",
    description: "Get step-by-step explanations for any math problem with our AI tutor.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Camera,
    title: "Photo Solve",
    description: "Snap a photo of a problem and get an instant, detailed solution.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Dumbbell,
    title: "Practice Problems",
    description: "Generate unlimited practice problems tailored to your level.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Formula Sheets",
    description: "AI-generated formula sheets organized by topic.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Map,
    title: "Knowledge Map",
    description: "Visualize your learning journey as an interactive graph of math topics.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "Smart Tracking",
    description: "Track mastery across topics and identify areas for improvement.",
    color: "from-fuchsia-500 to-purple-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-primary-foreground">U</span>
            </div>
            <span className="text-lg font-bold tracking-tight">UniMath</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Brain className="w-4 h-4" />
            Powered by Gemini Flash AI
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Master university math{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Your personal AI math tutor that helps you understand, practice, and track your progress across calculus, linear algebra, differential equations, and more.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to excel</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete suite of AI-powered tools designed for university-level mathematics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to level up your math?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join UniMath and start mastering university mathematics with the help of AI.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <p>UniMath &mdash; AI Math Tutor for University Students</p>
          <p>Powered by Gemini Flash</p>
        </div>
      </footer>
    </div>
  );
}
