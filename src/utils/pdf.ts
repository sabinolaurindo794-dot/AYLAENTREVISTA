import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromFile(file: File, maxLength = 6000): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it: any) => it.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText.slice(0, maxLength);
    } catch (err: any) {
      console.error("Failed to parse PDF:", err);
      throw new Error("Não foi possível extrair o texto do PDF: " + err.message);
    }
  } else {
    // Plain text / Markdown
    const text = await file.text();
    return text.slice(0, maxLength);
  }
}
