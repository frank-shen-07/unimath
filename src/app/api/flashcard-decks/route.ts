import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateDeckPayload = {
  title?: string;
  topic?: string | null;
  sourceText?: string | null;
  cards?: Array<{
    front?: string;
    back?: string;
  }>;
};

export async function GET() {
  try {
    const session = await requireServerAuthSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("flashcard_decks")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ decks: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Flashcard decks GET error:", error);
    return Response.json(
      { error: "Failed to load flashcard decks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireServerAuthSession();
    const payload = (await request.json()) as CreateDeckPayload;
    const cards =
      payload.cards?.filter(
        (card) => card.front?.trim() && card.back?.trim()
      ) ?? [];

    if (!payload.title?.trim() || cards.length === 0) {
      return Response.json(
        { error: "A title and at least one flashcard are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: session.user.id,
        title: payload.title.trim(),
        topic: payload.topic?.trim() || null,
        source_text: payload.sourceText?.trim() || null,
        card_count: cards.length,
      })
      .select("*")
      .single();

    if (deckError || !deck) {
      throw deckError ?? new Error("Could not create flashcard deck");
    }

    const { error: cardsError } = await supabase.from("flashcards").insert(
      cards.map((card, index) => ({
        deck_id: deck.id,
        front: card.front!.trim(),
        back: card.back!.trim(),
        sort_order: index,
      }))
    );

    if (cardsError) {
      throw cardsError;
    }

    return Response.json({ deckId: deck.id });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Flashcard decks POST error:", error);
    return Response.json(
      { error: "Failed to save flashcard deck" },
      { status: 500 }
    );
  }
}
