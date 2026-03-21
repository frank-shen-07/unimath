import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateFormulaSheetPayload = {
  title?: string;
  topic?: string;
  formulas?: unknown;
};

export async function GET() {
  try {
    const session = await requireServerAuthSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("formula_sheets")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ sheets: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Formula sheets GET error:", error);
    return Response.json(
      { error: "Failed to load formula sheets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireServerAuthSession();
    const payload = (await request.json()) as CreateFormulaSheetPayload;

    if (!payload.title?.trim() || !payload.topic?.trim() || !payload.formulas) {
      return Response.json(
        { error: "Title, topic, and formulas are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("formula_sheets")
      .insert({
        user_id: session.user.id,
        title: payload.title.trim(),
        topic: payload.topic.trim(),
        formulas: payload.formulas,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ sheet: data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Formula sheets POST error:", error);
    return Response.json(
      { error: "Failed to save formula sheet" },
      { status: 500 }
    );
  }
}
