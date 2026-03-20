export interface DefaultTopic {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
}

export interface DefaultEdge {
  source: string;
  target: string;
  label: string;
}

export const TOPIC_CATEGORIES = [
  "Basic Calculus",
  "Multivariable & Vector Calculus",
  "Linear Algebra",
  "Probability and Statistics",
  "Applied Maths",
  "Discrete Maths",
  "Analysis",
  "Differential Equations",
  "Abstract Algebra",
  "Topology",
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "Basic Calculus": { bg: "bg-blue-50/80 dark:bg-blue-950/30", border: "border-blue-400/60 dark:border-blue-500/40", text: "text-blue-700 dark:text-blue-200" },
  "Multivariable & Vector Calculus": { bg: "bg-cyan-50/80 dark:bg-cyan-950/30", border: "border-cyan-400/60 dark:border-cyan-500/40", text: "text-cyan-700 dark:text-cyan-200" },
  "Linear Algebra": { bg: "bg-violet-50/80 dark:bg-violet-950/30", border: "border-violet-400/60 dark:border-violet-500/40", text: "text-violet-700 dark:text-violet-200" },
  "Probability and Statistics": { bg: "bg-emerald-50/80 dark:bg-emerald-950/30", border: "border-emerald-400/60 dark:border-emerald-500/40", text: "text-emerald-700 dark:text-emerald-200" },
  "Applied Maths": { bg: "bg-cyan-50/80 dark:bg-cyan-950/30", border: "border-cyan-400/60 dark:border-cyan-500/40", text: "text-cyan-700 dark:text-cyan-200" },
  "Discrete Maths": { bg: "bg-rose-50/80 dark:bg-rose-950/30", border: "border-rose-400/60 dark:border-rose-500/40", text: "text-rose-700 dark:text-rose-200" },
  Analysis: { bg: "bg-amber-50/80 dark:bg-amber-950/30", border: "border-amber-400/60 dark:border-amber-500/40", text: "text-amber-700 dark:text-amber-200" },
  "Differential Equations": { bg: "bg-orange-50/80 dark:bg-orange-950/30", border: "border-orange-400/60 dark:border-orange-500/40", text: "text-orange-700 dark:text-orange-200" },
  "Abstract Algebra": { bg: "bg-fuchsia-50/80 dark:bg-fuchsia-950/30", border: "border-fuchsia-400/60 dark:border-fuchsia-500/40", text: "text-fuchsia-700 dark:text-fuchsia-200" },
  Topology: { bg: "bg-slate-50/80 dark:bg-slate-900/60", border: "border-slate-400/60 dark:border-slate-500/40", text: "text-slate-700 dark:text-slate-200" },
};

export const CATEGORY_CENTERS: Record<string, { x: number; y: number }> = {
  "Discrete Maths": { x: -420, y: -150 },
  "Basic Calculus": { x: -170, y: -170 },
  "Multivariable & Vector Calculus": { x: 70, y: -140 },
  "Linear Algebra": { x: 320, y: -170 },
  "Probability and Statistics": { x: 520, y: -140 },
  "Differential Equations": { x: -120, y: 160 },
  "Applied Maths": { x: 250, y: 160 },
  Analysis: { x: -360, y: 380 },
  "Abstract Algebra": { x: 20, y: 390 },
  Topology: { x: 420, y: 380 },
};

