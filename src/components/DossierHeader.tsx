import React from "react";
import { NivelExigencia, UserAccount } from "../types";
import { NIVEIS } from "../data/constants";
import { UserCheck, Lock, LogIn, Sun, Moon, UserX, Calendar, Send } from "lucide-react";

interface DossierHeaderProps {
  procNum: string;
  nivel: NivelExigencia;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenSchedule?: () => void;
  onOpenAgendamentos?: () => void;
}

export const DossierHeader: React.FC<DossierHeaderProps> = ({
  procNum,
  nivel,
  currentUser,
  onOpenAuth,
  theme,
  onToggleTheme,
  onOpenSchedule,
  onOpenAgendamentos,
}) => {
  const info = NIVEIS[nivel] || NIVEIS.medio;

  return (
    <div className="border border-[var(--line)] bg-gradient-to-b from-[var(--panel-raised)] to-[var(--panel)] p-4 sm:p-5 md:p-6 relative overflow-hidden rounded-[var(--radius)] shadow-lg space-y-3">
      {/* Top Session & Theme & Quick Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--line)]">
        <div className="flex items-center flex-wrap gap-2">
          {/* User Auth Button / Guest Indicator */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 border border-[var(--gold-dim)] bg-[rgba(200,162,77,0.08)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#1a1509] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer font-semibold shadow-xs"
            title="Clique para Entrar, Criar Conta ou Entrar Sem Login"
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sessão: {currentUser.nome}</span>
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5 text-[var(--paper-dim)]" />
                <span>Modo Convidado (Sem Login)</span>
              </>
            )}
            <LogIn className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {/* Direct Schedule Button in Header */}
          {onOpenSchedule && (
            <button
              onClick={onOpenSchedule}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--gold)] bg-[var(--gold)] text-[#1a1509] hover:bg-[#dab364] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer font-bold shadow-xs"
              title="Agendar entrevista e enviar notificação por mensagem/e-mail"
            >
              <Calendar className="w-3.5 h-3.5 fill-current" />
              <span>Agendar Entrevista</span>
            </button>
          )}

          {/* Agenda List Button in Header */}
          {onOpenAgendamentos && (
            <button
              onClick={onOpenAgendamentos}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] bg-[var(--bg)] text-[var(--paper)] hover:border-[var(--gold)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer shadow-xs"
              title="Ver lista de agendamentos e status das notificações"
            >
              <Send className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="hidden sm:inline">Ver Agendamentos</span>
            </button>
          )}

          {/* Theme Toggle Button (Modo Preto vs. Modo Branco) */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--line)] bg-[var(--bg)] text-[var(--paper)] hover:border-[var(--gold)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer shadow-xs"
            title={theme === "dark" ? "Alternar para Modo Branco (Claro)" : "Alternar para Modo Preto (Escuro)"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Modo Branco</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Modo Preto</span>
              </>
            )}
          </button>

          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
            <Lock className="w-3 h-3" /> Servidor Ativo
          </span>
        </div>

        <div className="font-mono text-xs tracking-[0.15em] uppercase text-[var(--gold)] flex items-center gap-3">
          <span>Processo Nº <strong className="text-[var(--paper)]">{procNum}</strong></span>
          <span className="hidden sm:inline">· Nível: {info.label}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--paper)] tracking-tight">
            AYLAENTREVISTA
          </h1>

          <p className="text-[var(--paper-dim)] text-xs sm:text-sm max-w-[62ch] mt-1 leading-relaxed">
            Simulador de entrevistas de emprego — banca de recrutamento virtual com memória, avaliação em tempo real e modo por voz.
          </p>
        </div>

        <div className="self-start md:self-auto border-2 border-[var(--brick)] text-[var(--brick-bright)] font-mono font-semibold text-xs tracking-widest px-3 py-1.5 uppercase bg-[rgba(169,74,52,0.08)] md:rotate-3 shadow-sm shrink-0">
          {info.stamp}
        </div>
      </div>
    </div>
  );
};

