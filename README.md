# 🩺 MediHelp — Doctor Practice Management System

A comprehensive, production-ready web application for managing a doctor's clinic — from patient registration and EMR-style visit recording to appointment follow-ups, billing, and deep analytics. Built on **Next.js 16**, **PostgreSQL** (via Prisma ORM), **Recharts**, and **NextAuth**, with a modern teal-themed UI supporting both light and dark modes.

MediHelp replaces paperwork with an intelligence-driven system that automates follow-up scheduling, generates downloadable prescription PDFs, sends WhatsApp reminders, and surfaces actionable clinic KPIs in real-time.

---

## 🌟 Core Modules & Features

### 1. 📊 Clinic Dashboard — Intelligence Hub

The dashboard is the command center. It surfaces **9 live KPIs** and **3 interactive charts**, all computed server-side with Prisma aggregations (no N+1 queries).

Every tile is **clickable** and navigates to the relevant module for deeper exploration.

#### KPI Tiles

| Tile | What It Shows | Click Target | How It's Calculated |
|------|--------------|--------------|---------------------|
| **Total Patients** | All registered patients | `/patients` | `prisma.patient.count()` |
| **New This Month** | Patients registered since the 1st of the current month | `/patients` | `prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } })` |
| **Repeat Patient %** | Percentage of patients who visited more than once | `/analytics` | Raw SQL: count patients with >1 visit / total patients with visits × 100 |
| **Today's Appointments** | Follow-ups scheduled for today that haven't been marked as VISITED | `/followups?tab=today` | `prisma.followUp.count({ where: { followUpDate: today, status: { not: 'VISITED' } } })` |
| **Today's Visits** | Visits recorded today | `/patients` | `prisma.visit.count({ where: { visitDate: today } })` |
| **Upcoming Follow-ups** | Follow-ups in the next 7 days with CONFIRMED/RESCHEDULED status | `/followups?tab=upcoming` | `prisma.followUp.count({ where: { followUpDate: next7days, status: { in: ['CONFIRMED', 'RESCHEDULED'] } } })` |
| **Missed Follow-ups** | Past follow-ups that were never attended (not VISITED, not RESCHEDULED) | `/followups?tab=missed` | `prisma.followUp.count({ where: { followUpDate: { lt: today }, status: { notIn: ['VISITED', 'RESCHEDULED'] } } })` |
| **Monthly Revenue** | Sum of all consultation fees this month | `/billing` | `prisma.visit.aggregate({ _sum: { fee: true }, where: { visitDate: { gte: startOfMonth } } })` |
| **Top Patient Type** | Most common disease category by patient count | `/analytics` | `prisma.patientType.findMany({ orderBy: { patients: { _count: 'desc' } }, take: 1 })` |

#### Charts (Recharts)

| Chart | Type | Data Source |
|-------|------|-------------|
| **Visit Trend** | Area Chart | Monthly visit counts for last 6 months. Each month: `prisma.visit.count({ where: { visitDate: { gte: monthStart, lt: monthEnd } } })` |
| **Revenue Trend** | Bar Chart | Monthly fee sums for last 6 months. Each month: `prisma.visit.aggregate({ _sum: { fee: true } })` |
| **Patient Type Distribution** | Donut Chart | Patient count per `PatientType`. Uses `prisma.patientType.findMany({ select: { name, _count: { select: { patients } } } })` |

#### Recent Visits Feed
The bottom of the dashboard shows the **5 most recent visits** across all patients, including patient name, ID, date, fee, and diagnosis — with a link to the full patient list.

---

### 2. 👥 Patient Management

#### Patient Registration (`/patients/new`)
- Fields: Name, Phone (required), Email, Gender, Date of Birth, Blood Group (A+/A−/B+/B−/O+/O−/AB+/AB−), Allergies, Chronic Conditions, Address, Patient Type (dropdown).
- **Auto-generated Patient Number**: When a patient is created, a unique ID in the format `CLINIC-XXXXX` is auto-generated.
  ```
  Logic: count existing patients → nextNum = count + 1 → "CLINIC-" + padStart(5, '0')
  Example: If 12 patients exist → new patient gets CLINIC-00013
  ```

