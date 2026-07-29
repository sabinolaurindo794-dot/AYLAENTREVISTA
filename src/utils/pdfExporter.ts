import jsPDF from "jspdf";
import { EvaluationResult, HistoryItem, NivelExigencia } from "../types";
import { CATEGORY_LABELS, NIVEIS, PERSONAS } from "../data/constants";

export interface PDFReportData {
  procNum: string;
  nome: string;
  area: string;
  empresa: string;
  nivel: NivelExigencia;
  evalData: EvaluationResult;
  history?: HistoryItem[];
  timestamp?: number;
}

export function generateCandidatePDFReport(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 5;
    }
  };

  const drawHeaderFooter = (pageNum: number, totalPages: number) => {
    // Header line
    doc.setDrawColor(200, 162, 77); // #c8a24d
    doc.setLineWidth(0.5);
    doc.line(margin, 10, pageWidth - margin, 10);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AYLAENTREVISTA · Relatório de Avaliação Oficial · Processo Nº ${data.procNum}`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Página ${pageNum} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  };

  // --- Document Header Banner ---
  doc.setFillColor(27, 33, 43); // #1b212b
  doc.rect(margin, y, contentWidth, 24, "F");

  doc.setDrawColor(200, 162, 77);
  doc.setLineWidth(1);
  doc.line(margin, y + 24, margin + contentWidth, y + 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(238, 233, 223); // #eee9df
  doc.text("AYLAENTREVISTA — BANCA DE RECRUTAMENTO", margin + 5, y + 9);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 162, 77); // #c8a24d
  doc.text(`RELATÓRIO DE AVALIAÇÃO DE CANDIDATO`, margin + 5, y + 17);

  const dateStr = new Date(data.timestamp || Date.now()).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(8);
  doc.setTextColor(169, 174, 187);
  doc.text(`Emitido em: ${dateStr}`, pageWidth - margin - 5, y + 17, { align: "right" });

  y += 30;

  // --- Candidate Info Metadata Box ---
  doc.setFillColor(245, 243, 238);
  doc.setDrawColor(220, 215, 205);
  doc.rect(margin, y, contentWidth, 26, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Processo Nº: ${data.procNum}`, margin + 5, y + 7);
  doc.text(`Candidato(a): ${data.nome || "Não informado"}`, margin + 5, y + 14);
  doc.text(`Área / Setor: ${data.area}`, margin + 5, y + 21);

  const nivelLabel = NIVEIS[data.nivel]?.label || data.nivel;
  doc.text(`Nível Exigência: ${nivelLabel}`, margin + 95, y + 7);
  doc.text(`Empresa / Ref: ${data.empresa}`, margin + 95, y + 14);

  y += 32;

  // --- Final Verdict & Global Score Banner ---
  checkPageBreak(30);

  const verdictMap: Record<string, { title: string; fill: [number, number, number]; textCol: [number, number, number] }> = {
    CONTRATADO: { title: "APROVADO / CONTRATADO", fill: [230, 245, 233], textCol: [40, 110, 55] },
    LISTA_ESPERA: { title: "EM LISTA DE ESPERA", fill: [255, 248, 225], textCol: [160, 120, 20] },
    NAO_SELECIONADO: { title: "NÃO SELECIONADO", fill: [253, 236, 234], textCol: [170, 45, 30] },
  };

  const vInfo = verdictMap[data.evalData.decisaoFinal] || verdictMap.NAO_SELECIONADO;

  doc.setFillColor(...vInfo.fill);
  doc.setDrawColor(...vInfo.textCol);
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, 22, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...vInfo.textCol);
  doc.text(`DECISÃO DA BANCA: ${vInfo.title}`, margin + 5, y + 9);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 162, 77);
  doc.text(`${data.evalData.pontuacaoGlobal} / 100`, pageWidth - margin - 5, y + 14, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Pontuação Global`, pageWidth - margin - 5, y + 19, { align: "right" });

  y += 26;

  // Justification text
  if (data.evalData.justificativaDecisao) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text("Justificativa do Parecer:", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const splitJust = doc.splitTextToSize(data.evalData.justificativaDecisao, contentWidth);
    doc.text(splitJust, margin, y);
    y += splitJust.length * 4.5 + 4;
  }

  // --- Category Scores Table ---
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("DESEMPENHO POR CATEGORIA DE AVALIAÇÃO", margin, y);
  y += 6;

  doc.setFillColor(235, 235, 235);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Categoria", margin + 3, y + 4.2);
  doc.text("Nota", margin + 115, y + 4.2);
  doc.text("Desempenho", margin + 130, y + 4.2);
  y += 7;

  const categories = data.evalData.categorias || {};
  Object.entries(CATEGORY_LABELS).forEach(([key, label], idx) => {
    checkPageBreak(6);
    const score = (categories as any)[key] ?? 0;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y - 1, contentWidth, 5.5, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text(label, margin + 3, y + 3);

    doc.setFont("helvetica", "bold");
    doc.text(`${score} / 10`, margin + 115, y + 3);

    // Mini bar
    const barWidth = 40;
    const filledWidth = Math.max(1, (score / 10) * barWidth);
    doc.setFillColor(220, 220, 220);
    doc.rect(margin + 130, y, barWidth, 3.5, "F");
    doc.setFillColor(200, 162, 77);
    doc.rect(margin + 130, y, filledWidth, 3.5, "F");

    y += 5.5;
  });

  y += 6;

  // --- Strengths & Improvements ---
  const renderBulletSection = (title: string, items: string[], titleColor: [number, number, number]) => {
    if (!items || items.length === 0) return;
    checkPageBreak(15 + items.length * 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...titleColor);
    doc.text(title, margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);

    items.forEach((item) => {
      const splitLines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
      checkPageBreak(splitLines.length * 4 + 2);
      doc.text(splitLines, margin + 2, y);
      y += splitLines.length * 4 + 1.5;
    });

    y += 4;
  };

  renderBulletSection("PONTOS FORTES OBSERVADOS", data.evalData.pontosFortes || [], [40, 110, 55]);
  renderBulletSection("ASPETOS A MELHORAR", data.evalData.aspetosAMelhorar || [], [170, 45, 30]);
  renderBulletSection("PLANO DE TREINO RECOMENDADO", data.evalData.planoTreino || [], [180, 130, 30]);

  // --- Complete Transcript (Q&A) ---
  if (data.history && data.history.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("TRANSCRIÇÃO COMPLETA DA ENTREVISTA", margin, y);
    y += 6;

    data.history.forEach((h, index) => {
      checkPageBreak(25);
      const persona = PERSONAS[h.persona] || PERSONAS.tecnico;

      // Question box header
      doc.setFillColor(240, 242, 245);
      doc.rect(margin, y, contentWidth, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 110, 30);
      doc.text(`Pergunta ${index + 1} (${persona.label} — ${h.block})`, margin + 2, y + 3.5);
      y += 6;

      // Question text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 30, 30);
      const qLines = doc.splitTextToSize(h.question, contentWidth - 4);
      checkPageBreak(qLines.length * 4);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4 + 2;

      // Answer text
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      const aLines = doc.splitTextToSize(`Resposta: ${h.answer}`, contentWidth - 6);
      checkPageBreak(aLines.length * 4);
      doc.text(aLines, margin + 4, y);
      y += aLines.length * 4 + 2;

      // Evaluation notes if available
      if (h.avaliacao) {
        let noteParts: string[] = [];
        if (h.avaliacao.vaga) noteParts.push("Resposta Vaga");
        if (h.avaliacao.incoerente) noteParts.push(`Incoerência: ${h.avaliacao.notaIncoerencia || "Detetada"}`);
        if (h.avaliacao.scores) {
          const s = h.avaliacao.scores;
          noteParts.push(`Notas: C:${s.clareza} Com:${s.comunicacao} Lid:${s.lideranca} CT:${s.conhecimentoTecnico} Conf:${s.confianca}`);
        }
        if (noteParts.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(140, 60, 40);
          doc.text(`[Notas da Banca: ${noteParts.join(" | ")}]`, margin + 4, y);
          y += 4;
        }
      }

      y += 4;
    });
  }

  // Draw headers and footers across all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawHeaderFooter(i, pageCount);
  }

  // Save the PDF
  const cleanName = (data.nome || "Candidato").replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Relatorio_Entrevista_${cleanName}_Proc_${data.procNum}.pdf`;
  doc.save(fileName);
}
