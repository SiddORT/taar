-- Keep revocation atomic for every client writer (including imports and future APIs).
-- Changing identity never silently transfers an existing account.
CREATE OR REPLACE FUNCTION revoke_changed_client_access() RETURNS trigger AS $$
BEGIN
  IF (lower(trim(NEW.email)) IS DISTINCT FROM lower(trim(OLD.email)))
     OR (NEW.is_active = false AND OLD.is_active = true)
     OR (NEW.is_deleted = true AND OLD.is_deleted = false) THEN
    UPDATE client_accounts SET enabled=false,password_hash=NULL,must_change_password=false,
      temporary_expires_at=NULL,delivery_status=NULL,updated_at=now(),
      updated_by=COALESCE(NEW.updated_by,'system')
      WHERE client_id=NEW.id AND is_deleted=false;
    UPDATE client_sessions SET revoked_at=now(),updated_at=now(),updated_by=COALESCE(NEW.updated_by,'system')
      WHERE account_id IN (SELECT id FROM client_accounts WHERE client_id=NEW.id)
      AND revoked_at IS NULL AND is_deleted=false;
    UPDATE client_credentials SET consumed_at=now(),updated_at=now(),updated_by=COALESCE(NEW.updated_by,'system')
      WHERE account_id IN (SELECT id FROM client_accounts WHERE client_id=NEW.id)
      AND consumed_at IS NULL AND is_deleted=false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER clients_revoke_portal_access AFTER UPDATE OF email,is_active,is_deleted ON clients
  FOR EACH ROW EXECUTE FUNCTION revoke_changed_client_access();
--> statement-breakpoint
CREATE TABLE "client_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"email" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"temporary_expires_at" timestamp with time zone,
	"delivery_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp with time zone,
	"updated_by" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	CONSTRAINT "client_accounts_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "client_auth_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp with time zone,
	"updated_by" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text
);
--> statement-breakpoint
CREATE TABLE "client_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"kind" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp with time zone,
	"updated_by" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	CONSTRAINT "client_credentials_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "client_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"restricted" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp with time zone,
	"updated_by" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" text,
	CONSTRAINT "client_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "client_accounts" ADD CONSTRAINT "client_accounts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_credentials" ADD CONSTRAINT "client_credentials_account_id_client_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."client_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_sessions" ADD CONSTRAINT "client_sessions_account_id_client_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."client_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "client_accounts_email_unique" ON "client_accounts" USING btree ("email");