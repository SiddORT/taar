# ZARI ERP API Reference

  > Auto-generated from `artifacts/api-server/src/routes/` — **433 endpoints** across **45 modules**.

  ## Authentication

  All endpoints (except `POST /api/auth/login`, health & client-portal links) require a Bearer JWT:

  ```http
  POST /api/auth/login
  Content-Type: application/json

  { "email": "admin@zarierp.com", "password": "Admin@123" }
  ```

  The response contains a `token` field — pass it on every subsequent request:

  ```http
  Authorization: Bearer <token>
  ```

  ## Conventions

  - **Base path** — every route is mounted under `/api`.
  - **Path params** — written as `:id` in source / `{id}` in the OpenAPI spec.
  - **File uploads** — endpoints marked _multipart_ accept `multipart/form-data` with a `file` field.
  - **Errors** — `400` validation, `401` auth, `404` not found, `500` server.

  ---

  ## Table of Contents

  - [Auth](#auth) (8)
- [Accounts · Credit/Debit Notes](#accounts-credit-debit-notes) (6)
- [Accounts · Dashboard](#accounts-dashboard) (1)
- [Accounts · Invoice Payments](#accounts-invoice-payments) (4)
- [Accounts · Invoices](#accounts-invoices) (10)
- [Accounts · Other Expenses](#accounts-other-expenses) (6)
- [Accounts · Purchases](#accounts-purchases) (8)
- [Accounts · Sales](#accounts-sales) (4)
- [Client Portal](#client-portal) (3)
- [Client Portal · Links](#client-portal-links) (9)
- [Dashboard Overview](#dashboard-overview) (1)
- [Health](#health) (1)
- [Inventory](#inventory) (26)
- [Inventory · Packing Lists](#inventory-packing-lists) (22)
- [Inventory · Shipping](#inventory-shipping) (13)
- [Lookups](#lookups) (2)
- [Masters · Artworks](#masters-artworks) (5)
- [Masters · Clients](#masters-clients) (9)
- [Masters · Costing](#masters-costing) (57)
- [Masters · Departments](#masters-departments) (7)
- [Masters · Fabrics](#masters-fabrics) (8)
- [Masters · HSN](#masters-hsn) (8)
- [Masters · Item Types](#masters-item-types) (8)
- [Masters · Items](#masters-items) (7)
- [Masters · Materials](#masters-materials) (8)
- [Masters · Packaging Materials](#masters-packaging-materials) (5)
- [Masters · Style Categories](#masters-style-categories) (8)
- [Masters · Styles](#masters-styles) (11)
- [Masters · Swatch Categories](#masters-swatch-categories) (8)
- [Masters · Swatches](#masters-swatches) (12)
- [Masters · Unit Types](#masters-unit-types) (7)
- [Masters · Vendors](#masters-vendors) (9)
- [Orders](#orders) (6)
- [Orders · Style Order Artworks](#orders-style-order-artworks) (5)
- [Orders · Style Order Products](#orders-style-order-products) (5)
- [Orders · Style Orders](#orders-style-orders) (6)
- [Orders · Swatch Orders](#orders-swatch-orders) (6)
- [Procurement · Purchase Orders](#procurement-purchase-orders) (15)
- [Procurement · Purchase Receipts](#procurement-purchase-receipts) (8)
- [Procurement · Vendor Challans](#procurement-vendor-challans) (12)
- [Procurement · Vendor Ledger](#procurement-vendor-ledger) (7)
- [Quotations](#quotations) (10)
- [Reports](#reports) (10)
- [Settings](#settings) (30)
- [User Management](#user-management) (12)

---

## Auth

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `POST` | `/api/auth/accept-invite` | — | json | `auth.ts:166` |
| `POST` | `/api/auth/forgot-password` | — | json | `auth.ts:76` |
| `GET` | `/api/auth/invite/:token` | — | — | `auth.ts:152` |
| `POST` | `/api/auth/login` | — | json | `auth.ts:29` |
| `POST` | `/api/auth/logout` | — | json | `auth.ts:71` |
| `GET` | `/api/auth/me` | ✓ | — | `auth.ts:206` |
| `GET` | `/api/auth/my-permissions` | ✓ | — | `auth.ts:193` |
| `POST` | `/api/auth/reset-password` | — | json | `auth.ts:125` |

## Accounts · Credit/Debit Notes

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/` | ✓ | — | `creditDebitNotes.ts:79` |
| `POST` | `/api/` | ✓ | json | `creditDebitNotes.ts:133` |
| `GET` | `/api/:id` | ✓ | — | `creditDebitNotes.ts:114` |
| `DELETE` | `/api/:id` | ✓ | — | `creditDebitNotes.ts:266` |
| `PUT` | `/api/:id/apply` | ✓ | json | `creditDebitNotes.ts:211` |
| `PUT` | `/api/:id/cancel` | ✓ | json | `creditDebitNotes.ts:239` |

## Accounts · Dashboard

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/accounts/dashboard` | ✓ | — | `accountsDashboard.ts:7` |

## Accounts · Invoice Payments

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/invoice-payments` | ✓ | — | `invoicePayments.ts:75` |
| `POST` | `/api/invoice-payments` | ✓ | json | `invoicePayments.ts:94` |
| `DELETE` | `/api/invoice-payments/:id` | ✓ | — | `invoicePayments.ts:178` |
| `GET` | `/api/invoice-payments/accounts` | ✓ | — | `invoicePayments.ts:21` |

## Accounts · Invoices

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/invoices` | ✓ | — | `invoices.ts:44` |
| `POST` | `/api/invoices` | ✓ | json | `invoices.ts:158` |
| `GET` | `/api/invoices/:id` | ✓ | — | `invoices.ts:79` |
| `PUT` | `/api/invoices/:id` | ✓ | json | `invoices.ts:231` |
| `DELETE` | `/api/invoices/:id` | ✓ | — | `invoices.ts:336` |
| `PATCH` | `/api/invoices/:id/payment` | ✓ | json | `invoices.ts:317` |
| `PATCH` | `/api/invoices/:id/status` | ✓ | json | `invoices.ts:303` |
| `GET` | `/api/invoices/next-number` | ✓ | — | `invoices.ts:38` |
| `GET` | `/api/invoices/style/:styleOrderId` | ✓ | — | `invoices.ts:104` |
| `GET` | `/api/invoices/swatch/:swatchOrderId` | ✓ | — | `invoices.ts:88` |

## Accounts · Other Expenses

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/other-expenses` | ✓ | — | `otherExpenses.ts:40` |
| `POST` | `/api/other-expenses` | ✓ | multipart | `otherExpenses.ts:106` |
| `GET` | `/api/other-expenses/:id` | ✓ | — | `otherExpenses.ts:89` |
| `PUT` | `/api/other-expenses/:id` | ✓ | multipart | `otherExpenses.ts:185` |
| `DELETE` | `/api/other-expenses/:id` | ✓ | — | `otherExpenses.ts:233` |
| `GET` | `/api/other-expenses/categories` | ✓ | — | `otherExpenses.ts:22` |

## Accounts · Purchases

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/purchase-orders` | ✓ | — | `accountPurchases.ts:19` |
| `POST` | `/api/record-payment` | ✓ | json | `accountPurchases.ts:437` |
| `GET` | `/api/summary` | ✓ | — | `accountPurchases.ts:116` |
| `GET` | `/api/top-vendors-pending` | ✓ | — | `accountPurchases.ts:418` |
| `GET` | `/api/unified-liabilities` | ✓ | — | `accountPurchases.ts:238` |
| `GET` | `/api/unified-summary` | ✓ | — | `accountPurchases.ts:159` |
| `GET` | `/api/vendor-bills` | ✓ | — | `accountPurchases.ts:55` |
| `POST` | `/api/vendor-bills/:id/payment` | ✓ | json | `accountPurchases.ts:83` |

## Accounts · Sales

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `POST` | `/api/record-payment` | ✓ | json | `accountSales.ts:282` |
| `GET` | `/api/top-clients-pending` | ✓ | — | `accountSales.ts:118` |
| `GET` | `/api/unified-receivables` | ✓ | — | `accountSales.ts:173` |
| `GET` | `/api/unified-summary` | ✓ | — | `accountSales.ts:10` |

## Client Portal

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/client-portal/:token` | — | — | `clientPortal.ts:12` |
| `POST` | `/api/client-portal/:token/feedback` | — | json | `clientPortal.ts:120` |
| `POST` | `/api/client-portal/:token/message` | — | json | `clientPortal.ts:87` |

## Client Portal · Links

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `PATCH` | `/api/client-links/:id` | ✓ | json | `clientLinks.ts:38` |
| `GET` | `/api/client-links/:id/feedback` | ✓ | — | `clientLinks.ts:103` |
| `GET` | `/api/client-links/:id/messages` | ✓ | — | `clientLinks.ts:141` |
| `POST` | `/api/client-links/:id/messages` | ✓ | json | `clientLinks.ts:154` |
| `POST` | `/api/client-links/:id/regenerate` | ✓ | json | `clientLinks.ts:88` |
| `PATCH` | `/api/client-links/:id/threads/toggle` | ✓ | json | `clientLinks.ts:178` |
| `PATCH` | `/api/client-links/feedback/:feedbackId` | ✓ | json | `clientLinks.ts:115` |
| `GET` | `/api/client-links/style/:styleOrderId` | ✓ | — | `clientLinks.ts:25` |
| `GET` | `/api/client-links/swatch/:swatchOrderId` | ✓ | — | `clientLinks.ts:12` |

## Dashboard Overview

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/dashboard/overview` | ✓ | — | `dashboardOverview.ts:7` |

## Health

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/healthz` | — | — | `health.ts:6` |

## Inventory

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/inventory/adjustments` | ✓ | — | `inventory.ts:1017` |
| `POST` | `/api/inventory/adjustments` | ✓ | json | `inventory.ts:1070` |
| `PUT` | `/api/inventory/adjustments/:id` | ✓ | json | `inventory.ts:1160` |
| `DELETE` | `/api/inventory/adjustments/:id` | ✓ | — | `inventory.ts:1255` |
| `GET` | `/api/inventory/adjustments/summary` | ✓ | — | `inventory.ts:996` |
| `GET` | `/api/inventory/dashboard` | ✓ | — | `inventory.ts:1317` |
| `GET` | `/api/inventory/filters` | ✓ | — | `inventory.ts:265` |
| `GET` | `/api/inventory/item-categories` | ✓ | — | `inventory.ts:1298` |
| `GET` | `/api/inventory/items` | ✓ | — | `inventory.ts:56` |
| `GET` | `/api/inventory/items/:id` | ✓ | — | `inventory.ts:174` |
| `POST` | `/api/inventory/items/:id/add-image` | ✓ | json | `inventory.ts:1464` |
| `GET` | `/api/inventory/items/:id/logs` | ✓ | — | `inventory.ts:199` |
| `GET` | `/api/inventory/items/:id/reservations` | ✓ | — | `inventory.ts:216` |
| `PUT` | `/api/inventory/items/:id/stock` | ✓ | json | `inventory.ts:516` |
| `GET` | `/api/inventory/ledger` | ✓ | — | `inventory.ts:284` |
| `DELETE` | `/api/inventory/ledger/:id` | ✓ | — | `inventory.ts:428` |
| `POST` | `/api/inventory/ledger/wastage` | ✓ | json | `inventory.ts:376` |
| `GET` | `/api/inventory/low-stock-alerts` | ✓ | — | `inventory.ts:1428` |
| `GET` | `/api/inventory/reservations` | ✓ | — | `inventory.ts:649` |
| `POST` | `/api/inventory/reservations` | ✓ | json | `inventory.ts:713` |
| `DELETE` | `/api/inventory/reservations/:id` | ✓ | — | `inventory.ts:957` |
| `PATCH` | `/api/inventory/reservations/:id/cancel` | ✓ | json | `inventory.ts:819` |
| `PATCH` | `/api/inventory/reservations/:id/convert` | ✓ | json | `inventory.ts:852` |
| `PATCH` | `/api/inventory/reservations/:id/release` | ✓ | json | `inventory.ts:778` |
| `GET` | `/api/inventory/summary` | ✓ | — | `inventory.ts:9` |
| `POST` | `/api/inventory/sync` | ✓ | json | `inventory.ts:620` |

## Inventory · Packing Lists

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/delivery-addresses` | ✓ | — | `packingLists.ts:28` |
| `POST` | `/api/delivery-addresses` | ✓ | json | `packingLists.ts:45` |
| `PUT` | `/api/delivery-addresses/:id` | ✓ | json | `packingLists.ts:73` |
| `DELETE` | `/api/delivery-addresses/:id` | ✓ | — | `packingLists.ts:115` |
| `GET` | `/api/eligible-orders-for-packing` | ✓ | — | `packingLists.ts:128` |
| `GET` | `/api/packing-lists` | ✓ | — | `packingLists.ts:165` |
| `POST` | `/api/packing-lists` | ✓ | json | `packingLists.ts:336` |
| `GET` | `/api/packing-lists/:id` | ✓ | — | `packingLists.ts:211` |
| `PUT` | `/api/packing-lists/:id` | ✓ | json | `packingLists.ts:415` |
| `DELETE` | `/api/packing-lists/:id` | ✓ | — | `packingLists.ts:512` |
| `GET` | `/api/packing-lists/:id/eligible-orders` | ✓ | — | `packingLists.ts:898` |
| `POST` | `/api/packing-lists/:id/packages` | ✓ | json | `packingLists.ts:526` |
| `PUT` | `/api/packing-lists/:id/packages/:pkgId` | ✓ | json | `packingLists.ts:550` |
| `DELETE` | `/api/packing-lists/:id/packages/:pkgId` | ✓ | — | `packingLists.ts:571` |
| `POST` | `/api/packing-lists/:id/packages/:pkgId/items` | ✓ | json | `packingLists.ts:619` |
| `PATCH` | `/api/packing-lists/:id/packages/:pkgId/items/:itemId` | ✓ | json | `packingLists.ts:748` |
| `DELETE` | `/api/packing-lists/:id/packages/:pkgId/items/:itemId` | ✓ | — | `packingLists.ts:766` |
| `DELETE` | `/api/packing-lists/:id/packages/:pkgId/items/:itemId/image` | ✓ | — | `packingLists.ts:879` |
| `GET` | `/api/packing-lists/:id/pdf-html` | ✓ | — | `packingLists.ts:948` |
| `GET` | `/api/packing-lists/inventory/search` | ✓ | — | `packingLists.ts:583` |
| `GET` | `/api/packing-lists/item-images/:filename` | — | — | `packingLists.ts:810` |
| `GET` | `/api/packing-lists/order-artwork-image` | ✓ | — | `packingLists.ts:819` |

## Inventory · Shipping

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/shipping/details` | ✓ | — | `shipping.ts:193` |
| `POST` | `/api/shipping/details` | ✓ | json | `shipping.ts:268` |
| `GET` | `/api/shipping/details/:id` | ✓ | — | `shipping.ts:252` |
| `PUT` | `/api/shipping/details/:id` | ✓ | json | `shipping.ts:318` |
| `DELETE` | `/api/shipping/details/:id` | ✓ | — | `shipping.ts:387` |
| `PATCH` | `/api/shipping/details/:id/status` | ✓ | json | `shipping.ts:369` |
| `GET` | `/api/shipping/details/by-reference` | ✓ | — | `shipping.ts:233` |
| `GET` | `/api/shipping/vendors` | ✓ | — | `shipping.ts:83` |
| `POST` | `/api/shipping/vendors` | ✓ | json | `shipping.ts:117` |
| `PUT` | `/api/shipping/vendors/:id` | ✓ | json | `shipping.ts:134` |
| `DELETE` | `/api/shipping/vendors/:id` | ✓ | — | `shipping.ts:169` |
| `PATCH` | `/api/shipping/vendors/:id/status` | ✓ | json | `shipping.ts:154` |
| `GET` | `/api/shipping/vendors/all` | ✓ | — | `shipping.ts:95` |

## Lookups

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/lookups/:type` | ✓ | — | `lookups.ts:19` |
| `POST` | `/api/lookups/:type` | ✓ | json | `lookups.ts:26` |

## Masters · Artworks

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/artworks` | ✓ | — | `artworks.ts:25` |
| `POST` | `/api/artworks` | ✓ | json | `artworks.ts:52` |
| `GET` | `/api/artworks/:id` | ✓ | — | `artworks.ts:42` |
| `PUT` | `/api/artworks/:id` | ✓ | json | `artworks.ts:107` |
| `DELETE` | `/api/artworks/:id` | ✓ | — | `artworks.ts:182` |

## Masters · Clients

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/clients` | ✓ | — | `clients.ts:32` |
| `POST` | `/api/clients` | ✓ | json | `clients.ts:68` |
| `GET` | `/api/clients/:id` | ✓ | — | `clients.ts:60` |
| `PUT` | `/api/clients/:id` | ✓ | json | `clients.ts:97` |
| `DELETE` | `/api/clients/:id` | ✓ | — | `clients.ts:138` |
| `PATCH` | `/api/clients/:id/status` | ✓ | json | `clients.ts:128` |
| `GET` | `/api/clients/all` | ✓ | — | `clients.ts:55` |
| `GET` | `/api/clients/export-all` | ✓ | — | `clients.ts:47` |
| `POST` | `/api/clients/import` | ✓ | json | `clients.ts:148` |

## Masters · Costing

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `POST` | `/api/artisan-timesheets` | ✓ | json | `costing.ts:1329` |
| `PUT` | `/api/artisan-timesheets/:id` | ✓ | json | `costing.ts:1354` |
| `DELETE` | `/api/artisan-timesheets/:id` | ✓ | — | `costing.ts:1380` |
| `GET` | `/api/artisan-timesheets/:swatchOrderId` | ✓ | — | `costing.ts:1322` |
| `POST` | `/api/bom` | ✓ | json | `costing.ts:611` |
| `PATCH` | `/api/bom/:id` | ✓ | json | `costing.ts:650` |
| `DELETE` | `/api/bom/:id` | ✓ | — | `costing.ts:844` |
| `GET` | `/api/bom/:id/log` | ✓ | — | `costing.ts:832` |
| `PATCH` | `/api/bom/:id/qty` | ✓ | json | `costing.ts:786` |
| `GET` | `/api/bom/:swatchOrderId` | ✓ | — | `costing.ts:571` |
| `POST` | `/api/consumption` | ✓ | json | `costing.ts:1107` |
| `PUT` | `/api/consumption/:id` | ✓ | json | `costing.ts:1183` |
| `DELETE` | `/api/consumption/:id` | ✓ | — | `costing.ts:1260` |
| `GET` | `/api/consumption/:swatchOrderId` | ✓ | — | `costing.ts:1100` |
| `GET` | `/api/costing-payments` | ✓ | — | `costing.ts:2176` |
| `POST` | `/api/costing-payments` | ✓ | json | `costing.ts:2195` |
| `GET` | `/api/costing-payments-totals` | ✓ | — | `costing.ts:2155` |
| `PATCH` | `/api/costing-payments/:id` | ✓ | json | `costing.ts:2261` |
| `DELETE` | `/api/costing-payments/:id` | ✓ | — | `costing.ts:2294` |
| `POST` | `/api/custom-charges` | ✓ | json | `costing.ts:1450` |
| `PUT` | `/api/custom-charges/:id` | ✓ | json | `costing.ts:1475` |
| `DELETE` | `/api/custom-charges/:id` | ✓ | — | `costing.ts:1501` |
| `GET` | `/api/custom-charges/:swatchOrderId` | ✓ | — | `costing.ts:1443` |
| `GET` | `/api/hsn-search` | ✓ | — | `costing.ts:1306` |
| `GET` | `/api/invoice-items` | ✓ | — | `costing.ts:1924` |
| `GET` | `/api/material-search` | ✓ | — | `costing.ts:536` |
| `POST` | `/api/outsource-jobs` | ✓ | json | `costing.ts:1393` |
| `PUT` | `/api/outsource-jobs/:id` | ✓ | json | `costing.ts:1416` |
| `DELETE` | `/api/outsource-jobs/:id` | ✓ | — | `costing.ts:1437` |
| `GET` | `/api/outsource-jobs/:swatchOrderId` | ✓ | — | `costing.ts:1386` |
| `POST` | `/api/payments` | ✓ | json | `costing.ts:1077` |
| `DELETE` | `/api/payments/:id` | ✓ | — | `costing.ts:1094` |
| `GET` | `/api/payments/:prId` | ✓ | — | `costing.ts:1070` |
| `POST` | `/api/po` | ✓ | json | `costing.ts:893` |
| `GET` | `/api/po-action` | — | — | `costing.ts:2309` |
| `PATCH` | `/api/po/:id` | ✓ | json | `costing.ts:945` |
| `DELETE` | `/api/po/:id` | ✓ | — | `costing.ts:960` |
| `GET` | `/api/po/:swatchOrderId` | ✓ | — | `costing.ts:886` |
| `POST` | `/api/pr` | ✓ | json | `costing.ts:973` |
| `PATCH` | `/api/pr/:id` | ✓ | json | `costing.ts:1050` |
| `DELETE` | `/api/pr/:id` | ✓ | — | `costing.ts:1064` |
| `GET` | `/api/pr/:swatchOrderId` | ✓ | — | `costing.ts:966` |
| `POST` | `/api/style-artisan-timesheets` | ✓ | json | `costing.ts:1825` |
| `GET` | `/api/style-artisan-timesheets/:styleOrderId` | ✓ | — | `costing.ts:1818` |
| `POST` | `/api/style-bom` | ✓ | json | `costing.ts:1551` |
| `GET` | `/api/style-bom/:styleOrderId` | ✓ | — | `costing.ts:1511` |
| `POST` | `/api/style-consumption` | ✓ | json | `costing.ts:1741` |
| `GET` | `/api/style-consumption/:styleOrderId` | ✓ | — | `costing.ts:1734` |
| `POST` | `/api/style-custom-charges` | ✓ | json | `costing.ts:1893` |
| `GET` | `/api/style-custom-charges/:styleOrderId` | ✓ | — | `costing.ts:1886` |
| `POST` | `/api/style-outsource-jobs` | ✓ | json | `costing.ts:1860` |
| `GET` | `/api/style-outsource-jobs/:styleOrderId` | ✓ | — | `costing.ts:1853` |
| `POST` | `/api/style-po` | ✓ | json | `costing.ts:1598` |
| `GET` | `/api/style-po/:styleOrderId` | ✓ | — | `costing.ts:1591` |
| `POST` | `/api/style-pr` | ✓ | json | `costing.ts:1658` |
| `GET` | `/api/style-pr/:styleOrderId` | ✓ | — | `costing.ts:1651` |
| `GET` | `/api/vendor-search` | ✓ | — | `costing.ts:1290` |

## Masters · Departments

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/departments` | ✓ | — | `departments.ts:20` |
| `POST` | `/api/departments` | ✓ | json | `departments.ts:43` |
| `PUT` | `/api/departments/:id` | ✓ | json | `departments.ts:96` |
| `DELETE` | `/api/departments/:id` | ✓ | — | `departments.ts:131` |
| `PATCH` | `/api/departments/:id/status` | ✓ | json | `departments.ts:118` |
| `GET` | `/api/departments/export-all` | ✓ | — | `departments.ts:35` |
| `POST` | `/api/departments/import` | ✓ | json | `departments.ts:57` |

## Masters · Fabrics

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/fabrics` | ✓ | — | `fabrics.ts:59` |
| `POST` | `/api/fabrics` | ✓ | json | `fabrics.ts:177` |
| `PUT` | `/api/fabrics/:id` | ✓ | json | `fabrics.ts:212` |
| `DELETE` | `/api/fabrics/:id` | ✓ | — | `fabrics.ts:269` |
| `PATCH` | `/api/fabrics/:id/status` | ✓ | json | `fabrics.ts:251` |
| `GET` | `/api/fabrics/all` | ✓ | — | `fabrics.ts:92` |
| `GET` | `/api/fabrics/export-all` | ✓ | — | `fabrics.ts:80` |
| `POST` | `/api/fabrics/import` | ✓ | json | `fabrics.ts:99` |

## Masters · HSN

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/hsn` | ✓ | — | `hsn.ts:29` |
| `POST` | `/api/hsn` | ✓ | json | `hsn.ts:63` |
| `PUT` | `/api/hsn/:id` | ✓ | json | `hsn.ts:142` |
| `DELETE` | `/api/hsn/:id` | ✓ | — | `hsn.ts:211` |
| `PATCH` | `/api/hsn/:id/status` | ✓ | json | `hsn.ts:183` |
| `GET` | `/api/hsn/all` | ✓ | — | `hsn.ts:54` |
| `GET` | `/api/hsn/export-all` | ✓ | — | `hsn.ts:46` |
| `POST` | `/api/hsn/import` | ✓ | json | `hsn.ts:91` |

## Masters · Item Types

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/item-types` | ✓ | — | `itemTypes.ts:91` |
| `POST` | `/api/item-types` | ✓ | json | `itemTypes.ts:113` |
| `PUT` | `/api/item-types/:id` | ✓ | json | `itemTypes.ts:131` |
| `DELETE` | `/api/item-types/:id` | ✓ | — | `itemTypes.ts:169` |
| `PATCH` | `/api/item-types/:id/status` | ✓ | json | `itemTypes.ts:159` |
| `GET` | `/api/item-types/all` | ✓ | — | `itemTypes.ts:82` |
| `GET` | `/api/item-types/export-all` | ✓ | — | `itemTypes.ts:21` |
| `POST` | `/api/item-types/import` | ✓ | json | `itemTypes.ts:36` |

## Masters · Items

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/items` | ✓ | — | `items.ts:137` |
| `POST` | `/api/items` | ✓ | json | `items.ts:160` |
| `PUT` | `/api/items/:id` | ✓ | json | `items.ts:214` |
| `DELETE` | `/api/items/:id` | ✓ | — | `items.ts:287` |
| `PATCH` | `/api/items/:id/status` | ✓ | json | `items.ts:273` |
| `GET` | `/api/items/export-all` | ✓ | — | `items.ts:42` |
| `POST` | `/api/items/import` | ✓ | json | `items.ts:58` |

## Masters · Materials

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/materials` | ✓ | — | `materials.ts:154` |
| `POST` | `/api/materials` | ✓ | json | `materials.ts:196` |
| `PUT` | `/api/materials/:id` | ✓ | json | `materials.ts:243` |
| `DELETE` | `/api/materials/:id` | ✓ | — | `materials.ts:310` |
| `PATCH` | `/api/materials/:id/status` | ✓ | json | `materials.ts:292` |
| `GET` | `/api/materials/all` | ✓ | — | `materials.ts:145` |
| `GET` | `/api/materials/export-all` | ✓ | — | `materials.ts:40` |
| `POST` | `/api/materials/import` | ✓ | json | `materials.ts:70` |

## Masters · Packaging Materials

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/packaging-materials` | ✓ | — | `packagingMaterials.ts:29` |
| `POST` | `/api/packaging-materials` | ✓ | json | `packagingMaterials.ts:62` |
| `PUT` | `/api/packaging-materials/:id` | ✓ | json | `packagingMaterials.ts:84` |
| `DELETE` | `/api/packaging-materials/:id` | ✓ | — | `packagingMaterials.ts:111` |
| `PATCH` | `/api/packaging-materials/:id/status` | ✓ | json | `packagingMaterials.ts:99` |

## Masters · Style Categories

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/style-categories` | ✓ | — | `styleCategories.ts:21` |
| `POST` | `/api/style-categories` | ✓ | json | `styleCategories.ts:51` |
| `PUT` | `/api/style-categories/:id` | ✓ | json | `styleCategories.ts:108` |
| `DELETE` | `/api/style-categories/:id` | ✓ | — | `styleCategories.ts:142` |
| `PATCH` | `/api/style-categories/:id/status` | ✓ | json | `styleCategories.ts:129` |
| `GET` | `/api/style-categories/all` | ✓ | — | `styleCategories.ts:44` |
| `GET` | `/api/style-categories/export-all` | ✓ | — | `styleCategories.ts:36` |
| `POST` | `/api/style-categories/import` | ✓ | json | `styleCategories.ts:65` |

## Masters · Styles

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/styles` | ✓ | — | `styles.ts:109` |
| `POST` | `/api/styles` | ✓ | json | `styles.ts:205` |
| `GET` | `/api/styles/:id` | ✓ | — | `styles.ts:197` |
| `PUT` | `/api/styles/:id` | ✓ | json | `styles.ts:221` |
| `DELETE` | `/api/styles/:id` | ✓ | — | `styles.ts:252` |
| `POST` | `/api/styles/:id/media` | ✓ | multipart | `styles.ts:266` |
| `DELETE` | `/api/styles/:id/media` | ✓ | — | `styles.ts:290` |
| `PATCH` | `/api/styles/:id/status` | ✓ | json | `styles.ts:242` |
| `GET` | `/api/styles/export-all` | ✓ | — | `styles.ts:27` |
| `GET` | `/api/styles/for-reference` | ✓ | — | `styles.ts:169` |
| `POST` | `/api/styles/import` | ✓ | json | `styles.ts:46` |

## Masters · Swatch Categories

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/swatch-categories` | ✓ | — | `swatchCategories.ts:20` |
| `POST` | `/api/swatch-categories` | ✓ | json | `swatchCategories.ts:50` |
| `PUT` | `/api/swatch-categories/:id` | ✓ | json | `swatchCategories.ts:107` |
| `DELETE` | `/api/swatch-categories/:id` | ✓ | — | `swatchCategories.ts:141` |
| `PATCH` | `/api/swatch-categories/:id/status` | ✓ | json | `swatchCategories.ts:128` |
| `GET` | `/api/swatch-categories/all` | ✓ | — | `swatchCategories.ts:43` |
| `GET` | `/api/swatch-categories/export-all` | ✓ | — | `swatchCategories.ts:35` |
| `POST` | `/api/swatch-categories/import` | ✓ | json | `swatchCategories.ts:64` |

## Masters · Swatches

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/swatches` | ✓ | — | `swatches.ts:41` |
| `POST` | `/api/swatches` | ✓ | json | `swatches.ts:128` |
| `GET` | `/api/swatches/:id` | ✓ | — | `swatches.ts:120` |
| `PUT` | `/api/swatches/:id` | ✓ | json | `swatches.ts:157` |
| `DELETE` | `/api/swatches/:id` | ✓ | — | `swatches.ts:191` |
| `POST` | `/api/swatches/:id/media` | ✓ | multipart | `swatches.ts:268` |
| `DELETE` | `/api/swatches/:id/media` | ✓ | — | `swatches.ts:292` |
| `PATCH` | `/api/swatches/:id/status` | ✓ | json | `swatches.ts:181` |
| `GET` | `/api/swatches/all` | ✓ | — | `swatches.ts:62` |
| `GET` | `/api/swatches/export-all` | ✓ | — | `swatches.ts:55` |
| `GET` | `/api/swatches/for-reference` | ✓ | — | `swatches.ts:67` |
| `POST` | `/api/swatches/import` | ✓ | json | `swatches.ts:201` |

## Masters · Unit Types

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/unit-types-master` | ✓ | — | `unitTypes.ts:20` |
| `POST` | `/api/unit-types-master` | ✓ | json | `unitTypes.ts:43` |
| `PUT` | `/api/unit-types-master/:id` | ✓ | json | `unitTypes.ts:93` |
| `DELETE` | `/api/unit-types-master/:id` | ✓ | — | `unitTypes.ts:124` |
| `PATCH` | `/api/unit-types-master/:id/status` | ✓ | json | `unitTypes.ts:113` |
| `GET` | `/api/unit-types-master/export-all` | ✓ | — | `unitTypes.ts:35` |
| `POST` | `/api/unit-types-master/import` | ✓ | json | `unitTypes.ts:55` |

## Masters · Vendors

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/vendors` | ✓ | — | `vendors.ts:28` |
| `POST` | `/api/vendors` | ✓ | json | `vendors.ts:66` |
| `GET` | `/api/vendors/:id` | ✓ | — | `vendors.ts:58` |
| `PUT` | `/api/vendors/:id` | ✓ | json | `vendors.ts:140` |
| `DELETE` | `/api/vendors/:id` | ✓ | — | `vendors.ts:173` |
| `PATCH` | `/api/vendors/:id/status` | ✓ | json | `vendors.ts:161` |
| `GET` | `/api/vendors/all` | ✓ | — | `vendors.ts:51` |
| `GET` | `/api/vendors/export-all` | ✓ | — | `vendors.ts:43` |
| `POST` | `/api/vendors/import` | ✓ | json | `vendors.ts:83` |

## Orders

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/orders` | ✓ | — | `orders.ts:12` |
| `POST` | `/api/orders` | ✓ | json | `orders.ts:54` |
| `GET` | `/api/orders/:id` | ✓ | — | `orders.ts:45` |
| `PUT` | `/api/orders/:id` | ✓ | json | `orders.ts:70` |
| `DELETE` | `/api/orders/:id` | ✓ | — | `orders.ts:114` |
| `PATCH` | `/api/orders/:id/status` | ✓ | json | `orders.ts:92` |

## Orders · Style Order Artworks

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/style-order-artworks` | ✓ | — | `styleOrderArtworks.ts:24` |
| `POST` | `/api/style-order-artworks` | ✓ | json | `styleOrderArtworks.ts:60` |
| `GET` | `/api/style-order-artworks/:id` | ✓ | — | `styleOrderArtworks.ts:49` |
| `PUT` | `/api/style-order-artworks/:id` | ✓ | json | `styleOrderArtworks.ts:108` |
| `DELETE` | `/api/style-order-artworks/:id` | ✓ | — | `styleOrderArtworks.ts:256` |

## Orders · Style Order Products

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/style-order-products` | ✓ | — | `styleOrderProducts.ts:10` |
| `POST` | `/api/style-order-products` | ✓ | json | `styleOrderProducts.ts:33` |
| `GET` | `/api/style-order-products/:id` | ✓ | — | `styleOrderProducts.ts:24` |
| `PUT` | `/api/style-order-products/:id` | ✓ | json | `styleOrderProducts.ts:45` |
| `DELETE` | `/api/style-order-products/:id` | ✓ | — | `styleOrderProducts.ts:61` |

## Orders · Style Orders

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/style-orders` | ✓ | — | `styleOrders.ts:24` |
| `POST` | `/api/style-orders` | ✓ | json | `styleOrders.ts:71` |
| `GET` | `/api/style-orders/:id` | ✓ | — | `styleOrders.ts:62` |
| `PUT` | `/api/style-orders/:id` | ✓ | json | `styleOrders.ts:88` |
| `DELETE` | `/api/style-orders/:id` | ✓ | — | `styleOrders.ts:125` |
| `PATCH` | `/api/style-orders/:id/status` | ✓ | json | `styleOrders.ts:107` |

## Orders · Swatch Orders

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/swatch-orders` | ✓ | — | `swatchOrders.ts:22` |
| `POST` | `/api/swatch-orders` | ✓ | json | `swatchOrders.ts:66` |
| `GET` | `/api/swatch-orders/:id` | ✓ | — | `swatchOrders.ts:56` |
| `PUT` | `/api/swatch-orders/:id` | ✓ | json | `swatchOrders.ts:126` |
| `DELETE` | `/api/swatch-orders/:id` | ✓ | — | `swatchOrders.ts:204` |
| `PATCH` | `/api/swatch-orders/:id/status` | ✓ | json | `swatchOrders.ts:185` |

## Procurement · Purchase Orders

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/procurement/approved-pos` | ✓ | — | `procurement.ts:815` |
| `GET` | `/api/procurement/item-tracking` | ✓ | — | `procurement.ts:767` |
| `GET` | `/api/procurement/po-numbers` | ✓ | — | `procurement.ts:799` |
| `GET` | `/api/procurement/purchase-orders` | ✓ | — | `procurement.ts:72` |
| `POST` | `/api/procurement/purchase-orders` | ✓ | json | `procurement.ts:158` |
| `GET` | `/api/procurement/purchase-orders/:id` | ✓ | — | `procurement.ts:121` |
| `DELETE` | `/api/procurement/purchase-orders/:id` | ✓ | — | `procurement.ts:268` |
| `PATCH` | `/api/procurement/purchase-orders/:id/status` | ✓ | json | `procurement.ts:224` |
| `GET` | `/api/procurement/purchase-receipts` | ✓ | — | `procurement.ts:287` |
| `POST` | `/api/procurement/purchase-receipts` | ✓ | json | `procurement.ts:377` |
| `GET` | `/api/procurement/purchase-receipts/:id` | ✓ | — | `procurement.ts:347` |
| `PUT` | `/api/procurement/purchase-receipts/:id` | ✓ | json | `procurement.ts:542` |
| `DELETE` | `/api/procurement/purchase-receipts/:id` | ✓ | — | `procurement.ts:698` |
| `POST` | `/api/procurement/purchase-receipts/:id/cancel` | ✓ | json | `procurement.ts:622` |
| `POST` | `/api/procurement/purchase-receipts/:id/confirm` | ✓ | json | `procurement.ts:484` |

## Procurement · Purchase Receipts

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/purchase-receipts` | ✓ | — | `purchaseReceipts.ts:130` |
| `POST` | `/api/purchase-receipts` | ✓ | json | `purchaseReceipts.ts:250` |
| `GET` | `/api/purchase-receipts/:id` | ✓ | — | `purchaseReceipts.ts:227` |
| `PUT` | `/api/purchase-receipts/:id` | ✓ | json | `purchaseReceipts.ts:315` |
| `DELETE` | `/api/purchase-receipts/:id` | ✓ | — | `purchaseReceipts.ts:439` |
| `POST` | `/api/purchase-receipts/:id/cancel` | ✓ | json | `purchaseReceipts.ts:406` |
| `POST` | `/api/purchase-receipts/:id/confirm` | ✓ | json | `purchaseReceipts.ts:361` |
| `GET` | `/api/purchase-receipts/vendors/search` | ✓ | — | `purchaseReceipts.ts:471` |

## Procurement · Vendor Challans

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/vendor-challans` | ✓ | — | `vendorChallans.ts:34` |
| `POST` | `/api/vendor-challans` | ✓ | json | `vendorChallans.ts:77` |
| `GET` | `/api/vendor-challans/:id` | ✓ | — | `vendorChallans.ts:68` |
| `PUT` | `/api/vendor-challans/:id` | ✓ | json | `vendorChallans.ts:110` |
| `DELETE` | `/api/vendor-challans/:id` | ✓ | — | `vendorChallans.ts:140` |
| `PATCH` | `/api/vendor-challans/:id/cancel` | ✓ | json | `vendorChallans.ts:179` |
| `POST` | `/api/vendor-challans/:id/document` | ✓ | multipart | `vendorChallans.ts:381` |
| `DELETE` | `/api/vendor-challans/:id/document` | ✓ | — | `vendorChallans.ts:403` |
| `PATCH` | `/api/vendor-challans/:id/verify` | ✓ | json | `vendorChallans.ts:153` |
| `POST` | `/api/vendor-challans/convert-selected-to-po` | ✓ | json | `vendorChallans.ts:290` |
| `POST` | `/api/vendor-challans/convert-to-po` | ✓ | json | `vendorChallans.ts:212` |
| `POST` | `/api/vendor-challans/preview-po` | ✓ | json | `vendorChallans.ts:192` |

## Procurement · Vendor Ledger

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `POST` | `/api/vendor-ledger/:vendorId/charge` | ✓ | json | `vendorLedger.ts:485` |
| `GET` | `/api/vendor-ledger/:vendorId/entries` | ✓ | — | `vendorLedger.ts:142` |
| `GET` | `/api/vendor-ledger/:vendorId/info` | ✓ | — | `vendorLedger.ts:383` |
| `POST` | `/api/vendor-ledger/:vendorId/pay` | ✓ | json | `vendorLedger.ts:397` |
| `DELETE` | `/api/vendor-ledger/charges/:id` | ✓ | — | `vendorLedger.ts:540` |
| `DELETE` | `/api/vendor-ledger/payments/:id` | ✓ | — | `vendorLedger.ts:530` |
| `GET` | `/api/vendor-ledger/summary` | ✓ | — | `vendorLedger.ts:10` |

## Quotations

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/quotations` | ✓ | — | `quotations.ts:39` |
| `POST` | `/api/quotations` | ✓ | json | `quotations.ts:134` |
| `GET` | `/api/quotations/:id` | ✓ | — | `quotations.ts:101` |
| `PUT` | `/api/quotations/:id` | ✓ | json | `quotations.ts:211` |
| `DELETE` | `/api/quotations/:id` | ✓ | — | `quotations.ts:291` |
| `POST` | `/api/quotations/:id/convert-style` | ✓ | json | `quotations.ts:470` |
| `POST` | `/api/quotations/:id/convert-swatch` | ✓ | json | `quotations.ts:421` |
| `POST` | `/api/quotations/:id/feedback` | ✓ | json | `quotations.ts:341` |
| `POST` | `/api/quotations/:id/revise` | ✓ | json | `quotations.ts:359` |
| `POST` | `/api/quotations/:id/status` | ✓ | json | `quotations.ts:303` |

## Reports

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/reports/client-ledger` | ✓ | — | `reports.ts:191` |
| `GET` | `/api/reports/filter-options` | ✓ | — | `reports.ts:15` |
| `GET` | `/api/reports/gst-summary` | ✓ | — | `reports.ts:320` |
| `GET` | `/api/reports/invoice-summary` | ✓ | — | `reports.ts:134` |
| `GET` | `/api/reports/order-profitability` | ✓ | — | `reports.ts:220` |
| `GET` | `/api/reports/purchase-summary` | ✓ | — | `reports.ts:96` |
| `GET` | `/api/reports/purchase-vs-sales` | ✓ | — | `reports.ts:278` |
| `GET` | `/api/reports/stock-movement` | ✓ | — | `reports.ts:65` |
| `GET` | `/api/reports/stock-summary` | ✓ | — | `reports.ts:33` |
| `GET` | `/api/reports/vendor-ledger` | ✓ | — | `reports.ts:162` |

## Settings

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/settings/activity-logs` | ✓ | — | `settings.ts:442` |
| `POST` | `/api/settings/activity-logs/action` | ✓ | json | `settings.ts:486` |
| `GET` | `/api/settings/activity-logs/users` | ✓ | — | `settings.ts:508` |
| `GET` | `/api/settings/bank-accounts` | ✓ | — | `settings.ts:372` |
| `POST` | `/api/settings/bank-accounts` | ✓ | json | `settings.ts:382` |
| `PUT` | `/api/settings/bank-accounts/:id` | ✓ | json | `settings.ts:398` |
| `DELETE` | `/api/settings/bank-accounts/:id` | ✓ | — | `settings.ts:428` |
| `PATCH` | `/api/settings/bank-accounts/:id/default` | ✓ | json | `settings.ts:414` |
| `GET` | `/api/settings/currencies` | ✓ | — | `settings.ts:248` |
| `PATCH` | `/api/settings/currencies/:code/toggle` | ✓ | json | `settings.ts:274` |
| `PATCH` | `/api/settings/currencies/base` | ✓ | json | `settings.ts:258` |
| `GET` | `/api/settings/download-logs` | ✓ | — | `settings.ts:748` |
| `POST` | `/api/settings/download-logs` | ✓ | json | `settings.ts:722` |
| `GET` | `/api/settings/download-logs/users` | ✓ | — | `settings.ts:786` |
| `GET` | `/api/settings/exchange-rates` | ✓ | — | `settings.ts:296` |
| `PATCH` | `/api/settings/exchange-rates/:code` | ✓ | json | `settings.ts:348` |
| `POST` | `/api/settings/exchange-rates/refresh` | ✓ | json | `settings.ts:314` |
| `GET` | `/api/settings/gst` | ✓ | — | `settings.ts:590` |
| `PUT` | `/api/settings/gst` | ✓ | json | `settings.ts:603` |
| `GET` | `/api/settings/invoice-templates` | ✓ | — | `settings.ts:665` |
| `PATCH` | `/api/settings/invoice-templates/:id` | ✓ | json | `settings.ts:673` |
| `POST` | `/api/settings/invoice-templates/:id/set-default` | ✓ | json | `settings.ts:687` |
| `GET` | `/api/settings/my-permissions` | ✓ | — | `settings.ts:703` |
| `PATCH` | `/api/settings/password` | ✓ | json | `settings.ts:211` |
| `GET` | `/api/settings/profile` | ✓ | — | `settings.ts:172` |
| `PATCH` | `/api/settings/profile` | ✓ | json | `settings.ts:196` |
| `GET` | `/api/settings/warehouses` | ✓ | — | `settings.ts:525` |
| `POST` | `/api/settings/warehouses` | ✓ | json | `settings.ts:534` |
| `PUT` | `/api/settings/warehouses/:id` | ✓ | json | `settings.ts:553` |
| `DELETE` | `/api/settings/warehouses/:id` | ✓ | — | `settings.ts:575` |

## User Management

| Method | Path | Auth | Body | Source |
|---|---|---|---|---|
| `GET` | `/api/user-management/permissions` | — | — | `userManagement.ts:273` |
| `GET` | `/api/user-management/roles` | — | — | `userManagement.ts:449` |
| `POST` | `/api/user-management/roles` | — | json | `userManagement.ts:459` |
| `PUT` | `/api/user-management/roles/:id` | — | json | `userManagement.ts:470` |
| `DELETE` | `/api/user-management/roles/:id` | — | — | `userManagement.ts:489` |
| `PUT` | `/api/user-management/roles/:id/permissions` | — | json | `userManagement.ts:498` |
| `GET` | `/api/user-management/users` | — | — | `userManagement.ts:277` |
| `POST` | `/api/user-management/users` | — | json | `userManagement.ts:294` |
| `PUT` | `/api/user-management/users/:id` | — | json | `userManagement.ts:340` |
| `DELETE` | `/api/user-management/users/:id` | — | — | `userManagement.ts:380` |
| `POST` | `/api/user-management/users/:id/resend-invite` | — | json | `userManagement.ts:395` |
| `POST` | `/api/user-management/users/:id/send-reset` | — | json | `userManagement.ts:419` |
