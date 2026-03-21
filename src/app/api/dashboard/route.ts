import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session = await requireServerAuthSession();
    const supabase = createAdminClient();

    const [sessionsResult, decksResult] = await Promise.all([
      supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

    if (sessionsResult.error) {
      throw sessionsResult.error;
    }

    if (decksResult.error) {
      throw decksResult.error;
    }

    return Response.json({
      userName:
        session.user.name ??
        session.user.email?.split("@")[0] ??
        "Student",
      sessions: sessionsResult.data ?? [],
      decks: decksResult.data ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Dashboard API error:", error);
    return Response.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
