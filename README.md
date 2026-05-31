# 🩺 Medi-Help — Clinic Management & EMR System

**Medi-Help** is a full-stack Electronic Medical Record (EMR) and Clinic Management System built for doctors, receptionists, and clinic administrators. It handles the complete clinic workflow — from patient registration and clinical visit documentation to follow-up scheduling, billing, and analytics — in a single cohesive platform.

Built with **Next.js 16 (App Router)**, **Prisma 7**, **PostgreSQL**, and **Ant Design**, the system uses React Server Components and Server Actions for a zero-API-overhead architecture. It features role-based access control, dark/light theme support, and a responsive design that works across desktop and mobile devices.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Working Flow — How the Platform Works](#-working-flow--how-the-platform-works)
- [Technical Architecture](#-technical-architecture)
- [Project Structure & Module Guide](#-project-structure--module-guide)
- [Database Schema](#-database-schema)
- [Authentication & RBAC](#-authentication--rbac)
- [API Routes](#-api-routes)
- [UI Component Library](#-ui-component-library)
- [Local Development Setup](#-local-development-setup)
- [Database Seeding](#-database-seeding)
- [Environment Variables](#-environment-variables)
- [Tech Stack Summary](#-tech-stack-summary)

---

## ✨ Features Overview

### 1. 🏥 Patient Management (`/patients`)
- **Patient Registry** — Searchable, paginated list of all patients with type-ahead search by name, phone, or patient ID.
- **Auto-generated Clinic IDs** — Sequential IDs in `CLINIC-XXXXX` format (e.g., `CLINIC-00001`) generated server-side.
- **Comprehensive Demographics** — Name, phone, email, gender, date of birth, blood group, address.
- **Medical History** — Free-text fields for allergies and chronic conditions, displayed with visual highlights.
- **Patient Categorization** — Assign patients to customizable types (e.g., *Diabetic*, *Cardiac*, *Pediatric*, *Orthopedic*, *General*) for segmented analytics.
- **Patient Profile** (`/patients/[id]`) — Full profile with demographics, medical info, visit summary stats, and complete visit timeline with vitals.

### 2. 📋 Clinical Visit / EMR Entry (`/patients/[id]/visits/new`)
The core clinical workflow for doctors during consultations:
- **Vitals Capture** — Blood pressure (text, e.g. "120/80"), temperature (°F), pulse (bpm), height (m), weight (kg), and **auto-calculated BMI**.
- **Risk Factor Assessment** — Lifestyle checkboxes (Non-Veg, Alcohol, Smoking) plus free-text fields for drug allergies and surgery history.
- **Structured Clinical Notes**:
  - Chief Complaint (required)
  - History of Present Illness
  - Physical Examination
  - Provisional Diagnosis
  - Investigations / Lab Tests
  - Final Diagnosis
- **Legacy Fields** — Symptoms, Diagnosis, Prescription, and Lab Tests fields for backward compatibility.
- **Scheduling** — Setting a "Next Visit Date" automatically creates a follow-up reminder.
- **Billing** — Consultation fee (₹) and payment mode (Cash / UPI / Card / Insurance) recorded per visit.
- **Immutable Records** — Visit records are append-only; no update or delete is exposed to preserve medical audit integrity.
- **PDF Download** (`/patients/[id]/visits/[visitId]`) — Generate a branded prescription-style PDF with patient info, vitals, clinical notes, and billing via `jsPDF`.

### 3. 📅 Follow-up Management (`/followups`)
Automated patient retention and appointment tracking:
- **Auto-Scheduling** — When a visit includes a "Next Visit Date", a follow-up record is automatically created with status `CONFIRMED` and method `WHATSAPP`.
- **Tab-Based Views** — Today, Upcoming, Missed, and Completed tabs with live badge counts.
- **Status Lifecycle** — `CONFIRMED` → `RESCHEDULED` / `VISITED` / `NO_RESPONSE` / `MISSED`.
- **WhatsApp Integration** — Pre-generated reminder messages (appointment reminders and missed-appointment messages) with one-click WhatsApp Web links. Phone numbers are automatically cleaned and formatted with India country code (`91`).
- **Quick Actions** — Mark as Visited, Reschedule to a new date, update status, all via Server Actions.
- **Search** — Filter follow-ups by patient name, phone, or patient ID.

### 4. 💰 Billing & Revenue (`/billing`)
- **Revenue KPIs** — Today's revenue, monthly revenue, total revenue, and average fee per visit.
- **Payment Mode Breakdown** — Aggregated revenue by Cash, UPI, Card, and Insurance for the current month.
- **Revenue Trend Charts** — 6-month revenue trend line (Recharts).
- **Revenue by Patient Type** — Pie chart showing revenue distribution across patient categories.
- **Today's Revenue Detail** — Itemized table of today's billable visits with patient name, time, fee, and payment mode.

### 5. 📊 Dashboard (`/dashboard`)
Real-time clinic intelligence hub:
- **9 KPI Cards** — Total patients, new patients this month, repeat patient %, today's appointments, today's visits, upcoming follow-ups, missed follow-ups, monthly revenue, and top patient type.
- **3 Interactive Charts** (Recharts):
  - Visit trend (6-month bar chart)
  - Revenue trend (6-month area chart)
  - Patient type distribution (pie chart)
- **Recent Visits Feed** — Last 5 visits with patient name, ID, date, fee, and diagnosis.

### 6. 📈 Analytics (`/analytics`)
Deep clinic performance insights:
- **Follow-up Compliance KPIs** — Total follow-ups, attended, missed, and compliance rate percentage.
- **5 Interactive Charts** (Recharts):
  - Patient growth (12-month line chart of new registrations)
  - Disease distribution (pie chart by patient type, including uncategorized)
  - Visit frequency distribution (bar chart: 1, 2, 3, 4, 5+ visits per patient)
  - Revenue trend (12-month bar chart)
  - Revenue by patient type (bar chart)

### 7. 🌙 Dark Mode & Responsive Design
- **Theme Toggle** — System, Light, and Dark modes via `next-themes`.
- **Custom Design System** — CSS variables for primary (teal), secondary, success, warning, danger colors with distinct light/dark palettes.
- **Responsive Sidebar** — Auto-collapsing on desktop (hover to expand), mobile drawer with overlay.
- **Height-Responsive Sidebar** — Compact layout on short screens (laptops < 800px height).

---

## 🔄 Working Flow — How the Platform Works

Below is a step-by-step walkthrough of the complete clinic workflow with realistic examples.

### Step 1: Login & Authentication

A staff member opens the app and is redirected to `/login`.

> **Example**: Dr. Dibyanshu logs in with `doctor@medihelp.com` / `doctor123`.

- The system authenticates via NextAuth.js with bcrypt password comparison.
- A JWT token is issued containing `user.id` and `user.role` (e.g., `DOCTOR`).
- The user is redirected to `/dashboard`.

### Step 2: Dashboard Overview

The doctor sees the **Dashboard** with real-time clinic metrics:

> **What the doctor sees**:
> - Total Patients: **12** | New This Month: **4** | Repeat Patient %: **67%**
> - Today's Appointments: **3** | Monthly Revenue: **₹5,200**
> - A 6-month visit trend chart showing seasonal patterns.
> - Recent visits: "Rajesh Kumar — Diabetes Type 2 - Improving — ₹400"

### Step 3: Register a New Patient

The receptionist navigates to `/patients` → clicks **"+ New Patient"**.

> **Example**: Registering a new patient **Priya Gupta**:
> - Name: `Priya Gupta` | Phone: `9876543230` | Gender: `FEMALE`
> - Date of Birth: `1992-04-15` | Blood Group: `O+`
> - Allergies: `Penicillin` | Chronic Conditions: `None`
> - Patient Type: `General`
>
> On submit, the system auto-generates ID **`CLINIC-00013`** and redirects to the patient profile.

**How it works internally**:
1. The `createPatient` Server Action runs on the server.
2. `generatePatientNumber()` counts existing patients (`12`) and generates `CLINIC-00013`.
3. A `Patient` record is created in PostgreSQL via Prisma.
4. `revalidatePath('/patients')` ensures the patient list is fresh.

### Step 4: Record a Clinical Visit (EMR Entry)

From Priya's profile, the doctor clicks **"+ New Visit"** → lands on `/patients/[id]/visits/new`.

> **Example Visit**:
>
> **Vitals**:
> - BP: `120/80` | Temperature: `100.4°F` | Pulse: `88 bpm`
> - Height: `1.62 m` | Weight: `58 kg` → BMI: **22.10** (auto-calculated)
>
> **Risk Factors**: Non-Veg ✓ | Alcohol ✗ | Smoking ✗
>
> **Clinical Notes**:
> - Chief Complaint: `Fever and body aches for 3 days`
> - History of Present Illness: `Patient reports intermittent fever with chills, body pain, and mild headache since Monday`
> - Examination: `Throat mildly congested, no lymphadenopathy`
> - Provisional Diagnosis: `Viral fever`
> - Investigations: `CBC, Dengue NS1`
> - Final Diagnosis: `Acute viral upper respiratory infection`
>
> **Scheduling & Billing**:
> - Next Visit Date: `2026-06-06` | Fee: `₹400` | Payment: `UPI`

**What happens on submit**:
1. The `createVisit` Server Action validates inputs (height between 0.5–2.5m, weight between 1–300kg).
2. A `Visit` record is created with all clinical data, vitals, and billing info.
3. **Because a Next Visit Date was set**, a `FollowUp` record is automatically created:
   - `followUpDate: 2026-06-06`, `method: WHATSAPP`, `status: CONFIRMED`
   - `notes: "Auto-scheduled from visit on 5/30/2026"`
4. `revalidatePath` is called for `/patients/[id]`, `/patients`, `/followups`, and `/dashboard` to refresh all related pages.
5. The doctor is redirected back to Priya's patient profile showing the new visit in the timeline.

### Step 5: View Visit Detail & Download PDF

From the patient profile, clicking **"View Details →"** on any visit leads to `/patients/[id]/visits/[visitId]`.

> The doctor clicks **"📥 Download PDF"** to generate a branded prescription PDF:
> - Header: "MediHelp Clinic" in teal
> - Patient info: Name, ID, phone, type, age, gender, blood group, allergies
> - Visit details: Date, vitals, all clinical notes
> - Billing: ₹400 via UPI
> - Next appointment: Friday, June 6, 2026
> - Footer: "Computer-generated document — no signature required"

### Step 6: Manage Follow-ups

The receptionist navigates to `/followups`:

> **Upcoming Tab**: Shows Priya Gupta's follow-up for June 6 with status `CONFIRMED`.
>
> **Pre-generated WhatsApp message**:
> ```
> Hello Priya Gupta, this is a reminder from MediHelp Clinic for your appointment
> scheduled on Friday, 6 June 2026. Kindly confirm your visit. Thank you. 🙏
> ```
>
> The receptionist clicks **"📲 WhatsApp"** → Opens `wa.me/919876543230?text=...` in a new tab.

**If Priya doesn't show up** (date passes without status update):
- The follow-up appears in the **Missed** tab.
- The message changes to:
  ```
  Hello Priya Gupta, we noticed you missed your appointment on Friday, 6 June 2026
  at MediHelp Clinic. Your health is our priority. Please reply to reschedule. 🙏
  ```

**Actions available**:
- **Mark as Visited** → Status changes to `VISITED`
- **Reschedule** → Prompts for new date, status changes to `RESCHEDULED`
- **Update Status** → Set to `NO_RESPONSE`, `MISSED`, etc.

### Step 7: Monitor Revenue (Billing)

The doctor checks `/billing` at end of day:

> **Today's Revenue**: ₹2,100 (5 visits) | **Monthly Revenue**: ₹18,400
>
> Payment breakdown this month: Cash 45%, UPI 40%, Card 10%, Insurance 5%
>
> Today's detail table:
> | Patient | ID | Time | Fee | Mode |
> |---|---|---|---|---|
> | Priya Gupta | CLINIC-00013 | 10:30 AM | ₹400 | UPI |
> | Rajesh Kumar | CLINIC-00001 | 11:15 AM | ₹500 | Cash |
> | ... | ... | ... | ... | ... |

### Step 8: Analyze Clinic Performance (Analytics)

The doctor reviews `/analytics` for strategic insights:

> **Follow-up Compliance**: 72% (54 of 75 follow-ups resulted in visits)
>
> **Patient Growth Chart**: Steady increase from 5 patients/month to 12/month over the past year.
>
> **Disease Distribution**: General 40%, Diabetic 25%, Cardiac 15%, Pediatric 12%, Orthopedic 8%
>
> **Visit Frequency**: 35% of patients have 1 visit, 25% have 2 visits, 20% have 3+

---

## 🏗 Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React 19 (Client Components) + Server Components       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / RSC Protocol
┌─────────────────────▼───────────────────────────────────┐
│              Next.js 16 App Router                       │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Server      │  │ Server       │  │ API Routes     │  │
│  │ Components  │  │ Actions      │  │ (/api/...)     │  │
│  │ (pages)     │  │ (mutations)  │  │ (REST)         │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬─────────┘  │
│         │                │                  │            │
│  ┌──────▼──────────────▼──────────────────▼──────────┐  │
│  │           Service Layer (lib/services/)            │  │
│  │   dashboardService.ts  │  analyticsService.ts      │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │     Prisma 7 ORM  (lib/db/prisma.ts)              │  │
│  │     PrismaPg Adapter + Connection Pooling (pg)     │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │     NextAuth.js 4  (lib/authOptions.ts)           │  │
│  │     JWT Strategy + RBAC (DOCTOR/RECEPTIONIST)      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  PostgreSQL Database                      │
│    User │ PatientType │ Patient │ Visit │ FollowUp       │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Server Actions over API routes** | Mutations (create patient, create visit, update follow-up) use Server Actions for type-safe, co-located server-side logic without separate API endpoints. |
| **Server Components for data fetching** | All pages (`dashboard`, `patients`, `billing`, `analytics`, `followups`) are async Server Components that fetch data directly from the database. No client-side data fetching for page loads. |
| **Client Components for interactivity** | Forms (`NewVisitPage`, `LoginPage`), charts (`DashboardCharts`, `BillingCharts`, `AnalyticsCharts`), sidebar, and theme toggle are `'use client'` components. |
| **`Promise.all` parallel queries** | Dashboard and billing pages run 10–12 database queries in parallel for fast page loads. |
| **Prisma PrismaPg adapter** | Uses `@prisma/adapter-pg` with a `pg` connection pool for direct PostgreSQL wire protocol access. Singleton pattern prevents connection leaks in development. |
| **Immutable visit records** | No `updateVisit` or `deleteVisit` Server Actions exist. Visit records are append-only to preserve clinical audit trails. |
| **Auto-generated patient numbers** | `CLINIC-XXXXX` IDs are generated server-side from `patient.count() + 1` — never exposed to client input. |

---

## 📂 Project Structure & Module Guide

```
medi-help/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Providers + AppLayout)
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── providers.tsx             # SessionProvider + ThemeProvider (client)
│   ├── globals.css               # Design system (CSS variables, dark mode, animations)
│   │
│   ├── login/
│   │   └── page.tsx              # Login page (client) — email/password form
│   │
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard (server) — KPIs + recent visits
│   │   └── DashboardCharts.tsx   # Charts (client) — visit trend, revenue, patient types
│   │
│   ├── patients/
│   │   ├── page.tsx              # Patient list (server) — search, paginate, filter
│   │   ├── actions.ts            # Server Actions: createPatient, updatePatient, getPatientTypes
│   │   ├── new/
│   │   │   └── page.tsx          # New patient form (client)
│   │   └── [id]/
│   │       ├── page.tsx          # Patient profile (server) — demographics + visit timeline
│   │       └── visits/
│   │           ├── actions.ts    # Server Action: createVisit (+ auto follow-up)
│   │           ├── new/
│   │           │   └── page.tsx  # New visit/EMR form (client) — vitals, clinical, billing
│   │           └── [visitId]/
│   │               ├── page.tsx              # Visit detail (server)
│   │               └── VisitDownloadButton.tsx # PDF generation (client, jsPDF)
│   │
│   ├── followups/
│   │   ├── page.tsx              # Follow-ups list (server) — tabs, search, pagination
│   │   ├── actions.ts            # Server Actions: reschedule, markAsVisited, updateStatus
│   │   └── FollowUpActions.tsx   # Action buttons (client)
│   │
│   ├── billing/
│   │   ├── page.tsx              # Billing page (server) — revenue KPIs + detail table
│   │   └── BillingCharts.tsx     # Revenue charts (client)
│   │
│   ├── analytics/
│   │   ├── page.tsx              # Analytics page (server) — compliance KPIs
│   │   └── AnalyticsCharts.tsx   # Analytics charts (client) — 5 chart types
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth catch-all route
│   │   ├── patients/[id]/
│   │   │   └── route.ts          # GET /api/patients/:id — patient lookup (used by visit form)
│   │   └── patient-types/
│   │       └── route.ts          # GET /api/patient-types — list types (used by forms)
│   │
│   └── components/ui/            # Reusable UI components
│       ├── StatCard.tsx           # KPI metric cards with icon, value, subtitle, link
│       ├── Badge.tsx              # Status badges (default, secondary, success, danger, warning)
│       ├── Card.tsx               # Generic card wrapper
│       ├── Pagination.tsx         # Page navigation controls
│       ├── Search.tsx             # Search input with URL query param sync
│       ├── Filter.tsx             # Filter dropdown
│       ├── FilterPopover.tsx      # Advanced filter popover
│       ├── DashboardFilter.tsx    # Dashboard-specific filter controls
│       ├── DateRangeFilter.tsx    # Date range preset selector
│       ├── ActiveFilters.tsx      # Active filter tag display
│       ├── ExportButton.tsx       # Excel/PDF export trigger (client)
│       ├── ClientTooltip.tsx      # Recharts tooltip wrapper
│       └── ThemeToggle.tsx        # Dark/light/system theme toggle
│
├── components/                   # Shared layout components
│   ├── AppLayout.tsx             # Main layout — sidebar + content area (client)
│   ├── Sidebar.tsx               # Navigation sidebar with groups, user profile, sign out (client)
│   ├── Navbar.tsx                # Top navigation bar (currently unused)
│   ├── WhatsAppActions.tsx       # WhatsApp link + copy button (client)
│   ├── copyButton.tsx            # Generic clipboard copy button
│   └── analytics/                # GST analytics components (from prior system)
│       ├── GstLeakageList.tsx
│       ├── GstRateMixChart.tsx
│       └── GstTrendChart.tsx
│
├── lib/                          # Core business logic & utilities
│   ├── authOptions.ts            # NextAuth configuration (Credentials provider, JWT callbacks)
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   ├── auth/
│   │   └── requireRole.ts        # RBAC guard: requireRole(['DOCTOR']), hasRole('ADMIN')
│   ├── db/
│   │   └── prisma.ts             # Prisma client singleton (PrismaPg adapter, connection pool)
│   ├── services/
│   │   ├── dashboardService.ts   # getDashboardData() — 12 parallel queries for KPIs & charts
│   │   └── analyticsService.ts   # 6 analytics functions: growth, distribution, frequency, compliance, revenue
│   ├── collections/
│   │   └── messageTemplates.ts   # WhatsApp message generators (reminder, missed, health check)
│   ├── constants/
│   │   └── colors.ts             # Chart palettes and semantic color tokens
│   └── utils/
│       └── date.ts               # getNextNDays(), getDateRangeFromPreset() (7 presets)
│
├── types/
│   └── next-auth.d.ts            # NextAuth type augmentation (adds id, role to Session & JWT)
│
├── prisma/
│   ├── schema.prisma             # Database schema (5 models, 11 indexes)
│   └── seed.ts                   # Seed script — 2 users, 5 types, 12 patients, 11 visits, follow-ups
│
├── prisma.config.ts              # Prisma config (datasource URL, seed command)
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies & scripts
├── password.js                   # Utility: bcrypt hash generator for manual password creation
└── .gitignore                    # Git ignore rules
```

---

## 🗄 Database Schema

5 models with 11 indexed fields for optimized querying:

```
┌──────────────┐       ┌───────────────┐
│    User      │       │  PatientType  │
├──────────────┤       ├───────────────┤
│ id (UUID)    │       │ id (UUID)     │
│ name         │       │ name (unique) │
│ email (uniq) │       │ description?  │
│ password     │       │ createdAt     │
│ role         │       └──────┬────────┘
│ createdAt    │              │ 1:N
└──────────────┘              │
                       ┌──────▼────────┐
                       │   Patient     │
                       ├───────────────┤
                       │ id (UUID)     │
                       │ patientNumber │ ← auto: CLINIC-XXXXX
                       │ name          │
                       │ phone  [idx]  │
                       │ email?        │
                       │ gender?       │
                       │ dateOfBirth?  │
                       │ bloodGroup?   │
                       │ allergies?    │
                       │ chronicCond.? │
                       │ address?      │
                       │ patientTypeId?│
                       │ createdAt[idx]│
                       │ updatedAt     │
                       └──┬─────────┬──┘
                     1:N  │         │  1:N
              ┌───────────▼──┐   ┌──▼───────────┐
              │    Visit     │   │  FollowUp    │
              ├──────────────┤   ├──────────────┤
              │ id (UUID)    │   │ id (UUID)    │
              │ patientId[ix]│   │ patientId[ix]│
              │ visitDate[ix]│   │ visitId?     │
              │ bp?          │   │ followUpDt[i]│
              │ temperature? │   │ method       │ ← CALL|WHATSAPP|SMS|VISIT
              │ pulse?       │   │ status  [idx]│ ← CONFIRMED|NO_RESPONSE|
              │ weight?      │   │ notes?       │   RESCHEDULED|VISITED|MISSED
              │ height?      │   │ nextFollowUp?│
              │ bmi?         │   │ createdAt    │
              │ isNonVeg?    │   │ updatedAt    │
              │ alcohol?     │   └──────────────┘
              │ smoking?     │
              │ drugAllergy? │
              │ surgeryHist? │
              │ chiefCompl.? │
              │ historyPI?   │
              │ examination? │
              │ provDiag?    │
              │ investig.?   │
              │ finalDiag?   │
              │ symptoms?    │  ← legacy
              │ diagnosis?   │  ← legacy
              │ prescription?│
              │ labTests?    │  ← legacy
              │ nextVisitDt? │[ix]
              │ fee?         │
              │ paymentMode? │ ← CASH|UPI|CARD|INSURANCE
              │ notes?       │
              │ createdAt    │
              └──────────────┘
```

### Key Relationships
- `PatientType` → `Patient` (1:N) — Each patient can belong to one category.
- `Patient` → `Visit` (1:N) — A patient has many visits; visits are immutable records.
- `Patient` → `FollowUp` (1:N) — A patient has many follow-ups.
- `Visit` → `FollowUp` (1:N optional) — A follow-up may be linked to the visit that spawned it.

### Indexes
Performance-critical indexes on: `Patient.phone`, `Patient.patientNumber`, `Patient.createdAt`, `Patient.name`, `Visit.patientId`, `Visit.visitDate`, `Visit.nextVisitDate`, `FollowUp.patientId`, `FollowUp.followUpDate`, `FollowUp.status`.

---

## 🔐 Authentication & RBAC

### Auth Flow
1. **Login** — User submits email/password to NextAuth's `CredentialsProvider`.
2. **Verification** — Server looks up user by email, compares password hash using `bcrypt`.
3. **JWT Token** — On success, a JWT is created with `id` and `role` via the `jwt` callback.
4. **Session** — The `session` callback injects `id` and `role` into `session.user`.
5. **Protection** — Every page calls `getServerSession()` and redirects to `/login` if unauthenticated.

### Roles
| Role | Permissions |
|---|---|
| `DOCTOR` | Full access to all modules |
| `RECEPTIONIST` | Patient management, follow-ups (limited clinical access) |
| `ADMIN` | Reserved for future use |

### Role Guard Usage
```typescript
// In Server Actions or API routes
import { requireRole } from '@/lib/auth/requireRole'

await requireRole(['DOCTOR'])           // Throws if not a DOCTOR
const isDoc = await hasRole('DOCTOR')   // Returns boolean for conditional rendering
```

### Type Augmentation
NextAuth types are extended in `types/next-auth.d.ts` to include `id: string` and `role: string` on `Session.user`, `User`, and `JWT`.

---

## 🌐 API Routes

The application primarily uses Server Actions for mutations, but has two REST API routes:

| Method | Endpoint | Purpose | Used By |
|---|---|---|---|
| `GET` | `/api/patients/[id]` | Fetch patient name and basic info | New Visit form (client-side fetch for display) |
| `GET` | `/api/patient-types` | List all patient types | New Patient form (dropdown population) |
| `*` | `/api/auth/[...nextauth]` | NextAuth authentication endpoints | Login flow |

### Server Actions (Primary Mutation Layer)

| Action | File | Description |
|---|---|---|
| `createPatient` | `app/patients/actions.ts` | Creates patient with auto-generated ID |
| `updatePatient` | `app/patients/actions.ts` | Updates demographics |
| `getPatientTypes` | `app/patients/actions.ts` | Fetches patient type list |
| `createVisit` | `app/patients/[id]/visits/actions.ts` | Records visit + auto follow-up |
| `rescheduleFollowUp` | `app/followups/actions.ts` | Reschedules to new date |
| `markAsVisited` | `app/followups/actions.ts` | Marks follow-up as attended |
| `updateFollowUpStatus` | `app/followups/actions.ts` | Updates status + notes |

---

## 🧩 UI Component Library

Located in `app/components/ui/`:

| Component | Description |
|---|---|
| `StatCard` | KPI card with icon (emoji), title, value, optional subtitle, optional link, and danger variant |
| `Badge` | Colored label pill — variants: `default`, `secondary`, `success`, `danger`, `warning` |
| `Card` | Card container with title section and content area |
| `Pagination` | Page number navigation with prev/next, preserves query params |
| `Search` | Debounced search input that syncs to URL `?q=` param |
| `Filter` | Dropdown filter that syncs to URL query params |
| `FilterPopover` | Advanced popover with multiple filter options |
| `DashboardFilter` | Dashboard-specific combined filters |
| `DateRangeFilter` | Preset date range selector (This Week, This Month, Last 30 Days, etc.) |
| `ActiveFilters` | Displays and allows removing currently active filter tags |
| `ExportButton` | Dropdown to trigger Excel or PDF export via `/api/export` |
| `ClientTooltip` | Recharts-compatible tooltip with dark mode support |
| `ThemeToggle` | System / Light / Dark theme switcher |

### Layout Components (`components/`)

| Component | Description |
|---|---|
| `AppLayout` | Root layout wrapper — conditionally renders sidebar (hidden on `/login`), handles responsive spacer |
| `Sidebar` | Full navigation sidebar with 3 groups (Overview, Clinic, Finance), user avatar, sign out, collapse/expand on hover, mobile drawer |
| `WhatsAppActions` | Opens WhatsApp Web with pre-filled message and phone number; includes copy-to-clipboard |

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js** v20+
- **PostgreSQL** database (local, Docker, Supabase, or any hosted instance)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dibyansh01/Medi-Help.git
cd Medi-Help

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables
cp .env.example .env   # Then edit .env with your values (see below)

# 4. Push database schema
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. (Optional) Seed the database with demo data
npx --yes tsx prisma/seed.ts

# 7. Start the development server
npm run dev
```

The application will be available at **`http://localhost:3000`**.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma studio` | Open Prisma Studio GUI for database |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |
| `npx --yes tsx prisma/seed.ts` | Seed database with demo data |

---

## 🌱 Database Seeding

The seed script (`prisma/seed.ts`) populates the database with realistic demo data:

### Seeded Data

| Entity | Count | Details |
|---|---|---|
| **Users** | 2 | Dr. Dibyanshu (DOCTOR), Priya Sharma (RECEPTIONIST) |
| **Patient Types** | 5 | General, Diabetic, Cardiac, Pediatric, Orthopedic |
| **Patients** | 12 | Realistic Indian names, varied demographics, blood groups, conditions |
| **Visits** | 11 | Spread across last 60 days with vitals, diagnoses, prescriptions, fees |
| **Follow-ups** | ~9 | Mix of auto-generated (from visits) and manual, varied statuses |

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Doctor | `doctor@medihelp.com` | `doctor123` |
| Receptionist | `reception@medihelp.com` | `reception123` |

### Creating Additional Users

Use the `password.js` utility to generate bcrypt hashes, then insert directly via Prisma Studio or SQL:

```bash
node password.js   # Outputs bcrypt hash for 'password123'
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL Connection String (required)
DATABASE_URL="postgresql://user:password@localhost:5432/medihelp?schema=public"

# NextAuth Configuration (required)
NEXTAUTH_SECRET="your-random-secret-string-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for JWT encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | Base URL of the application |

---

## 📦 Tech Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.4 | Full-stack React framework with RSC & Server Actions |
| **Runtime** | React | 19.2.3 | UI library |
| **Language** | TypeScript | 5.x | End-to-end type safety |
| **Database** | PostgreSQL | — | ACID-compliant relational database |
| **ORM** | Prisma | 7.3.0 | Type-safe database access, schema management, migrations |
| **DB Adapter** | @prisma/adapter-pg | 7.3.0 | Direct PostgreSQL wire protocol via `pg` driver |
| **Auth** | NextAuth.js | 4.24.13 | Credentials-based auth with JWT sessions |
| **Hashing** | bcrypt | 6.0.0 | Password hashing (10 salt rounds) |
| **UI Framework** | Ant Design | 6.3.3 | Form components (InputNumber, Checkbox, Card) |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with custom design tokens |
| **Charts** | Recharts | 3.7.0 | Interactive data visualizations |
| **Icons** | Lucide React | 0.563.0 | Consistent SVG icon set |
| **PDF Gen** | jsPDF + jspdf-autotable | 4.1.0 / 5.0.7 | Client-side PDF generation for prescriptions |
| **Excel Export** | ExcelJS | 4.4.0 | Spreadsheet generation for data exports |
| **Theming** | next-themes | 0.4.6 | Dark/light/system theme management |
| **CSS Utils** | clsx + tailwind-merge | 2.1.1 / 3.4.0 | Conditional class merging |

---

## 🔒 Security & Data Integrity

- **Password Hashing** — All passwords hashed with `bcrypt` (10 salt rounds) before storage.
- **JWT Sessions** — Stateless authentication via encrypted JWT tokens; no server-side session store.
- **Server-Side Validation** — All mutations run as Server Actions on the server; client never sends raw SQL.
- **Immutable Medical Records** — Visit records are append-only; no update/delete actions exist.
- **Role-Based Access** — `requireRole()` guard throws on unauthorized access attempts.
- **Type Safety** — End-to-end TypeScript prevents runtime type errors at compile time.
- **SQL Injection Prevention** — Prisma's parameterized queries handle all database access (raw queries use `$queryRawUnsafe` only for aggregate analytics).

---

## 📄 License

This project is private. For commercial usage permissions or technical queries, please contact the maintainer.
