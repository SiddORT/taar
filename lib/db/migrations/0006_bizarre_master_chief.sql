ALTER TABLE "users" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hsn_master" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "hsn_master" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fabric_types" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "fabric_types" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "item_types" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "item_types" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "swatch_categories" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "swatch_categories" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unit_types" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "unit_types" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "materials" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fabrics" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "fabrics" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "style_categories" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "style_categories" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "swatches" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "swatches" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "styles" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "styles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packaging_materials" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "packaging_materials" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "swatch_orders" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "swatch_orders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "client_feedback" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_links" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "client_links" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_messages" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "client_messages" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "artisan_timesheets" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "artisan_timesheets" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bom_change_log" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "bom_change_log" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "consumption_log" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "consumption_log" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "costing_payments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "costing_payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "custom_charges" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "custom_charges" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "outsource_jobs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "outsource_jobs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pr_payments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "pr_payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "purchase_receipts" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "swatch_bom" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "swatch_bom" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "style_orders" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "style_orders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "style_order_products" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "style_order_products" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "style_order_artworks" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "style_order_artworks" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "vendor_ledger_charges" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inventory_stock_logs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "inventory_stock_logs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "material_reservations" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "material_reservations" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendor_challans" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "vendor_challans" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "client_invoice_ledger" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "client_invoice_ledger" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "company_gst_settings" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "company_gst_settings" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "credit_debit_notes" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "credit_debit_notes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "currencies" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "currencies" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "delivery_addresses" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "delivery_addresses" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "download_logs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "download_logs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "exchange_rates" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "invoice_payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoice_templates" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "invoice_templates" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order_shipping_details" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "order_shipping_details" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "other_expenses" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "other_expenses" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "packing_list_items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "packing_lists" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packing_package_items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "packing_package_items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "packing_packages" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "packing_packages" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "purchase_receipt_items" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quotation_custom_charges" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "quotation_custom_charges" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quotation_designs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "quotation_designs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quotation_feedback_logs" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "quotation_feedback_logs" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "shipping_vendors" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "shipping_vendors" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "vendor_invoice_ledger" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "warehouse_locations" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "warehouse_locations" ADD COLUMN "deleted_at" timestamp with time zone;