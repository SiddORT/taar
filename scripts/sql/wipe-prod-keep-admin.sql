-- ============================================================================
-- ZARI ERP — Production wipe, keep only admin@zarierp.com
-- ============================================================================
-- DESTRUCTIVE. IRREVERSIBLE. Run only against production after explicit consent.
--
-- What this does:
--   1. Wraps everything in a transaction so any error rolls back cleanly.
--   2. TRUNCATE ... RESTART IDENTITY CASCADE on every business table
--      (masters + transactions + audit logs + uploaded-file rows).
--   3. Keeps `users` (filtered to admin@zarierp.com only), `roles`, and
--      `role_permissions` so authentication still works after the wipe.
--   4. Keeps system reference tables: currencies, unit_types, item_types,
--      fabric_types, departments, company_gst_settings,
--      invoice_templates. Removing these would break FK constraints and
--      prevent the app from creating any new records.
--      ➜ If you want to wipe these too, uncomment them in the list below.
--
-- How to run:
--   psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/wipe-prod-keep-admin.sql
-- ============================================================================

BEGIN;

-- Safety check: abort if the admin user doesn't exist (otherwise we'd
-- end up with zero users and be locked out).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@zarierp.com') THEN
    RAISE EXCEPTION 'Aborting: admin@zarierp.com not found in users table';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Wipe all business tables in one CASCADE so FK order doesn't matter.
-- ----------------------------------------------------------------------------
TRUNCATE TABLE
  activity_logs,
  artisan_timesheets,
  artworks,
  bank_accounts,
  bom_change_log,
  client_feedback,
  client_invoice_ledger,
  client_links,
  client_messages,
  clients,
  consumption_log,
  costing_payments,
  credit_debit_notes,
  custom_charges,
  delivery_addresses,
  download_logs,
  exchange_rates,
  fabrics,
  hsn_master,
  inventory_items,
  inventory_stock_logs,
  invoice_payments,
  invoices,
  items,
  material_reservations,
  materials,
  order_shipping_details,
  orders,
  other_expenses,
  outsource_jobs,
  packaging_materials,
  packing_list_items,
  packing_lists,
  packing_package_items,
  packing_packages,
  pr_payments,
  purchase_order_items,
  purchase_orders,
  purchase_receipt_items,
  purchase_receipts,
  quotation_custom_charges,
  quotation_designs,
  quotation_feedback_logs,
  quotations,
  shipping_vendors,
  stock_adjustments,
  stock_ledger,
  style_categories,
  style_order_artworks,
  style_order_products,
  style_orders,
  styles,
  swatch_bom,
  swatch_categories,
  swatch_orders,
  swatches,
  vendor_challans,
  vendor_invoice_ledger,
  vendor_ledger_charges,
  vendor_payments,
  vendors,
  warehouse_locations
RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- Delete every user except the seed admin.
-- (Cannot TRUNCATE users because roles/role_permissions reference it; DELETE
-- with a WHERE clause is the correct pattern here.)
-- ----------------------------------------------------------------------------
DELETE FROM users WHERE email <> 'admin@zarierp.com';

-- ----------------------------------------------------------------------------
-- OPTIONAL: uncomment the line below to also wipe system reference tables.
-- WARNING: this will break the app until you reseed these tables, because
-- many forms (items, invoices, etc.) FK into them.
-- ----------------------------------------------------------------------------
-- TRUNCATE TABLE
--   currencies, unit_types, item_types, fabric_types,
--   departments, company_gst_settings, invoice_templates
-- RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- Final sanity report — make sure exactly one user remains.
-- ----------------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM users)                            AS users_remaining,
  (SELECT email FROM users LIMIT 1)                       AS remaining_email,
  (SELECT COUNT(*) FROM clients)                          AS clients_left,
  (SELECT COUNT(*) FROM vendors)                          AS vendors_left,
  (SELECT COUNT(*) FROM purchase_orders)                  AS pos_left,
  (SELECT COUNT(*) FROM quotations)                       AS quotations_left;

COMMIT;
