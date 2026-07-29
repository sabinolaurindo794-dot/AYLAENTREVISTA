import React from "react";
import { EvaluationResult, HistoryItem, NivelExigencia } from "../types";
import { CATEGORY_LABELS } from "../data/constants";
import { Award, CheckCircle2, AlertTriangle, Target, RotateCcw, Download } from "lucide-react";
import { generateCandidatePDFReport } from "../utils/pdfExporter";

interface ResultScreenProps {
  procNum: string;
  nome: string;
  area: string;
  empresa: string;
  nivel: NivelExigencia;
  data: EvaluationResult | null;
  history?: HistoryItem[];
  isLoading: boolean;
  errorMessage: string | null;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  procNum,
  nome,
  area,
  empresa,
  nivel,
  data,
  history = [],
  isLoading,
  errorMessage,
  onRestart,
}) => {
  const handleDownloadPdf = () => {
    if (!data) return;
    generateCandidatePDFReport({
      procNum,
      nome,
      area,
      empresa,
      nivel,
      evalData: data,
      history,
    });
  };
  if (isLoading) {
    return (
      <section className="border border-[var(--line)] bg-[var(--panel)] p-6 mt-4 rounded-[var(--radius)] text-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="font-serif text-xl font-semibold mb-2 text-[var(--paper)]">
          A gerar parecer final da banca...
        </h2>
        <p className="text-sm text-[var(--paper-dim)] max-w-md mx-auto">
          A banca de recrutamento está a compilar as notas de todas as respostas para calcular a pontuação global e plano de treino.
        </p>
      </section>
    );
  }

  if (errorMessage || !data) {
    return (
      <section className="border border-[var(--line)] bg-[var(--panel)] p-6 mt-4 rounded-[var(--radius)] text-center py-12">
        <p className="text-sm text-[var(--brick-bright)] mb-4 font-mono">
          {errorMessage || "Não foi possível carregar a avaliação final."}
        </p>
        <button
          onClick={onRestart}
          className="px-5 py-2.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)]"
        >
          Iniciar nova entrevista
        </button>
      </section>
    );
  }

  const getVerdictDetails = (v: string) => {
    switch (v) {
      case "CONTRATADO":
        return {
          label: "Aprovado / Contratado",
          border: "border-[var(--green)]",
          color: "text-[var(--green)]",
          bg: "bg-[rgba(111,155,122,0.08)]",
        };
      case "LISTA_ESPERA":
        return {
          label: "Lista de Espera / Em Análise",
          border: "border-[var(--gold)]",
          color: "text-[var(--gold)]",
          bg: "bg-[rgba(200,162,77,0.08)]",
        };
      case "NAO_SELECIONADO":
      default:
        return {
          label: "Não Selecionado",
          border: "border-[var(--brick)]",
          color: "text-[var(--brick-bright)]",
          bg: "bg-[rgba(169,74,52,0.08)]",
        };
    }
  };

  const verdict = getVerdictDetails(data.decisaoFinal);

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-5 md:p-6 mt-4 rounded-[var(--radius)] space-y-6">
      <div>
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-[var(--paper)]">
          Avaliação final da banca
        </h2>
        <p className="font-mono text-xs text-[var(--paper-dim)] mt-1">
          Processo Nº {procNum} — {nome || "Candidato(a)"} · {area}
        </p>
      </div>

      {/* Verdict Stamp Badge */}
      <div
        className={`inline-flex items-center gap-2 border-2 ${verdict.border} ${verdict.color} ${verdict.bg} px-4 py-2 font-mono text-sm tracking-widest uppercase font-semibold -rotate-1 rounded-[var(--radius)]`}
      >
        <Award className="w-4 h-4" />
        <span>Resultado: {verdict.label}</span>
      </div>

      <p className="text-sm text-[var(--paper-dim)] leading-relaxed max-w-2xl">
        {data.justificativaDecisao}
      </p>

      {/* Global Score Display */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-6xl font-bold text-[var(--gold)] leading-none">
          {data.pontuacaoGlobal}
        </span>
        <span className="text-[var(--paper-dim)] font-mono text-lg">/ 100</span>
      </div>

      {/* Category Breakdown Bars */}
      <div className="space-y-3 pt-2">
        <h3 className="font-serif text-base font-semibold text-[var(--paper)]">
          Desempenho por categoria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const score = (data.categorias as any)?.[key] ?? 0;
            const pct = Math.max(0, Math.min(10, score)) * 10;
            return (
              <div key={key} className="space-y-1 text-xs">
                <div className="flex justify-between text-[var(--paper-dim)] font-mono">
                  <span>{label}</span>
                  <span className="text-[var(--gold)] font-bold">{score}/10</span>
                </div>
                <div className="h-2 bg-[var(--bg)] border border-[var(--line)] rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[var(--line)]">
        {/* Strong points */}
        <div className="space-y-2">
          <h3 className="font-serif text-sm font-semibold text-[var(--green)] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Pontos fortes
          </h3>
          <ul className="space-y-1.5 text-xs text-[var(--paper-dim)] list-disc pl-4">
            {data.pontosFortes.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Aspects to improve */}
        <div className="space-y-2">
          <h3 className="font-serif text-sm font-semibold text-[var(--brick-bright)] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Aspetos a melhorar
          </h3>
          <ul className="space-y-1.5 text-xs text-[var(--paper-dim)] list-disc pl-4">
            {data.aspetosAMelhorar.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Training Plan */}
        <div className="space-y-2">
          <h3 className="font-serif text-sm font-semibold text-[var(--gold)] flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Plano de treino
          </h3>
          <ul className="space-y-1.5 text-xs text-[var(--paper-dim)] list-disc pl-4">
            {data.planoTreino.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownloadPdf}
          className="px-6 py-3 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)] flex items-center gap-2 hover:bg-[#dab364] transition shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Descarregar Relatório PDF
        </button>

        <button
          onClick={onRestart}
          className="px-5 py-3 border border-[var(--line)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] hover:bg-[rgba(200,162,77,0.06)] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[var(--gold)]" />
          Iniciar nova entrevista
        </button>
      </div>
    </section>
  );
};
