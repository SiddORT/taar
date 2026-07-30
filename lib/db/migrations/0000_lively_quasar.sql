CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"invite_token" text,
	"invite_token_expiry" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "hsn_master" (
	"id" serial PRIMARY KEY NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_percentage" text NOT NULL,
	"govt_description" text,
	"remarks" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "hsn_master_hsn_code_unique" UNIQUE("hsn_code")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fabric_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fabric_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "item_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "item_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "swatch_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "swatch_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "unit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unit_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "width_unit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "width_unit_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_code" text NOT NULL,
	"material_name" text,
	"item_type" text DEFAULT '' NOT NULL,
	"quality" text NOT NULL,
	"type" text,
	"color" text,
	"hex_code" text,
	"color_name" text NOT NULL,
	"size" text NOT NULL,
	"unit_price" text NOT NULL,
	"unit_type" text NOT NULL,
	"current_stock" text NOT NULL,
	"location_stocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_percent" text NOT NULL,
	"vendor" text,
	"location" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reorder_level" numeric(14, 3),
	"minimum_level" numeric(14, 3),
	"maximum_level" numeric(14, 3),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "materials_material_code_unique" UNIQUE("material_code")
);
--> statement-breakpoint
CREATE TABLE "fabrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"fabric_code" text NOT NULL,
	"fabric_type" text NOT NULL,
	"quality" text NOT NULL,
	"color" text,
	"hex_code" text,
	"color_name" text NOT NULL,
	"width" text NOT NULL,
	"height" text,
	"width_unit_type" text NOT NULL,
	"price_per_meter" text NOT NULL,
	"unit_type" text NOT NULL,
	"current_stock" text NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_percent" text NOT NULL,
	"vendor" text,
	"location" text,
	"location_stocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reorder_level" numeric(14, 3),
	"minimum_level" numeric(14, 3),
	"maximum_level" numeric(14, 3),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "fabrics_fabric_code_unique" UNIQUE("fabric_code")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"order_type" text NOT NULL,
	"client" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"assigned_to" text,
	"delivery_date" text,
	"remarks" text,
	"production_mode" text DEFAULT 'in-house' NOT NULL,
	"cost_status" text DEFAULT 'Pending' NOT NULL,
	"approval_status" text DEFAULT 'Pending' NOT NULL,
	"invoice_status" text DEFAULT 'Not Issued' NOT NULL,
	"invoice_number" text,
	"payment_status" text DEFAULT 'Unpaid' NOT NULL,
	"fabric" text,
	"swatch_length" text,
	"swatch_width" text,
	"quantity" text,
	"reference_swatch_id" text,
	"reference_style_id" text,
	"product" text,
	"pattern" text,
	"size_breakdown" text,
	"color_variants" text,
	"materials" text,
	"consumption" text,
	"artisan_assignment" text,
	"outsource_assignment" text,
	"artwork_hours" text,
	"artwork_rate" text,
	"artwork_feedback" text,
	"material_cost" text,
	"artisan_cost" text,
	"outsource_cost" text,
	"custom_charges" text,
	"total_cost" text,
	"client_comments" text,
	"share_link" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_code" text NOT NULL,
	"brand_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"alt_email" text,
	"contact_no" text NOT NULL,
	"alt_contact_no" text,
	"country" text,
	"country_of_origin" text,
	"has_gst" boolean DEFAULT false NOT NULL,
	"gst_no" text,
	"address1" text,
	"address2" text,
	"state" text,
	"city" text,
	"pincode" text,
	"addresses" jsonb,
	"invoice_currency" text DEFAULT 'INR',
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "clients_client_code_unique" UNIQUE("client_code")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_code" text NOT NULL,
	"brand_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text,
	"alt_email" text,
	"contact_no" text,
	"alt_contact_no" text,
	"country" text,
	"has_gst" boolean DEFAULT false NOT NULL,
	"gst_no" text,
	"bank_name" text,
	"account_no" text,
	"ifsc_code" text,
	"bank_accounts" jsonb,
	"address1" text,
	"address2" text,
	"pincode" text,
	"state" text,
	"city" text,
	"addresses" jsonb,
	"payment_attachments" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "vendors_vendor_code_unique" UNIQUE("vendor_code")
);
--> statement-breakpoint
CREATE TABLE "style_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "style_categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "swatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_code" text NOT NULL,
	"swatch_name" text NOT NULL,
	"client" text,
	"swatch_category" text,
	"fabric" text,
	"location" text,
	"swatch_date" text,
	"length" text,
	"width" text,
	"unit_type" text,
	"hours" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"color_name" text,
	"hex_code" text,
	"finish_type" text,
	"gsm" text,
	"wip_media" jsonb DEFAULT '[]'::jsonb,
	"final_media" jsonb DEFAULT '[]'::jsonb,
	"approval_status" text DEFAULT 'Pending' NOT NULL,
	"remarks" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "swatches_swatch_code_unique" UNIQUE("swatch_code")
);
--> statement-breakpoint
CREATE TABLE "styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"client" text NOT NULL,
	"style_no" text NOT NULL,
	"invoice_no" text,
	"description" text,
	"attach_link" text,
	"place_of_issue" text,
	"vendor_po_no" text,
	"shipping_date" text,
	"style_category" text NOT NULL,
	"reference_swatch_id" text,
	"wip_media" jsonb DEFAULT '[]'::jsonb,
	"final_media" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "packaging_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_code" text NOT NULL,
	"item_type" text,
	"item_name" text NOT NULL,
	"department" text,
	"size" text,
	"unit_type" text,
	"unit_price" numeric(12, 2),
	"current_stock" numeric(14, 3) DEFAULT '0',
	"vendor" text,
	"location" text,
	"reorder_level" numeric(14, 3),
	"minimum_level" numeric(14, 3),
	"maximum_level" numeric(14, 3),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "packaging_materials_item_code_unique" UNIQUE("item_code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "swatch_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"swatch_name" text NOT NULL,
	"client_id" text,
	"client_name" text,
	"is_chargeable" boolean DEFAULT false NOT NULL,
	"is_inhouse" boolean DEFAULT false NOT NULL,
	"quantity" text,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"order_status" text DEFAULT 'Draft' NOT NULL,
	"style_references" jsonb DEFAULT '[]'::jsonb,
	"swatch_references" jsonb DEFAULT '[]'::jsonb,
	"fabric_id" text,
	"fabric_name" text,
	"has_lining" boolean DEFAULT false NOT NULL,
	"lining_fabric_id" text,
	"lining_fabric_name" text,
	"unit_length" text,
	"unit_width" text,
	"unit_type" text,
	"order_issue_date" text,
	"delivery_date" text,
	"target_hours" text,
	"issued_to" text,
	"department" text,
	"description" text,
	"internal_notes" text,
	"client_instructions" text,
	"ref_docs" jsonb DEFAULT '[]'::jsonb,
	"ref_images" jsonb DEFAULT '[]'::jsonb,
	"wip_images" jsonb DEFAULT '[]'::jsonb,
	"final_images" jsonb DEFAULT '[]'::jsonb,
	"wip_videos" jsonb DEFAULT '[]'::jsonb,
	"final_videos" jsonb DEFAULT '[]'::jsonb,
	"actual_start_date" text,
	"actual_start_time" text,
	"tentative_delivery_date" text,
	"actual_completion_date" text,
	"actual_completion_time" text,
	"delay_reason" text,
	"cancel_reason" text,
	"approval_date" text,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"estimate" jsonb DEFAULT '[]'::jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "swatch_orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"artwork_code" text NOT NULL,
	"swatch_order_id" integer NOT NULL,
	"artwork_name" text NOT NULL,
	"unit_length" text,
	"unit_width" text,
	"unit_type" text,
	"artwork_created" text DEFAULT 'Inhouse' NOT NULL,
	"work_hours" text,
	"hourly_rate" text,
	"total_cost" text,
	"outsource_vendor_id" text,
	"outsource_vendor_name" text,
	"outsource_payment_date" text,
	"outsource_payment_amount" text,
	"outsource_payment_mode" text,
	"outsource_transaction_id" text,
	"outsource_payment_status" text,
	"feedback_status" text DEFAULT 'Pending' NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb,
	"ref_images" jsonb DEFAULT '[]'::jsonb,
	"wip_images" jsonb DEFAULT '[]'::jsonb,
	"final_images" jsonb DEFAULT '[]'::jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "artworks_artwork_code_unique" UNIQUE("artwork_code")
);
--> statement-breakpoint
CREATE TABLE "client_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_link_id" integer NOT NULL,
	"artwork_id" integer NOT NULL,
	"artwork_name" text NOT NULL,
	"decision" text NOT NULL,
	"comment" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"internal_note" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"token" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"hidden_images" jsonb DEFAULT '[]'::jsonb,
	"portal_title" text,
	"closed_threads" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "client_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "client_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_link_id" integer NOT NULL,
	"artwork_id" integer NOT NULL,
	"artwork_name" text NOT NULL,
	"sender" text NOT NULL,
	"message" text,
	"attachment" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artisan_timesheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"style_order_product_id" integer,
	"style_order_product_name" text,
	"no_of_artisans" integer DEFAULT 1 NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"shift_type" text DEFAULT 'regular' NOT NULL,
	"total_hours" text DEFAULT '0' NOT NULL,
	"hourly_rate" text DEFAULT '0' NOT NULL,
	"total_rate" text DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_change_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"bom_row_id" integer NOT NULL,
	"bom_type" text NOT NULL,
	"order_id" integer NOT NULL,
	"inventory_id" integer,
	"material_code" text NOT NULL,
	"material_name" text NOT NULL,
	"old_qty" text NOT NULL,
	"new_qty" text NOT NULL,
	"delta" text NOT NULL,
	"reservation_delta" text,
	"notes" text,
	"changed_by" text NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumption_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"style_order_product_id" integer,
	"style_order_product_name" text,
	"bom_row_id" integer NOT NULL,
	"material_code" text NOT NULL,
	"material_name" text NOT NULL,
	"material_type" text NOT NULL,
	"unit_type" text DEFAULT '' NOT NULL,
	"consumed_qty" text NOT NULL,
	"consumed_by" text NOT NULL,
	"consumed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"warehouse_location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "costing_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_name" text,
	"reference_type" text NOT NULL,
	"reference_id" integer NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"payment_type" text,
	"payment_mode" text,
	"payment_amount" numeric(12, 2) NOT NULL,
	"payment_status" text DEFAULT 'Pending',
	"transaction_id" text,
	"payment_date" timestamp with time zone,
	"remarks" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"style_order_product_id" integer,
	"style_order_product_name" text,
	"vendor_id" integer NOT NULL,
	"vendor_name" text NOT NULL,
	"hsn_id" integer NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_percentage" text DEFAULT '5' NOT NULL,
	"description" text NOT NULL,
	"unit_price" text DEFAULT '0' NOT NULL,
	"quantity" text DEFAULT '1' NOT NULL,
	"total_amount" text DEFAULT '0' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outsource_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"style_order_product_id" integer,
	"style_order_product_name" text,
	"vendor_id" integer NOT NULL,
	"vendor_name" text NOT NULL,
	"hsn_id" integer NOT NULL,
	"hsn_code" text NOT NULL,
	"gst_percentage" text DEFAULT '5' NOT NULL,
	"issue_date" text NOT NULL,
	"target_date" text,
	"delivery_date" text,
	"total_cost" text DEFAULT '0' NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pr_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pr_id" integer NOT NULL,
	"payment_type" text NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"payment_mode" text DEFAULT '' NOT NULL,
	"amount" text NOT NULL,
	"transaction_status" text DEFAULT '' NOT NULL,
	"payment_status" text DEFAULT 'Pending' NOT NULL,
	"attachment" jsonb DEFAULT 'null'::jsonb,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_number" text NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"reference_type" text DEFAULT 'Manual' NOT NULL,
	"reference_id" integer,
	"vendor_id" integer,
	"vendor_name" text,
	"po_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'Draft' NOT NULL,
	"notes" text,
	"bom_row_ids" jsonb DEFAULT '[]'::jsonb,
	"bom_items" jsonb DEFAULT '[]'::jsonb,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "purchase_orders_po_number_unique" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "purchase_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"pr_number" text NOT NULL,
	"po_id" integer NOT NULL,
	"bom_row_id" integer,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"vendor_name" text NOT NULL,
	"received_date" timestamp with time zone DEFAULT now() NOT NULL,
	"received_qty" text NOT NULL,
	"actual_price" text NOT NULL,
	"warehouse_location" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Open' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "purchase_receipts_pr_number_unique" UNIQUE("pr_number")
);
--> statement-breakpoint
CREATE TABLE "swatch_bom" (
	"id" serial PRIMARY KEY NOT NULL,
	"swatch_order_id" integer,
	"style_order_id" integer,
	"material_type" text NOT NULL,
	"material_id" integer NOT NULL,
	"material_code" text NOT NULL,
	"material_name" text NOT NULL,
	"current_stock" text DEFAULT '0' NOT NULL,
	"avg_unit_price" text DEFAULT '0' NOT NULL,
	"unit_type" text DEFAULT '' NOT NULL,
	"warehouse_location" text DEFAULT '' NOT NULL,
	"required_qty" text NOT NULL,
	"estimated_amount" text DEFAULT '0' NOT NULL,
	"consumed_qty" text DEFAULT '0' NOT NULL,
	"target_vendor_id" integer,
	"target_vendor_name" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_no" text NOT NULL,
	"invoice_direction" text DEFAULT 'Client',
	"invoice_type" text DEFAULT 'Final Invoice',
	"invoice_status" text DEFAULT 'Draft',
	"client_id" integer,
	"vendor_id" integer,
	"reference_type" text DEFAULT 'Manual',
	"reference_id" text DEFAULT '',
	"currency_code" text DEFAULT 'INR',
	"exchange_rate_snapshot" numeric(18, 6) DEFAULT '1',
	"subtotal_amount" numeric(18, 2) DEFAULT '0',
	"shipping_amount" numeric(18, 2) DEFAULT '0',
	"adjustment_amount" numeric(18, 2) DEFAULT '0',
	"total_amount" numeric(18, 2) DEFAULT '0',
	"invoice_currency_amount" numeric(18, 2) DEFAULT '0',
	"base_currency_amount" numeric(18, 2) DEFAULT '0',
	"received_amount" numeric(18, 2) DEFAULT '0',
	"pending_amount" numeric(18, 2) DEFAULT '0',
	"invoice_date" text NOT NULL,
	"due_date" text DEFAULT '',
	"client_name" text DEFAULT '',
	"client_address" text DEFAULT '',
	"client_gstin" text DEFAULT '',
	"client_email" text DEFAULT '',
	"client_phone" text DEFAULT '',
	"client_state" text DEFAULT '',
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discount_type" text DEFAULT 'flat',
	"discount_value" text DEFAULT '0',
	"cgst_rate" text DEFAULT '0',
	"sgst_rate" text DEFAULT '0',
	"bank_name" text DEFAULT '',
	"bank_account" text DEFAULT '',
	"bank_ifsc" text DEFAULT '',
	"bank_branch" text DEFAULT '',
	"bank_upi" text DEFAULT '',
	"shipping_address" text DEFAULT '',
	"carrier" text DEFAULT '',
	"tracking_number" text DEFAULT '',
	"dispatch_date" text DEFAULT '',
	"expected_delivery" text DEFAULT '',
	"remarks" text DEFAULT '',
	"notes" text DEFAULT '',
	"payment_terms" text DEFAULT '',
	"swatch_order_id" integer,
	"style_order_id" integer,
	"created_by" text DEFAULT '',
	"status" text DEFAULT 'Draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
CREATE TABLE "style_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"style_name" text NOT NULL,
	"style_no" text,
	"client_id" text,
	"client_name" text,
	"quantity" text,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"order_status" text DEFAULT 'Draft' NOT NULL,
	"season" text,
	"colorway" text,
	"sample_size" text,
	"fabric_type" text,
	"order_issue_date" text,
	"delivery_date" text,
	"target_hours" text,
	"issued_to" text,
	"department" text,
	"description" text,
	"internal_notes" text,
	"client_instructions" text,
	"is_chargeable" boolean DEFAULT false NOT NULL,
	"is_inhouse" boolean DEFAULT false NOT NULL,
	"style_references" jsonb DEFAULT '[]'::jsonb,
	"swatch_references" jsonb DEFAULT '[]'::jsonb,
	"ref_docs" jsonb DEFAULT '[]'::jsonb,
	"ref_images" jsonb DEFAULT '[]'::jsonb,
	"wip_images" jsonb DEFAULT '[]'::jsonb,
	"final_images" jsonb DEFAULT '[]'::jsonb,
	"wip_videos" jsonb DEFAULT '[]'::jsonb,
	"final_videos" jsonb DEFAULT '[]'::jsonb,
	"estimate" jsonb DEFAULT '[]'::jsonb,
	"actual_start_date" text,
	"actual_start_time" text,
	"tentative_delivery_date" text,
	"actual_completion_date" text,
	"actual_completion_time" text,
	"delay_reason" text,
	"cancel_reason" text,
	"approval_date" text,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "style_orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "style_order_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"style_order_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"style_category_id" text,
	"style_category_name" text,
	"product_status" text DEFAULT 'Draft' NOT NULL,
	"fabric_id" text,
	"fabric_name" text,
	"has_lining" boolean DEFAULT false NOT NULL,
	"lining_fabric_id" text,
	"lining_fabric_name" text,
	"unit_length" text,
	"unit_width" text,
	"unit_type" text,
	"order_issue_date" text,
	"delivery_date" text,
	"target_hours" text,
	"issued_to" text,
	"department" text,
	"ref_docs" jsonb DEFAULT '[]'::jsonb,
	"ref_images" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"pattern_type" text,
	"pattern_making_cost" text,
	"pattern_doc" jsonb DEFAULT '[]'::jsonb,
	"pattern_outhouse_doc" jsonb DEFAULT '[]'::jsonb,
	"pattern_vendor_id" text,
	"pattern_vendor_name" text,
	"pattern_payment_type" text,
	"pattern_payment_mode" text,
	"pattern_payment_status" text DEFAULT 'Pending',
	"pattern_payment_amount" text,
	"pattern_transaction_id" text,
	"pattern_payment_date" text,
	"pattern_remarks" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "style_order_artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"artwork_code" text NOT NULL,
	"style_order_id" integer NOT NULL,
	"style_order_product_id" integer,
	"style_order_product_name" text,
	"artwork_name" text NOT NULL,
	"unit_length" text,
	"unit_width" text,
	"unit_type" text,
	"artwork_created" text DEFAULT 'Inhouse' NOT NULL,
	"work_hours" text,
	"hourly_rate" text,
	"total_cost" text,
	"outsource_vendor_id" text,
	"outsource_vendor_name" text,
	"outsource_payment_date" text,
	"outsource_payment_amount" text,
	"outsource_payment_mode" text,
	"outsource_transaction_id" text,
	"outsource_payment_status" text,
	"toile_making_cost" text,
	"toile_vendor_id" text,
	"toile_vendor_name" text,
	"toile_cost" text,
	"toile_payment_type" text,
	"toile_payment_date" text,
	"toile_payment_mode" text,
	"toile_payment_status" text,
	"toile_payment_amount" text,
	"toile_transaction_id" text,
	"toile_remarks" text,
	"toile_images" jsonb DEFAULT '[]'::jsonb,
	"pattern_type" text,
	"pattern_making_cost" text,
	"pattern_doc" jsonb DEFAULT '[]'::jsonb,
	"pattern_outhouse_doc" jsonb DEFAULT '[]'::jsonb,
	"pattern_vendor_id" text,
	"pattern_vendor_name" text,
	"pattern_payment_type" text,
	"pattern_payment_mode" text,
	"pattern_payment_status" text,
	"pattern_payment_amount" text,
	"pattern_transaction_id" text,
	"pattern_payment_date" text,
	"pattern_remarks" text,
	"feedback_status" text DEFAULT 'Pending' NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb,
	"ref_images" jsonb DEFAULT '[]'::jsonb,
	"wip_images" jsonb DEFAULT '[]'::jsonb,
	"final_images" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "style_order_artworks_artwork_code_unique" UNIQUE("artwork_code")
);
--> statement-breakpoint
CREATE TABLE "vendor_ledger_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_name" text NOT NULL,
	"charge_date" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"amount" text NOT NULL,
	"notes" text,
	"order_type" text DEFAULT 'general' NOT NULL,
	"style_order_id" integer,
	"style_order_code" text,
	"swatch_order_id" integer,
	"swatch_order_code" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_name" text NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"amount" text NOT NULL,
	"payment_mode" text DEFAULT 'Bank Transfer' NOT NULL,
	"reference_no" text,
	"notes" text,
	"order_type" text DEFAULT 'general' NOT NULL,
	"style_order_id" integer,
	"style_order_code" text,
	"swatch_order_id" integer,
	"swatch_order_code" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" text NOT NULL,
	"source_id" integer NOT NULL,
	"item_name" text NOT NULL,
	"item_code" text NOT NULL,
	"category" text,
	"department" text,
	"warehouse_location" text,
	"unit_type" text,
	"current_stock" numeric(14, 3) DEFAULT '0' NOT NULL,
	"style_reserved_qty" numeric(14, 3) DEFAULT '0' NOT NULL,
	"swatch_reserved_qty" numeric(14, 3) DEFAULT '0' NOT NULL,
	"available_stock" numeric(14, 3) DEFAULT '0' NOT NULL,
	"average_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"last_purchase_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"minimum_level" numeric(14, 3) DEFAULT '0' NOT NULL,
	"reorder_level" numeric(14, 3) DEFAULT '0' NOT NULL,
	"maximum_level" numeric(14, 3) DEFAULT '0' NOT NULL,
	"preferred_vendor" text,
	"last_vendor" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_source_unique" UNIQUE("source_type","source_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_stock_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"quantity_before" numeric(14, 3) DEFAULT '0' NOT NULL,
	"quantity_after" numeric(14, 3) DEFAULT '0' NOT NULL,
	"quantity_delta" numeric(14, 3) DEFAULT '0' NOT NULL,
	"reference_type" text,
	"reference_id" integer,
	"notes" text,
	"created_by_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"inventory_id" integer NOT NULL,
	"reservation_type" text NOT NULL,
	"reference_id" integer NOT NULL,
	"reserved_quantity" numeric(14, 3) NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"remarks" text,
	"reserved_by" text,
	"reservation_date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"inventory_id" integer NOT NULL,
	"adjustment_type" text NOT NULL,
	"adjustment_direction" text NOT NULL,
	"adjustment_quantity" numeric(14, 3) NOT NULL,
	"unit" text,
	"average_price_at_adjustment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"revenue_loss_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"reference_type" text DEFAULT 'Manual' NOT NULL,
	"reference_id" text,
	"reason" text,
	"remarks" text,
	"adjusted_by" text,
	"adjustment_date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"reference_number" text,
	"reference_type" text,
	"in_quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"out_quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"balance_quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"remarks" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_code" text NOT NULL,
	"item_name" text NOT NULL,
	"item_type" text DEFAULT '' NOT NULL,
	"description" text,
	"unit_type" text DEFAULT '' NOT NULL,
	"unit_price" text DEFAULT '0' NOT NULL,
	"hsn_code" text,
	"gst_percent" text,
	"current_stock" text DEFAULT '0' NOT NULL,
	"location_stocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reorder_level" numeric(14, 3),
	"minimum_level" numeric(14, 3),
	"maximum_level" numeric(14, 3),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone,
	CONSTRAINT "items_item_code_unique" UNIQUE("item_code")
);
--> statement-breakpoint
CREATE TABLE "vendor_challans" (
	"id" serial PRIMARY KEY NOT NULL,
	"challan_number" text NOT NULL,
	"challan_date" text NOT NULL,
	"vendor_id" integer,
	"vendor_name" text,
	"challan_type" text NOT NULL,
	"reference_order_id" text,
	"description" text,
	"quantity" numeric(14, 3),
	"unit" text,
	"rate" numeric(14, 2),
	"amount" numeric(14, 2),
	"attachment" jsonb,
	"status" text DEFAULT 'Draft' NOT NULL,
	"linked_po_id" integer,
	"linked_po_number" text,
	"linked_pr_id" integer,
	"linked_pr_number" text,
	"remarks" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "vendor_challans_challan_number_unique" UNIQUE("challan_number")
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text DEFAULT '' NOT NULL,
	"method" text NOT NULL,
	"url" text NOT NULL,
	"action" text DEFAULT '' NOT NULL,
	"status_code" integer DEFAULT 200 NOT NULL,
	"ip_address" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_name" text NOT NULL,
	"account_no" text NOT NULL,
	"ifsc_code" text DEFAULT '' NOT NULL,
	"branch" text DEFAULT '' NOT NULL,
	"account_name" text DEFAULT '' NOT NULL,
	"bank_upi" text DEFAULT '' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_invoice_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"invoice_id" integer,
	"entry_type" text DEFAULT 'Payment Received' NOT NULL,
	"payment_amount" numeric(18, 2) NOT NULL,
	"payment_date" text NOT NULL,
	"transaction_reference" text DEFAULT '',
	"status" text DEFAULT 'Completed',
	"created_by" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_gst_settings" (
	"gst_settings_id" serial PRIMARY KEY NOT NULL,
	"company_gstin" text DEFAULT '' NOT NULL,
	"company_state" text DEFAULT '' NOT NULL,
	"company_country" text DEFAULT 'India' NOT NULL,
	"export_under_lut_enabled" boolean DEFAULT true NOT NULL,
	"reverse_charge_enabled" boolean DEFAULT false NOT NULL,
	"gst_mode" text DEFAULT 'Auto Detect' NOT NULL,
	"default_service_gst_rate" numeric(5, 2) DEFAULT '18' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"company_name" text DEFAULT 'ERP' NOT NULL,
	"company_address" text DEFAULT '' NOT NULL,
	"company_phone" text DEFAULT '' NOT NULL,
	"company_email" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_debit_notes" (
	"note_id" serial PRIMARY KEY NOT NULL,
	"note_number" text NOT NULL,
	"note_type" text NOT NULL,
	"reference_type" text DEFAULT 'Manual Entry' NOT NULL,
	"invoice_id" integer,
	"vendor_bill_id" integer,
	"party_id" integer,
	"party_name" text,
	"party_type" text,
	"currency_code" text DEFAULT 'INR' NOT NULL,
	"exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL,
	"note_amount" numeric(18, 2) NOT NULL,
	"base_currency_amount" numeric(18, 2) NOT NULL,
	"reason" text NOT NULL,
	"remarks" text,
	"note_date" text NOT NULL,
	"status" text DEFAULT 'Draft' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "credit_debit_notes_note_number_key" UNIQUE("note_number")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"decimal_places" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_base" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"label" text DEFAULT 'Default' NOT NULL,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"country" text,
	"pincode" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "download_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_name" text DEFAULT '' NOT NULL,
	"user_email" text DEFAULT '' NOT NULL,
	"file_type" text NOT NULL,
	"file_name" text NOT NULL,
	"module" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"currency_code" text NOT NULL,
	"rate" numeric(20, 6) NOT NULL,
	"source_type" text DEFAULT 'Auto' NOT NULL,
	"is_manual_override" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payments" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"payment_direction" text DEFAULT 'Received' NOT NULL,
	"party_id" integer,
	"payment_type" text DEFAULT 'Bank Transfer' NOT NULL,
	"payment_amount" numeric(18, 2) NOT NULL,
	"currency_code" text DEFAULT 'INR' NOT NULL,
	"exchange_rate_snapshot" numeric(18, 6) DEFAULT '1' NOT NULL,
	"base_currency_amount" numeric(18, 2) NOT NULL,
	"transaction_reference" text DEFAULT '',
	"payment_status" text DEFAULT 'Completed' NOT NULL,
	"payment_date" text NOT NULL,
	"remarks" text DEFAULT '',
	"attachment" text DEFAULT '',
	"created_by" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"layout" text DEFAULT 'classic' NOT NULL,
	"payment_terms" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_shipping_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" integer NOT NULL,
	"client_name" text,
	"shipping_vendor_id" integer,
	"tracking_number" text,
	"tracking_url" text,
	"shipment_weight" numeric(12, 4) DEFAULT '0' NOT NULL,
	"rate_per_kg" numeric(12, 4) DEFAULT '0' NOT NULL,
	"calculated_shipping_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"manual_shipping_amount_override" numeric(12, 2),
	"final_shipping_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipment_status" text DEFAULT 'Pending' NOT NULL,
	"shipment_date" date,
	"expected_delivery_date" date,
	"actual_delivery_date" date,
	"remarks" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_shipping_details_reference_type_check" CHECK (reference_type = ANY (ARRAY['Swatch'::text, 'Style'::text, 'PackingList'::text]))
);
--> statement-breakpoint
CREATE TABLE "other_expenses" (
	"expense_id" serial PRIMARY KEY NOT NULL,
	"expense_number" text NOT NULL,
	"expense_category" text NOT NULL,
	"vendor_id" integer,
	"vendor_name" text DEFAULT '',
	"reference_type" text DEFAULT 'Manual',
	"reference_id" text DEFAULT '',
	"amount" numeric(18, 2) NOT NULL,
	"currency_code" text DEFAULT 'INR' NOT NULL,
	"payment_status" text DEFAULT 'Unpaid' NOT NULL,
	"payment_type" text DEFAULT '',
	"paid_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"expense_date" text NOT NULL,
	"remarks" text DEFAULT '',
	"attachment" text DEFAULT '',
	"created_by" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "other_expenses_expense_number_key" UNIQUE("expense_number")
);
--> statement-breakpoint
CREATE TABLE "packing_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"packing_list_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" integer NOT NULL,
	"order_code" text,
	"description" text,
	"qty" numeric(12, 3),
	"unit" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"weight_kg" numeric(10, 3),
	"item_image_url" text
);
--> statement-breakpoint
CREATE TABLE "packing_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"pl_number" text NOT NULL,
	"client_id" integer NOT NULL,
	"delivery_address_id" integer,
	"shipment_id" integer,
	"destination_country" text,
	"package_count" integer,
	"package_type" text,
	"dimensions" text,
	"net_weight" numeric(12, 3),
	"gross_weight" numeric(12, 3),
	"status" text DEFAULT 'Draft' NOT NULL,
	"remarks" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packing_lists_pl_number_key" UNIQUE("pl_number")
);
--> statement-breakpoint
CREATE TABLE "packing_package_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"order_type" text,
	"order_id" integer,
	"product_id" integer,
	"order_code" text,
	"description" text,
	"quantity" numeric(12, 3),
	"unit" text,
	"item_weight" numeric(10, 3),
	"item_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"item_source" text DEFAULT 'order' NOT NULL,
	"inventory_id" integer,
	"inventory_type" text,
	"stock_deducted" numeric(12, 3) DEFAULT '0',
	"deducted_from_location" text
);
--> statement-breakpoint
CREATE TABLE "packing_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"packing_list_id" integer NOT NULL,
	"package_number" integer NOT NULL,
	"length" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"net_weight" numeric(12, 3),
	"gross_weight" numeric(12, 3),
	"shipment_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_id" integer NOT NULL,
	"inventory_item_id" integer,
	"item_name" text NOT NULL,
	"item_code" text DEFAULT '' NOT NULL,
	"ordered_quantity" numeric(14, 3) NOT NULL,
	"received_quantity" numeric(14, 3) DEFAULT '0' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"warehouse_location" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"item_image" text
);
--> statement-breakpoint
CREATE TABLE "purchase_receipt_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"pr_id" integer NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"item_name" text NOT NULL,
	"item_code" text NOT NULL,
	"quantity" numeric(14, 3) NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"warehouse_location" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"po_item_id" integer,
	"item_image" text
);
--> statement-breakpoint
CREATE TABLE "quotation_custom_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_id" integer NOT NULL,
	"charge_name" text NOT NULL,
	"hsn_code" text,
	"unit" text,
	"quantity" numeric(14, 3) DEFAULT '1',
	"price" numeric(14, 2) DEFAULT '0',
	"amount" numeric(14, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_id" integer NOT NULL,
	"design_name" text NOT NULL,
	"hsn_code" text,
	"design_image" text,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_feedback_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_id" integer NOT NULL,
	"feedback_text" text NOT NULL,
	"feedback_by" text,
	"feedback_date" text NOT NULL,
	"revision_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_number" text NOT NULL,
	"client_id" integer,
	"client_name" text,
	"client_state" text,
	"requirement_summary" text,
	"estimated_weight" numeric(10, 3) DEFAULT '0',
	"estimated_shipping_charges" numeric(14, 2) DEFAULT '0',
	"subtotal_amount" numeric(14, 2) DEFAULT '0',
	"gst_type" text DEFAULT 'IGST',
	"gst_rate" numeric(5, 2) DEFAULT '18',
	"gst_amount" numeric(14, 2) DEFAULT '0',
	"total_amount" numeric(14, 2) DEFAULT '0',
	"status" text DEFAULT 'Draft' NOT NULL,
	"revision_number" integer DEFAULT 1 NOT NULL,
	"parent_quotation_id" integer,
	"internal_notes" text,
	"client_notes" text,
	"converted_to" text,
	"converted_reference_id" text,
	"converted_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cover_page" text DEFAULT 'classic' NOT NULL,
	"cover_page_image" text,
	"shipping_rate_per_kg" numeric DEFAULT '0',
	CONSTRAINT "quotations_quotation_number_key" UNIQUE("quotation_number")
);
--> statement-breakpoint
CREATE TABLE "shipping_vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_name" text NOT NULL,
	"contact_person" text,
	"phone_number" text,
	"email_address" text,
	"weight_rate_per_kg" numeric(12, 4) DEFAULT '0' NOT NULL,
	"minimum_charge" numeric(12, 2) DEFAULT '0' NOT NULL,
	"remarks" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_invoice_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_name" text,
	"purchase_receipt_id" integer NOT NULL,
	"pr_number" text NOT NULL,
	"vendor_invoice_number" text NOT NULL,
	"vendor_invoice_date" date,
	"vendor_invoice_amount" numeric(12, 2) NOT NULL,
	"entry_type" text DEFAULT 'Vendor Invoice' NOT NULL,
	"status" text DEFAULT 'Unpaid' NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"paid_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"pending_amount" numeric(18, 2) GENERATED ALWAYS AS ((vendor_invoice_amount - paid_amount)) STORED,
	"linked_po_number" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "warehouse_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"address_line1" text DEFAULT '' NOT NULL,
	"address_line2" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"state" text DEFAULT '' NOT NULL,
	"pincode" text DEFAULT '' NOT NULL,
	"country" text DEFAULT 'India' NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_debit_notes" ADD CONSTRAINT "credit_debit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_shipping_details" ADD CONSTRAINT "order_shipping_details_shipping_vendor_id_fkey" FOREIGN KEY ("shipping_vendor_id") REFERENCES "public"."shipping_vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_packing_list_id_fkey" FOREIGN KEY ("packing_list_id") REFERENCES "public"."packing_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD CONSTRAINT "packing_lists_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD CONSTRAINT "packing_lists_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."delivery_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD CONSTRAINT "packing_lists_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."order_shipping_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_package_items" ADD CONSTRAINT "packing_package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packing_packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_packages" ADD CONSTRAINT "packing_packages_packing_list_id_fkey" FOREIGN KEY ("packing_list_id") REFERENCES "public"."packing_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD CONSTRAINT "purchase_receipt_items_po_item_id_fkey" FOREIGN KEY ("po_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_custom_charges" ADD CONSTRAINT "quotation_custom_charges_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_designs" ADD CONSTRAINT "quotation_designs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_feedback_logs" ADD CONSTRAINT "quotation_feedback_logs_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_parent_quotation_id_fkey" FOREIGN KEY ("parent_quotation_id") REFERENCES "public"."quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_client_invoice_ledger_client" ON "client_invoice_ledger" USING btree ("client_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_client_invoice_ledger_invoice" ON "client_invoice_ledger" USING btree ("invoice_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_cdn_invoice" ON "credit_debit_notes" USING btree ("invoice_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_cdn_party" ON "credit_debit_notes" USING btree ("party_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_cdn_status" ON "credit_debit_notes" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_cdn_type" ON "credit_debit_notes" USING btree ("note_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_download_logs_downloaded_at" ON "download_logs" USING btree ("downloaded_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_download_logs_user_id" ON "download_logs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_invoice_payments_invoice" ON "invoice_payments" USING btree ("invoice_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_invoice_payments_party" ON "invoice_payments" USING btree ("party_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_vendor_invoice_ledger_pr" ON "vendor_invoice_ledger" USING btree ("purchase_receipt_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_vendor_invoice_ledger_vendor" ON "vendor_invoice_ledger" USING btree ("vendor_id" int4_ops);