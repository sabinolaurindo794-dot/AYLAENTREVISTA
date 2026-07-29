import { pgTable, text, integer, boolean, jsonb, bigint } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  cargoRole: text("cargo_role").notNull(),
  pin: text("pin").notNull(),
  dataCriacao: bigint("data_criacao", { mode: "number" }).notNull(),
});

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefone: text("telefone").notNull(),
  cargoArea: text("cargo_area").notNull(),
  empresa: text("empresa").notNull(),
  notas: text("notas"),
  dataCriacao: bigint("data_criacao", { mode: "number" }).notNull(),
});

export const agendamentos = pgTable("agendamentos", {
  id: text("id").primaryKey(),
  candidatoNome: text("candidato_nome").notNull(),
  candidatoEmail: text("candidato_email").notNull(),
  candidatoTelefone: text("candidato_telefone"),
  area: text("area").notNull(),
  empresa: text("empresa").notNull(),
  nivel: text("nivel").notNull(),
  dataHora: text("data_hora").notNull(),
  notificado: boolean("notificado").default(false).notNull(),
  notificadoEmail: boolean("notificado_email").default(false),
  notificadoSMS: boolean("notificado_sms").default(false),
  dataNotificacao: bigint("data_notificacao", { mode: "number" }),
  dataCriacao: bigint("data_criacao", { mode: "number" }).notNull(),
  status: text("status").notNull().default("pendente"),
});

export const interviews = pgTable("interviews", {
  id: text("id").primaryKey(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  nome: text("nome").notNull(),
  area: text("area").notNull(),
  empresa: text("empresa").notNull(),
  nivel: text("nivel").notNull(),
  numPerguntas: integer("num_perguntas").notNull(),
  pontuacaoGlobal: integer("pontuacao_global").notNull(),
  decisaoFinal: text("decisao_final").notNull(),
  categorias: jsonb("categorias"),
  justificativaDecisao: text("justificativa_decisao"),
  pontosFortes: jsonb("pontos_fortes"),
  aspetosAMelhorar: jsonb("aspetos_a_melhorar"),
  planoTreino: jsonb("plano_treino"),
  history: jsonb("history"),
});
