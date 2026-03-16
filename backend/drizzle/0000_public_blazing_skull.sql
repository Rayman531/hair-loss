CREATE TABLE "onboarding_options" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"option_text" text NOT NULL,
	"option_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_options_question_id_option_order_unique" UNIQUE("question_id","option_order")
);
--> statement-breakpoint
CREATE TABLE "onboarding_questions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_text" text NOT NULL,
	"question_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_questions_question_order_unique" UNIQUE("question_order")
);
--> statement-breakpoint
CREATE TABLE "onboarding_responses" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "onboarding_responses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text,
	"session_id" text,
	"question_id" bigint NOT NULL,
	"option_id" bigint NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_sessions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "progress_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"note" text,
	"front_image_url" text NOT NULL,
	"top_image_url" text NOT NULL,
	"right_image_url" text NOT NULL,
	"left_image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "routines_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "routines_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "treatment_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "treatment_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"treatment_id" bigint NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "treatment_logs_treatment_date_unq" UNIQUE("treatment_id","date")
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "treatments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"routine_id" bigint NOT NULL,
	"name" text NOT NULL,
	"days_of_week" text[] DEFAULT '{}' NOT NULL,
	"frequency_per_week" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "feedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_options" ADD CONSTRAINT "onboarding_options_question_id_onboarding_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."onboarding_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_question_id_onboarding_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."onboarding_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_option_id_onboarding_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."onboarding_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_logs" ADD CONSTRAINT "treatment_logs_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "onboarding_option_question_id_idx" ON "onboarding_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "onboarding_response_question_id_idx" ON "onboarding_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "onboarding_response_option_id_idx" ON "onboarding_responses" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "progress_session_user_id_idx" ON "progress_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "treatment_logs_treatment_id_idx" ON "treatment_logs" USING btree ("treatment_id");--> statement-breakpoint
CREATE INDEX "treatment_logs_date_idx" ON "treatment_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "treatments_routine_id_idx" ON "treatments" USING btree ("routine_id");