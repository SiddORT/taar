CREATE TABLE "trading_product_colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"color_name" varchar(100) NOT NULL,
	"hex_code" varchar(10) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trading_product_sizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"size_label" varchar(20) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_products" ADD COLUMN "has_colors" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trading_products" ADD COLUMN "has_sizes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trading_product_colors" ADD CONSTRAINT "trading_product_colors_product_id_trading_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."trading_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_product_sizes" ADD CONSTRAINT "trading_product_sizes_product_id_trading_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."trading_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tpc_product_id_idx" ON "trading_product_colors" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tpc_color_name_idx" ON "trading_product_colors" USING btree ("color_name");--> statement-breakpoint
CREATE INDEX "tps_product_id_idx" ON "trading_product_sizes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "tps_size_label_idx" ON "trading_product_sizes" USING btree ("size_label");--> statement-breakpoint
ALTER TABLE "trading_products" ADD CONSTRAINT "trading_products_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_products" ADD CONSTRAINT "trading_products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_products" ADD CONSTRAINT "trading_products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trading_products_has_colors_idx" ON "trading_products" USING btree ("has_colors");--> statement-breakpoint
CREATE INDEX "trading_products_has_sizes_idx" ON "trading_products" USING btree ("has_sizes");