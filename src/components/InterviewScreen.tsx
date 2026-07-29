import React, { useState, useEffect, useRef } from "react";
import { PersonaKey, QuestionScores, HistoryItem, NivelExigencia } from "../types";
import { PERSONAS, LIVE_DIMS, MIN_PALAVRAS } from "../data/constants";
import { Mic, Send, Square, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface InterviewScreenProps {
  nome: string;
  area: string;
  nivel: NivelExigencia;
  numPerguntas: number;
  history: HistoryItem[];
  scoreHistory: QuestionScores[];
  currentQuestion: string | null;
  currentPersonaKey: PersonaKey | null;
  isLoadingQuestion: boolean;
  modoVoz: boolean;
  onSendAnswer: (answer: string) => void;
  onFinishEarly: () => void;
  errorMessage: string | null;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  nome,
  area,
  nivel,
  numPerguntas,
  history,
  scoreHistory,
  currentQuestion,
  currentPersonaKey,
  isLoadingQuestion,
  modoVoz,
  onSendAnswer,
  onFinishEarly,
  errorMessage,
}) => {
  const [answerInput, setAnswerInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Timers
  useEffect(() => {
    const timer = setInterval(() => setTotalSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQuestionSeconds(0);
    const qTimer = setInterval(() => setQuestionSeconds((s) => s + 1), 1000);
    return () => clearInterval(qTimer);
  }, [history.length, currentQuestion]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion, isLoadingQuestion]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.lang = "pt-PT";
        recog.continuous = false;
        recog.interimResults = false;
        recog.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setAnswerInput((prev) => (prev ? `${prev} ${text}` : text));
          setIsListening(false);
        };
        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const wordCount = answerInput.trim() ? answerInput.trim().split(/\s+/).length : 0;
  const minWords = MIN_PALAVRAS[nivel] || 15;
  const canSend = wordCount >= minWords && !isLoadingQuestion && currentQuestion !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSendAnswer(answerInput.trim());
    setAnswerInput("");
  };

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Calculate live average dimension scores
  const getDimensionAvg = (key: keyof QuestionScores) => {
    if (scoreHistory.length === 0) return 0;
    const vals = scoreHistory.map((s) => s[key]).filter((v) => typeof v === "number");
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const doneCount = history.length;
  const progressPct = Math.min(100, (doneCount / numPerguntas) * 100);

  return (
    <section className="border border-[var(--line)] bg-[var(--panel)] p-4 md:p-6 mt-4 rounded-[var(--radius)]">
      {/* Persona Panel Tabs */}
      <div className="flex border-b border-[var(--line)] mb-4 gap-1">
        {(["tecnico", "rh", "executivo"] as PersonaKey[]).map((pkey) => {
          const p = PERSONAS[pkey];
          const isActive = currentPersonaKey === pkey;
          return (
            <div
              key={pkey}
              className={`flex-1 text-center py-2 px-2 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
                isActive
                  ? "border-[var(--gold)] text-[var(--gold)] font-bold opacity-100"
                  : "border-transparent text-[var(--paper-dim)] opacity-50"
              }`}
            >
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center font-mono text-[10px] font-bold border"
                style={{ color: p.color, borderColor: p.color }}
              >
                {p.initials}
              </span>
              <span className="hidden sm:inline">{p.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress & Timers Bar */}
      <div className="flex justify-between items-center flex-wrap gap-2 text-xs font-mono text-[var(--paper-dim)] mb-2">
        <span>
          Pergunta <strong className="text-[var(--gold)]">{Math.min(doneCount + 1, numPerguntas)}</strong> de {numPerguntas}
        </span>
        <span>
          {nome ? `${nome} · ` : ""}
          {area}
        </span>
        <span>Tempo total: {fmtTime(totalSeconds)}</span>
      </div>

      <div className="w-full h-1 bg-[var(--line)] mb-4 overflow-hidden rounded-full">
        <div
          className="h-full bg-[var(--gold)] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Live Panel Score Indicators */}
      {scoreHistory.length > 0 && (
        <div className="border border-[var(--line)] p-3 mb-4 bg-[var(--panel-raised)] rounded-[var(--radius)]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--paper-dim)] mb-2">
            Painel ao vivo — Média por resposta
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {LIVE_DIMS.map(([key, label]) => {
              const avg = getDimensionAvg(key as keyof QuestionScores);
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] text-[var(--paper-dim)]">
                    <span>{label}</span>
                    <span className="font-mono text-[var(--gold)]">{avg.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg)] border border-[var(--line)] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)]"
                      style={{ width: `${avg * 10}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Box */}
      {errorMessage && (
        <div className="border border-[var(--brick)] bg-[rgba(169,74,52,0.12)] text-[#f1c3b4] p-3 text-xs mb-4 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--brick-bright)]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transcript Chat Area */}
      <div className="flex flex-col gap-3 mb-4 max-h-[460px] overflow-y-auto pr-1">
        {history.map((h, i) => {
          const p = PERSONAS[h.persona];
          return (
            <div key={i} className="space-y-2">
              {/* Question Bubble */}
              <div className="p-3.5 border border-[var(--line)] bg-[var(--panel-raised)] border-l-4 border-l-[var(--gold)] rounded-[var(--radius)]">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--gold)] mb-1 flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold border"
                    style={{ color: p.color, borderColor: p.color }}
                  >
                    {p.initials}
                  </span>
                  <span>{p.label}</span>
                </div>
                <p className="text-sm md:text-base text-[var(--paper)] leading-relaxed">
                  {h.question}
                </p>
              </div>

              {/* Answer Bubble */}
              <div className="p-3.5 border border-[var(--line)] bg-transparent border-l-4 border-l-[var(--line)] text-[var(--paper-dim)] rounded-[var(--radius)] ml-4">
                <div className="font-mono text-[10px] uppercase tracking-wider mb-1">
                  A sua resposta
                </div>
                <p className="text-sm md:text-base text-[var(--paper)] leading-relaxed">
                  {h.answer}
                </p>
              </div>

              {/* Evaluation Chips */}
              {h.avaliacao && (
                <div className="ml-4 flex flex-wrap gap-2 text-[10px] font-mono">
                  {h.avaliacao.vaga && (
                    <span className="px-2 py-0.5 border border-[var(--gold-dim)] text-[var(--gold)] bg-[rgba(200,162,77,0.06)] rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Resposta vaga
                    </span>
                  )}
                  {h.avaliacao.incoerente && (
                    <span className="px-2 py-0.5 border border-[var(--brick)] text-[var(--brick-bright)] bg-[rgba(169,74,52,0.06)] rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Incoerência: {h.avaliacao.notaIncoerencia || "detetada"}
                    </span>
                  )}
                  {h.avaliacao.scores && (
                    <span className="px-2 py-0.5 border border-[var(--line)] text-[var(--paper-dim)] rounded">
                      Clareza {h.avaliacao.scores.clareza} · Com {h.avaliacao.scores.comunicacao} · Lid {h.avaliacao.scores.lideranca} · CT {h.avaliacao.scores.conhecimentoTecnico} · Conf {h.avaliacao.scores.confianca}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Current Active Question */}
        {currentQuestion && currentPersonaKey && (
          <div className="p-3.5 border border-[var(--line)] bg-[var(--panel-raised)] border-l-4 border-l-[var(--gold)] rounded-[var(--radius)] animate-fade-in">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--gold)] mb-1 flex items-center gap-1.5">
              <span
                className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold border"
                style={{ color: PERSONAS[currentPersonaKey].color, borderColor: PERSONAS[currentPersonaKey].color }}
              >
                {PERSONAS[currentPersonaKey].initials}
              </span>
              <span>{PERSONAS[currentPersonaKey].label}</span>
            </div>
            <p className="text-sm md:text-base text-[var(--paper)] font-medium leading-relaxed">
              {currentQuestion}
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoadingQuestion && (
          <div className="flex items-center gap-2 py-3 px-2 text-xs font-mono text-[var(--paper-dim)]">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
            <span>A banca está a analisar e a preparar a próxima pergunta...</span>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Answer Form Area */}
      {!isLoadingQuestion && currentQuestion && (
        <form onSubmit={handleSubmit} className="border-t border-[var(--line)] pt-4 space-y-3">
          <label className="block font-mono text-xs uppercase tracking-wider text-[var(--paper-dim)]">
            A sua resposta
          </label>
          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Responda com clareza, estruturando os seus pontos com exemplos concretos..."
            rows={4}
            className="w-full bg-[var(--bg)] border border-[var(--line)] text-[var(--paper)] p-3 text-sm rounded-[var(--radius)] focus:outline-none focus:border-[var(--gold)]"
          />

          <div className="flex justify-between items-center text-xs font-mono">
            <span style={{ color: wordCount < minWords ? "var(--brick-bright)" : "var(--green)" }}>
              {wordCount} palavra{wordCount === 1 ? "" : "s"} (mínimo {minWords})
            </span>
            <span className="text-[var(--paper-dim)]">
              Tempo nesta pergunta: {fmtTime(questionSeconds)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSend}
              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold rounded-[var(--radius)] flex items-center gap-2 transition ${
                canSend
                  ? "bg-[var(--gold)] text-[#1a1509] hover:bg-[#dab364] cursor-pointer"
                  : "bg-[var(--panel-raised)] text-[var(--paper-dim)] cursor-not-allowed opacity-50"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Enviar resposta
            </button>

            {modoVoz && recognitionRef.current && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`px-4 py-2.5 border font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] flex items-center gap-2 transition ${
                  isListening
                    ? "border-[var(--brick-bright)] text-[var(--brick-bright)] bg-[rgba(169,74,52,0.1)]"
                    : "border-[var(--line)] text-[var(--paper)] hover:border-[var(--gold)]"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isListening ? "A ouvir..." : "Falar resposta"}
              </button>
            )}

            <button
              type="button"
              onClick={onFinishEarly}
              className="ml-auto px-4 py-2.5 border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--brick-bright)] hover:border-[var(--brick)] font-mono text-xs uppercase tracking-wider rounded-[var(--radius)] transition flex items-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-current" />
              Terminar agora
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
