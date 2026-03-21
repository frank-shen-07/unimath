import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireServerAuthSession();
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (conversationError || !conversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return Response.json({
      conversation,
      messages: messages ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Conversation detail error:", error);
    return Response.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}
