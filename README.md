# 🩺 Medi-Help — Clinic Management & EMR System

**Medi-Help** is a production-grade, multi-tenant Electronic Medical Record (EMR) and Clinic Management System designed for healthcare providers, receptionists, and clinic administrators. It handles the end-to-end clinical and operational workflow — from patient registration and clinical EMR logging to follow-up scheduling, billing tracking, and system-wide analytics — all within a single unified application.

Built on a modern stack using **Next.js 16 (App Router)**, **Prisma 7**, **PostgreSQL**, and **Ant Design** (styling powered by **Tailwind CSS**), the system leverages React Server Components (RSC) and Server Actions. This architecture eliminates the overhead of separate API layers, ensuring optimal performance, a secure server-centric state, and a highly responsive user experience.

---

## 📑 Table of Contents

1. [Features Overview](#-features-overview)
2. [User Guide & Workflows](#-user-guide--workflows)
3. [Technical Architecture](#-technical-architecture)
4. [Project Directory Structure](#-project-directory-structure)
5. [Service Layer (Business Logic)](#-service-layer-business-logic)
6. [Repository Layer (Data Access)](#-repository-layer-data-access)
7. [Role-Based Access Control (RBAC) & Permissions](#-role-based-access-control-rbac--permissions)
8. [Multi-Tenancy & Data Isolation](#-multi-tenancy--data-isolation)
9. [Database Schema & Indexes](#-database-schema--indexes)
10. [Local Development & Seeding](#-local-development--seeding)
11. [Environment Variables](#-environment-variables)
12. [Tech Stack & Dependencies](#-tech-stack--dependencies)
13. [Security & Data Integrity](#-security--data-integrity)

---

## 🌟 Features Overview

### 1. Patient Management (`/patients`)
*   **Centralized Patient Registry:** A paginated, searchable directory of all registered patients, allowing lookups by name, phone number, or patient ID.
*   **Auto-generated Clinic IDs:** Every patient is assigned a unique, sequential ID formatted as `CLINIC-XXXXX` (e.g., `CLINIC-00001`), computed server-side during registration.
*   **Comprehensive Demographics:** Fields to capture full name, telephone, email, gender, date of birth, blood group, and address.
*   **Medical Profiles:** Rich-text fields capturing drug/food allergies and chronic conditions (e.g., Diabetes, Hypertension) highlighted on their patient profile.
*   **Patient Categorization:** Grouping by medical profile (e.g., *Diabetic*, *Cardiac*, *Pediatric*, *Orthopedic*, *General*) to fuel segmented clinic analytics.
*   **Patient Profile Dashboard (`/patients/[id]`):** A single view housing patient demographics, key statistics (visit count, last visit date, outstanding follow-ups), and a chronological, rich timeline of past clinical visits.

### 2. Clinical Visit & EMR Entry (`/patients/[id]/visits/new`)
A streamlined workspace built specifically for doctors during active consultations:
*   **Vitals Tracking:** Records blood pressure (e.g., `120/80`), temperature (°F), pulse (bpm), weight (kg), and height (m) with an **auto-calculated Body Mass Index (BMI)**.
*   **Lifestyle & Risk Factors:** Yes/No indicators for behavioral risk factors (Smoking, Alcohol, Non-Veg) alongside free-text fields for drug allergy notes and surgery histories.
*   **Structured Clinical Notes:** Fields for Chief Complaint (required), History of Present Illness (HPI), Physical Examination, Provisional Diagnosis, Investigations (Lab/Imaging ordered), and Final Diagnosis.
*   **Legacy Data Compatibility:** Fields for general Symptoms, Diagnosis, Prescription, and Lab Tests are kept to import historic records.
*   **Prescription & Scheduling:** Directly link the next recommended follow-up date, which automatically generates a calendar reminder in the system.
*   **Integrated Billing:** Records the consultation fee (in ₹) and the chosen payment mode (Cash, UPI, Card, or Insurance).
*   **Immutable Records:** Once saved, clinical visits are permanently written to the ledger and cannot be edited or deleted, ensuring strict medical compliance.
*   **PDF Generation (`/patients/[id]/visits/[visitId]`):** Renders a clean, print-friendly prescription layout. Users can instantly export or print PDF summaries containing patient details, vitals, clinical notes, and billing history.

### 3. Follow-up & Recall System (`/followups`)
Designed to automate patient retention and monitor recovery progress:
*   **Auto-Scheduling:** Setting a "Next Visit Date" during an EMR entry automatically schedules a follow-up with a `CONFIRMED` status.
*   **Status-based Tabs:** Easily manage workflows using categorized tabs: *Today*, *Upcoming*, *Missed*, and *Completed*. Live badge counts show total tasks for each view.
*   **Status Lifecycle:** Track patient interactions through statuses: `CONFIRMED` ➔ `VISITED` (completed), `RESCHEDULED`, `NO_RESPONSE`, or `MISSED`.
*   **WhatsApp Web Integration:** One-click WhatsApp button pre-compiles personalized reminders based on patient status:
    *   *Upcoming:* "Hello [Name], this is a reminder from MediHelp Clinic for your appointment on [Date]..."
    *   *Missed:* "Hello [Name], we noticed you missed your appointment on [Date]..."
*   **Phone Number Normalization:** Automatically strips spaces, formatting characters, and country prefix duplication to guarantee valid `wa.me/91XXXXXXXXXX` (India) endpoints.

### 4. Billing & Financials (`/billing`)
*   **Revenue at a Glance:** Live counter showcasing Today's Revenue, Monthly Revenue, YTD Total Revenue, and Average Revenue per Visit.
*   **Payment Mode Analysis:** Visual distribution chart showcasing share of Cash, UPI, Card, and Insurance payments.
*   **Revenue Growth Trends:** An interactive Recharts line chart illustrating revenue development over the trailing 6 months.
*   **Revenue by Patient Type:** Breakdowns to analyze which patient segments (e.g., Diabetic, General, Pediatric) contribute most.
*   **Detailed Transaction Log:** Real-time ledger listing today's billable visits, showing patient names, timestamps, fees, and payment modes.

### 5. Main Dashboard (`/dashboard`)
*   **High-Level KPI Panel:** Displays 9 live counters (Total Patients, Monthly New Registrations, % Repeat Patients, Active Appointments, Today's Visits, Pending Followups, Missed Followups, Monthly Revenue, and dominant Patient Category).
*   **Visual Charts:** Renders interactive charts detailing the 6-month visit volume trend, 6-month revenue trend, and division of current patient types.
*   **Recent Visits Feed:** Quick-reference log of the last 5 registered clinical visits.

---

## 🔄 User Guide & Workflows

Here is how different staff roles typically interact with the system throughout a patient’s journey.

### 1. Receptionist: Checking in a New Patient
1. Open the sidebar and navigate to **Patients**.
2. Click the **+ New Patient** button on the top right.
3. Fill in the patient's demographics: Full Name, 10-digit Phone Number (crucial for WhatsApp reminders), Email (optional), Date of Birth, Gender, Blood Group, and select the **Patient Type** (e.g. *Diabetic*).
4. Enter any known allergies (e.g., "Penicillin") or chronic conditions.
5. Click **Register Patient**. The system registers the patient, auto-generates a unique ID (e.g., `CLINIC-00014`), and redirects you to the new patient's profile page.

### 2. Doctor: Conducting a Consultation & EMR Entry
1. From the patient's profile page (or by searching in the **Patients** directory), click the **+ New Visit** button.
2. Under **Vitals**, enter the patient's vitals. Note that as you enter *Height* (in meters, e.g. `1.75`) and *Weight* (in kg, e.g. `70`), the **BMI** is auto-calculated dynamically (e.g., `22.86`).
3. Under **Risk Factors**, check any lifestyle habits (e.g., check *Smoking* if they smoke) and list any drug allergies.
4. Under **Clinical Notes**, fill out the diagnosis details:
    *   **Chief Complaint:** (Required) *e.g., High fever & cough for 4 days.*
    *   *History of Present Illness*, *Physical Examination*, *Provisional Diagnosis*, *Investigations*, and *Final Diagnosis*.
5. Under **Scheduling & Billing**:
    *   To set a return appointment, select a **Next Visit Date** (e.g., 2 weeks from now). This will automatically create an active follow-up reminder.
    *   Enter the **Consultation Fee** (e.g., `₹500`) and the **Payment Mode** used (e.g., `UPI`).
6. Click **Save Visit Record**. The record is locked as permanent, and you are redirected to the patient's profile, where the new entry appears at the top of the history timeline.
7. Click **View Details** next to the visit, and click **📥 Download PDF** to save or print a clean, structured prescription.

### 3. Receptionist: Managing Follow-ups
1. Navigate to the **Follow-ups** tab in the sidebar.
2. Under the **Today** or **Upcoming** tabs, you will see a list of scheduled return visits.
3. Click the **📲 WhatsApp** button next to a patient. This will launch a new browser tab with a pre-formatted message addressed to their phone number. Send the message to remind them of their appointment.
4. If a patient visits the clinic for their follow-up, click the green **✓ Mark Visited** button next to their name. The status will update to `VISITED` and move the record to the **Completed** tab.
5. If a patient requests to reschedule, click **📅 Reschedule**, enter the new date, and click **OK**.
6. If the day of their appointment passes and no action was taken, the patient will automatically move to the **Missed** tab, where the pre-formatted WhatsApp text changes to a polite re-engagement prompt.

---

## 🏗 Technical Architecture

Medi-Help employs a layered architecture that clearly decouples concerns:
*   **Presentation Layer (Next.js Pages & Components):** Handles routing, layout, and client-side interactions. Uses React Server Components (RSC) to render pages server-side for maximum performance, and Client Components where user-interactivity (like forms, data visualizations, and buttons) is needed.
*   **Service Layer (`services/`):** Contains all core business logic, validation rules, external integrations, and orchestrates operations between multiple repositories.
*   **Repository Layer (`repositories/`):** Isolates the data access logic. Contains raw Database queries. No page or service directly queries the database; they all utilize these repositories.
*   **Database & ORM (`prisma/`):** Uses Prisma 7 ORM with a dedicated native PostgreSQL connection pool for database operations.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React 19 (Client Components) + Server Components       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / RSC Protocol
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 App Router                      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Server      │  │ Server       │  │ API Routes     │  │
│  │ Components  │  │ Actions      │  │ (/api/...)     │  │
│  │ (pages)     │  │ (mutations)  │  │ (REST)         │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬─────────┘  │
│         │                │                  │            │
│  ┌──────▼──────────────▼──────────────────▼──────────┐  │
│  │           Service Layer (services/)                │  │
│  │   Handles business logic & coordinates Repositories│  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │         Repository Layer (repositories/)          │  │
│  │   Encapsulates all Prisma / Database operations   │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │     Prisma 7 ORM  (lib/db/prisma.ts)              │  │
│  │     PrismaPg Adapter + Connection Pooling (pg)     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  PostgreSQL Database                      │
│    User │ Tenant │ Patient │ Visit │ FollowUp │ ...     │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Directory Structure

Below is an overview of the most critical directories and files:

```
├── app/                            # Next.js App Router root
│   ├── layout.tsx                  # Global HTML wrapper & Font setup
│   ├── providers.tsx               # Auth & Theme context providers
│   ├── (public)/                   # Routes accessible without authentication
│   │   ├── login/                  # User login page
│   │   ├── signup/                 # Register account page (placeholder)
│   │   └── forgot-password/        # Password reset (placeholder)
│   ├── (authenticated)/            # Protected routes requiring authentication
│   │   ├── layout.tsx              # App shell containing the responsive sidebar
│   │   ├── dashboard/              # Home dashboard page & client charts
│   │   ├── patients/               # Patient directory & registration
│   │   │   ├── [id]/               # Patient profile page & details
│   │   │   │   └── visits/         # EMR entries, new visit creation & PDF exports
│   │   │   └── actions.ts          # Server actions for creating/updating patients
│   │   ├── followups/              # Follow-up center & appointment management
│   │   │   └── actions.ts          # Server actions to update follow-ups
│   │   ├── billing/                # Financial ledger & revenue charts
│   │   └── analytics/              # Performance reports & clinical analytics
│   └── api/                        # REST API endpoints
│       ├── auth/                   # NextAuth.js endpoints
│       ├── patient-types/          # Endpoint to fetch types for dropdowns
│       └── patients/[id]/          # Endpoint to fetch a patient by ID
├── components/                     # Reusable UI components
│   ├── charts/                     # Recharts wrappers for data visualization
│   ├── followups/                  # Specialized follow-up UI widgets
│   ├── layouts/                    # Navigation and core layout components (e.g. Sidebar)
│   └── ui/                         # Atomic components (cards, badges, search bars, etc.)
├── context/                        # Global React contexts
│   └── AuthContext.tsx             # Exposes session, user details, and client-side permissions
├── lib/                            # Core infrastructural modules
│   ├── auth/                       # Authentication guards & middlewares
│   │   └── requireRole.ts          # Server-side role protection helper
│   ├── db/                         # Database clients
│   │   └── prisma.ts               # Prisma client singleton using pg connection pool
│   ├── collections/                # Reusable static configs / templates
│   │   └── messageTemplates.ts     # Pre-formatted SMS/WhatsApp text builders
│   ├── constants/                  # Unified constants
│   ├── utils/                      # Helper utilities (dates, string formatting, etc.)
│   ├── permissions.ts              # Core Role-Based Access Control config
│   ├── permissions.server.ts       # Server-side permission enforcement helper
│   └── validations.ts              # Common validation schemas (Zod or custom)
├── modules/                        # Domain-specific Types, Constants, and Helpers
│   ├── auth/                       # Types and constants for authentication
│   ├── patient/                    # Types and constants for patients
│   ├── visit/                      # Types and constants for EMR visits
│   ├── followup/                   # Types and constants for followups
│   ├── billing/                    # Financial domain-specific rules
│   └── user/                       # User management constants & types
├── services/                       # Application Services (Business Logic layer)
├── repositories/                   # Data Repositories (Data Access layer)
├── prisma/                         # Database schema & migrations
│   ├── schema.prisma               # Prisma schema definition
│   └── seed.ts                   # Pre-populates database with demo data
└── config files                    # next.config.ts, tsconfig.json, tailwind.config...
```

---

## ⚙️ Service Layer (Business Logic)

Located in `/services`, this layer houses all the core business logic of the application. Services interact with the data layer via Repositories and are designed to be independent of the presentation framework (Next.js).

*   **`auth.service.ts`**
    *   **Purpose:** Manages user authentication and account creation.
    *   **Key Functions:**
        *   `validateCredentials(email, password)`: Verifies if a user exists and checks password authenticity using `bcrypt.compare`.
        *   `createUser(data)`: Hashes passwords with `bcrypt` (10 rounds) and persists new user accounts.
        *   `getUserById(id)`: Fetches user details by ID.

*   **`patient.service.ts`**
    *   **Purpose:** Handles patient lifecycle management.
    *   **Key Functions:**
        *   `createPatient(prevState, formData)`: Validates form data, generates a sequential, unique, and concurrency-safe clinic ID (`CLINIC-XXXXX`), and registers the patient.
        *   `updatePatient(id, prevState, formData)`: Updates a patient's contact, demographic, and medical details.
        *   `getPatientProfile(id)`: Aggregates patient data, including demographics, total visits, last visit, and full visit history.

*   **`visit.service.ts`**
    *   **Purpose:** Manages EMR clinical records.
    *   **Key Functions:**
        *   `createVisit(prevState, formData)`: Validates vitals (height and weight constraints), calculates BMI, saves the new visit, and—if a "Next Visit Date" is set—calls the `followup` repository to schedule a follow-up. Invokes cache revalidation.
        *   `getVisitDetail(id)`: Retrieves a specific visit record, including its associated patient.

*   **`followup.service.ts`**
    *   **Purpose:** Coordinates the follow-up and notification workflow.
    *   **Key Functions:**
        *   `listFollowUps(filters)`: Queries follow-up reminders based on selected tab (Today, Upcoming, Missed, Completed), search query, and pagination.
        *   `updateFollowUpStatus(id, status, notes)`: Updates status (e.g. `NO_RESPONSE`, `MISSED`) and appends internal notes.
        *   `markAsVisited(id)`: Transition a follow-up status to `VISITED`.
        *   `rescheduleFollowUp(id, newDate)`: postphones an appointment, updating the date and setting the status to `RESCHEDULED`.

*   **`billing.service.ts`**
    *   **Purpose:** Aggregates and calculates financial reports.
    *   **Key Functions:**
        *   `getBillingOverview()`: Returns sum and count statistics for today's, monthly, and overall revenue, as well as a list of today's paid visits. Provides monthly trend and patient-type revenue share.

*   **`analytics.service.ts`**
    *   **Purpose:** Supplies data to complex charts.
    *   **Key Functions:**
        *   `getPatientGrowth()`, `getDiseaseDistribution()`, `getVisitFrequencyDistribution()`, `getFollowUpCompliance()`: Calculate metrics for various analytical charts (e.g., how many follow-ups were met vs missed, patient acquisition rates over 12 months, etc.).

*   **`audit.service.ts`**
    *   **Purpose:** Registers security and compliance logs in a non-blocking way.
    *   **Key Functions:**
        *   `logAuditEvent(data)`: Creates an entry in the database. Operates in a try-catch block to prevent breaking the core user experience if a logging failure occurs (fire-and-forget).

*   **`subscription.service.ts`**
    *   **Purpose:** Governs feature toggles and record ceilings based on tenant plans (e.g., limiting the maximum number of patients on a free tier).

---

## 🗄️ Repository Layer (Data Access)

Located in `/repositories`, this layer is responsible for performing raw database operations via the Prisma client. Separating the repositories from services ensures that if the database client changes, only the repository layer needs modification.

*   **`base.repository.ts`:** An abstract class providing common CRUD operations (find, count, create, update, delete) to other repositories for code reuse.
*   **`user.repository.ts`:** Locates users by ID or unique email.
*   **`patient.repository.ts`:** Fetches, filters, searches, and counts patients. Handles atomic creation of patient profiles.
*   **`patient-type.repository.ts`:** Interacts with the categories of patients (Diabetic, Cardiac, etc.).
*   **`visit.repository.ts`:** Manages visit creations, retrieval by ID, and complex sub-aggregations.
*   **`followup.repository.ts`:** Implements complex queries for follow-ups (filtering by dates, search queries, status-matching, and pagination).
*   **`tenant.repository.ts`:** Resolves tenant data based on domain slugs and generates new, unique tenant slugs.
*   **`audit-log.repository.ts`:** Writes audit logs to the database.

---

## 🔐 Role-Based Access Control (RBAC) & Permissions

Medi-Help has a multi-tier permission-based system that allows you to easily restrict access to specific pages, APIs, and Server Actions. 

### Core Concepts

*   **Roles:** We support three user roles:
    *   `DOCTOR`: Full access to all features (clinical, administrative, billing).
    *   `RECEPTIONIST`: Limited access. Can manage patients and follow-ups. No access to write clinical files (though they can see patient visit history summaries).
    *   `ADMIN`: Administrative access (reserved for future use).
*   **Permissions:** Granular permissions represent specific actions (e.g., `PATIENT_READ`, `VISIT_CREATE`, `BILLING_READ`, `USER_MANAGE`).

### Where the Files are Located

1.  **Definitions and Mappings:** [`lib/permissions.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/lib/permissions.ts)  
    Contains the `Permission` enum and the `ROLE_PERMISSIONS` dictionary, which maps each role to an array of allowed permissions.
2.  **Server Guard:** [`lib/permissions.server.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/lib/permissions.server.ts)  
    Contains `requirePermission(permission: Permission)`, which is used inside **Server Actions** or **API routes (Route Handlers)** to block unauthorized requests.
3.  **Role Guard (Coarse):** [`lib/auth/requireRole.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/lib/auth/requireRole.ts)  
    Contains `requireRole(allowedRoles: string[])` for simple, role-level checks on the server.
4.  **Client-Side Hook:** [`context/AuthContext.tsx`](file:///home/dibyanshu/My-Projects/Medi-Help/context/AuthContext.tsx)  
    Provides the `useAuth()` hook which exposes `hasPermission(permission: Permission)` to easily hide or disable buttons/UI elements for certain users.
5.  **NextAuth Session Augmentation:** [`types/next-auth.d.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/types/next-auth.d.ts)  
    Extends the NextAuth user session so that the `role` is accessible on both the client (via `useSession()`) and the server (via `getServerSession()`).

### How to Control / Enforce Access (Developer Guide)

#### A. Protecting a Server Action or API Route (Recommended: Permission-Based)
Use `requirePermission` inside your server functions. If the user does not have the corresponding permission, the function will throw an error immediately:

```typescript
import { requirePermission } from '@/lib/permissions.server';
import { Permission } from '@/lib/permissions';

export async function createVisitAction(formData: FormData) {
  // Enforce the user has permission to write a visit
  await requirePermission(Permission.VISIT_CREATE);

  // ... execute your action logic
}
```

#### B. Protecting a Page (Server Component)
Verify the user's role before rendering the page, redirecting unauthorized users:

```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  
  // Restrict to DOCTOR and ADMIN only
  if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') {
    redirect('/unauthorized'); // or redirect to the dashboard
  }

  // ... render the page
}
```

#### C. Conditional UI Rendering (Client Component)
Use the `useAuth` hook to hide elements that a user does not have permissions to access:

```tsx
'use client'
import { useAuth } from '@/context/AuthContext';
import { Permission } from '@/lib/permissions';

export function ActionPanel() {
  const { hasPermission } = useAuth();

  return (
    <div>
      {/* Only render the delete button if they have permission */}
      {hasPermission(Permission.PATIENT_DELETE) && (
        <button className="bg-red-500">Delete Patient</button>
      )}
    </div>
  );
}
```

#### D. How to Add a New Role
1. Open [`modules/auth/auth.constants.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/modules/auth/auth.constants.ts) and add the new role to the `ROLES` object:
   ```typescript
   export const ROLES = {
     DOCTOR: 'DOCTOR',
     RECEPTIONIST: 'RECEPTIONIST',
     ADMIN: 'ADMIN',
     NURSE: 'NURSE', // New Role
   } as const;
   ```
2. Open [`lib/permissions.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/lib/permissions.ts) and map the appropriate permissions to the new role in `ROLE_PERMISSIONS`:
   ```typescript
   export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
     DOCTOR: Object.values(Permission),
     ADMIN: Object.values(Permission),
     RECEPTIONIST: [ ... ],
     NURSE: [
       Permission.PATIENT_READ,
       Permission.VISIT_READ,
     ]
   }
   ```
3. Update [`modules/user/user.constants.ts`](file:///home/dibyanshu/My-Projects/Medi-Help/modules/user/user.constants.ts) to define the new role's Display Name and Description.

---

## 🏢 Multi-Tenant Architecture & Data Isolation

Medi-Help is built to partition data by "Tenant" (Clinic). 

*   **Database Partitioning:** The database contains a `Tenant` table. The main entities like `Patient` and `User` contain a `tenantId` field linking them back to the `Tenant`.
*   **Query Filtering:** When performing database queries in repositories, all queries should be scoped with the current active user's `tenantId`.
*   **Legacy Migrations:** If there are older records in your database created without a tenant (where `tenantId` is null), you can assign a default tenant to them by running:
    ```bash
    npx tsx scripts/migrate-default-tenant.ts
    ```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
*   **Node.js** v20 or higher.
*   **PostgreSQL** Database. You can use a local PostgreSQL instance, a Docker container, or a cloud instance (e.g. Supabase).

### 2. Installation & Setup
Follow these steps to set up a local development environment:

```bash
# Clone the repository
git clone https://github.com/dibyansh01/Medi-Help.git
cd Medi-Help

# Install dependencies using the appropriate peer dependency flags
npm install --legacy-peer-deps

# Create and configure environmental variables
cp .env.example .env
# Open the .env file and fill in your DATABASE_URL and NEXTAUTH_SECRET.

# Push the database schema directly to your Database
npx prisma db push

# Generate the Prisma Client
npx prisma generate

# Seed the database with mock patients, users, and clinical records
npx --yes tsx prisma/seed.ts

# Start the local development server
npm run dev
```
The application will be available at **`http://localhost:3000`**.

### 3. Available Scripts
*   `npm run dev`: Starts the Next.js development server in Turbopack mode.
*   `npm run build`: Compiles the application for production.
*   `npm run start`: Runs the built production server.
*   `npm run lint`: Runs ESLint checks.
*   `npx prisma studio`: Launches a local GUI for interacting with the database tables.

---

## 🌱 Database Seeding & Mock Accounts

The seeding script (`prisma/seed.ts`) populates the database with:
*   **2 Users** with preloaded Roles.
*   **5 Patient Types** (General, Diabetic, Cardiac, Pediatric, Orthopedic).
*   **12 Patients** with complete medical histories.
*   **11 Visits** spanning various vitals and prescriptions.
*   **9 Follow-up tasks** with varying statuses.

### Default Login Accounts
| Account Type | Email | Password |
|---|---|---|
| **Doctor (Full Access)** | `doctor@medihelp.com` | `doctor123` |
| **Receptionist (Operational Access)** | `reception@medihelp.com` | `reception123` |

To generate new encrypted passwords to place into the database manually:
```bash
node password.js # Generates a bcrypt hash of 'password123'
```

---

## 🔑 Environment Variables
Your `.env` file must contain:
```env
# Database connection string
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<db>?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📦 Tech Stack & Dependencies
*   **Framework:** Next.js 16.1.4 (App Router)
*   **UI & Styling:** React 19.2.3, Ant Design 6.3.3, Tailwind CSS 4.x
*   **ORM / Database:** Prisma 7.3.0, PostgreSQL (via `@prisma/adapter-pg` & `pg` driver)
*   **Authentication:** NextAuth.js 4.24.13, bcrypt 6.0.0
*   **Analytics & Exports:** Recharts 3.7.0, jsPDF (PDF reports), ExcelJS (Excel exports)

---

## 🛡️ Security & Data Integrity
*   **Bcrypt Encryption:** Protects credentials.
*   **Stateless Sessions:** Leverages NextAuth JSON Web Tokens (JWT) containing userId and role for verification.
*   **Immutable Medical Ledger:** Visits cannot be updated or deleted, providing audit certainty for medical history.
*   **Asynchronous Auditing:** Real-time logging of user activity (creates, updates, logins, exports) runs in a fire-and-forget manner to keep critical paths fast and error-resilient.
