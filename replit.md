# LeadCatcher MVP

## Overview

LeadCatcher is a multi-tenant lead capture and basic CRM SaaS application for agencies. It allows agency owners to create embeddable form widgets, capture leads from any website, and manage those leads through a simple CRM interface with status tracking, team assignment, notes, and dashboard analytics.

**Core workflow:**
1. Agency owner signs up and logs in
2. Owner creates a customizable form widget (widget builder)
3. Owner copies embed code (iframe pointing to `/embed/:widgetId`) and installs on any website
4. Website visitors submit the form
5. Leads appear in the app for management (status updates, notes, assignment to team reps)
6. Dashboard shows lead counts, status breakdown, and charts

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React + TypeScript with Vite as the build tool
- **Routing:** Wouter (lightweight router, not React Router despite initial spec)
- **UI Components:** Shadcn UI (new-york style) with Tailwind CSS, using CSS variables for theming
- **State Management:** TanStack React Query for server state; no global client state library
- **Charts:** Recharts for dashboard visualizations (Pie, Bar charts)
- **Forms:** Direct state management with useState (not React Hook Form despite it being in deps)
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Pages:** Auth, Dashboard, Widgets (list), WidgetBuilder (create/edit), EmbedForm (public), Leads (list), LeadDetail, Team, NotFound

### Backend
- **Framework:** Express.js with TypeScript, running via `tsx`
- **Authentication:** Passport.js with Local Strategy, using express-session stored in PostgreSQL (connect-pg-simple). Password hashing with bcryptjs.
- **Session cookies:** Authentication uses session cookies with `credentials: "include"` on all fetch requests
- **API structure:** RESTful routes defined in `server/routes.ts`, with a shared API contract in `shared/routes.ts` using Zod schemas for input validation and response typing
- **Authorization:** Role-based with two roles: `owner` (full access) and `rep` (limited access). Multi-tenancy enforced via `agencyId` on every record.
- **Build process:** Custom build script (`script/build.ts`) using esbuild for server and Vite for client. Production output goes to `dist/`.

### Shared Layer (`shared/`)
- **`schema.ts`:** Drizzle ORM table definitions (users, agencies, widgets, leads, notes) with Zod insert schemas via `drizzle-zod`
- **`routes.ts`:** Typed API contract object that both frontend and backend import, defining paths, HTTP methods, Zod input/output schemas for every endpoint. This ensures type-safe API communication.

### Database
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Database:** PostgreSQL (required via `DATABASE_URL` environment variable)
- **Connection:** `pg` Pool in `server/db.ts`
- **Schema push:** `npm run db:push` uses `drizzle-kit push` to sync schema to database
- **Migrations directory:** `./migrations`
- **Multi-tenancy:** Achieved by storing `agencyId` on users, widgets, leads, and filtering all queries by the logged-in user's `agencyId`

### Key Tables
- **users:** id, email, password, name, role (owner/rep), agencyId
- **agencies:** id, name
- **widgets:** id, agencyId, name, fields (JSONB array of form field configs), primaryColor, headingText
- **leads:** id, agencyId, widgetId, name, email, phone, formResponses (JSONB), status (new/contacted/qualified/converted/closed_lost), assignedTo
- **notes:** id, leadId, content, userId, timestamps

### Development vs Production
- **Dev:** `npm run dev` runs `tsx server/index.ts` with Vite dev server middleware (HMR enabled)
- **Build:** `npm run build` compiles client with Vite and server with esbuild
- **Production:** `npm start` runs the compiled `dist/index.cjs` and serves static files from `dist/public`

### Key Design Decisions
1. **Shared API contract** (`shared/routes.ts`): Both client and server import the same route definitions with Zod schemas, providing end-to-end type safety without code generation
2. **Session-based auth over JWT:** Uses express-session with PostgreSQL session store rather than JWT tokens, simplifying CSRF handling and session management
3. **Drizzle over other ORMs:** Lightweight, type-safe SQL with PostgreSQL, avoiding the complexity of Prisma or TypeORM
4. **No WebSockets in MVP:** Leads don't appear in real-time; the client uses React Query with manual invalidation
5. **Public embed routes:** Widget forms are served at `/embed/:widgetId` without authentication, allowing iframe embedding on external sites

## External Dependencies

### Required Services
- **PostgreSQL Database:** Required. Connection via `DATABASE_URL` environment variable. Used for all data storage and session management.

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Secret for signing session cookies (defaults to "super_secret_key" in dev)
- `NODE_ENV` — "development" or "production"

### Notable NPM Packages
- `drizzle-orm` + `drizzle-kit` — ORM and schema management
- `express-session` + `connect-pg-simple` — Session management backed by PostgreSQL
- `passport` + `passport-local` — Authentication strategy
- `bcryptjs` — Password hashing (pure JS, no native bindings)
- `recharts` — Dashboard charts
- `@tanstack/react-query` — Server state management
- `zod` + `drizzle-zod` — Runtime validation and schema generation
- `wouter` — Client-side routing
- Full Shadcn UI component library (Radix UI primitives)

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` — Dev tooling (dev only)
- `@replit/vite-plugin-dev-banner` — Dev banner (dev only)