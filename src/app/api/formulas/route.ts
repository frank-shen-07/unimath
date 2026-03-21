import { generateFormulaSheet } from "@/lib/gemini";
import { requireServerAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";

type FormulaPayload = {
  topic?: string;
};

export async function POST(request: Request) {
  try {
    await requireServerAuthSession();

    const payload = (await request.json()) as FormulaPayload;
    const topic = payload.topic?.trim();

    if (!topic) {
      return Response.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const result = await generateFormulaSheet(topic);

    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Formulas API error:", error);
    return Response.json(
      { error: "Failed to generate formula sheet" },
      { status: 500 }
    );
  }
}
