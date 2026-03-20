import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.1-flash-lite-preview";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const MATH_TUTOR_SYSTEM_PROMPT = `You are UniMath, an expert AI math tutor for university students. You help with calculus, linear algebra, differential equations, probability, statistics, discrete math, real analysis, abstract algebra, and more.

Guidelines:
- Always use LaTeX delimiters for math: inline with $...$ and display with $$...$$
- Provide clear, step-by-step explanations
- When solving problems, show your work and explain each step
- Be encouraging and patient
- If a student makes an error, gently point it out and guide them to the correct approach
- Use precise mathematical notation and terminology
- When appropriate, suggest related topics or concepts for further study`;

export async function generateChatResponse(
  messages: { role: string; content: string; imageData?: string; imageMimeType?: string }[]
) {
  const ai = getAI();
  const contents = messages.map((m) => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: m.content },
    ];
    if (m.imageData && m.imageMimeType) {
      parts.push({
        inlineData: { mimeType: m.imageMimeType, data: m.imageData },
      });
    }
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: MATH_TUTOR_SYSTEM_PROMPT,
    },
  });

  return response.text ?? "";
}

export async function generateChatResponseStream(
  messages: { role: string; content: string; imageData?: string; imageMimeType?: string }[]
) {
  const ai = getAI();
  const contents = messages.map((m) => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: m.content },
    ];
    if (m.imageData && m.imageMimeType) {
      parts.push({
        inlineData: { mimeType: m.imageMimeType, data: m.imageData },
      });
    }
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const response = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction: MATH_TUTOR_SYSTEM_PROMPT,
    },
  });

  return response;
}

export async function generatePracticeProblems(
  topic: string,
  difficulty: string,
  count: number = 5
) {
  const ai = getAI();
  const prompt = `Generate ${count} university-level math practice problems about "${topic}" at ${difficulty} difficulty level.

For each problem, provide:
1. The question (use LaTeX with $...$ for inline math and $$...$$ for display math)
2. The correct answer (with LaTeX)
3. A detailed step-by-step explanation (with LaTeX)

Return as JSON with this exact structure:
{
  "questions": [
    {
      "question": "...",
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text ?? "{}");
}

export async function generateFormulaSheet(topic: string) {
  const ai = getAI();
  const prompt = `Create a comprehensive university-level formula sheet for "${topic}".

Organize it into logical sections. For each formula:
- Provide the name
- The LaTeX expression (use $...$ for inline)
- A brief description of when to use it

Return as JSON:
{
  "title": "...",
  "sections": [
    {
      "heading": "...",
      "formulas": [
        {
          "name": "...",
          "expression": "...",
          "description": "..."
        }
      ]
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text ?? "{}");
}

export async function generateFlashcards(input: {
  topic?: string;
  notes?: string;
  count?: number;
}) {
  const ai = getAI();
  const count = input.count ?? 10;
  const prompt = `Create ${count} high-quality university study flashcards.

Context:
- Topic or scope: ${input.topic ?? "General university mathematics"}
- Notes: ${input.notes?.trim() || "No notes provided. Infer the most useful core concepts from the topic."}

Requirements:
- Make each flashcard concise, useful, and study-worthy.
- Front side should be a direct question, definition cue, theorem cue, method cue, or concept prompt.
- Back side should be accurate, clear, and can include LaTeX using $...$ or $$...$$ where helpful.
- Cover a good spread of concepts instead of repeating the same idea.
- If the topic is broad, include representative subtopics.

Return JSON in this exact format:
{
  "title": "...",
  "flashcards": [
    {
      "front": "...",
      "back": "..."
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text ?? "{}");
}

export async function classifyTopic(question: string): Promise<string> {
  const ai = getAI();
  const prompt = `Classify this math question into exactly one of these university math topic names. Return ONLY the topic name, nothing else.

Topics: Sets and Functions, Logic and Proofs, Number Theory, Graph Theory, Limits, Derivatives, Integration, Series and Sequences, Multivariable Calculus, Vectors, Matrices, Vector Spaces, Linear Transformations, Eigenvalues and Eigenvectors, Combinatorics, Probability, Statistics, First-Order ODEs, Second-Order ODEs, Laplace Transforms, Partial Differential Equations, Numerical Methods, Optimization, Fourier Analysis, Real Analysis, Complex Analysis, Measure Theory, Groups, Rings and Fields, Modules and Representations, Point-Set Topology, Algebraic Topology, Differential Topology

Question: ${question}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return (response.text ?? "Uncategorized").trim();
}
