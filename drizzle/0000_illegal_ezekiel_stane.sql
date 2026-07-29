CREATE TABLE "agendamentos" (
	"id" text PRIMARY KEY NOT NULL,
	"candidato_nome" text NOT NULL,
	"candidato_email" text NOT NULL,
	"candidato_telefone" text,
	"area" text NOT NULL,
	"empresa" text NOT NULL,
	"nivel" text NOT NULL,
	"data_hora" text NOT NULL,
	"notificado" boolean DEFAULT false NOT NULL,
	"notificado_email" boolean DEFAULT false,
	"notificado_sms" boolean DEFAULT false,
	"data_notificacao" bigint,
	"data_criacao" bigint NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text NOT NULL,
	"cargo_area" text NOT NULL,
	"empresa" text NOT NULL,
	"notas" text,
	"data_criacao" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" bigint NOT NULL,
	"nome" text NOT NULL,
	"area" text NOT NULL,
	"empresa" text NOT NULL,
	"nivel" text NOT NULL,
	"num_perguntas" integer NOT NULL,
	"pontuacao_global" integer NOT NULL,
	"decisao_final" text NOT NULL,
	"categorias" jsonb,
	"justificativa_decisao" text,
	"pontos_fortes" jsonb,
	"aspetos_a_melhorar" jsonb,
	"plano_treino" jsonb,
	"history" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"cargo_role" text NOT NULL,
	"pin" text NOT NULL,
	"data_criacao" bigint NOT NULL
);
