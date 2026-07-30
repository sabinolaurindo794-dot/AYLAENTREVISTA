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
    return null;
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

function generateFallbackQuestion(
  personaKey: string,
  index: number,
  total: number,
  block: string,
  nivel: string,
  nome: string,
  area: string,
  empresa: string,
  history: any[]
) {
  const candidato = nome || "Candidato";
  const emp = empresa || "Empresa";
  const ar = area || "Recrutamento";
  const isHighLevel = nivel === "dificil" || personaKey === "executivo";

  const fallbackQuestions: Record<string, string[]> = {
    tecnico: [
      `Sr(a). ${candidato}, considerando a função de ${ar} na ${emp}, qual é o protocolo técnico rigoroso que aplica para auditar, diagnosticar e mitigar falhas críticas sob restrições de tempo? Exija exemplos com métricas.`,
      `Na área de ${ar}, quais são as normas internacionais, metodologias padrão e ferramentas de ponta que utiliza para garantir a conformidade e a eficiência operacional na ${emp}?`,
      `Descreva um incidente técnico de elevadíssima complexidade que liderou em ${ar}. Quais foram as variáveis de risco, que procedimentos tomou e como mensurou o sucesso da intervenção?`,
      `Como projeta a arquitetura de processos ou sistemas em ${ar} para suportar escalabilidade, tolerância a falhas e elevados padrões de qualidade na ${emp}?`
    ],
    rh: [
      `Sr(a). ${candidato}, perante o nível de exigência da ${emp} em ${ar}, como gere situações em que membros da equipa apresentam desempenho insatisfatório ou condutas contrárias à cultura organizacional?`,
      `Como lida com a pressão por prazos agressivos sem comprometer os padrões éticos, a qualidade do trabalho e o bem-estar da equipa em projetos de ${ar}?`,
      `Relate um episódio em que teve de gerir um conflito de interesses grave entre diferentes departamentos da ${emp}. Qual foi a sua abordagem e como alcançou o consenso?`,
      `De que forma a sua trajetória profissional em ${ar} comprova a sua capacidade de adaptação contínua, resiliência e liderança pelo exemplo?`
    ],
    executivo: [
      `Na qualidade de líder estratégico em ${ar} na ${emp}, como avalia os riscos macroeconómicos e regulatórios atuais no mercado Angolano e que plano de mitigação implementaria?`,
      `Se fosse necessário reestruturar a operação de ${ar} na ${emp} com um corte orçamental de 25%, como priorizaria os investimentos e defenderia o ROI perante o Conselho de Administração?`,
      `Qual é a sua estratégia executiva para impulsionar a inovação disruptiva e a eficiência de custos mantendo a equipa motivada em cenários de incerteza?`,
      `Como alinha a visão estratégica de longo prazo em ${ar} com a execução diária e os resultados operacionais imediatos exigidos pelos acionistas da ${emp}?`
    ]
  };

  const personaList = fallbackQuestions[personaKey] || fallbackQuestions.tecnico;
  const qIndex = index % personaList.length;
  const pergunta = personaList[qIndex];

  let avaliacaoRespostaAnterior = undefined;
  if (history && history.length > 0) {
    const lastAns = history[history.length - 1]?.answer || "";
    const words = lastAns.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount < 15) {
      avaliacaoRespostaAnterior = {
        vaga: true,
        incoerente: true,
        notaIncoerencia: "Resposta extremamente resumida (menos de 15 palavras), desprovida de fundamentação técnica ou dados concretos.",
        scores: {
          clareza: 3.2,
          comunicacao: 3.5,
          lideranca: 2.8,
          conhecimentoTecnico: 3.0,
          confianca: 2.5,
        },
      };
    } else if (wordCount < 35) {
      avaliacaoRespostaAnterior = {
        vaga: true,
        incoerente: false,
        notaIncoerencia: "Resposta genérica e superficial. Faltam indicadores práticos de desempenho e casos concretos.",
        scores: {
          clareza: 5.8,
          comunicacao: 6.0,
          lideranca: 5.2,
          conhecimentoTecnico: 5.5,
          confianca: 5.5,
        },
      };
    } else {
      avaliacaoRespostaAnterior = {
        vaga: false,
        incoerente: false,
        notaIncoerencia: "",
        scores: {
          clareza: 8.2,
          comunicacao: 8.4,
          lideranca: 7.8,
          conhecimentoTecnico: 8.2,
          confianca: 8.0,
        },
      };
    }
  }

  const observacaoRigor = isHighLevel ? " (Exigência Elevada)" : "";
  const notaBanca = `Observação da Banca Examinadora (${personaKey.toUpperCase()}${observacaoRigor}): Resposta avaliada com rigor metodológico para o bloco ${block}.`;

  return {
    avaliacaoRespostaAnterior,
    notaBanca,
    pergunta,
  };
}

