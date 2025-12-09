ALTER TABLE "podcast_reservation" ADD COLUMN "client_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_reservation" ADD COLUMN "client_id" uuid NOT NULL;