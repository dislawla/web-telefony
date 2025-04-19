CREATE TABLE "telephony_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"api_key" varchar(255) NOT NULL,
	"incoming_routing" varchar(50) NOT NULL,
	"incoming_greeting" text NOT NULL,
	"incoming_wait_time" integer NOT NULL,
	"outgoing_phone" varchar(50) NOT NULL,
	"record_calls" boolean DEFAULT true,
	"analyze_conversations" boolean DEFAULT true,
	"transcription_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"company_name" text NOT NULL,
	"email" text,
	"phone" text,
	"name" text,
	"avatar_url" text,
	"avatar_position" jsonb,
	"avatar_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "telephony_settings" ADD CONSTRAINT "telephony_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;