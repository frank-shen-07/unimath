import { generatePracticeProblems } from "@/lib/gemini";
import { requireServerAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";

type PracticePayload = {
  topic?: string;
  difficulty?: string;
  count?: number;
};

export async function POST(request: Request) {
  try {
    await requireServerAuthSession();

    const payload = (await request.json()) as PracticePayload;
    const topic = payload.topic?.trim();
    const difficulty = payload.difficulty?.trim();
    const count = Math.max(1, Math.min(10, Number(payload.count) || 5));

    if (!topic || !difficulty) {
      return Response.json(
        { error: "Topic and difficulty are required" },
        { status: 400 }
      );
    }

    const result = await generatePracticeProblems(topic, difficulty, count);

    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Practice API error:", error);
    return Response.json(
      { error: "Failed to generate practice problems" },
      { status: 500 }
    );
  }
}
