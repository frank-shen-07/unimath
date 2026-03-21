import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session = await requireServerAuthSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("topic_nodes")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

    return Response.json({ topicNodes: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Topic nodes GET error:", error);
    return Response.json(
      { error: "Failed to load topic nodes" },
      { status: 500 }
    );
  }
}
