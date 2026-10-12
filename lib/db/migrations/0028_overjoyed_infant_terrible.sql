CREATE TABLE "payment_terms" (
	"term_code" varchar(30) PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"net_days" integer NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"discount_days" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "payment_terms_net_days_positive" CHECK ("payment_terms"."net_days" > 0),
	CONSTRAINT "payment_terms_discount_percentage_valid" CHECK ("payment_terms"."discount_percentage" >= 0 AND "payment_terms"."discount_percentage" <= 100),
	CONSTRAINT "payment_terms_discount_days_valid" CHECK ("payment_terms"."discount_days" >= 0 AND "payment_terms"."discount_days" <= "payment_terms"."net_days")
);
