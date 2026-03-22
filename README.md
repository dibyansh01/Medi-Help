# Medi-Help EMR System

**Medi-Help** is a modern, comprehensive, and highly scalable Electronic Medical Record (EMR) and Clinic Management System designed for doctors, receptionists, and hospital administrators. Built with Next.js, Prisma, and PostgreSQL, it streamlines patient registration, advanced clinical data tracking, follow-up management, billing operations, and revenue analytics into a single cohesive, high-performance platform.

Designed to be pitched as a robust SaaS or on-premise offering, Medi-Help focuses on **speed**, **clinical accuracy**, and **intelligent patient retention**.

---

## 🚀 Key Features & Modules

### 1. Patient Management (`/patients`)
A centralized hub for handling all patient lifecycles:
- **Comprehensive Demographic Tracking**: Track name, phone, email, gender, Date of Birth, Blood Group, Address.
- **Unique Patient Identification**: Auto-generated sequential Clinic IDs (e.g., `CLINIC-00001`) to map records securely.
- **Medical History Profiles**: Free-text & structured storage for allergies and chronic conditions.
- **Patient Categorization**: Assign patients to customizable categories (e.g., *Diabetic*, *Cardiac*, *General*) to segment analytics and specialized marketing/follow-ups.

### 2. Advanced Clinical Visits / EMR (`/patients/[id]/visits/new`)
The core of the doctor's workflow, optimized for rapid, comprehensive data entry during consultations.
- **Granular Vitals Tracking**: Capture Blood Pressure, Temperature (°F/°C), Pulse (bpm), Weight, Height, and auto-calculate **BMI**.
- **Risk Factor Assessment**: Easily track Lifestyle elements (Non-Veg, Alcohol, Smoking checkboxes) and note Drug Allergies or Surgery Histories.
- **Detailed Clinical Notes**: Structured sections for:
  - Chief Complaint
  - History of Present Illness
  - Examination
  - Provisional & Final Diagnoses
  - Investigations (Lab Tests)
  - Actionable Prescriptions (Rx)
- **Immutable Audit Trails**: Visit records are securely stamped and structured immutably to preserve medical integrity.

### 3. Intelligent Follow-ups (`/followups`)
Never let a patient fall through the cracks. Automate and track patient retention seamlessly:
- **Auto-Scheduling**: Creating a future "Next Visit Date" during a consultation automatically spawns a Follow-up record.
- **Omnichannel Tracking**: Track communication methods across Call, WhatsApp, SMS, or In-person visits.
- **Status Lifecycle**: Manage states from `CONFIRMED`, `NO_RESPONSE`, `RESCHEDULED`, to `VISITED` and `MISSED`.

### 4. Billing & Invoicing (`/billing`)
Streamline financial operations and export records for accounting and compliance.
- **Financial Logs**: Track consultation fees natively on every visit.
- **Multi-Modal Payments**: Classify revenue by payment methods (`CASH`, `UPI`, `CARD`, `INSURANCE`).
- **Data Export & Reporting**: Utilize powerful PDF generation (`jspdf`/`jspdf-autotable`) and Excel exports (`exceljs`) for instant end-of-day financial reconciliation.

### 5. Dashboard & Analytics (`/dashboard` & `/analytics`)
Transform raw data into actionable clinic intelligence:
- **Live Metrics**: Instantly view total revenue, active patients, and upcoming appointments.
- **Rich Visualizations**: Rendered using `Recharts` for stunning, interactive graphical breakdowns.
- **Data-Driven Insights**: Analyze clinical demographics by `PatientType` to understand practice trends and optimize facility resources.

---

## 🛠 Technical Architecture

Medi-Help employs a modern, edge-ready, and strongly-typed architecture to ensure maximum developer velocity and application stability.

### The Stack
- **Framework**: [Next.js (App Router)](https://nextjs.org/) — Utilizing React Server Components and Server Actions for a zero-API-layer architecture.
- **Database**: [PostgreSQL](https://www.postgresql.org/) — Hosted robustly (e.g. Supabase/RDS) for ACID compliance.
- **ORM**: [Prisma](https://www.prisma.io/) — Providing type-safe database access, seamless migrations, and intuitive schema definition.
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) paired with [Ant Design](https://ant.design/) for rapid, beautiful, and accessible clinical interface development.
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) — Scalable JWT/Session strategy with secure RBAC (Role-Based Access Control) bridging `ADMIN`, `DOCTOR`, and `RECEPTIONIST` roles. Password hashing provided natively via `bcrypt`.

---

## 🗄 Database Schema Overview

The database is highly relational and optimized for clinical querying:

*   **`User`**: System authentication, encapsulating roles.
*   **`PatientType`**: Categorical lookup tables for dynamic demographics.
*   **`Patient`**: Master record containing PHI (Protected Health Information).
*   **`Visit`**: The foundational EMR document containing nested clinical arrays, vitals, risk factors, and financial ledgers. Tied 1-to-many to Patients.
*   **`FollowUp`**: Actionable scheduling vectors tied logically to both Patients and specific historical Visits.

---

## ⚙️ Local Development & Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medi-help
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and populate it:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL="postgresql://user:password@localhost:5432/medihelp?schema=public"
   
   # NextAuth Configuration
   NEXTAUTH_SECRET="your-super-secret-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database:**
   Push the schema and optionally seed the database:
   ```bash
   npx prisma db push
   npx prisma generate
   # Optional: Set up your local seed file using `prisma/seed.ts`
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will now safely boot at `http://localhost:3000`.*

---

## 🔒 Security & Compliance
- **Data Immutability**: Medical data via `Visit` logs are structurally designed to be append-only / immutable.
- **Type Safety**: End-to-end TypeScript enforcement catches runtime errors at compile time.
- **Secure Auth**: Form submissions and endpoints are securely guarded by SSR session validations using NextAuth.

---

*For further technical queries or commercial usage permissions, please consult the internal team or review the active issue boards.*