export const DEFAULT_TOPICS: DefaultTopic[] = [
  { id: "sets", name: "Sets and Functions", category: "Discrete Maths", x: -500, y: -210 },
  { id: "logic", name: "Logic and Proofs", category: "Discrete Maths", x: -390, y: -120 },
  { id: "number-theory", name: "Number Theory", category: "Discrete Maths", x: -300, y: -210 },
  { id: "graph-theory", name: "Graph Theory", category: "Discrete Maths", x: -240, y: -80 },

  { id: "limits", name: "Limits", category: "Basic Calculus", x: -220, y: -240 },
  { id: "derivatives", name: "Derivatives", category: "Basic Calculus", x: -110, y: -160 },
  { id: "integration", name: "Integration", category: "Basic Calculus", x: -10, y: -210 },
  { id: "series", name: "Series and Sequences", category: "Basic Calculus", x: 90, y: -135 },
  { id: "multivariable", name: "Multivariable Calculus", category: "Multivariable & Vector Calculus", x: -10, y: -80 },
  { id: "vector-calculus", name: "Vector Calculus", category: "Multivariable & Vector Calculus", x: 110, y: -20 },

  { id: "vectors", name: "Vectors", category: "Linear Algebra", x: 140, y: -245 },
  { id: "matrices", name: "Matrices", category: "Linear Algebra", x: 250, y: -180 },
  { id: "vector-spaces", name: "Vector Spaces", category: "Linear Algebra", x: 360, y: -240 },
  { id: "linear-transforms", name: "Linear Transformations", category: "Linear Algebra", x: 300, y: -60 },
  { id: "eigenvalues", name: "Eigenvalues and Eigenvectors", category: "Linear Algebra", x: 430, y: -120 },

  { id: "combinatorics", name: "Combinatorics", category: "Probability and Statistics", x: 480, y: -260 },
  { id: "probability", name: "Probability", category: "Probability and Statistics", x: 560, y: -160 },
  { id: "statistics", name: "Statistics", category: "Probability and Statistics", x: 620, y: -60 },

  { id: "first-ode", name: "First-Order ODEs", category: "Differential Equations", x: -210, y: 70 },
  { id: "second-ode", name: "Second-Order ODEs", category: "Differential Equations", x: -80, y: 125 },
  { id: "laplace", name: "Laplace Transforms", category: "Differential Equations", x: 30, y: 70 },
  { id: "pde", name: "Partial Differential Equations", category: "Differential Equations", x: 20, y: 220 },

  { id: "numerical", name: "Numerical Methods", category: "Applied Maths", x: 180, y: 250 },
  { id: "optimization", name: "Optimization", category: "Applied Maths", x: 300, y: 140 },
  { id: "fourier", name: "Fourier Analysis", category: "Applied Maths", x: 420, y: 240 },

  { id: "real-analysis", name: "Real Analysis", category: "Analysis", x: -440, y: 290 },
  { id: "complex-analysis", name: "Complex Analysis", category: "Analysis", x: -320, y: 370 },
  { id: "measure-theory", name: "Measure Theory", category: "Analysis", x: -220, y: 300 },

  { id: "groups", name: "Groups", category: "Abstract Algebra", x: -20, y: 300 },
  { id: "rings-fields", name: "Rings and Fields", category: "Abstract Algebra", x: 80, y: 390 },
  { id: "modules", name: "Modules and Representations", category: "Abstract Algebra", x: 170, y: 300 },

  { id: "point-set-topology", name: "Point-Set Topology", category: "Topology", x: 330, y: 300 },
  { id: "algebraic-topology", name: "Algebraic Topology", category: "Topology", x: 470, y: 380 },
  { id: "differential-topology", name: "Differential Topology", category: "Topology", x: 590, y: 300 },
];

