CREATE TABLE "podcast_decor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(1024),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcast_form_question_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"value" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcast_form_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(255) NOT NULL,
	"field_name" varchar(255) NOT NULL,
	"question_type" varchar(50) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"help_text" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcast_form_question_field_name_unique" UNIQUE("field_name")
);
--> statement-breakpoint
CREATE TABLE "podcast_pack_offer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"duration_min" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcast_reservation_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_text" text,
	"answer_option_ids" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "podcast_reservation_answer_reservation_id_question_id_unique" UNIQUE("reservation_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "podcast_reservation_new" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"confirmation_id" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"duration_hours" integer NOT NULL,
	"timezone" varchar(100) DEFAULT 'Europe/Paris' NOT NULL,
	"decor_id" uuid,
	"pack_offer_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"notes" text,
	"metadata" jsonb,
	"total_price" numeric(10, 2) NOT NULL,
	"assigned_admin_id" uuid,
	"confirmed_by_admin_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	CONSTRAINT "podcast_reservation_new_confirmation_id_unique" UNIQUE("confirmation_id")
);
--> statement-breakpoint
CREATE TABLE "podcast_reservation_supplement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"supplement_id" uuid NOT NULL,
	"price_at_booking" numeric(10, 2) NOT NULL,
	CONSTRAINT "podcast_reservation_supplement_reservation_id_supplement_id_unique" UNIQUE("reservation_id","supplement_id")
);
--> statement-breakpoint
CREATE TABLE "podcast_supplement_service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "podcast_form_question_option" ADD CONSTRAINT "podcast_form_question_option_question_id_podcast_form_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."podcast_form_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_answer" ADD CONSTRAINT "podcast_reservation_answer_reservation_id_podcast_reservation_new_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."podcast_reservation_new"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_answer" ADD CONSTRAINT "podcast_reservation_answer_question_id_podcast_form_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."podcast_form_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD CONSTRAINT "podcast_reservation_new_decor_id_podcast_decor_id_fk" FOREIGN KEY ("decor_id") REFERENCES "public"."podcast_decor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD CONSTRAINT "podcast_reservation_new_pack_offer_id_podcast_pack_offer_id_fk" FOREIGN KEY ("pack_offer_id") REFERENCES "public"."podcast_pack_offer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD CONSTRAINT "podcast_reservation_new_assigned_admin_id_user_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_new" ADD CONSTRAINT "podcast_reservation_new_confirmed_by_admin_id_user_id_fk" FOREIGN KEY ("confirmed_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_supplement" ADD CONSTRAINT "podcast_reservation_supplement_reservation_id_podcast_reservation_new_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."podcast_reservation_new"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_reservation_supplement" ADD CONSTRAINT "podcast_reservation_supplement_supplement_id_podcast_supplement_service_id_fk" FOREIGN KEY ("supplement_id") REFERENCES "public"."podcast_supplement_service"("id") ON DELETE no action ON UPDATE no action;