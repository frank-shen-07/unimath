import { generatePracticeProblems } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, count } = await request.json();

    if (!topic || !difficulty) {
      return Response.json(
        { error: "Topic and difficulty are required" },
        { status: 400 }
      );
    }

    const result = await generatePracticeProblems(topic, difficulty, count || 5);
    return Response.json(result);
  } catch (error) {
    console.error("Practice API error:", error);
    return Response.json(
      { error: "Failed to generate practice problems" },
      { status: 500 }
    );
  }
}