export const DEFAULT_EDGES: DefaultEdge[] = [
  { source: "sets", target: "logic", label: "within-group" },
  { source: "logic", target: "number-theory", label: "within-group" },
  { source: "logic", target: "graph-theory", label: "within-group" },

  { source: "limits", target: "derivatives", label: "within-group" },
  { source: "derivatives", target: "integration", label: "within-group" },
  { source: "integration", target: "series", label: "within-group" },
  { source: "derivatives", target: "multivariable", label: "within-group" },
  { source: "multivariable", target: "vector-calculus", label: "within-group" },

  { source: "vectors", target: "matrices", label: "within-group" },
  { source: "matrices", target: "vector-spaces", label: "within-group" },
  { source: "vector-spaces", target: "linear-transforms", label: "within-group" },
  { source: "linear-transforms", target: "eigenvalues", label: "within-group" },

  { source: "combinatorics", target: "probability", label: "within-group" },
  { source: "probability", target: "statistics", label: "within-group" },

  { source: "first-ode", target: "second-ode", label: "within-group" },
  { source: "second-ode", target: "laplace", label: "within-group" },
  { source: "laplace", target: "pde", label: "within-group" },

  { source: "numerical", target: "optimization", label: "within-group" },
  { source: "numerical", target: "fourier", label: "within-group" },

  { source: "real-analysis", target: "measure-theory", label: "within-group" },
  { source: "real-analysis", target: "complex-analysis", label: "within-group" },

  { source: "groups", target: "rings-fields", label: "within-group" },
  { source: "rings-fields", target: "modules", label: "within-group" },

  { source: "point-set-topology", target: "algebraic-topology", label: "within-group" },
  { source: "point-set-topology", target: "differential-topology", label: "within-group" },

  { source: "integration", target: "first-ode", label: "bridge" },
  { source: "multivariable", target: "optimization", label: "bridge" },
  { source: "series", target: "fourier", label: "bridge" },
  { source: "real-analysis", target: "point-set-topology", label: "bridge" },
];

export const CATEGORY_TO_TOPICS = DEFAULT_TOPICS.reduce<Record<string, string[]>>(
  (acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = [];
    }
    acc[topic.category].push(topic.name);
    return acc;
  },
  {}
);

const CATEGORY_ALIASES: Record<string, string[]> = {
  "Basic Calculus": ["basic calculus", "calculus"],
  "Multivariable & Vector Calculus": [
    "multivariable and vector calculus",
    "multivariable vector calculus",
    "multivariable calculus",
    "vector calculus",
  ],
  "Linear Algebra": ["linear algebra"],
  "Probability and Statistics": [
    "probability and statistics",
    "probability & statistics",
    "probability",
    "statistics",
    "stats",
  ],
  "Applied Maths": ["applied maths", "applied math", "applied mathematics"],
  "Discrete Maths": ["discrete maths", "discrete math", "discrete mathematics"],
  Analysis: ["analysis", "mathematical analysis"],
  "Differential Equations": [
    "differential equations",
    "differential equation",
    "odes",
    "pdes",
  ],
  "Abstract Algebra": ["abstract algebra", "algebra"],
  Topology: ["topology", "algebraic topology", "differential topology"],
};

export interface ResolvedTopicScope {
  label: string;
  promptTopic: string;
  subtopics: string[];
  isCategory: boolean;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/maths/g, "math")
    .replace(/mathematics/g, "math")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveTopicScope(input: string): ResolvedTopicScope {
  const trimmed = input.trim();
  const normalizedInput = normalizeSearch(trimmed);

  const exactTopic = DEFAULT_TOPICS.find(
    (topic) => normalizeSearch(topic.name) === normalizedInput
  );

  if (exactTopic) {
    return {
      label: exactTopic.name,
      promptTopic: exactTopic.name,
      subtopics: [exactTopic.name],
      isCategory: false,
    };
  }

  const matchedCategory = Object.keys(CATEGORY_TO_TOPICS).find((category) => {
    const aliases = [category, ...(CATEGORY_ALIASES[category] ?? [])];
    return aliases.some((alias) => normalizeSearch(alias) === normalizedInput);
  });

  if (matchedCategory) {
    const subtopics = CATEGORY_TO_TOPICS[matchedCategory];
    return {
      label: matchedCategory,
      promptTopic: `${matchedCategory}. Cover these subtopics as relevant: ${subtopics.join(
        ", "
      )}.`,
      subtopics,
      isCategory: true,
    };
  }

  return {
    label: trimmed,
    promptTopic: trimmed,
    subtopics: [],
    isCategory: false,
  };
}

export const PRACTICE_TOPICS = DEFAULT_TOPICS.map((t) => t.name);
