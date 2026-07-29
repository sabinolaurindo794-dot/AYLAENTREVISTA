import { PersonaInfo, NivelInfo, PersonaKey, NivelExigencia } from "../types";

export const AREAS: string[] = [
  "Administração Pública",
  "Agricultura",
  "Petróleo e Gás",
  "Minas",
  "Bancos",
  "Seguros",
  "Telecomunicações",
  "Educação",
  "Saúde",
  "Farmácia",
  "Engenharia Civil",
  "Engenharia Mecânica",
  "Engenharia Elétrica",
  "Engenharia Informática",
  "Programação",
  "Inteligência Artificial",
  "Recursos Humanos",
  "Contabilidade",
  "Auditoria",
  "Finanças",
  "Economia",
  "Direito",
  "Comunicação Social",
  "Jornalismo",
  "Marketing",
  "Atendimento ao Cliente",
  "Logística",
  "Compras",
  "Gestão",
  "Comércio",
  "Hotelaria",
  "Turismo",
  "Aviação",
  "Construção Civil",
  "Segurança Industrial",
  "HSE",
  "Polícia",
  "Forças Armadas",
  "ONG",
  "Organizações Internacionais",
  "Empresas privadas",
  "Multinacionais",
  "Startups"
];

export const EMPRESAS: string[] = [
  "Genérico (empresa privada comum)",
  "Sonangol",
  "Chevron",
  "TotalEnergies",
  "ExxonMobil",
  "Banco Nacional de Angola",
  "Banco Angolano de Investimentos",
  "Banco Millennium Atlântico",
  "Administração Geral Tributária",
  "Tribunal Supremo",
  "Procuradoria-Geral da República",
  "Ministério da Agricultura",
  "Ministério dos Recursos Minerais, Petróleo e Gás",
  "Ministério das Finanças",
  "Administração Pública",
  "TAAG",
  "Unitel",
  "Africell",
  "Endiama",
  "Catoca"
];

export const EMPRESA_CONTEXTOS: Record<string, string> = {
  "Sonangol": "conhecimento do setor petrolífero angolano, exploração e produção (upstream/downstream), conteúdo local, relação com parceiros internacionais, ética em contratos públicos, segurança industrial.",
  "Chevron": "operações internacionais de petróleo e gás, normas HSE rigorosas, trabalho em equipas multiculturais, compliance internacional.",
  "TotalEnergies": "transição energética, operações offshore, sustentabilidade, normas internacionais de segurança e compliance.",
  "ExxonMobil": "rigor técnico e operacional, segurança industrial, ética corporativa, ambiente multinacional.",
  "Banco Nacional de Angola": "política monetária, supervisão do sistema financeiro, integridade e combate ao branqueamento de capitais, regulação bancária.",
  "Banco Angolano de Investimentos": "produtos e serviços bancários, atendimento ao cliente, gestão de risco de crédito, compliance.",
  "Banco Millennium Atlântico": "atendimento ao cliente, banca digital, vendas de produtos financeiros, compliance.",
  "Administração Geral Tributária": "fiscalidade, cumprimento de obrigações tributárias, atendimento ao contribuinte, ética no serviço público.",
  "Tribunal Supremo": "conhecimento jurídico, imparcialidade, ética judicial, rigor processual.",
  "Procuradoria-Geral da República": "ética jurídica, ministério público, investigação criminal, integridade.",
  "Ministério da Agricultura": "políticas agrícolas, desenvolvimento rural, segurança alimentar, extensão rural.",
  "Ministério dos Recursos Minerais, Petróleo e Gás": "regulação do setor extrativo, política energética e mineira, sustentabilidade.",
  "Ministério das Finanças": "gestão orçamental do Estado, política fiscal, execução orçamental.",
  "Administração Pública": "ética no serviço público, atendimento ao cidadão, eficiência administrativa.",
  "TAAG": "aviação comercial, segurança operacional, atendimento a clientes internacionais, pontualidade.",
  "Unitel": "telecomunicações, inovação, atendimento ao cliente, concorrência de mercado.",
  "Africell": "telecomunicações, expansão de mercado, atendimento ao cliente, marketing digital.",
  "Endiama": "mineração de diamantes, sustentabilidade, segurança industrial, gestão de concessões.",
  "Catoca": "extração diamantífera, segurança industrial, responsabilidade social, operações de grande escala."
};

