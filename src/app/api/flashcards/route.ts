import { generateFlashcards } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { topic, notes, count } = await request.json();

    if (!topic && !notes) {
      return Response.json(
        { error: "A topic or notes input is required" },
        { status: 400 }
      );
    }

    const result = await generateFlashcards({
      topic,
      notes,
      count: count ?? 10,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Flashcards API error:", error);
    return Response.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
