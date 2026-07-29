export type NivelExigencia = "facil" | "medio" | "dificil";
export type PersonaKey = "tecnico" | "rh" | "executivo";
export type DecisaoFinal = "CONTRATADO" | "NAO_SELECIONADO" | "LISTA_ESPERA";

export interface PersonaInfo {
  label: string;
  tab: string;
  color: string;
  initials: string;
  desc: string;
}

export interface NivelInfo {
  label: string;
  stamp: string;
  regras: string;
}

export interface QuestionScores {
  clareza: number;
  comunicacao: number;
  lideranca: number;
  conhecimentoTecnico: number;
  confianca: number;
}

export interface AvaliacaoRespostaAnterior {
  vaga: boolean;
  incoerente: boolean;
  notaIncoerencia?: string;
  scores?: QuestionScores;
}

export interface HistoryItem {
  persona: PersonaKey;
  block: string;
  question: string;
  answer: string;
  avaliacao?: AvaliacaoRespostaAnterior;
}

export interface CategoryScores {
  comunicacaoVerbal: number;
  clarezaRespostas: number;
  organizacaoIdeias: number;
  argumentacao: number;
  conhecimentoTecnico: number;
  segurancaConfianca: number;
  resolucaoProblemas: number;
  lideranca: number;
  eticaProfissional: number;
  inteligenciaEmocional: number;
  gestaoPressao: number;
  pensamentoCritico: number;
  capacidadeAnalitica: number;
}

export interface EvaluationResult {
  decisaoFinal: DecisaoFinal;
  justificativaDecisao: string;
  pontuacaoGlobal: number;
  categorias: CategoryScores;
  pontosFortes: string[];
  aspetosAMelhorar: string[];
  planoTreino: string[];
}

export interface SavedInterviewRecord {
  id: string;
  timestamp: number;
  nome: string;
  area: string;
  empresa: string;
  nivel: NivelExigencia;
  numPerguntas: number;
  pontuacaoGlobal: number;
  decisaoFinal: DecisaoFinal;
  categorias: CategoryScores;
  justificativaDecisao?: string;
  pontosFortes?: string[];
  aspetosAMelhorar: string[];
  planoTreino?: string[];
  history?: HistoryItem[];
}

export interface Contacto {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargoArea: string;
  empresa: string;
  notas?: string;
  dataCriacao: number;
}

export interface UserAccount {
  id: string;
  nome: string;
  email: string;
  cargoRole: string;
  pin: string;
  dataCriacao: number;
}

export interface Agendamento {
  id: string;
  candidatoNome: string;
  candidatoEmail: string;
  candidatoTelefone?: string;
  area: string;
  empresa: string;
  nivel: NivelExigencia;
  dataHora: string;
  notificado: boolean;
  notificadoEmail?: boolean;
  notificadoSMS?: boolean;
  dataNotificacao?: number;
  dataCriacao: number;
  status: "pendente" | "concluida" | "cancelada";
}

