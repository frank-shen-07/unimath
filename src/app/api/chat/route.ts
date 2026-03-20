import { generateChatResponseStream } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationId, imageData, imageMimeType } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let convId = conversationId;

    if (user && !convId) {
      const { data: conv } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: messages[0]?.content?.slice(0, 100) || "New conversation",
        })
        .select("id")
        .single();
      convId = conv?.id;
    }

    if (user && convId) {
      const lastMsg = messages[messages.length - 1];
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: lastMsg.content,
        image_url: imageData ? `data:${imageMimeType};base64,${imageData.slice(0, 50)}...` : null,
      });
    }

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
      ...(m.role === "user" && imageData ? { imageData, imageMimeType } : {}),
    }));

    const response = await generateChatResponseStream(geminiMessages);

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text ?? "";
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }

          if (user && convId) {
            await supabase.from("messages").insert({
              conversation_id: convId,
              role: "assistant",
              content: fullResponse,
            });

            await supabase
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", convId);
          }

          controller.enqueue(
            new TextEncoder().encode(`\n\n<!--CONV_ID:${convId}-->`)
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
