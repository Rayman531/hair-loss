CREATE TYPE "public"."treatment_type" AS ENUM('minoxidil', 'finasteride', 'microneedling', 'ketoconazole', 'hair_oils');--> statement-breakpoint
CREATE TABLE "onboarding_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"option_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_options_question_id_option_order_unique" UNIQUE("question_id","option_order")
);
--> statement-breakpoint
CREATE TABLE "onboarding_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_text" text NOT NULL,
	"question_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_questions_question_order_unique" UNIQUE("question_order")
);
--> statement-breakpoint
CREATE TABLE "onboarding_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"question_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_routines" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"treatment_type" "treatment_type" NOT NULL,
	"time_of_day" text NOT NULL,
	"days_of_week" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_routines_user_id_treatment_type_unique" UNIQUE("user_id","treatment_type")
);
--> statement-breakpoint
CREATE TABLE "progress_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"note" text,
	"front_image_url" text NOT NULL,
	"top_image_url" text NOT NULL,
	"right_image_url" text NOT NULL,
	"left_image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "routines_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "side_effect_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "side_effect_logs_routine_week_unq" UNIQUE("routine_id","week_start_date")
);
--> statement-breakpoint
CREATE TABLE "treatment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"treatment_id" uuid NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "treatment_logs_treatment_date_unq" UNIQUE("treatment_id","date")
);
--> statement-breakpoint
CREATE TABLE "treatments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"name" text NOT NULL,
	"frequency_per_week" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_options" ADD CONSTRAINT "onboarding_options_question_id_onboarding_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."onboarding_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_question_id_onboarding_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."onboarding_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_responses" ADD CONSTRAINT "onboarding_responses_option_id_onboarding_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."onboarding_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "side_effect_logs" ADD CONSTRAINT "side_effect_logs_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_logs" ADD CONSTRAINT "treatment_logs_treatment_id_treatments_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "side_effect_logs_routine_id_idx" ON "side_effect_logs" USING btree ("routine_id");--> statement-breakpoint
CREATE INDEX "side_effect_logs_week_start_idx" ON "side_effect_logs" USING btree ("week_start_date");--> statement-breakpoint
CREATE INDEX "treatment_logs_treatment_id_idx" ON "treatment_logs" USING btree ("treatment_id");--> statement-breakpoint
CREATE INDEX "treatment_logs_date_idx" ON "treatment_logs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "treatments_routine_id_idx" ON "treatments" USING btree ("routine_id");