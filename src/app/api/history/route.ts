import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session = await requireServerAuthSession();
    const supabase = createAdminClient();

    const [conversationsResult, sessionsResult] = await Promise.all([
      supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (conversationsResult.error) {
      throw conversationsResult.error;
    }

    if (sessionsResult.error) {
      throw sessionsResult.error;
    }

    return Response.json({
      conversations: conversationsResult.data ?? [],
      sessions: sessionsResult.data ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("History API error:", error);
    return Response.json(
      { error: "Failed to load history" },
      { status: 500 }
    );
  }
}
