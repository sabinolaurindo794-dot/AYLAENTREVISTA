import React, { useState, useEffect } from "react";
import { Agendamento } from "../types";
import {
  getAgendamentos,
  cancelAgendamento,
  deleteAgendamento,
} from "../utils/agendamentosStorage";
import {
  openCandidateEmail,
  openCandidateSMSOrWhatsApp,
} from "../utils/notificationDispatcher";
import {
  Calendar,
  Clock,
  Plus,
  ArrowLeft,
  Search,
  Mail,
  Phone,
  Briefcase,
  Building,
  BellRing,
  Play,
  XCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
} from "lucide-react";

interface AgendamentosScreenProps {
  onBack: () => void;
  onOpenScheduleNew: () => void;
  onResendNotification: (agendamento: Agendamento) => void;
  onStartInterview: (agendamento: Agendamento) => void;
}

export function AgendamentosScreen({
  onBack,
  onOpenScheduleNew,
  onResendNotification,
  onStartInterview,
}: AgendamentosScreenProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<Agendamento | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (itemToDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [itemToDelete]);

  const loadData = () => {
    setAgendamentos(getAgendamentos());
  };

  const handleCancel = (id: string) => {
    cancelAgendamento(id);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteAgendamento(id);
    setItemToDelete(null);
    loadData();
  };

  const filtered = agendamentos.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.candidatoNome.toLowerCase().includes(q) ||
      a.candidatoEmail.toLowerCase().includes(q) ||
      a.area.toLowerCase().includes(q) ||
      a.empresa.toLowerCase().includes(q)
    );
  });

  const total = agendamentos.length;
  const pendentes = agendamentos.filter((a) => a.status === "pendente").length;
  const notificados = agendamentos.filter((a) => a.notificado).length;

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6 mt-4 rounded-[var(--radius)] shadow-lg space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] hover:border-[var(--gold)] rounded-[var(--radius)] transition cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--paper)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--gold)]" />
              Agenda de Entrevistas & Notificações Automáticas
            </h2>
            <p className="font-mono text-xs text-[var(--paper-dim)]">
              Controlo de convites despachados, datas programadas e alertas de candidatos.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenScheduleNew}
          className="px-4 py-2.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:bg-[#dab364] transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agendar Entrevista
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5 rounded flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[var(--paper-dim)] uppercase tracking-wider block">
              Total Agendadas
            </span>
            <strong className="font-serif text-xl font-bold text-[var(--paper)]">
              {total}
            </strong>
          </div>
          <Calendar className="w-6 h-6 text-[var(--gold)] opacity-70" />
        </div>

        <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5 rounded flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[var(--paper-dim)] uppercase tracking-wider block">
              Sessões Pendentes
            </span>
            <strong className="font-serif text-xl font-bold text-amber-400">
              {pendentes}
            </strong>
          </div>
          <Clock className="w-6 h-6 text-amber-400 opacity-70" />
        </div>

        <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5 rounded flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[var(--paper-dim)] uppercase tracking-wider block">
              Candidatos Notificados
            </span>
            <strong className="font-serif text-xl font-bold text-emerald-400">
              {notificados}
            </strong>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-70" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por candidato, e-mail, área ou empresa..."
          className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-4 py-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
        />
      </div>

      {/* Agendamentos Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--line)] rounded text-[var(--paper-dim)] space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-[var(--paper-dim)] opacity-50" />
          <p className="font-mono text-xs uppercase tracking-wider">
            Nenhuma entrevista agendada encontrada
          </p>
          <p className="text-xs">
            Clique no botão acima para agendar uma nova entrevista e notificar o candidato.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="border border-[var(--line)] bg-[var(--bg)] p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--gold-dim)] transition"
            >
              <div className="space-y-2 max-w-lg">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-serif font-bold text-base text-[var(--paper)]">
                    {a.candidatoNome}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded border ${
                      a.status === "pendente"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : a.status === "concluida"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}
                  >
                    {a.status === "pendente"
                      ? "Pendente"
                      : a.status === "concluida"
                      ? "Concluída"
                      : "Cancelada"}
                  </span>

                  <span className="text-[10px] font-mono text-[var(--gold)] border border-[var(--gold-dim)]/40 px-2 py-0.5 rounded uppercase">
                    Nível: {a.nivel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-[var(--paper-dim)]">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                    <span className="truncate">{a.candidatoEmail}</span>
                  </div>
                  {a.candidatoTelefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                      <span>{a.candidatoTelefone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                    <span className="truncate">{a.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[var(--gold-dim)] shrink-0" />
                    <span className="truncate">{a.empresa}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-[var(--paper)] pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-[var(--gold)]">
                    <Calendar className="w-3.5 h-3.5" />
                    {a.dataHora.replace("T", " às ")}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Mail className="w-3 h-3 text-emerald-400" /> E-mail Enviado
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Phone className="w-3 h-3 text-emerald-400" /> Mensagem SMS / WA Enviada
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]">
                <button
                  onClick={() => openCandidateEmail(a)}
                  className="px-2.5 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 font-mono text-xs uppercase tracking-wider font-semibold rounded transition flex items-center gap-1.5 cursor-pointer"
                  title="Enviar convite por E-mail ao candidato"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Enviar E-mail
                </button>

                <button
                  onClick={() => openCandidateSMSOrWhatsApp(a)}
                  className="px-2.5 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 font-mono text-xs uppercase tracking-wider font-semibold rounded transition flex items-center gap-1.5 cursor-pointer"
                  title="Enviar convite por SMS/WhatsApp ao candidato"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Enviar SMS / WA
                </button>

                <button
                  onClick={() => onResendNotification(a)}
                  className="px-3 py-1.5 border border-[var(--gold-dim)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded transition flex items-center gap-1.5 cursor-pointer"
                  title="Visualizar ou Reenviar Notificação Automática"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Notificação
                </button>

                <button
                  onClick={() => onStartInterview(a)}
                  className="px-3.5 py-1.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded hover:bg-[#dab364] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Iniciar Entrevista
                </button>

                {a.status === "pendente" && (
                  <button
                    onClick={() => handleCancel(a.id)}
                    className="p-1.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-amber-400 hover:border-amber-400 rounded transition cursor-pointer"
                    title="Cancelar agendamento"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setItemToDelete(a)}
                  className="p-1.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-red-400 hover:border-red-400 rounded transition cursor-pointer"
                  title="Eliminar agendamento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[var(--panel)] border border-red-500/40 rounded-[var(--radius)] w-full max-w-sm my-auto p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-400 font-serif font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Eliminar Agendamento
            </div>
            <p className="text-xs text-[var(--paper-dim)] leading-relaxed">
              Tem a certeza que deseja eliminar o agendamento de <strong className="text-[var(--paper)]">{itemToDelete.candidatoNome}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(itemToDelete.id)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded transition cursor-pointer shadow-sm"
              >
                Confirmar Eliminação
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
