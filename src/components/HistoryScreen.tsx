import React, { useState, useEffect } from "react";
import { SavedInterviewRecord } from "../types";
import { getSavedInterviews, clearInterviewHistory, extractFrequentWeakPoints } from "../utils/storage";
import { NIVEIS } from "../data/constants";
import { ArrowLeft, Trash2, TrendingUp, Download, AlertTriangle } from "lucide-react";
import { generateCandidatePDFReport } from "../utils/pdfExporter";

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [records, setRecords] = useState<SavedInterviewRecord[]>([]);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    setRecords(getSavedInterviews());
  }, []);

  const handleDownloadPdf = (r: SavedInterviewRecord) => {
    generateCandidatePDFReport({
      procNum: r.id.replace("rec_", "").slice(0, 4),
      nome: r.nome,
      area: r.area,
      empresa: r.empresa,
      nivel: r.nivel,
      timestamp: r.timestamp,
      evalData: {
        decisaoFinal: r.decisaoFinal,
        justificativaDecisao: r.justificativaDecisao || "",
        pontuacaoGlobal: r.pontuacaoGlobal,
        categorias: r.categorias,
        pontosFortes: r.pontosFortes || [],
        aspetosAMelhorar: r.aspetosAMelhorar || [],
        planoTreino: r.planoTreino || [],
      },
      history: r.history || [],
    });
  };

  const handleClear = () => {
    setShowClearModal(true);
  };

  const confirmClear = () => {
    clearInterviewHistory();
    setRecords([]);
    setShowClearModal(false);
  };


  const total = records.length;
  const avgScore = total
    ? (records.reduce((acc, r) => acc + (r.pontuacaoGlobal || 0), 0) / total).toFixed(1)
    : "0";

  const weakPoints = extractFrequentWeakPoints(records);

  // Chronological list for evolution chart
  const chronoRecords = [...records].reverse();

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-5 md:p-6 mt-4 rounded-[var(--radius)] space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[var(--line)] pb-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-[var(--paper)]">
            Histórico e Estatísticas
          </h2>
          <p className="text-xs text-[var(--paper-dim)] mt-0.5">
            Entrevistas realizadas neste dispositivo e evolução de desempenho.
          </p>
        </div>

        {total > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 border border-[var(--brick)] text-[var(--brick-bright)] text-xs font-mono rounded flex items-center gap-1.5 hover:bg-[rgba(169,74,52,0.1)] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar histórico
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="text-center py-12 text-[var(--paper-dim)] text-sm font-mono">
          Ainda não há entrevistas registradas. Realize a sua primeira entrevista para visualizar aqui as suas métricas e gráficos de evolução.
        </div>
      ) : (
        <>
          {/* Summary Badges */}
          <div className="flex items-center gap-6 font-mono text-xs">
            <span className="text-[var(--gold)]">
              <strong>{total}</strong> entrevista{total === 1 ? "" : "s"} realizada{total === 1 ? "" : "s"}
            </span>
            <span className="text-[var(--paper-dim)]">
              Média geral: <strong className="text-[var(--paper)]">{avgScore}/100</strong>
            </span>
          </div>

          {/* Evolution Chart */}
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-semibold text-[var(--paper)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[var(--gold)]" /> Evolução das pontuações
            </h3>
            <div className="flex items-end gap-1.5 h-24 border border-[var(--line)] p-3 bg-[var(--panel-raised)] rounded">
              {chronoRecords.map((r) => {
                const score = r.pontuacaoGlobal || 0;
                const dateStr = new Date(r.timestamp).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                });
                return (
                  <div
                    key={r.id}
                    title={`${dateStr} - ${score}/100 (${r.area})`}
                    className="flex-1 bg-gradient-to-t from-[var(--gold-dim)] to-[var(--gold)] hover:opacity-80 transition rounded-t-xs min-w-[8px]"
                    style={{ height: `${Math.max(6, score)}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Recurring Weak Points */}
          {weakPoints.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-serif text-sm font-semibold text-[var(--paper)]">
                Pontos de atenção recorrentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {weakPoints.map(([term, count]) => (
                  <span
                    key={term}
                    className="px-2.5 py-1 border border-[var(--gold-dim)] text-[var(--gold)] font-mono text-xs uppercase bg-[rgba(200,162,77,0.06)] rounded"
                  >
                    {term} <span className="text-[var(--paper-dim)]">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History Table */}
          <div className="space-y-2 overflow-x-auto">
            <h3 className="font-serif text-sm font-semibold text-[var(--paper)]">
              Registos anteriores
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] font-mono text-[var(--paper-dim)] uppercase text-[10px]">
                  <th className="py-2 px-2">Data</th>
                  <th className="py-2 px-2">Candidato</th>
                  <th className="py-2 px-2">Área</th>
                  <th className="py-2 px-2">Nível</th>
                  <th className="py-2 px-2">Pontuação</th>
                  <th className="py-2 px-2">Decisão</th>
                  <th className="py-2 px-2 text-right">Relatório</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--paper-dim)]">
                {records.map((r) => {
                  const dateStr = new Date(r.timestamp).toLocaleString("pt-PT", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const badgeColor =
                    r.decisaoFinal === "CONTRATADO"
                      ? "text-[var(--green)] border-[var(--green)]"
                      : r.decisaoFinal === "LISTA_ESPERA"
                      ? "text-[var(--gold)] border-[var(--gold)]"
                      : "text-[var(--brick-bright)] border-[var(--brick)]";

                  return (
                    <tr key={r.id} className="hover:bg-[var(--panel-raised)]">
                      <td className="py-2.5 px-2 font-mono">{dateStr}</td>
                      <td className="py-2.5 px-2 font-medium text-[var(--paper)]">{r.nome || "—"}</td>
                      <td className="py-2.5 px-2">{r.area}</td>
                      <td className="py-2.5 px-2">{NIVEIS[r.nivel]?.label || r.nivel}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[var(--gold)]">
                        {r.pontuacaoGlobal}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 border font-mono text-[10px] uppercase rounded ${badgeColor}`}>
                          {r.decisaoFinal}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleDownloadPdf(r)}
                          title="Descarregar Relatório PDF"
                          className="px-2.5 py-1 border border-[var(--gold-dim)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#1a1509] font-mono text-[10px] uppercase tracking-wider rounded transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Back Button */}
      <div className="pt-4 border-t border-[var(--line)]">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-[var(--line)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] hover:border-[var(--gold)] hover:bg-[rgba(200,162,77,0.06)] transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </button>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-red-500/40 rounded-[var(--radius)] w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-400 font-serif font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Limpar Todo o Histórico
            </div>
            <p className="text-xs text-[var(--paper-dim)] leading-relaxed">
              Tem a certeza que deseja eliminar permanentemente todo o histórico de entrevistas simuladas neste dispositivo?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-3.5 py-1.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmClear}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded transition cursor-pointer shadow-sm"
              >
                Confirmar e Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

