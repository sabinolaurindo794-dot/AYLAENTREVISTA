import React, { useState } from "react";
import { Agendamento, NivelExigencia } from "../types";
import { addAgendamento } from "../utils/agendamentosStorage";
import { AREAS, EMPRESAS } from "../data/constants";
import { Calendar, Clock, Mail, Phone, User, Briefcase, Building, Send, X, AlertCircle } from "lucide-react";
import {
  openCandidateEmail,
  openCandidateSMSOrWhatsApp,
} from "../utils/notificationDispatcher";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: {
    nome?: string;
    email?: string;
    telefone?: string;
    area?: string;
    empresa?: string;
  };
  onScheduled: (agendamento: Agendamento) => void;
}

export function ScheduleModal({ isOpen, onClose, prefill, onScheduled }: ScheduleModalProps) {
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [nome, setNome] = useState(prefill?.nome || "");
  const [email, setEmail] = useState(prefill?.email || "");
  const [telefone, setTelefone] = useState(prefill?.telefone || "");
  const [area, setArea] = useState(prefill?.area || AREAS[0]);
  const [empresa, setEmpresa] = useState(prefill?.empresa || EMPRESAS[0]);
  const [nivel, setNivel] = useState<NivelExigencia>("medio");
  const [dataHora, setDataHora] = useState(getDefaultDateTime());
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [notificarSMS, setNotificarSMS] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (prefill?.nome) setNome(prefill.nome);
      if (prefill?.email) setEmail(prefill.email);
      if (prefill?.telefone) setTelefone(prefill.telefone);
      if (prefill?.area) setArea(prefill.area);
      if (prefill?.empresa) setEmpresa(prefill.empresa);
      setNotificarEmail(true);
      setNotificarSMS(true);
      setErrorMsg(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, prefill]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg("O nome do candidato é obrigatório.");
      return;
    }
    if (notificarEmail && !email.trim()) {
      setErrorMsg("O e-mail do candidato é obrigatório para enviar a notificação por e-mail.");
      return;
    }
    if (notificarSMS && !telefone.trim()) {
      setErrorMsg("O número de telefone/WhatsApp é obrigatório para enviar a notificação por mensagem.");
      return;
    }
    if (!dataHora) {
      setErrorMsg("Selecione a data e hora do agendamento.");
      return;
    }

    const newAgendamento = addAgendamento({
      candidatoNome: nome.trim(),
      candidatoEmail: email.trim(),
      candidatoTelefone: telefone.trim(),
      area: area.trim(),
      empresa: empresa.trim(),
      nivel,
      dataHora,
      notificadoEmail: notificarEmail,
      notificadoSMS: notificarSMS,
    });

    if (notificarEmail) {
      setTimeout(() => openCandidateEmail(newAgendamento), 100);
    }
    if (notificarSMS) {
      setTimeout(() => openCandidateSMSOrWhatsApp(newAgendamento), 400);
    }

    onScheduled(newAgendamento);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-[var(--radius)] w-full max-w-lg shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[var(--line)] bg-[var(--bg)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--gold)]" />
            <h3 className="font-serif font-bold text-base text-[var(--paper)]">
              Agendar Entrevista & Notificar Candidato
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--paper-dim)] hover:text-[var(--paper)] p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Auto Notification Note */}
          <div className="p-3 border border-[var(--gold-dim)]/40 bg-[rgba(200,162,77,0.08)] text-[var(--paper)] text-xs rounded flex items-start gap-2.5 shrink-0">
            <Send className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <span className="font-semibold font-mono uppercase tracking-wider text-[11px] text-[var(--gold)] block">
                Notificação Automática Instantânea
              </span>
              <p className="text-[11px] text-[var(--paper-dim)] leading-relaxed">
                Ao concluir o agendamento, o candidato receberá automaticamente a notificação com os detalhes da sessão, data, hora e credenciais de acesso.
              </p>
            </div>
          </div>
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
              Nome do Candidato *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ana Beatriz Silva"
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                E-mail do Candidato *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidato@empresa.co.ao"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--paper-dim)]" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="+244 923 000 000"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] pl-10 pr-3 py-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                Área / Cargo
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Engenharia de Software"
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                Empresa / Instituição
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Sonangol E.P."
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                Data & Hora da Entrevista *
              </label>
              <input
                type="datetime-local"
                required
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
                Nível da Entrevista
              </label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value as NivelExigencia)}
                className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-2.5 text-sm rounded focus:outline-none focus:border-[var(--gold)]"
              >
                <option value="facil">Fácil (Júnior / Estágio)</option>
                <option value="medio">Médio (Pleno / Padrão)</option>
                <option value="dificil">Difícil (Sênior / Rigoroso)</option>
              </select>
            </div>
          </div>

          {/* Notification Channel Options */}
          <div className="p-3 bg-[var(--bg)] border border-[var(--line)] rounded space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">
              Canais de Notificação do Candidato
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[var(--paper)]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[var(--gold)]">
                <input
                  type="checkbox"
                  checked={notificarEmail}
                  onChange={(e) => setNotificarEmail(e.target.checked)}
                  className="accent-[var(--gold)] w-4 h-4 cursor-pointer"
                />
                <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>Enviar Notificação por E-mail</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-[var(--gold)]">
                <input
                  type="checkbox"
                  checked={notificarSMS}
                  onChange={(e) => setNotificarSMS(e.target.checked)}
                  className="accent-[var(--gold)] w-4 h-4 cursor-pointer"
                />
                <Phone className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>Enviar Mensagem SMS / WhatsApp</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center gap-2 hover:bg-[#dab364] transition cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              Agendar & Notificar Automaticamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
