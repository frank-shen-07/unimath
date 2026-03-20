import { extractTextFromDocument } from "@/lib/document-text";
import { generateFlashcards } from "@/lib/gemini";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let topic = "";
    let notes = "";
    let count = 10;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      topic = String(formData.get("topic") || "").trim();
      notes = String(formData.get("notes") || "").trim();
      count = Number(formData.get("count") || 10);

      const file = formData.get("document");
      if (file instanceof File && file.size > 0) {
        const documentText = await extractTextFromDocument(file);
        notes = [notes, `Document: ${file.name}\n\n${documentText}`]
          .filter(Boolean)
          .join("\n\n");
      }
    } else {
      const payload = await request.json();
      topic = String(payload.topic || "").trim();
      notes = String(payload.notes || "").trim();
      count = Number(payload.count || 10);
    }

    if (!topic && !notes) {
      return Response.json(
        { error: "A topic or notes input is required" },
        { status: 400 }
      );
    }

    const result = await generateFlashcards({
      topic,
      notes,
      count: count || 10,
    });

    return Response.json({
      ...result,
      sourceText: notes || null,
    });
  } catch (error) {
    console.error("Flashcards API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
