import { Agendamento } from "../types";

const AGENDAMENTOS_KEY = "aylaentrevista_agendamentos_v1";

const INITIAL_AGENDAMENTOS: Agendamento[] = [
  {
    id: "agd_1",
    candidatoNome: "Mateus Pedro",
    candidatoEmail: "mateus.pedro@sonangol.co.ao",
    candidatoTelefone: "+244 923 111 222",
    area: "Engenharia de Software",
    empresa: "Sonangol E.P.",
    nivel: "dificil",
    dataHora: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    notificado: true,
    notificadoEmail: true,
    notificadoSMS: true,
    dataNotificacao: Date.now() - 3600000,
    dataCriacao: Date.now() - 3600000,
    status: "pendente",
  },
  {
    id: "agd_2",
    candidatoNome: "Ana Beatriz Silva",
    candidatoEmail: "ana.silva@bfa.ao",
    candidatoTelefone: "+244 912 333 444",
    area: "Análise Financeira & Risco",
    empresa: "Banco de Fomento Angola (BFA)",
    nivel: "medio",
    dataHora: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 16),
    notificado: true,
    notificadoEmail: true,
    notificadoSMS: true,
    dataNotificacao: Date.now() - 7200000,
    dataCriacao: Date.now() - 7200000,
    status: "pendente",
  },
];

export function getAgendamentos(): Agendamento[] {
  try {
    const raw = localStorage.getItem(AGENDAMENTOS_KEY);
    if (!raw) {
      localStorage.setItem(AGENDAMENTOS_KEY, JSON.stringify(INITIAL_AGENDAMENTOS));
      return INITIAL_AGENDAMENTOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading agendamentos from storage:", err);
    return INITIAL_AGENDAMENTOS;
  }
}

export function saveAgendamentos(agendamentos: Agendamento[]): void {
  try {
    localStorage.setItem(AGENDAMENTOS_KEY, JSON.stringify(agendamentos));
  } catch (err) {
    console.error("Error saving agendamentos to storage:", err);
  }
}

export function addAgendamento(
  data: Omit<Agendamento, "id" | "dataCriacao" | "notificado" | "dataNotificacao" | "status"> & {
    notificadoEmail?: boolean;
    notificadoSMS?: boolean;
  }
): Agendamento {
  const agendamentos = getAgendamentos();
  const now = Date.now();
  const newAgendamento: Agendamento = {
    ...data,
    id: "agd_" + now + "_" + Math.floor(Math.random() * 1000),
    notificado: true,
    notificadoEmail: data.notificadoEmail ?? true,
    notificadoSMS: data.notificadoSMS ?? true,
    dataNotificacao: now,
    dataCriacao: now,
    status: "pendente",
  };

  const updated = [newAgendamento, ...agendamentos];
  saveAgendamentos(updated);

  // Trigger browser Notification if permitted
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        new Notification("Convite de Entrevista Agendado!", {
          body: `Entrevista para ${newAgendamento.candidatoNome} (${newAgendamento.area}) agendada para ${newAgendamento.dataHora.replace("T", " às ")}.`,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.log("Notification trigger notice:", e);
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  return newAgendamento;
}

export function cancelAgendamento(id: string): void {
  const agendamentos = getAgendamentos();
  const updated = agendamentos.map((a) => (a.id === id ? { ...a, status: "cancelada" as const } : a));
  saveAgendamentos(updated);
}

export function deleteAgendamento(id: string): void {
  const agendamentos = getAgendamentos();
  const updated = agendamentos.filter((a) => a.id !== id);
  saveAgendamentos(updated);
}
