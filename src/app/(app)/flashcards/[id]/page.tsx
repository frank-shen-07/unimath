import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditorialHeader, EditorialPage } from "@/components/editorial";
import { FlashcardDeckViewer } from "@/components/flashcard-deck-viewer";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <EditorialPage>
      <EditorialHeader
        eyebrow="Flashcards"
        title="Review saved deck"
        description="Open a saved deck and work through the cards with keyboard navigation and review tracking."
        aside={
          <Link
            href="/flashcards"
            className="unimath-pill inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm text-foreground/80 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to decks
          </Link>
        }
      />
      <FlashcardDeckViewer deckId={id} />
    </EditorialPage>
  );
}
