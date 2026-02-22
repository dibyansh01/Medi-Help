# MSME CashFlow Management System

A comprehensive, production-ready web application designed specifically for Micro, Small, and Medium Enterprises (MSMEs) to track, manage, and optimize their cash flow, receivables, payables, and GST compliance. 

Built on Next.js 14, standardizing on a robust Postgres database (via Prisma), this application moves beyond basic accounting to provide **operational intelligence**, predictive collections, and automated GST cash flow tracking.

---

## 🌟 Core Modules & Features

The platform is divided into intuitively designed modules that map directly to real-world business operations.

### 1. 📊 Owner Dashboard
The central command center providing a holistic view of the business\'s financial health in real-time.
- **Business & Cash Snapshot:** Instantly view Total Invoiced, Payment Collected, Total Outstanding, and Overdue amounts.
- **Net Cash Position:** Actively calculates your actual money in the bank (Total Collections - Total Cash Out/Expenses).
- **GST Snapshot & Cashflow:** Tracks your estimated GST Liability (Collected) vs. Input Tax Credit (Paid). It calculates "GST Cash Blocked" (GST on sales not yet paid by customers) and "GST pending" (from unpaid vendor bills).
- **Operational Intelligence:** Automatically highlights High-Risk Customers, Top Defaulters, Aging Summaries, and upcoming collection follow-ups.

### 2. 👥 Customers & Receivables (Cash-In)
Manage the lifeblood of your cash flow—your sales and collections.
- **Customer Profiles:** Maintain directories of clients including their standard credit terms, locations, and historical payment behavior.
- **Invoicing:** Generate clean, trackable invoices.
  - Supports both **GST Inclusive** and **Exclusive** billing.
  - Automatically calculates Due Dates based on customer credit terms.
  - Granular statuses: `NEW`, `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`.

### 3. 📞 Collections & Follow-ups Queue
A specialized CRM-like queue built exclusively for debt recovery.
- **Smart Queue:** Invoices are routed here automatically based on due dates and risk profiles.
- **Interaction Logging:** Log outcomes of collection efforts (`PROMISED`, `NO_RESPONSE`, `LOCATED`, `DISPUTED`) and interaction methods (`CALL`, `WHATSAPP`, `EMAIL`).
- **One-Click WhatsApp:** Auto-generates polite but firm payment reminder templates based on the overdue duration and outstanding amount, launching directly into WhatsApp Web/App.

### 4. 🏢 Vendors & Payables (Cash-Out)
Track money leaving the business on credit.
- **Vendor Profiles:** Track suppliers and their credit periods.
- **Vendor Invoices (Bills):** Log incoming bills. Crucially, track if the GST on these purchases is **Eligible for Input Tax Credit (ITC)** or if it is a blocked credit.

### 5. 💸 Direct Expenses
Track immediate cash outflows that don't go through a credit cycle.
- **Categorization:** Classify daily/monthly operational expenses (e.g., Rent, Salaries, Office Supplies).
- **GST Leakage Tracking:** Identifies expenses where GST was paid but cannot be claimed back from the government, impacting your bottom-line profit.

### 6. 📈 Advanced Analytics (Cash Flow & GST)
- **Cash Flow Analysis:** Visualizes "Actual Past" vs "Projected Future" inflows and outflows to predict cash crunches before they happen.
- **GST Analytics:** 
  - **Trend Analysis:** Graphically compares your GST Liability against your GST Credits month-over-month.
  - **Rate Mix Analysis:** Breaks down your tax exposure by brackets (e.g., 5%, 12%, 18%).
  - **Leakage Analysis:** Highlights exactly which categories or vendors are costing you non-claimable GST.

---

## 💡 How It Really Works (Example Workflows)

### Scenario A: Making a Sale & Collecting Cash
1. **Setup:** You add a Customer ("Acme Corp") with 30-day credit terms.
2. **Invoice:** You create an invoice for ₹1,00,000 + 18% GST (Total: ₹1,18,000). The system automatically sets the status to `UNPAID` and the due date to 30 days from today.
3. **Dashboard Impact:** "Total Invoiced" and "Total Outstanding" increase. "GST Collected" registers an ₹18,000 liability.
4. **Collection:** 35 days pass. The invoice automatically switches to `OVERDUE` (highlighted in red). It appears in your **Collections Queue**.
5. **Follow-up:** You click the WhatsApp icon in the queue, sending an automated overdue reminder. The customer promises to pay tomorrow. You log a follow-up: Method `WHATSAPP`, Status `PROMISED`, Next Action Date `Tomorrow`.
6. **Payment Settlement:** The customer pays ₹1,18,000. You log a Payment. The invoice becomes `PAID`. The dashboard\'s "Payment Collected" rises, and your "Net Cash Position" improves.

### Scenario B: Managing Purchases & GST Credits
1. **Setup:** You create a Vendor ("TechSupplies Inc"). 
2. **Expense:** You buy laptops for ₹50,000 + 18% GST. You log this as a Vendor Invoice and mark the GST as **Eligible for ITC**.
3. **Analytics Impact:** Your "GST Paid (Claimable)" rises by ₹9,000. When calculating your "Net GST Payable" on the dashboard, the system deducts this ₹9,000 from the GST you collected from your sales, instantly showing you exactly what you owe the government.
4. **Leakage:** Later, you pay restaurant bills for a team lunch (₹10,000 + 5% GST). Since restaurant GST is generally blocked, you mark it as **Non-Claimable**. This ₹500 appears in the **GST Leakage Analysis** module, helping you audit true business costs.

---

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router, Server Actions)
- **Database:** PostgreSQL customized through Prisma ORM
- **Styling:** Tailwind CSS combined with custom UI components (supporting sleek Dark/Light modes)
- **Analytics Visualization:** Recharts
- **Authentication:** NextAuth (Role-based access constraints: Owner, Accounts, Sales)

## 🚀 Getting Started Locally

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` contains your Postgres database URL and NextAuth secret.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/msme-cashflow"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database with sample data
   npx prisma db seed 
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*
