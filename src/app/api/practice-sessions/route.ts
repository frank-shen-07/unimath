import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type PracticeSessionPayload = {
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
  totalQuestions?: number;
  correctAnswers?: number;
};

export async function POST(request: Request) {
  try {
    const session = await requireServerAuthSession();
    const payload = (await request.json()) as PracticeSessionPayload;

    if (
      !payload.topic?.trim() ||
      !payload.difficulty ||
      typeof payload.totalQuestions !== "number" ||
      typeof payload.correctAnswers !== "number"
    ) {
      return Response.json(
        { error: "Missing practice session fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("practice_sessions").insert({
      user_id: session.user.id,
      topic: payload.topic.trim(),
      difficulty: payload.difficulty,
      total_questions: payload.totalQuestions,
      correct_answers: payload.correctAnswers,
    });

    if (error) {
      throw error;
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Practice sessions POST error:", error);
    return Response.json(
      { error: "Failed to save practice session" },
      { status: 500 }
    );
  }
}
