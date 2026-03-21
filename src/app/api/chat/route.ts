import { generateChatResponse } from "@/lib/gemini";
import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ChatPayload = {
  messages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  conversationId?: string | null;
  imageData?: string;
  imageMimeType?: string;
};

function deriveConversationTitle(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "New conversation";
  }

  return normalized.slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const session = await requireServerAuthSession();
    const payload = (await request.json()) as ChatPayload;
    const messages =
      payload.messages?.filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
      ) ?? [];

    if (messages.length === 0) {
      return Response.json(
        { error: "At least one chat message is required" },
        { status: 400 }
      );
    }

    const latestUserMessage = [...messages].reverse().find(
      (message) => message.role === "user"
    );

    if (!latestUserMessage) {
      return Response.json(
        { error: "A user message is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let conversationId = payload.conversationId ?? null;
    let createdConversationId: string | null = null;

    if (conversationId) {
      const { data: existingConversation, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !existingConversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          user_id: session.user.id,
          title: deriveConversationTitle(latestUserMessage.content),
        })
        .select("id")
        .single();

      if (error || !conversation) {
        throw error ?? new Error("Failed to create conversation");
      }

      conversationId = conversation.id;
      createdConversationId = conversation.id;
    }

    if (!conversationId) {
      throw new Error("Conversation was not initialized");
    }

    const { error: insertUserMessageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: latestUserMessage.content,
      image_url: null,
    });

    if (insertUserMessageError) {
      throw insertUserMessageError;
    }

    const aiMessages = messages.map((message, index) => ({
      role: message.role,
      content: message.content,
      imageData:
        index === messages.length - 1 ? payload.imageData : undefined,
      imageMimeType:
        index === messages.length - 1 ? payload.imageMimeType : undefined,
    }));

    const assistantText = await generateChatResponse(aiMessages);

    const { error: insertAssistantMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantText,
        image_url: null,
      });

    if (insertAssistantMessageError) {
      throw insertAssistantMessageError;
    }

    const { error: updateConversationError } = await supabase
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateConversationError) {
      throw updateConversationError;
    }

    const responseText = createdConversationId
      ? `${assistantText}\n\n<!--CONV_ID:${createdConversationId}-->`
      : assistantText;

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate chat response" },
      { status: 500 }
    );
  }
}
