const MAX_DOCUMENT_CHARS = 40000;

function getExtension(filename: string) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

function normalizeDocumentText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractTextFromDocument(file: File) {
  const extension = getExtension(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  let extractedText = "";

  if (
    file.type.startsWith("text/") ||
    extension === "txt" ||
    extension === "md" ||
    extension === "markdown"
  ) {
    extractedText = buffer.toString("utf-8");
  } else if (file.type === "application/pdf" || extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    extractedText = result.text;
    await parser.destroy();
  } else if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    extractedText = result.value;
  } else {
    throw new Error("Unsupported document type. Use PDF, DOCX, TXT, or MD.");
  }

  const normalized = normalizeDocumentText(extractedText);
  if (!normalized) {
    throw new Error("Could not extract readable text from that document.");
  }

  return normalized.slice(0, MAX_DOCUMENT_CHARS);
}
