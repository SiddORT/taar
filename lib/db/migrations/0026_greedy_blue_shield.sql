CREATE TABLE "trading_product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_path" varchar(500) NOT NULL,
	"original_name" varchar(255),
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trading_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_code" varchar(50) NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"category_id" integer NOT NULL,
	"description" text,
	"hsn_code" varchar(20),
	"gst_percentage" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" integer,
	"deleted_at" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	"updated_at" timestamp,
	CONSTRAINT "trading_products_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
ALTER TABLE "trading_product_images" ADD CONSTRAINT "trading_product_images_product_id_trading_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."trading_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_product_images" ADD CONSTRAINT "trading_product_images_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trading_product_images_product_id_idx" ON "trading_product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "trading_products_code_idx" ON "trading_products" USING btree ("product_code");--> statement-breakpoint
CREATE INDEX "trading_products_name_idx" ON "trading_products" USING btree ("product_name");--> statement-breakpoint
CREATE INDEX "trading_products_category_idx" ON "trading_products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "trading_products_is_active_idx" ON "trading_products" USING btree ("is_active");