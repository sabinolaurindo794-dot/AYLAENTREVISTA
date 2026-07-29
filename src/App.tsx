import React, { useState, useEffect } from "react";
import { NivelExigencia, PersonaKey, QuestionScores, HistoryItem, EvaluationResult, UserAccount, Agendamento } from "./types";
import { BLOCOS } from "./data/constants";
import { soundNovaPergunta, soundEnviar, soundFim, falarPergunta } from "./utils/audio";
import { saveInterviewRecord } from "./utils/storage";
import { getCurrentUser } from "./utils/authStorage";
import { DossierHeader } from "./components/DossierHeader";
import { SetupScreen } from "./components/SetupScreen";
import { InterviewScreen } from "./components/InterviewScreen";
import { ResultScreen } from "./components/ResultScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { ContactsScreen } from "./components/ContactsScreen";
import { AgendamentosScreen } from "./components/AgendamentosScreen";
import { ScheduleModal } from "./components/ScheduleModal";
import { NotificationModal } from "./components/NotificationModal";
import { AuthModal } from "./components/AuthModal";

type ScreenType = "setup" | "interview" | "result" | "history" | "contacts" | "agendamentos";

export default function App() {
  const [screen, setScreen] = useState<ScreenType>("setup");
  const [prefillContact, setPrefillContact] = useState<{ nome: string; area: string; empresa: string } | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Scheduling & Notifications State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulePrefill, setSchedulePrefill] = useState<{
    nome?: string;
    email?: string;
    telefone?: string;
    area?: string;
    empresa?: string;
  } | undefined>(undefined);
  const [activeNotificationAgendamento, setActiveNotificationAgendamento] = useState<Agendamento | null>(null);

  const handleOpenSchedule = (prefill?: {
    nome?: string;
    email?: string;
    telefone?: string;
    area?: string;
    empresa?: string;
  }) => {
    setSchedulePrefill(prefill);
    setIsScheduleOpen(true);
  };

  const handleScheduled = (agendamento: Agendamento) => {
    setActiveNotificationAgendamento(agendamento);
  };

  const handleStartInterviewFromAgendamento = (agendamento: Agendamento) => {
    setPrefillContact({
      nome: agendamento.candidatoNome,
      area: agendamento.area,
      empresa: agendamento.empresa,
    });
    setNivel(agendamento.nivel);
    setScreen("setup");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  // Theme State ("dark" / "light")
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("aylaentrevista_theme_v1");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aylaentrevista_theme_v1", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const [procNum, setProcNum] = useState<string>(() =>
    String(Math.floor(1000 + Math.random() * 8999))
  );


  // Session Config
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [nivel, setNivel] = useState<NivelExigencia>("medio");
  const [numPerguntas, setNumPerguntas] = useState(16);
  const [vagaTexto, setVagaTexto] = useState("");
  const [cvTexto, setCvTexto] = useState("");
  const [somAtivo, setSomAtivo] = useState(false);
  const [modoVoz, setModoVoz] = useState(false);

  // Session Runtime State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bancaMemoria, setBancaMemoria] = useState("");
  const [scoreHistory, setScoreHistory] = useState<QuestionScores[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentPersonaKey, setCurrentPersonaKey] = useState<PersonaKey | null>(null);
  const [currentBlock, setCurrentBlock] = useState<string>("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Evaluation State
  const [evalData, setEvalData] = useState<EvaluationResult | null>(null);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const personaForIndex = (i: number, total: number): PersonaKey => {
    if (i < total / 3) return "tecnico";
    if (i < (2 * total) / 3) return "rh";
    return "executivo";
  };

  const blocoForIndex = (i: number, total: number): string => {
    const idx = Math.min(BLOCOS.length - 1, Math.floor((i / total) * BLOCOS.length));
    return BLOCOS[idx];
  };

  const handleStart = async (config: {
    nome: string;
    area: string;
    empresa: string;
    nivel: NivelExigencia;
    numPerguntas: number;
    vagaTexto: string;
    cvTexto: string;
    somAtivo: boolean;
    modoVoz: boolean;
  }) => {
    const newProcNum = String(Math.floor(1000 + Math.random() * 8999));
    setProcNum(newProcNum);
    setNome(config.nome);
    setArea(config.area);
    setEmpresa(config.empresa);
    setNivel(config.nivel);
    setNumPerguntas(config.numPerguntas);
    setVagaTexto(config.vagaTexto);
    setCvTexto(config.cvTexto);
    setSomAtivo(config.somAtivo);
    setModoVoz(config.modoVoz);

    setHistory([]);
    setBancaMemoria("");
    setScoreHistory([]);
    setCurrentQuestion(null);
    setEvalData(null);
    setErrorMessage(null);

    setScreen("interview");
    fetchNextQuestion([], "", [], config.numPerguntas, config.nivel, config.nome, config.area, config.empresa, config.vagaTexto, config.cvTexto, config.somAtivo, config.modoVoz);
  };

  const fetchNextQuestion = async (
    currentHistory: HistoryItem[],
    memoria: string,
    scores: QuestionScores[],
    total: number,
    currentNivel: NivelExigencia,
    currentNome: string,
    currentArea: string,
    currentEmpresa: string,
    currentVaga: string,
    currentCv: string,
    soundOn: boolean,
    voiceOn: boolean
  ) => {
    setIsLoadingQuestion(true);
    setErrorMessage(null);

    const index = currentHistory.length;
    const personaKey = personaForIndex(index, total);
    const block = blocoForIndex(index, total);
    setCurrentPersonaKey(personaKey);
    setCurrentBlock(block);

    try {
      const resp = await fetch("/api/interview/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaKey,
          index,
          total,
          block,
          nivel: currentNivel,
          nome: currentNome,
          area: currentArea,
          empresa: currentEmpresa,
          vagaTexto: currentVaga,
          cvTexto: currentCv,
          history: currentHistory,
          bancaMemoria: memoria,
          scoreHistory: scores,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Falha no servidor (${resp.status})`);
      }

      const data = await resp.json();

      // If there was an evaluation of the previous answer
      if (currentHistory.length > 0 && data.avaliacaoRespostaAnterior) {
        const updatedHistory = [...currentHistory];
        const lastIdx = updatedHistory.length - 1;
        updatedHistory[lastIdx] = {
          ...updatedHistory[lastIdx],
          avaliacao: data.avaliacaoRespostaAnterior,
        };
        setHistory(updatedHistory);

        if (data.avaliacaoRespostaAnterior.scores) {
          setScoreHistory((prev) => [...prev, data.avaliacaoRespostaAnterior.scores]);
        }
      }

      if (data.notaBanca) {
        setBancaMemoria((prev) => (prev ? `${prev}\n- ${data.notaBanca}` : `- ${data.notaBanca}`));
      }

      setCurrentQuestion(data.pergunta);
      soundNovaPergunta(soundOn);
      falarPergunta(data.pergunta, voiceOn);
    } catch (err: any) {
      console.error("Error fetching next question:", err);
      setErrorMessage("Não foi possível carregar a pergunta: " + err.message);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSendAnswer = (answer: string) => {
    if (!currentQuestion || !currentPersonaKey) return;

    soundEnviar(somAtivo);
    const updatedHistory: HistoryItem[] = [
      ...history,
      {
        persona: currentPersonaKey,
        block: currentBlock,
        question: currentQuestion,
        answer,
      },
    ];
    setHistory(updatedHistory);
    setCurrentQuestion(null);

    if (updatedHistory.length >= numPerguntas) {
      finishInterview(updatedHistory);
    } else {
      fetchNextQuestion(
        updatedHistory,
        bancaMemoria,
        scoreHistory,
        numPerguntas,
        nivel,
        nome,
        area,
        empresa,
        vagaTexto,
        cvTexto,
        somAtivo,
        modoVoz
      );
    }
  };

  const finishInterview = async (finalHistory = history) => {
    soundFim(somAtivo);
    setScreen("result");
    setIsLoadingEval(true);
    setErrorMessage(null);

    try {
      const resp = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nivel,
          nome,
          area,
          empresa,
          vagaTexto,
          cvTexto,
          history: finalHistory,
          bancaMemoria,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Erro ao gerar avaliação (${resp.status})`);
      }

      const evalResult: EvaluationResult = await resp.json();
      setEvalData(evalResult);

      // Save to history storage
      saveInterviewRecord(nome, area, empresa, nivel, numPerguntas, evalResult, finalHistory);
    } catch (err: any) {
      console.error("Error evaluating interview:", err);
      setErrorMessage("Erro ao gerar a avaliação final: " + err.message);
    } finally {
      setIsLoadingEval(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--paper)] font-sans selection:bg-[var(--gold-dim)] selection:text-white">
      <main className="max-w-[880px] mx-auto px-4 py-6 md:py-8 pb-16">
        <DossierHeader
          procNum={procNum}
          nivel={nivel}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSchedule={() => handleOpenSchedule()}
          onOpenAgendamentos={() => setScreen("agendamentos")}
        />

        {screen === "setup" && (
          <SetupScreen
            onStart={handleStart}
            onOpenHistory={() => setScreen("history")}
            onOpenContacts={() => setScreen("contacts")}
            onOpenAgendamentos={() => setScreen("agendamentos")}
            onScheduleInterview={(p) => handleOpenSchedule(p)}
            prefillContact={prefillContact}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {screen === "interview" && (
          <InterviewScreen
            nome={nome}
            area={area}
            nivel={nivel}
            numPerguntas={numPerguntas}
            history={history}
            scoreHistory={scoreHistory}
            currentQuestion={currentQuestion}
            currentPersonaKey={currentPersonaKey}
            isLoadingQuestion={isLoadingQuestion}
            modoVoz={modoVoz}
            onSendAnswer={handleSendAnswer}
            onFinishEarly={() => finishInterview()}
            errorMessage={errorMessage}
          />
        )}

        {screen === "result" && (
          <ResultScreen
            procNum={procNum}
            nome={nome}
            area={area}
            empresa={empresa}
            nivel={nivel}
            data={evalData}
            history={history}
            isLoading={isLoadingEval}
            errorMessage={errorMessage}
            onRestart={() => setScreen("setup")}
          />
        )}

        {screen === "history" && (
          <HistoryScreen onBack={() => setScreen("setup")} />
        )}

        {screen === "contacts" && (
          <ContactsScreen
            onBack={() => setScreen("setup")}
            onOpenAgendamentos={() => setScreen("agendamentos")}
            onSelectForInterview={(c) => {
              setPrefillContact(c);
              setScreen("setup");
            }}
            onScheduleInterview={(c) =>
              handleOpenSchedule({
                nome: c.nome,
                email: c.email,
                telefone: c.telefone,
                area: c.cargoArea,
                empresa: c.empresa,
              })
            }
          />
        )}

        {screen === "agendamentos" && (
          <AgendamentosScreen
            onBack={() => setScreen("setup")}
            onOpenScheduleNew={() => handleOpenSchedule()}
            onResendNotification={(a) => setActiveNotificationAgendamento(a)}
            onStartInterview={(a) => handleStartInterviewFromAgendamento(a)}
          />
        )}

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onUserChanged={(u) => setCurrentUser(u)}
        />

        <ScheduleModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          prefill={schedulePrefill}
          onScheduled={handleScheduled}
        />

        <NotificationModal
          agendamento={activeNotificationAgendamento}
          onClose={() => setActiveNotificationAgendamento(null)}
          onStartInterviewNow={(a) => handleStartInterviewFromAgendamento(a)}
        />

        <footer className="text-center text-[var(--paper-dim)] text-xs mt-10 font-mono tracking-wide">
          AYLAENTREVISTA · Banca Virtual de Recrutamento com Inteligência Artificial Gemini
        </footer>
      </main>
    </div>
  );
}