export const BLOCOS: string[] = [
  "Apresentação pessoal",
  "Formação académica",
  "Experiência profissional",
  "Competências técnicas",
  "Competências comportamentais",
  "Situações reais (estudo de caso)",
  "Resolução de problemas",
  "Ética e integridade",
  "Trabalho em equipa",
  "Liderança",
  "Gestão de conflitos",
  "Comunicação",
  "Gestão do tempo",
  "Conhecimento da empresa/instituição",
  "Conhecimento do setor",
  "Pergunta inesperada",
  "Pergunta de pressão",
  "Simulação de crise",
  "Teste de raciocínio",
  "Pergunta final"
];

export const PERSONAS: Record<PersonaKey, PersonaInfo> = {
  tecnico: {
    label: "Técnico",
    tab: "tab-tecnico",
    color: "#c8a24d",
    initials: "T",
    desc: "avalia conhecimentos técnicos específicos da profissão e do setor, pede detalhes práticos, cenários e procedimentos concretos."
  },
  rh: {
    label: "Recursos Humanos",
    tab: "tab-rh",
    color: "#6f9b7a",
    initials: "RH",
    desc: "avalia motivação, adequação à cultura organizacional, competências comportamentais, ética e trabalho em equipa."
  },
  executivo: {
    label: "Executivo",
    tab: "tab-executivo",
    color: "#d6603f",
    initials: "E",
    desc: "faz perguntas estratégicas, de liderança, tomada de decisão, ética e simulações de pressão ou crise."
  }
};

export const NIVEIS: Record<NivelExigencia, NivelInfo> = {
  facil: {
    label: "Fácil",
    stamp: "Nível Fácil",
    regras: "- Este é um nível de TREINO INICIAL. Tom encorajador, paciente e didático, como um mentor.\n- Perguntas claras, diretas e previsíveis.\n- Pede gentilmente mais detalhes se a resposta for vaga."
  },
  medio: {
    label: "Médio",
    stamp: "Nível Médio",
    regras: "- Nível INTERMÉDIO, equilibrado e realista.\n- Perguntas moderadamente desafiantes.\n- Pede exemplos concretos se a resposta for vaga."
  },
  dificil: {
    label: "Difícil",
    stamp: "Nível Difícil",
    regras: "- Nível DIFÍCIL (Professional Challenge) — o mais exigente, tal como uma banca real e rigorosa.\n- Perguntas diretas, desconfortáveis e simulações de pressão.\n- Exige exemplos concretos e confronta contradições."
  }
};

export const MIN_PALAVRAS: Record<NivelExigencia, number> = {
  facil: 8,
  medio: 15,
  dificil: 25
};

export const LIVE_DIMS: [string, string][] = [
  ["clareza", "Clareza"],
  ["comunicacao", "Comunicação"],
  ["lideranca", "Liderança"],
  ["conhecimentoTecnico", "Conhecimento técnico"],
  ["confianca", "Confiança"]
];

export const CATEGORY_LABELS: Record<string, string> = {
  comunicacaoVerbal: "Comunicação verbal",
  clarezaRespostas: "Clareza das respostas",
  organizacaoIdeias: "Organização das ideias",
  argumentacao: "Argumentação",
  conhecimentoTecnico: "Conhecimento técnico",
  segurancaConfianca: "Segurança e confiança",
  resolucaoProblemas: "Resolução de problemas",
  lideranca: "Liderança",
  eticaProfissional: "Ética profissional",
  inteligenciaEmocional: "Inteligência emocional",
  gestaoPressao: "Gestão de pressão",
  pensamentoCritico: "Pensamento crítico",
  capacidadeAnalitica: "Capacidade analítica"
};

export const STOPWORDS = new Set([
  "de","da","do","das","dos","a","o","as","os","e","em","um","uma","uns","umas","para","com",
  "que","não","mais","como","foi","ser","sua","seu","suas","seus","na","no","nas","nos","por","ao","às","aos","é",
  "ou","se","muito","pouco","candidato","candidata","durante","entrevista","houve","tem","têm","foram","este","esta",
  "estes","estas","isso","isto","sobre","pode","podia","deve","deveria","ainda","também","quando"
]);
