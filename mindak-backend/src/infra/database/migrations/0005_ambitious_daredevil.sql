CREATE TABLE "podcast_form_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcast_theme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "podcast_form_question" ADD COLUMN "step_id" uuid;--> statement-breakpoint
ALTER TABLE "podcast_pack_offer" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD COLUMN "custom_theme" varchar(255);--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD COLUMN "podcast_description" text;--> statement-breakpoint
ALTER TABLE "podcast_form_question" ADD CONSTRAINT "podcast_form_question_step_id_podcast_form_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."podcast_form_step"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD CONSTRAINT "podcast_reservation_new_theme_id_podcast_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."podcast_theme"("id") ON DELETE no action ON UPDATE no action;