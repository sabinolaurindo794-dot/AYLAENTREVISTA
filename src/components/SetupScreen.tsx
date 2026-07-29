import React, { useState } from "react";
import { NivelExigencia, UserAccount } from "../types";
import { AREAS, EMPRESAS } from "../data/constants";
import { extractTextFromFile } from "../utils/pdf";
import { getAgendamentos } from "../utils/agendamentosStorage";
import { FileText, Upload, Volume2, Mic, History, Play, Users, UserCheck, UserX, LogIn, Calendar, Send, Bell } from "lucide-react";

interface SetupScreenProps {
  onStart: (config: {
    nome: string;
    area: string;
    empresa: string;
    nivel: NivelExigencia;
    numPerguntas: number;
    vagaTexto: string;
    cvTexto: string;
    somAtivo: boolean;
    modoVoz: boolean;
  }) => void;
  onOpenHistory: () => void;
  onOpenContacts: () => void;
  onOpenAgendamentos?: () => void;
  onScheduleInterview?: (prefill: { nome: string; area: string; empresa: string }) => void;
  prefillContact?: { nome: string; area: string; empresa: string } | null;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStart,
  onOpenHistory,
  onOpenContacts,
  onOpenAgendamentos,
  onScheduleInterview,
  prefillContact,
  currentUser,
  onOpenAuth,
}) => {
  const [nome, setNome] = useState(prefillContact?.nome || "");
  const [area, setArea] = useState(prefillContact?.area || AREAS[0]);
  const [empresa, setEmpresa] = useState(prefillContact?.empresa || EMPRESAS[0]);
  const [nivel, setNivel] = useState<NivelExigencia>("medio");
  const [numPerguntas, setNumPerguntas] = useState(16);
  const [vagaTexto, setVagaTexto] = useState("");
  const [cvTexto, setCvTexto] = useState("");
  const [cvStatus, setCvStatus] = useState("");
  const [vagaStatus, setVagaStatus] = useState("");
  const [somAtivo, setSomAtivo] = useState(false);
  const [modoVoz, setModoVoz] = useState(false);
  const [isExtractingCv, setIsExtractingCv] = useState(false);
  const [isExtractingVaga, setIsExtractingVaga] = useState(false);

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingCv(true);
    setCvStatus("A ler ficheiro de currículo...");
    try {
      const text = await extractTextFromFile(file, 5000);
      setCvTexto(text);
      setCvStatus(`Currículo lido com sucesso (${text.length} caracteres extraídos).`);
    } catch (err: any) {
      setCvStatus("Erro ao ler ficheiro: " + err.message);
    } finally {
      setIsExtractingCv(false);
    }
  };

  const handleVagaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtractingVaga(true);
    setVagaStatus("A ler ficheiro da vaga...");
    try {
      const text = await extractTextFromFile(file, 6000);
      setVagaTexto(text);
      setVagaStatus(`Anúncio de vaga lido com sucesso (${text.length} caracteres extraídos).`);
    } catch (err: any) {
      setVagaStatus("Erro ao ler ficheiro: " + err.message);
    } finally {
      setIsExtractingVaga(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      nome,
      area,
      empresa,
      nivel,
      numPerguntas,
      vagaTexto,
      cvTexto,
      somAtivo,
      modoVoz,
    });
  };

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-5 md:p-6 mt-4 rounded-[var(--radius)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-semibold mb-1 text-[var(--paper)]">
            Abrir processo de entrevista
          </h2>
          <p className="text-[var(--paper-dim)] text-xs md:text-sm">
            Preencha os dados abaixo para iniciar imediatamente ou agende para enviar notificação ao candidato por E-mail e SMS/WhatsApp.
          </p>
        </div>

        {onScheduleInterview && (
          <button
            type="button"
            onClick={() => onScheduleInterview({ nome, area, empresa })}
            className="px-4 py-2 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#dab364] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
          >
            <Calendar className="w-4 h-4 fill-current" />
            Agendar & Notificar
          </button>
        )}
      </div>

      {/* Quick Scheduling Banner Callout */}
      <div className="mb-6 p-3.5 bg-gradient-to-r from-[rgba(200,162,77,0.12)] to-[var(--panel-raised)] border border-[var(--gold-dim)]/40 rounded-[var(--radius)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-xs md:text-sm text-[var(--paper)]">
              Agendamento & Notificação Automática por E-mail e Mensagem
            </h4>
            <p className="font-mono text-[11px] text-[var(--paper-dim)]">
              Envie convites formais com data, horário e link de acesso direto para a vaga do candidato.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onScheduleInterview && (
            <button
              type="button"
              onClick={() => onScheduleInterview({ nome, area, empresa })}
              className="px-3.5 py-1.5 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#dab364] transition rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 fill-current" />
              Agendar Novo
            </button>
          )}

          {onOpenAgendamentos && (
            <button
              type="button"
              onClick={onOpenAgendamentos}
              className="px-3.5 py-1.5 border border-[var(--line)] bg-[var(--bg)] text-[var(--paper)] hover:border-[var(--gold)] font-mono text-xs uppercase tracking-wider rounded transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[var(--gold)] inline mr-1" />
              Ver Lista ({getAgendamentos().filter((a) => a.status === "pendente").length} Pendentes)
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
            Nome do candidato
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Laurindo Sabino"
            className="w-full bg-[var(--bg)] border border-[var(--line)] color-[var(--paper)] px-3 py-2.5 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)] text-[var(--paper)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
              Área / Setor profissional
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] px-3 py-2.5 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
              Empresa / Instituição de referência (opcional)
            </label>
            <select
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] px-3 py-2.5 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
            >
              {EMPRESAS.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CV Upload */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
            Currículo do candidato (opcional) — PDF ou texto
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={handleCvChange}
              disabled={isExtractingCv}
              className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper-dim)] px-3 py-2 text-xs rounded-[var(--radius)] file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-mono file:bg-[var(--panel-raised)] file:text-[var(--gold)] cursor-pointer"
            />
          </div>
          {cvStatus && (
            <p className="text-xs text-[var(--gold)] mt-1.5 font-mono">{cvStatus}</p>
          )}
        </div>

        {/* Vaga Upload / Textarea */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
            Anúncio da vaga (opcional) — PDF ou texto
          </label>
          <input
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            onChange={handleVagaChange}
            disabled={isExtractingVaga}
            className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper-dim)] px-3 py-2 text-xs rounded-[var(--radius)] file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-mono file:bg-[var(--panel-raised)] file:text-[var(--gold)] cursor-pointer"
          />
          <textarea
            value={vagaTexto}
            onChange={(e) => setVagaTexto(e.target.value)}
            placeholder="...ou cole aqui o texto da vaga de emprego (requisitos, funções, perfil)"
            className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-3 text-xs mt-2 min-h-[70px] rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
          />
          {vagaStatus && (
            <p className="text-xs text-[var(--gold)] mt-1.5 font-mono">{vagaStatus}</p>
          )}
        </div>

        {/* Nível de Exigência */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
            Nível de Exigência
          </label>
          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value as NivelExigencia)}
            className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] px-3 py-2.5 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
          >
            <option value="facil">Fácil — treino inicial, tom encorajador</option>
            <option value="medio">Médio — banca equilibrada e realista</option>
            <option value="dificil">Difícil — Professional Challenge, pressão máxima</option>
          </select>
        </div>

        {/* Range Slider for Number of Questions */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
              Número de perguntas
            </label>
            <span className="font-mono text-sm text-[var(--gold)] font-medium">
              {numPerguntas} perguntas
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="40"
            step="1"
            value={numPerguntas}
            onChange={(e) => setNumPerguntas(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--gold)] bg-[var(--bg)] h-2 rounded cursor-pointer"
          />
        </div>

        {/* Checkbox Options */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={modoVoz}
              onChange={(e) => setModoVoz(e.target.checked)}
              className="mt-0.5 accent-[var(--gold)] w-4 h-4"
            />
            <span className="text-xs md:text-sm text-[var(--paper)]">
              <Mic className="inline-block w-3.5 h-3.5 mr-1 color-[var(--gold)] text-[var(--gold)]" />
              <strong>Ativar modo por voz</strong> — a banca lê as perguntas em voz alta e pode responder por microfone (síntese e reconhecimento de voz).
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={somAtivo}
              onChange={(e) => setSomAtivo(e.target.checked)}
              className="mt-0.5 accent-[var(--gold)] w-4 h-4"
            />
            <span className="text-xs md:text-sm text-[var(--paper)]">
              <Volume2 className="inline-block w-3.5 h-3.5 mr-1 text-[var(--gold)]" />
              <strong>Efeitos sonoros</strong> — feedback de áudio ao receber pergunta e enviar resposta.
            </span>
          </label>
        </div>

        {/* Auth / Guest Option Card Before Interview */}
        <div className="p-4 border border-[var(--line)] bg-[var(--bg)] rounded-[var(--radius)] space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--gold)] font-semibold flex items-center gap-1.5">
              {currentUser ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4 text-[var(--paper-dim)]" />}
              Modo de Acesso da Sessão
            </span>
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-xs font-mono text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              {currentUser ? "Alternar Conta / Entrar sem Login" : "Fazer Login com PIN / Criar Conta"}
            </button>
          </div>
          <p className="text-xs text-[var(--paper-dim)] leading-relaxed">
            {currentUser ? (
              <>
                Sessão iniciada como <strong className="text-[var(--paper)]">{currentUser.nome}</strong> ({currentUser.cargoRole}). Os resultados serão registados com a assinatura desta conta.
              </>
            ) : (
              <>
                Está a utilizar o <strong className="text-[var(--paper)]">Modo Convidado (Sem Login)</strong>. Pode iniciar a entrevista imediatamente sem necessidade de palavra-passe ou criar conta.
              </>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--line)]">
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--gold)] text-[#1a1509] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#dab364] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar entrevista agora
          </button>

          {onScheduleInterview && (
            <button
              type="button"
              onClick={() => onScheduleInterview({ nome, area, empresa })}
              className="px-5 py-3 border border-[var(--gold-dim)] text-[var(--gold)] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[rgba(200,162,77,0.1)] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              Agendar & Notificar
            </button>
          )}

          {onOpenAgendamentos && (
            <button
              type="button"
              onClick={onOpenAgendamentos}
              className="px-5 py-3 border border-[var(--line)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] hover:bg-[rgba(200,162,77,0.06)] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[var(--gold)]" />
              Agenda de Entrevistas
            </button>
          )}

          <button
            type="button"
            onClick={onOpenContacts}
            className="px-5 py-3 border border-[var(--line)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] hover:bg-[rgba(200,162,77,0.06)] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[var(--paper-dim)]" />
            Contactos
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="px-5 py-3 border border-[var(--line)] text-[var(--paper)] font-mono text-xs uppercase tracking-wider hover:border-[var(--gold)] hover:bg-[rgba(200,162,77,0.06)] transition rounded-[var(--radius)] flex items-center gap-2 cursor-pointer"
          >
            <History className="w-4 h-4 text-[var(--paper-dim)]" />
            Histórico
          </button>
        </div>
      </form>
    </section>
  );
};
