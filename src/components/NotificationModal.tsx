import React, { useState } from "react";
import { Agendamento } from "../types";
import {
  BellRing,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building,
  ShieldCheck,
  X,
  Play,
  Copy,
  Check,
  Send,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { soundNovaPergunta } from "../utils/audio";
import {
  getNotificationDetails,
  openCandidateEmail,
  openCandidateSMSOrWhatsApp,
} from "../utils/notificationDispatcher";

interface NotificationModalProps {
  agendamento: Agendamento | null;
  onClose: () => void;
  onStartInterviewNow?: (agendamento: Agendamento) => void;
}

export function NotificationModal({
  agendamento,
  onClose,
  onStartInterviewNow,
}: NotificationModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedSMSText, setCopiedSMSText] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "sms">("email");

  React.useEffect(() => {
    if (agendamento) {
      soundNovaPergunta(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [agendamento]);

  if (!agendamento) return null;

  const { formattedDate, accessLink, emailSubject, emailBody, smsBody } =
    getNotificationDetails(agendamento);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(accessLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2500);
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsBody);
    setCopiedSMSText(true);
    setTimeout(() => setCopiedSMSText(false), 2500);
  };

  const handleOpenMailClient = () => {
    openCandidateEmail(agendamento);
  };

  const handleOpenWhatsAppOrSMS = () => {
    openCandidateSMSOrWhatsApp(agendamento);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--panel)] border border-[var(--gold)] rounded-[var(--radius)] w-full max-w-lg shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-950 to-[var(--panel-raised)] border-b border-emerald-500/30 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                Notificação Automática Concluída
              </span>
              <h3 className="font-serif font-bold text-base text-[var(--paper)]">
                Entrevista Agendada & Candidato Notificado!
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--paper-dim)] hover:text-[var(--paper)] p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Confirmation Banner & Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300 space-y-2">
            <div className="flex items-center justify-between font-semibold border-b border-emerald-500/20 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Notificações Despachadas com Sucesso
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                Canal Duplo Activo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="flex items-center justify-between bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{agendamento.candidatoEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="ml-1 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded transition cursor-pointer font-sans whitespace-nowrap shrink-0"
                >
                  Enviar E-mail
                </button>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                <span className="flex items-center gap-1.5 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{agendamento.candidatoTelefone || "Sem telefone"}</span>
                </span>
                <button
                  type="button"
                  onClick={handleOpenWhatsAppOrSMS}
                  className="ml-1 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded transition cursor-pointer font-sans whitespace-nowrap shrink-0"
                >
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5 rounded space-y-2 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-2">
              <div>
                <span className="text-[10px] text-[var(--paper-dim)] uppercase tracking-wider block">
                  Candidato Agendado
                </span>
                <strong className="text-sm font-serif font-bold text-[var(--paper)]">
                  {agendamento.candidatoNome}
                </strong>
              </div>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-[var(--gold-dim)]/20 text-[var(--gold)] border border-[var(--gold-dim)]/40 rounded">
                Nível: {agendamento.nivel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--paper-dim)]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                <span className="truncate">{agendamento.area}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                <span className="truncate">{agendamento.empresa}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[var(--paper)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Confirmado no Servidor
              </div>
            </div>
          </div>

          {/* Notification Preview Tabs */}
          <div className="border border-[var(--line)] rounded overflow-hidden">
            <div className="flex items-center border-b border-[var(--line)] bg-[var(--bg)] font-mono text-xs">
              <button
                onClick={() => setActiveTab("email")}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 border-r border-[var(--line)] transition cursor-pointer font-semibold ${
                  activeTab === "email"
                    ? "bg-[var(--panel)] text-[var(--gold)] border-b-2 border-b-[var(--gold)]"
                    : "text-[var(--paper-dim)] hover:text-[var(--paper)]"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Ver E-mail Enviado
              </button>

              <button
                onClick={() => setActiveTab("sms")}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer font-semibold ${
                  activeTab === "sms"
                    ? "bg-[var(--panel)] text-[var(--gold)] border-b-2 border-b-[var(--gold)]"
                    : "text-[var(--paper-dim)] hover:text-[var(--paper)]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ver Mensagem SMS / WA
              </button>
            </div>

            <div className="p-3 bg-[var(--panel-raised)] font-mono text-xs space-y-2">
              {activeTab === "email" ? (
                <>
                  <div className="flex items-center justify-between text-[11px] text-[var(--paper-dim)] border-b border-[var(--line)] pb-1.5">
                    <span>Para: <strong>{agendamento.candidatoEmail}</strong></span>
                    <button
                      onClick={handleOpenMailClient}
                      className="text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Abrir no Mail Client
                    </button>
                  </div>
                  <pre className="text-[11px] text-[var(--paper)] whitespace-pre-wrap font-mono leading-relaxed bg-[var(--bg)] p-2.5 rounded border border-[var(--line)] max-h-36 overflow-y-auto">
                    {emailBody}
                  </pre>
                  <button
                    onClick={handleCopyEmail}
                    className="w-full py-1.5 border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--gold)] text-[var(--paper)] text-[11px] font-mono rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedEmailText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Texto do E-mail Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--gold)]" />
                        Copiar Conteúdo do E-mail
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[11px] text-[var(--paper-dim)] border-b border-[var(--line)] pb-1.5">
                    <span>Para: <strong>{agendamento.candidatoTelefone || "Telemóvel do Candidato"}</strong></span>
                    <button
                      onClick={handleOpenWhatsAppOrSMS}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Send className="w-3 h-3" />
                      Enviar via WhatsApp / SMS
                    </button>
                  </div>
                  <div className="text-[11px] text-[var(--paper)] font-mono leading-relaxed bg-[var(--bg)] p-2.5 rounded border border-[var(--line)]">
                    {smsBody}
                  </div>
                  <button
                    onClick={handleCopySMS}
                    className="w-full py-1.5 border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--gold)] text-[var(--paper)] text-[11px] font-mono rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedSMSText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Texto da Mensagem Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--gold)]" />
                        Copiar Mensagem SMS
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {onStartInterviewNow && (
              <button
                onClick={() => {
                  onClose();
                  onStartInterviewNow(agendamento);
                }}
                className="w-full py-3 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#dab364] transition cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar Simulador de Entrevista Agora
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 border border-[var(--line)] bg-[var(--bg)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] transition rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Link Direto Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Copiar Link da Sessão
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer font-medium"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