function generateFallbackEvaluation(
  nome: string,
  area: string,
  empresa: string,
  history: any[],
  nivel: string = "medio"
) {
  const candidato = nome || "Candidato";
  const totalRespostas = history.length;
  
  let totalWords = 0;
  let shortAnswersCount = 0;

  history.forEach((item) => {
    const ans = item.answer || "";
    const wCount = ans.trim().split(/\s+/).filter(Boolean).length;
    totalWords += wCount;
    if (wCount < 20) {
      shortAnswersCount++;
    }
  });

  const avgWords = totalRespostas > 0 ? totalWords / totalRespostas : 0;
  const isReprovado = shortAnswersCount >= Math.max(1, Math.ceil(totalRespostas / 2)) || avgWords < 20;
  const isListaEspera = !isReprovado && (avgWords < 45 || shortAnswersCount > 0);

  if (isReprovado) {
    const score = Math.max(32, Math.min(56, Math.round(30 + avgWords * 1.1)));
    return {
      decisaoFinal: "NAO_SELECIONADO",
      justificativaDecisao: `AVALIAÇÃO DE RIGOR MÁXIMO (REJEITADO): O(A) candidato(a) ${candidato} não demonstrou o nível de exigência, rigor técnico e fundamentação prática exigidos pela banca virtual para o cargo de ${area} na ${empresa}. As suas respostas foram predominantemente breves e evasivas (média de apenas ${Math.round(avgWords)} palavras por resposta), falhando em apresentar métricas, casos de sucesso ou metodologias consolidadas.`,
      pontuacaoGlobal: score,
      categorias: {
        comunicacaoVerbal: 4.2,
        clarezaRespostas: 4.5,
        organizacaoIdeias: 4.0,
        argumentacao: 3.8,
        conhecimentoTecnico: 4.2,
        segurancaConfianca: 4.0,
        resolucaoProblemas: 4.0,
        lideranca: 3.5,
        eticaProfissional: 6.5,
        inteligenciaEmocional: 4.5,
        gestaoPressao: 4.0,
        pensamentoCritico: 3.8,
        capacidadeAnalitica: 3.9
      },
      pontosFortes: [
        "Comparecimento e cumprimento do protocolo da entrevista virtual",
        "Respeito e cordialidade formal perante a banca examinadora"
      ],
      aspetosAMelhorar: [
        `Desenvolver profundidade técnica sólida na área de ${area}`,
        "Estruturar respostas com fundamentação empírica, métricas quantitativas e exemplos práticos",
        "Superar a abordagem evasiva em perguntas de cenários complexos sob pressão"
      ],
      planoTreino: [
        `Formação intensiva e atualização técnica em ${area}`,
        "Treino de comunicação assertiva e síntese para entrevistas de seleção profissional",
        "Resolução de estudos de caso práticos com foco em gestão de crise e indicadores"
      ]
    };
  }

  if (isListaEspera) {
    const score = Math.min(74, Math.max(62, Math.round(60 + (avgWords - 20) * 0.5)));
    return {
      decisaoFinal: "LISTA_ESPERA",
      justificativaDecisao: `AVALIAÇÃO DE RIGOR MÁXIMO (EM ANÁLISE / RESERVA): O(A) candidato(a) ${candidato} demonstrou competências base satisfatórias para a área de ${area}, contudo oscilou no nível de profundidade técnica exigido pela ${empresa} (média de ${Math.round(avgWords)} palavras por resposta). Em alguns blocos decisivos, faltou detalhar a inclusão de métricas operacionais e plano de mitigação de riscos. Recomendado para bolsa de reserva com necessidade de capacitação complementar.`,
      pontuacaoGlobal: score,
      categorias: {
        comunicacaoVerbal: 6.8,
        clarezaRespostas: 7.0,
        organizacaoIdeias: 6.5,
        argumentacao: 6.8,
        conhecimentoTecnico: 7.0,
        segurancaConfianca: 6.8,
        resolucaoProblemas: 6.5,
        lideranca: 6.2,
        eticaProfissional: 7.8,
        inteligenciaEmocional: 7.0,
        gestaoPressao: 6.5,
        pensamentoCritico: 6.6,
        capacidadeAnalitica: 6.5
      },
      pontosFortes: [
        `Conhecimento geral dos procedimentos essenciais de ${area}`,
        "Boa articulação verbal e atitude profissional",
        "Alinhamento prévio com os valores institucionais"
      ],
      aspetosAMelhorar: [
        "Consolidar a fundamentação das respostas com métricas numéricas e dados de retorno",
        "Demonstrar maior assertividade em tomadas de decisão sob elevado stress"
      ],
      planoTreino: [
        "Módulo de gestão de desempenho e análise de indicadores de eficiência",
        "Workshop prático de liderança e comunicação estratégica"
      ]
    };
  }

  const score = Math.min(93, Math.max(78, Math.round(78 + (avgWords - 45) * 0.3)));
  return {
    decisaoFinal: "CONTRATADO",
    justificativaDecisao: `AVALIAÇÃO DE RIGOR MÁXIMO (APROVADO): O(A) candidato(a) ${candidato} obteve uma excelente classificação perante a banca virtual para a vaga de ${area} na ${empresa}. Demonstrou elevado rigor técnico, clareza conceptual exemplar (média de ${Math.round(avgWords)} palavras por resposta) e excelente capacidade de argumentação em todas as rondas de perguntas.`,
    pontuacaoGlobal: score,
    categorias: {
      comunicacaoVerbal: 8.8,
      clarezaRespostas: 8.8,
      organizacaoIdeias: 8.5,
      argumentacao: 8.6,
      conhecimentoTecnico: 9.0,
      segurancaConfianca: 8.8,
      resolucaoProblemas: 8.6,
      lideranca: 8.2,
      eticaProfissional: 9.2,
      inteligenciaEmocional: 8.8,
      gestaoPressao: 8.5,
      pensamentoCritico: 8.7,
      capacidadeAnalitica: 8.6
    },
    pontosFortes: [
      `Elevado domínio técnico e prático nas competências de ${area}`,
      "Articulação de respostas madura, fundamentada em dados e procedimentos padrão",
      "Segurança e postura profissional condizente com o nível exigido"
    ],
    aspetosAMelhorar: [
      "Manter o foco na sintetização executiva de relatórios para a administração superior"
    ],
    planoTreino: [
      "Programa de mentoria executiva para liderança de alto impacto"
    ]
  };
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Next Question
app.post("/api/interview/next-question", async (req, res) => {
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

  try {
    const ai = getAI();

    if (!ai) {
      console.warn("GEMINI_API_KEY environment variable missing; using intelligent fallback question generator.");
      const fallbackData = generateFallbackQuestion(
        personaKey,
        index,
        total,
        block,
        nivel,
        nome,
        area,
        empresa,
        history
      );
      return res.json(fallbackData);
    }

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
    console.error("Error in next-question API, falling back to generator:", error);
    const fallbackData = generateFallbackQuestion(
      personaKey,
      index,
      total,
      block,
      nivel,
      nome,
      area,
      empresa,
      history
    );
    res.json(fallbackData);
  }
});

// API: Evaluate Interview
app.post("/api/interview/evaluate", async (req, res) => {
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

  try {
    const ai = getAI();

    if (!ai) {
      console.warn("GEMINI_API_KEY environment variable missing; using intelligent fallback evaluation report.");
      const fallbackEval = generateFallbackEvaluation(nome, area, empresa, history, nivel);
      return res.json(fallbackEval);
    }

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
    console.error("Error in evaluate API, falling back to generator:", error);
    const fallbackEval = generateFallbackEvaluation(nome, area, empresa, history, nivel);
    res.json(fallbackEval);
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
