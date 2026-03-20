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
  "Foundations",
  "Calculus",
  "Linear Algebra",
  "Differential Equations",
  "Probability & Statistics",
  "Discrete Math",
  "Advanced",
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Foundations: { bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-300 dark:border-slate-600", text: "text-slate-700 dark:text-slate-300" },
  Calculus: { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  "Linear Algebra": { bg: "bg-purple-50 dark:bg-purple-950", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  "Differential Equations": { bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  "Probability & Statistics": { bg: "bg-green-50 dark:bg-green-950", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
  "Discrete Math": { bg: "bg-rose-50 dark:bg-rose-950", border: "border-rose-300 dark:border-rose-700", text: "text-rose-700 dark:text-rose-300" },
  Advanced: { bg: "bg-cyan-50 dark:bg-cyan-950", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-700 dark:text-cyan-300" },
};

export const DEFAULT_TOPICS: DefaultTopic[] = [
  // Foundations
  { id: "sets", name: "Sets and Functions", category: "Foundations", x: 0, y: 0 },
  { id: "logic", name: "Logic and Proofs", category: "Foundations", x: 200, y: 0 },
  { id: "number-theory", name: "Number Theory", category: "Foundations", x: 400, y: 0 },

  // Calculus
  { id: "limits", name: "Limits", category: "Calculus", x: 0, y: 200 },
  { id: "derivatives", name: "Derivatives", category: "Calculus", x: 200, y: 200 },
  { id: "integration", name: "Integration", category: "Calculus", x: 400, y: 200 },
  { id: "series", name: "Series and Sequences", category: "Calculus", x: 600, y: 200 },
  { id: "multivariable", name: "Multivariable Calculus", category: "Calculus", x: 300, y: 350 },

  // Linear Algebra
  { id: "vectors", name: "Vectors", category: "Linear Algebra", x: 700, y: 0 },
  { id: "matrices", name: "Matrices", category: "Linear Algebra", x: 900, y: 0 },
  { id: "linear-transforms", name: "Linear Transformations", category: "Linear Algebra", x: 800, y: 150 },
  { id: "vector-spaces", name: "Vector Spaces", category: "Linear Algebra", x: 1000, y: 150 },
  { id: "eigenvalues", name: "Eigenvalues and Eigenvectors", category: "Linear Algebra", x: 900, y: 300 },

  // Differential Equations
  { id: "first-ode", name: "First-Order ODEs", category: "Differential Equations", x: 0, y: 500 },
  { id: "second-ode", name: "Second-Order ODEs", category: "Differential Equations", x: 200, y: 500 },
  { id: "laplace", name: "Laplace Transforms", category: "Differential Equations", x: 400, y: 500 },
  { id: "pde", name: "Partial Differential Equations", category: "Differential Equations", x: 300, y: 650 },

  // Probability & Statistics
  { id: "probability", name: "Probability", category: "Probability & Statistics", x: 700, y: 450 },
  { id: "statistics", name: "Statistics", category: "Probability & Statistics", x: 900, y: 450 },
  { id: "combinatorics", name: "Combinatorics", category: "Probability & Statistics", x: 800, y: 600 },

  // Discrete Math
  { id: "graph-theory", name: "Graph Theory", category: "Discrete Math", x: 600, y: 650 },

  // Advanced
  { id: "real-analysis", name: "Real Analysis", category: "Advanced", x: 100, y: 800 },
  { id: "complex-analysis", name: "Complex Analysis", category: "Advanced", x: 300, y: 800 },
  { id: "abstract-algebra", name: "Abstract Algebra", category: "Advanced", x: 500, y: 800 },
  { id: "topology", name: "Topology", category: "Advanced", x: 700, y: 800 },
  { id: "numerical", name: "Numerical Methods", category: "Advanced", x: 900, y: 800 },
  { id: "optimization", name: "Optimization", category: "Advanced", x: 1000, y: 650 },
  { id: "fourier", name: "Fourier Analysis", category: "Advanced", x: 500, y: 650 },
];

export const DEFAULT_EDGES: DefaultEdge[] = [
  { source: "sets", target: "logic", label: "prerequisite" },
  { source: "sets", target: "limits", label: "prerequisite" },
  { source: "logic", target: "number-theory", label: "prerequisite" },
  { source: "limits", target: "derivatives", label: "prerequisite" },
  { source: "derivatives", target: "integration", label: "prerequisite" },
  { source: "integration", target: "series", label: "prerequisite" },
  { source: "derivatives", target: "multivariable", label: "extends" },
  { source: "integration", target: "multivariable", label: "extends" },
  { source: "vectors", target: "matrices", label: "prerequisite" },
  { source: "matrices", target: "linear-transforms", label: "prerequisite" },
  { source: "matrices", target: "vector-spaces", label: "prerequisite" },
  { source: "linear-transforms", target: "eigenvalues", label: "prerequisite" },
  { source: "vector-spaces", target: "eigenvalues", label: "prerequisite" },
  { source: "derivatives", target: "first-ode", label: "prerequisite" },
  { source: "first-ode", target: "second-ode", label: "prerequisite" },
  { source: "integration", target: "laplace", label: "prerequisite" },
  { source: "second-ode", target: "laplace", label: "related" },
  { source: "multivariable", target: "pde", label: "prerequisite" },
  { source: "second-ode", target: "pde", label: "prerequisite" },
  { source: "combinatorics", target: "probability", label: "prerequisite" },
  { source: "probability", target: "statistics", label: "prerequisite" },
  { source: "logic", target: "graph-theory", label: "prerequisite" },
  { source: "sets", target: "graph-theory", label: "prerequisite" },
  { source: "limits", target: "real-analysis", label: "extends" },
  { source: "series", target: "real-analysis", label: "extends" },
  { source: "real-analysis", target: "complex-analysis", label: "prerequisite" },
  { source: "sets", target: "abstract-algebra", label: "prerequisite" },
  { source: "logic", target: "abstract-algebra", label: "prerequisite" },
  { source: "real-analysis", target: "topology", label: "related" },
  { source: "integration", target: "numerical", label: "related" },
  { source: "multivariable", target: "optimization", label: "prerequisite" },
  { source: "eigenvalues", target: "optimization", label: "related" },
  { source: "series", target: "fourier", label: "prerequisite" },
  { source: "integration", target: "fourier", label: "prerequisite" },
  { source: "fourier", target: "pde", label: "related" },
];

export const PRACTICE_TOPICS = DEFAULT_TOPICS.map((t) => t.name);