#### Patient List (`/patients`)
- Server-side **search** (searches name, phone, patient number) with **pagination** (15 per page).
- Filter by **Patient Type** via dropdown.
- Displays: Name, Phone, Patient Type badge, Visit Count, Last Visit Date, and a link to the profile.

#### Patient Profile (`/patients/[id]`)
A split-layout page:

**Left Column — Demographics & Medical Info:**
- Contact details (phone, email, address)
- Date of Birth, Blood Group
- Allergies (highlighted in amber if present)
- Chronic Conditions (highlighted)
- Summary: Total Visits count, Upcoming Follow-ups count, Last Visit date

**Right Column — Visit Timeline:**
- Every visit shown in reverse chronological order (newest first)
- Each visit card shows: visit number, date, fee, vitals (BP, Temp, Pulse, Weight), clinical notes (symptoms, diagnosis, prescription, labs, notes)
- **"View Details →"** link on each visit card → opens the full visit detail page

---

### 3. 🩺 Visit Entry — EMR (Electronic Medical Record)

#### New Visit Form (`/patients/[id]/visits/new`)
Records a complete clinical encounter. All fields are optional (the doctor fills what's relevant):

**Vitals Section:**
- Blood Pressure (e.g., "120/80")
- Temperature in °F (e.g., 98.6)
- Pulse in bpm (e.g., 72)
- Weight in kg (e.g., 70)

**Clinical Notes Section:**
- Symptoms (free text)
- Diagnosis (free text)
- Prescription / Rx (free text — medications, dosage, duration)
- Lab Tests (recommended investigations)

**Scheduling & Billing Section:**
- **Next Visit Date** — if set, **automatically creates a FollowUp record** with status `CONFIRMED` and method `WHATSAPP`
  ```
  Logic: createVisit() → if nextVisitDate exists →
    prisma.followUp.create({
      patientId, visitId, followUpDate: nextVisitDate,
      method: 'WHATSAPP', status: 'CONFIRMED',
      notes: 'Auto-scheduled from visit on <date>'
    })
  ```
- Consultation Fee (₹)
- Payment Mode: CASH / UPI / CARD / INSURANCE

**Design principle:** Visits are **immutable** — once saved, they cannot be edited. This preserves a true EMR audit trail.

#### Visit Detail Page (`/patients/[id]/visits/[visitId]`)
A dedicated full-page view of a single visit:
- **Patient Summary Bar**: Name, Patient ID, Age, Gender, Blood Group, Allergies (highlighted)
- **Vitals Grid**: Large, centered values for BP, Temp, Pulse, Weight
- **Clinical Sections**: Each in its own card — Symptoms, Diagnosis, **Prescription (highlighted in teal)**, Lab Tests, Notes
- **Billing & Schedule**: Fee, Payment Mode, Next Visit date
- **📥 Download PDF** button — generates a prescription-style PDF (details below)

#### PDF Download (via jsPDF)
Clicking "Download PDF" generates a professional prescription document:
- **Header**: "MediHelp Clinic" in teal with subtitle
- **Patient Info**: Name, Patient Number, Phone, Type, Age, Gender, Blood Group, Allergies
- **Visit Details**: Date, Vitals (single line)
- **Clinical Sections**: Each with a teal-colored heading — Symptoms, Diagnosis, Prescription, Lab Tests, Notes
- **Billing**: Fee and Payment Mode
- **Next Appointment**: Highlighted in teal
- **Footer**: "Computer-generated document. No signature required."
- **File name**: `CLINIC-00001_visit_2026-02-22.pdf`

---

### 4. 📞 Follow-ups & Appointments

The follow-up system tracks every scheduled patient revisit and provides a CRM-style queue for appointment management.

#### Follow-ups Page (`/followups`)
Organized into **4 tabs**, each with a live badge count:

| Tab | Shows | Filter Logic |
|-----|-------|-------------|
| **Today** | Follow-ups scheduled for today, not yet visited | `followUpDate: today, status ≠ 'VISITED'` |
| **Upcoming** | Future follow-ups with CONFIRMED/RESCHEDULED status | `followUpDate ≥ today, status in ['CONFIRMED', 'RESCHEDULED']` |
| **Missed** | Past follow-ups that never happened | `followUpDate < today, status not in ['VISITED', 'RESCHEDULED']` |
| **Completed** | Follow-ups where the patient showed up | `status = 'VISITED'` |

#### Follow-up Actions (per row)
Each row has three action buttons:
- **✓ Mark Visited** — updates status to `VISITED`, revalidates dashboard
- **📅 Reschedule** — shows an inline date picker, updates to `RESCHEDULED` with new date
- **📵 No Response** — marks as `NO_RESPONSE` (for tracking unresponsive patients)

#### WhatsApp Reminder Integration
Each follow-up row includes:
- A **pre-generated message** based on the context:
  - **Upcoming**: "Hello {name}, this is a reminder from MediHelp Clinic for your appointment scheduled on {date}. Kindly confirm your visit. 🙏"
  - **Missed**: "Hello {name}, we noticed you missed your appointment on {date} at MediHelp Clinic. Your health is our priority. Please reply to reschedule. 🙏"
- A **📲 WhatsApp** button that opens `wa.me/{phone}?text={encoded_message}`
- A **📋 Copy** button to copy the message to clipboard

Phone numbers are auto-cleaned: spaces/dashes removed, leading `0` replaced with `91` (India country code).

---

### 5. 💰 Billing Module

#### Billing Page (`/billing`)
A revenue-focused view with:

**4 KPI Tiles:**
| KPI | Calculation |
|-----|-------------|
| Today's Revenue | `SUM(fee) WHERE visitDate = today` |
| Monthly Revenue | `SUM(fee) WHERE visitDate >= firstOfMonth` |
| Total Revenue | `SUM(fee) WHERE fee IS NOT NULL` (all time) |
| Avg Fee/Visit | `Total Revenue / Total Visit Count` |

**3 Charts:**
- **Monthly Revenue Trend** (Bar Chart): 6-month history of revenue sums
- **Payment Mode Breakdown** (Donut Chart): CASH vs UPI vs CARD vs INSURANCE split for the current month, by total ₹ amount
- **Revenue by Patient Type** (Horizontal Bar): Compares revenue across disease categories (General, Diabetic, Cardiac, etc.)

**Today's Revenue Detail Table:**
Lists every visit from today that has a fee: Patient Name, Patient ID, Time, Fee (₹), Payment Mode.

---

### 6. 📈 Advanced Analytics

#### Analytics Page (`/analytics`)

**Follow-up Compliance KPIs (top row):**
| KPI | Calculation |
|-----|-------------|
| Total Follow-ups | `prisma.followUp.count()` |
| Attended | `prisma.followUp.count({ where: { status: 'VISITED' } })` |
| Missed | `Total - Attended` |
| Compliance Rate | `(Attended / Total) × 100` |

**Example:** If 50 follow-ups were scheduled and 35 patients showed up → Compliance Rate = 70%.

**5 Analytics Charts:**

| Chart | Type | What It Shows | Data Logic |
|-------|------|---------------|------------|
| **Patient Growth** | Area Chart | Monthly new patient registrations (12 months) | For each of the last 12 months: `prisma.patient.count({ where: { createdAt between monthStart and monthEnd } })` |
| **Disease Category Distribution** | Donut Chart | Patient count per PatientType | `prisma.patientType.findMany({ _count: { patients } })` + uncategorized patients (patientTypeId = null) |
| **Visit Frequency Distribution** | Bar Chart | How many patients had 1, 2, 3, 4, 5+ visits | Raw SQL: `SELECT visit_count, COUNT(*) FROM (SELECT patientId, COUNT(*) as visit_count FROM Visit GROUP BY patientId) GROUP BY visit_count`. Groups 5+ together. |
| **Revenue Trend** | Bar Chart | Monthly revenue sums (12 months) | For each month: `prisma.visit.aggregate({ _sum: { fee } })` |
| **Revenue by Patient Type** | Horizontal Bar | Revenue contribution per disease category | For each PatientType: `prisma.visit.aggregate({ _sum: { fee }, where: { patient: { patientTypeId: type.id } } })` + uncategorized |

**Example — Visit Frequency:**
If the clinic has: 40 patients with 1 visit, 25 with 2 visits, 10 with 3 visits, 5 with 4 visits, 8 with 5+ visits — the bar chart shows these 5 bars, helping the doctor understand patient retention.

**Example — Disease Distribution:**
If the clinic has 30 General, 20 Diabetic, 15 Cardiac, 10 Pediatric, 5 Orthopedic patients — the donut chart shows each segment with a percentage label (e.g., "Diabetic 25%").

---

### 7. 🔐 Authentication & Role-Based Access

**Roles:**
| Role | Intended Access |
|------|----------------|
| `DOCTOR` | Full access to all modules |
| `RECEPTIONIST` | Patient registration, follow-ups, billing |
| `ADMIN` | System administration (future) |

- Authentication via **NextAuth** with **Credentials Provider** (email + bcrypt-hashed password)
- JWT + Session callbacks inject `user.id` and `user.role` into the session
- Server-side role enforcement via `requireRole(['DOCTOR'])` helper

---

### 8. 🎨 Sidebar Navigation

The sidebar provides quick access to all modules with a consistent dark slate design:

| Section | Items |
|---------|-------|
| **Overview** | Dashboard, Analytics |
| **Clinic** | Patients, Follow-ups |
| **Finance** | Billing |
| **System** | Settings |

Features:
- **Collapsible**: Auto-collapses on desktop, expands on hover
- **Mobile responsive**: Full-width overlay with backdrop on small screens
- **Active state**: Teal highlight on current page
- **Tooltips**: Appear in collapsed state on hover
- **User avatar**: Shows first initial with gradient background, name, email, and logout button

---

## 🗄️ Database Schema

```
User          → Authentication (DOCTOR, RECEPTIONIST, ADMIN)
PatientType   → Disease categories (General, Diabetic, Cardiac, etc.)
Patient       → Demographics, medical info, auto-generated CLINIC-XXXXX number
  └─ Visit    → Immutable EMR entry (vitals, clinical notes, billing)
      └─ FollowUp → Appointment tracking (CONFIRMED/RESCHEDULED/VISITED/MISSED/NO_RESPONSE)
  └─ FollowUp → Can also be linked directly to patient without a visit
```

Key indexes: `Patient.phone`, `Patient.patientNumber`, `Patient.createdAt`, `Patient.name`, `Visit.patientId`, `Visit.visitDate`, `Visit.nextVisitDate`, `FollowUp.followUpDate`, `FollowUp.status`.

---

## 💡 How It Really Works — Example Workflows

### Scenario A: New Patient Registration → Visit → Auto Follow-up

1. **Register**: Receptionist opens `/patients/new`, enters "Rajesh Kumar", phone `9876543210`, selects "Diabetic" type. System generates `CLINIC-00013`.
2. **First Visit**: Doctor opens Rajesh's profile → clicks "+ New Visit" → records:
   - Vitals: BP 140/90, Temp 98.4°F, Pulse 78 bpm, Weight 82 kg
   - Symptoms: "Frequent urination, increased thirst"
   - Diagnosis: "Diabetes Type 2 — Uncontrolled"
   - Rx: "Metformin 500mg BD, Glimepiride 1mg OD"
   - Next Visit: 30 days from today
   - Fee: ₹500 (CASH)
3. **Auto Follow-up**: The system automatically creates a follow-up record for 30 days later with status `CONFIRMED` and method `WHATSAPP`.
4. **Dashboard Impact**: "Total Patients" increases, "New This Month" increases, "Monthly Revenue" adds ₹500, "Upcoming Follow-ups" shows 1.
5. **PDF**: Doctor clicks "View Details →" on the visit → clicks "📥 Download PDF" → gets `CLINIC-00013_visit_2026-02-22.pdf`.

### Scenario B: Follow-up Day — WhatsApp Reminder → Patient Visit

1. **30 days later**: Rajesh's follow-up appears in the "Today" tab on `/followups`.
2. **WhatsApp Reminder**: The system shows a pre-generated message: _"Hello Rajesh Kumar, this is a reminder from MediHelp Clinic for your appointment scheduled on Saturday, 25 March, 2026..."_. Doctor clicks 📲 → WhatsApp opens with the message pre-filled.
3. **Patient arrives**: Doctor clicks "✓ Mark Visited". Status changes to `VISITED`.
4. **New Visit**: Doctor records a new visit with updated vitals showing improvement (BP 130/85). Sets next visit to 30 days again. Another follow-up is auto-created.
5. **Analytics Impact**: "Repeat Patient %" increases, Follow-up Compliance Rate improves.

### Scenario C: Missed Appointment → Outreach

1. A patient doesn't show up on their scheduled follow-up date.
2. **Next day**: The follow-up moves to the "Missed" tab. Badge turns red. Dashboard "Missed Follow-ups" KPI increases.
3. **Message changes**: The pre-generated WhatsApp message now says: _"Hello {name}, we noticed you missed your appointment..."_
4. **Doctor acts**: Either sends the WhatsApp → clicks "📅 Reschedule" → enters a new date. Status changes to `RESCHEDULED`, and the follow-up moves back to "Upcoming".
5. **If patient is unreachable**: Clicks "📵 No Response" to log the attempt.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Database | PostgreSQL via Prisma ORM (with `@prisma/adapter-pg`) |
| Auth | NextAuth (Credentials Provider, bcrypt, JWT sessions) |
| Charts | Recharts (AreaChart, BarChart, PieChart) |
| PDF | jsPDF |
| Styling | Tailwind CSS v4 + custom CSS variables (Dark/Light mode) |
| Icons | Lucide React |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/dibyansh01/Medi-Help.git
cd Medi-Help
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/medihelp"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
npx prisma db seed    # Populates 12 patients, 11 visits, follow-ups, 2 users
```

### 4. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Login Credentials (from seed)
| Role | Email | Password |
|------|-------|----------|
| Doctor | `doctor@medihelp.com` | `doctor123` |
| Receptionist | `reception@medihelp.com` | `reception123` |

---

## 📁 Project Structure

```
app/
├── dashboard/          # Dashboard page + DashboardCharts
├── patients/           # Patient list, new patient form
│   └── [id]/           # Patient profile
│       └── visits/
│           ├── new/    # EMR visit entry form
│           └── [visitId]/ # Visit detail + PDF download
├── followups/          # Follow-up queue with tabs + WhatsApp
├── billing/            # Revenue tracking + charts
├── analytics/          # Deep clinic analytics + charts
├── login/              # Login page
└── api/                # API routes (patient-types, patients)

lib/
├── services/
│   ├── dashboardService.ts   # All dashboard KPI queries
│   └── analyticsService.ts   # Analytics data queries
├── collections/
│   └── messageTemplates.ts   # WhatsApp message generators
├── auth/
│   └── requireRole.ts        # RBAC helper
└── db/
    └── prisma.ts              # Prisma client singleton

components/
├── Sidebar.tsx         # App navigation
└── WhatsAppActions.tsx # WhatsApp link + copy button

prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Sample data seeder
```
