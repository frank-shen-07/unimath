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

    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (deckError || !deck) {
      return Response.json({ error: "Deck not found" }, { status: 404 });
    }

    const { data: flashcards, error: cardsError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", id)
      .order("sort_order", { ascending: true });

    if (cardsError) {
      throw cardsError;
    }

    return Response.json({
      deck,
      flashcards: flashcards ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Flashcard deck detail error:", error);
    return Response.json(
      { error: "Failed to load flashcard deck" },
      { status: 500 }
    );
  }
}
