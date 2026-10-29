# ERP Workspace

## Overview

ERP is a full-stack ERP authentication system built for ERP. It is designed to streamline business operations, from procurement and inventory management to order processing and quotations. The system aims to centralize various business functions into a single platform, enhancing efficiency and data consistency. Key capabilities include comprehensive authentication, master data management for HSN, materials, and fabrics, a unified procurement workflow (Purchase Order to Purchase Receipt), and a robust quotation module with revision and conversion features.

## User Preferences

- I prefer clear and concise explanations.
- I appreciate iterative development with regular updates.
- Please ask for confirmation before implementing major changes or architectural shifts.
- I prefer descriptive commit messages.
- Ensure all new features are accompanied by relevant tests.

## Running on Replit

- Install the existing workspace dependencies with `pnpm install --frozen-lockfile`.
- The ERP frontend runs through `artifacts/zari-erp: web`; the backend runs through `artifacts/api-server: API Server`.
- Use the managed workflows so each service receives its assigned `PORT` and `BASE_PATH`. API requests are routed by Replit's shared proxy, not a Vite localhost proxy.
- If an unrelated backend package blocks the full install, `pnpm --filter @workspace/zari-erp... install --frozen-lockfile` installs only the frontend and its workspace dependencies. This allows the login page to load but does not enable sign-in or database features without the backend.
- The API and its dependencies can be installed with `pnpm --filter @workspace/api-server... install --frozen-lockfile` without installing API code-generation tooling.
- For an empty database, apply the committed migrations with `pnpm --filter @workspace/db run migrate` before starting the backend. Do not use schema push or restore the repository's SQL backup without approval.
- The legacy bulk `scripts/seed.sql` is not compatible with the current users schema. Do not run it unchanged against a fresh database; use an admin-only bootstrap and separately seed the role/permission baseline. The API synchronizes missing admin permissions on startup.

## System Architecture

The project is structured as a pnpm monorepo using TypeScript, targeting Node.js 24. It comprises two main artifacts: a React frontend (`artifacts/zari-erp`) and an Express.js backend (`artifacts/api-server`).

### UI/UX Decisions
- **Design System**: Utilizes Tailwind CSS for styling.
- **Components**: Features a set of reusable UI components (e.g., `ZariButton`, `InputField`, `MasterTable`, `MasterFormModal`) for consistency and rapid development.
- **Navigation**: A `TopNavbar` provides primary navigation with dropdowns for "Masters" and "Procurement."
- **Forms**: Styled form controls include labels and inline error handling.
- **Modals**: Centered modals with clear headers, footers, and keyboard navigation.
- **Theming**: A primary button style uses a black background with gold text, reflecting Zari branding.

### Technical Implementations
- **Monorepo**: Managed with pnpm workspaces for efficient dependency management.
- **Authentication**: Implemented using JWT tokens for session management and bcrypt for password hashing.
- **API Framework**: Express 5 serves as the backend API framework.
- **Database ORM**: Drizzle ORM is used with PostgreSQL for database interactions.
- **Validation**: Zod is employed for schema validation on both frontend and backend.
- **API Codegen**: Orval generates API hooks and Zod schemas from an OpenAPI specification, ensuring type safety and consistency between frontend and backend.
- **Build System**: esbuild is used for bundling backend code into CJS.
- **File Uploads**: Features a modular storage abstraction layer with interchangeable drivers (local disk, with S3 stub for future integration). Files are organized into a structured folder layout based on entity and category.

### Feature Specifications
- **Master Data Management**: Full CRUD operations for HSN, Materials, and Fabrics, including auto-generated codes and status toggles. Swatch Category Master and Style Category Master include bulk import (Download Sample Excel / Upload Excel), export-all (respects search + status filters, Active/Inactive labels, DD-MM-YYYY HH:mm:ss dates), regex validation (letters and spaces only, max 100 chars), real-time char counter, save button disabled until valid, and duplicate-check on create/edit.
- **Style Master**: Fully overhauled. Add/Edit Style now uses a dedicated page (`/masters/styles/new`, `/masters/styles/:id/edit`) with a two-column layout (fields + media/swatch). Features: Excel Import (Download Sample / Upload Excel), Export All to Excel, Status change confirmation modal, full form validations (Client required, Style Category required, Description required, Place of Issue required, Shipping Date no-past validation, Attach Link URL format validation, field length limits), WIP/Final media upload support (inline upload for new records, MediaUploadSection for edit), Reference Swatch linking with inline swatch creation, Clear Filters button. Backend: `GET /api/styles/export-all`, `POST /api/styles/import` (row-level validation with error report), `GET /api/styles/:id` (single record fetch). Fixed route ordering so `/export-all`, `/import`, `/for-reference` come before `/:id`.
- **Procurement Module**: Unified Purchase Order (PO) to Purchase Receipt (PR) workflow, including detailed item tracking, status transitions, and integration with inventory.
- **Quotation Module**: Comprehensive quotation management with unique numbering, client details, design attachments, custom charges, GST logic, status workflow (Draft → Sent → Client Reviewing → Approved/Rejected/Revised), feedback logging, and conversion to Swatch or Style orders.

## External Dependencies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API Definition**: OpenAPI
- **Frontend Framework**: React
- **Frontend Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Authentication**: jsonwebtoken, bcryptjs
- **Validation**: Zod
- **Excel Export**: `xlsx` library
- **File Uploads**: Multer (for multipart/form-data)

## Client portal account operations

- Set `CLIENT_PORTAL_ORIGIN` to the trusted HTTPS application origin (no path, credentials, query, or fragment). Configure the published origin explicitly in the deployment environment; incoming request hosts are never used for client invitations. Development may use an explicitly configured localhost HTTP origin.
- Client account email uses existing SMTP settings: `EMAIL_USER`, `EMAIL_PASS`, and optionally `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_FROM`. Without working SMTP, staff see a delivery failure and access stays disabled. Do not send bulk or real-client invitations as a setup check.
- Client account cookies and credentials are separate from employee bearer tokens. Account entry is `/client`; existing `/client/:token` shared links retain their existing publication rules. Account home is read-only and shows only owned, published, non-deleted orders, excluding hidden images.
- Run account regression checks with `pnpm --filter @workspace/api-server exec vitest run src/routes/__tests__/clientAccount.integration.test.ts`. They use a disposable PostgreSQL schema and mocked mail transport, never real recipients.