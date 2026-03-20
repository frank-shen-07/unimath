import { EditorialPage } from "@/components/editorial";
import { FlashcardDeckViewer } from "@/components/flashcard-deck-viewer";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <EditorialPage>
      <FlashcardDeckViewer deckId={id} />
    </EditorialPage>
  );
}
