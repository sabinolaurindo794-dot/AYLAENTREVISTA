import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy init for Gemini SDK
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Next Question
app.post("/api/interview/next-question", async (req, res) => {
  try {
    const {
      personaKey,
      index,
      total,
      block,
      nivel,
      nome,
      area,
      empresa,
      vagaTexto,
      cvTexto,
      history = [],
      bancaMemoria = "",
      scoreHistory = [],
    } = req.body;

    const ai = getAI();

    const PERSONAS_DESC: Record<string, string> = {
      tecnico: "Técnico — avalia conhecimentos técnicos específicos da profissão e do setor, pede detalhes práticos, cenários e procedimentos concretos.",
      rh: "Recursos Humanos — avalia motivação, adequação à cultura organizacional, competências comportamentais, ética e trabalho em equipa.",
      executivo: "Executivo — faz perguntas estratégicas, de liderança, tomada de decisão, ética e simulações de pressão ou crise."
    };

    const NIVEIS_REGRAS: Record<string, string> = {
      facil: "Nível FÁCIL (Treino Inicial): Tom encorajador, paciente e didático. Perguntas claras e diretas. Se incompleta, peça detalhes com gentileza.",
      medio: "Nível MÉDIO (Intermédio): Equilibrado e realista. Perguntas moderadamente desafiantes. Pede exemplos concretos quando resposta for vaga.",
      dificil: "Nível DIFÍCIL (Professional Challenge): Banca altamente rigorosa. Exija exemplos concretos. Confrontar incoerências diretamente."
    };

    // Calculate dynamic difficulty adjustment based on recent scores
    let ajuste = "";
    if (scoreHistory.length > 0) {
      const recent = scoreHistory.slice(-3);
      const averages = recent.map((s: any) => {
        const vals = Object.values(s).filter((v): v is number => typeof v === "number");
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
      });
      const avg = averages.reduce((a, b) => a + b, 0) / averages.length;
      if (avg >= 8) {
        ajuste = "O candidato tem mostrado um desempenho forte nas últimas respostas — aumente a exigência da próxima pergunta.";
      } else if (avg <= 4) {
        ajuste = "O candidato tem mostrado dificuldades nas últimas respostas — seja um pouco mais orientador, mas exija clareza.";
      }
    }

    const vagaBlock = vagaTexto ? `\nANÚNCIO DA VAGA:\n"""\n${vagaTexto}\n"""\n` : "";
    const cvBlock = cvTexto ? `\nCURRÍCULO DO CANDIDATO:\n"""\n${cvTexto}\n"""\n` : "";

    const systemInstruction = `Tu és o(a) Entrevistador(a) ${personaKey.toUpperCase()} de uma banca profissional de recrutamento em Angola no simulador AYLAENTREVISTA.

EXIGÊNCIAS DE LÍNGUA PORTUGUESA (OBRIGATÓRIO):
- Escreve num Português límpido, gramaticalmente correto, elegante e profissional (variante de Angola / Português padrão).
- Garante acentuação rigorosa, concordância verbal/nominal perfeita e pontuação natural.
- Formula perguntas claras, fluidas e estruturadas, sem cacofonias, sem vícios de linguagem e sem erros sintáticos.

NÍVEL DE EXIGÊNCIA: ${nivel.toUpperCase()}
${NIVEIS_REGRAS[nivel] || NIVEIS_REGRAS.medio}
Foco da persona: ${PERSONAS_DESC[personaKey] || PERSONAS_DESC.tecnico}
${ajuste ? "AJUSTE DINÂMICO: " + ajuste : ""}

MEMÓRIA ACUMULADA DA BANCA (notas internas sobre o candidato):
${bancaMemoria || "(Sem notas anteriores — esta é a primeira pergunta)"}
${vagaBlock}${cvBlock}
CONTEXTO DA ENTREVISTA:
- Candidato(a): ${nome || "Candidato(a)"}
- Área/Setor: ${area || "Geral"}
- Empresa/Instituição de Referência: ${empresa || "Empresa privada"}
- Pergunta atual: ${index + 1} de ${total}
- Bloco temático: ${block || "Conhecimento Geral"}

ORIENTAÇÕES ESPECÍFICAS:
1. Avalia a resposta anterior do candidato (se existir): verifica a clareza, a coerência com o currículo/anúncio e a correção da linguagem. Atribua notas de 0 a 10 (clareza, comunicacao, lideranca, conhecimentoTecnico, confianca).
2. Atualiza a "notaBanca" com observações sintéticas e objetivas.
3. Formula a próxima pergunta de forma direta, cortês e profissional, sem aspas, numeração nem chavões informais.`;

    const contents = history.map((h: any) => [
      { role: "user", parts: [{ text: `Pergunta anterior: ${h.question}` }] },
      { role: "user", parts: [{ text: `Resposta do candidato: ${h.answer}` }] }
    ]).flat();

    contents.push({
      role: "user",
      parts: [{ text: `Formule a pergunta ${index + 1} de ${total} (${block}) para a persona ${personaKey}.` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            avaliacaoRespostaAnterior: {
              type: Type.OBJECT,
              properties: {
                vaga: { type: Type.BOOLEAN },
                incoerente: { type: Type.BOOLEAN },
                notaIncoerencia: { type: Type.STRING },
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    clareza: { type: Type.NUMBER },
                    comunicacao: { type: Type.NUMBER },
                    lideranca: { type: Type.NUMBER },
                    conhecimentoTecnico: { type: Type.NUMBER },
                    confianca: { type: Type.NUMBER }
                  },
                  required: ["clareza", "comunicacao", "lideranca", "conhecimentoTecnico", "confianca"]
                }
              },
              required: ["vaga", "incoerente", "notaIncoerencia", "scores"]
            },
            notaBanca: { type: Type.STRING },
            pergunta: { type: Type.STRING }
          },
          required: ["notaBanca", "pergunta"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in next-question API:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar próxima pergunta" });
  }
});

// API: Evaluate Interview
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const {
      nivel,
      nome,
      area,
      empresa,
      vagaTexto,
      cvTexto,
      history = [],
      bancaMemoria = ""
    } = req.body;

    const ai = getAI();

    const vagaBlock = vagaTexto ? `\nANÚNCIO DA VAGA:\n"""\n${vagaTexto}\n"""\n` : "";
    const cvBlock = cvTexto ? `\nCURRÍCULO DO CANDIDATO:\n"""\n${cvTexto}\n"""\n` : "";

    const systemInstruction = `Tu és o painel de avaliação final da banca profissional de recrutamento no simulador AYLAENTREVISTA.

EXIGÊNCIAS LINGUÍSTICAS E ESTILÍSTICAS (OBRIGATÓRIO):
- Toda a análise, parecer, justificativa e plano de treino devem ser redigidos em Português padrão / Português de Angola de nível exemplar.
- Aplica acentuação rigorosa, vocabulário corporativo adequado, excelente coesão textual e pontuação impecável.
- Evita erros ortográficos, frases truncadas, construções gramaticais duvidosas ou tradução literal de termos estrangeiros.

Nível da entrevista: ${nivel}
MEMÓRIA ACUMULADA DA BANCA:
${bancaMemoria}
${vagaBlock}${cvBlock}

Com base na transcrição completa da entrevista de ${nome || "Candidato(a)"} (${area}, ${empresa}), elabora um relatório detalhado de avaliação.
Seja rigoroso, imparcial, construtivo e profundamente profissional.`;

    const transcriptText = history.map((h: any, i: number) => 
      `Pergunta ${i + 1} (${h.persona}): ${h.question}\nResposta: ${h.answer}`
    ).join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analise a transcrição completa da entrevista:\n\n${transcriptText}\n\nGere o parecer final em JSON.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decisaoFinal: { 
              type: Type.STRING, 
              description: "Deve ser um dos seguintes valores: CONTRATADO, NAO_SELECIONADO, ou LISTA_ESPERA" 
            },
            justificativaDecisao: { type: Type.STRING },
            pontuacaoGlobal: { type: Type.INTEGER },
            categorias: {
              type: Type.OBJECT,
              properties: {
                comunicacaoVerbal: { type: Type.NUMBER },
                clarezaRespostas: { type: Type.NUMBER },
                organizacaoIdeias: { type: Type.NUMBER },
                argumentacao: { type: Type.NUMBER },
                conhecimentoTecnico: { type: Type.NUMBER },
                segurancaConfianca: { type: Type.NUMBER },
                resolucaoProblemas: { type: Type.NUMBER },
                lideranca: { type: Type.NUMBER },
                eticaProfissional: { type: Type.NUMBER },
                inteligenciaEmocional: { type: Type.NUMBER },
                gestaoPressao: { type: Type.NUMBER },
                pensamentoCritico: { type: Type.NUMBER },
                capacidadeAnalitica: { type: Type.NUMBER }
              },
              required: [
                "comunicacaoVerbal", "clarezaRespostas", "organizacaoIdeias", "argumentacao",
                "conhecimentoTecnico", "segurancaConfianca", "resolucaoProblemas", "lideranca",
                "eticaProfissional", "inteligenciaEmocional", "gestaoPressao", "pensamentoCritico", "capacidadeAnalitica"
              ]
            },
            pontosFortes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            aspetosAMelhorar: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            planoTreino: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["decisaoFinal", "justificativaDecisao", "pontuacaoGlobal", "categorias", "pontosFortes", "aspetosAMelhorar", "planoTreino"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in evaluate API:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar avaliação final" });
  }
});

// Vite middleware or static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AYLAENTREVISTA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
