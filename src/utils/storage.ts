import { SavedInterviewRecord, EvaluationResult, NivelExigencia, HistoryItem } from "../types";
import { STOPWORDS } from "../data/constants";

const STORAGE_KEY = "aylaentrevista_records_v1";

export function getSavedInterviews(): SavedInterviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read interviews from localStorage:", e);
    return [];
  }
}

export function saveInterviewRecord(
  nome: string,
  area: string,
  empresa: string,
  nivel: NivelExigencia,
  numPerguntas: number,
  evalData: EvaluationResult,
  history?: HistoryItem[]
): SavedInterviewRecord {
  const records = getSavedInterviews();
  const newRecord: SavedInterviewRecord = {
    id: `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: Date.now(),
    nome,
    area,
    empresa,
    nivel,
    numPerguntas,
    pontuacaoGlobal: evalData.pontuacaoGlobal,
    decisaoFinal: evalData.decisaoFinal,
    categorias: evalData.categorias,
    justificativaDecisao: evalData.justificativaDecisao,
    pontosFortes: evalData.pontosFortes || [],
    aspetosAMelhorar: evalData.aspetosAMelhorar || [],
    planoTreino: evalData.planoTreino || [],
    history: history || [],
  };

  const updated = [newRecord, ...records];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save record to localStorage:", e);
  }
  return newRecord;
}

export function clearInterviewHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

export function extractFrequentWeakPoints(records: SavedInterviewRecord[]): [string, number][] {
  const freq: Record<string, number> = {};
  records.forEach((r) => {
    (r.aspetosAMelhorar || []).forEach((frase) => {
      frase
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, "")
        .split(/\s+/)
        .forEach((w) => {
          if (w.length < 4 || STOPWORDS.has(w)) return;
          freq[w] = (freq[w] || 0) + 1;
        });
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}
