# Arua Finance — Autonomous AI Wealth & Personal Finance Intelligence

<div align="center">
  <h3>⚡ Smarter Money. Powered by AI. ⚡</h3>
  <p>Comprehensive personal wealth, expense tracking, tax optimization, and AI financial advisory platform built for Indian investors.</p>
</div>

---

## 🌟 Overview & Key Capabilities

**Arua Finance** is a full-stack financial intelligence application engineered with a premium glassmorphic dark interface. It transforms raw financial telemetry (income, expenses, budgets, savings, investments) into automated, actionable wealth strategies.

### 🔑 Core Capabilities

1. **Authentication & Identity Security**:
   - **Direct Email Registration & Login**: Validated credential processing with bcrypt password hashing and JWT authentication tokens.
   - **Mobile 2Factor SMS OTP Verification**: Indian mobile verification (+91) via real 2Factor.in SMS gateway.
   - **Secure Password Reset Flow**: Cryptographically generated single-use reset tokens with 1-hour expiration, emailed securely via Nodemailer with direct frontend reset routes (/reset-password/:token).
   - **Protected Route Guards**: Client-side session verification for private endpoints (/dashboard, /expenses, /profile).

2. **Executive Financial Cockpit (Dashboard)**:
   - Live monthly in-hand cash flow, total expenditures, monthly targets, and remaining runway.
   - Real-time **Budget Burn Meter** with color-coded depletion indicators.
   - **6-Pillar Financial Health Score (0–100)**: Algorithm calculating Savings Ratio, Budget Discipline, Emergency Runway, Wealth Horizon, Goal Momentum, and Tax Asset Mix.

3. **Multi-Channel Expense Radar & Ledger (₹)**:
   - Full CRUD operations with MongoDB Atlas persistence.
   - 9 Standard Indian expenditure categories (*Food & Dining, Rent & Housing, Utilities, Entertainment, Healthcare, Shopping, Transport, EMI & Loans, Other*).
   - Multi-channel payment tracking (*UPI, Credit Card, Debit Card, Net Banking, Cash*).
   - Dynamic search, category filters, payment mode filters, and delete confirmation dialogs.
   - **Automated Budget Threshold Alerts**: Nodemailer email warnings dispatched when monthly spending crosses threshold limits (with 24-hour duplicate alert suppression).

4. **Smart Budget Generator (50/30/20 & Custom)**:
   - Interactive percentage allocation across Needs, Wants, Savings, Investments, and Emergency Fund.
   - Real-time validation ensuring 100% total allocation with direct database sync.

5. **Financial Goals Planner**:
   - Create, track, edit, and delete prioritized financial milestones (*Emergency Fund, Buy a House, Buy a Car, Education, Retirement, Travel*).
   - Completion percentages, target date projections, and monthly contribution tracking.

6. **AI Money Coach & Wealth Advisory (Gemini Engine)**:
   - Google Gemini generative model integration strictly proxied via the Node.js backend (/api/ai/coach, /api/ai/recommendations) to guarantee zero client-side API key exposure.
   - Injects live financial telemetry (income, expenses, top category burn, liquid savings, health score, active goals) into system prompts.

7. **Monthly AI Financial Report**:
   - One-click synthesis of monthly income, expenditures, surplus, category concentrations, detected anomalies, and Gemini-generated 3-point executive action plans.
   - Printable dossier view.

8. **Investment Simulator & SIP Compounding**:
   - SIP, Equity, PPF, and FD compounding calculators with annual step-up percentage capability.
   - Scenario A vs Scenario B side-by-side comparison.

9. **Emergency Fund Runway Calculator**:
   - 3-Month, 6-Month, and 12-Month reserve target calculations based on essential monthly expenses and liquid savings.

10. **Indian Tax Studio (FY 2025–26)**:
    - Old vs New Tax Regime optimizer tailored for Indian Budget FY 2025–26.
    - New Regime: Standard Deduction ₹75,000, Section 87A rebate up to ₹7,00,000 (Tax = ₹0).
    - Old Regime: Standard Deduction ₹50,000, Section 80C (up to ₹1.5L), Section 80D, Section 24(b) (Home loan interest up to ₹2L), HRA exemption, and Section 87A rebate up to ₹5,00,000.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React 18, Vite, JavaScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Component System** | Radix UI, Shadcn UI, Recharts, TanStack Query |
| **Backend Runtime** | Node.js (ES Modules), Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI Intelligence** | Google Gemini Generative AI (@google/generative-ai) |
| **Authentication** | JSON Web Tokens (jsonwebtoken), cryptjs, Node Crypto |
| **Communications** | Nodemailer (Gmail SMTP), 2Factor.in SMS Gateway |

---

## 📁 Repository Structure

`
arua-finance/
├── frontend/                     # Vite + React Client Application
│   ├── src/
│   │   ├── components/           # UI components, calculators & modals
│   │   │   ├── AIRecommendations.jsx
│   │   │   ├── CalculateCompo.jsx        # Indian Tax Studio (FY 25-26)
│   │   │   ├── ChatBotGemini.jsx         # AI Coach interface
│   │   │   ├── EmergencyFundCalculator.jsx
│   │   │   ├── FinancialGoalPlanner.jsx
│   │   │   ├── FinancialHealthScore.jsx
│   │   │   ├── InvestmentSimulator.jsx
│   │   │   ├── MonthlyFinancialReport.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PhoneAuthModal.jsx        # Dual Email & SMS Auth Modal
│   │   │   ├── ProtectedRoute.jsx        # Route security wrapper
│   │   │   ├── SmartBudgetGenerator.jsx
│   │   │   └── SpendingInsights.jsx
│   │   ├── helper/               # Auth context, formatters & API handlers
│   │   │   ├── apiUrl.js
│   │   │   ├── auth.jsx                  # Master authentication state
│   │   │   └── formatters.js             # Indian Rupee (₹) formatting
│   │   ├── pages/                # Routed views
│   │   │   ├── Dashboard.jsx             # Executive Cockpit
│   │   │   ├── ExpenseTracker.jsx        # Transaction Ledger
│   │   │   ├── ForgotPassword.jsx        # Reset request view
│   │   │   ├── ResetPassword.jsx         # New password confirmation view
│   │   │   ├── Profile.jsx               # User calibration & security
│   │   │   ├── Index.jsx                 # Landing page
│   │   │   └── NotFound.jsx              # 404 handler
│   │   ├── App.jsx               # React Router configuration
│   │   └── main.jsx              # Client entry point
│   ├── .env.example              # Frontend environment template
│   ├── vercel.json               # SPA rewrites for Vercel
│   └── package.json
│
├── backend/                      # Node.js + Express API Service
│   ├── ai.service.js             # Gemini AI, Health Score & Report Engine
│   ├── auth.middleware.js        # JWT Bearer Token verification
│   ├── index.js                  # Express API server & routes
│   ├── MongoDBConnection.js      # Resilient Mongoose connection manager
│   ├── sendMail.controller.js    # Nodemailer email dispatcher
│   ├── twofactor.service.js      # 2Factor SMS OTP gateway
│   ├── user.controller.js        # User, goal & expense operations
│   ├── user.model.js             # Mongoose schemas (User, Goals, Expenses)
│   ├── .env.example              # Backend environment template
│   └── package.json
│
├── .gitignore                    # Git exclusions (.env, node_modules, dist)
├── package.json                  # Root monorepo scripts
└── README.md                     # Documentation
`

---

## ⚙️ Environment Configuration

### Backend Environment (ackend/.env)

Create ackend/.env based on ackend/.env.example:

`env
PORT=4000
NODE_ENV=production
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority
DBName=arua_finance
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CLIENT_URL=http://localhost:8080
GEMINI_API_KEY=your_google_gemini_api_key
TWOFACTOR_API_KEY=your_2factor_in_api_key_optional
OTP_LENGTH=6
APIEMAILADDRESS=your_notification_email@gmail.com
APIEMAILPASS=your_16_character_gmail_app_password
`

### Frontend Environment (rontend/.env)

Create rontend/.env based on rontend/.env.example:

`env
VITE_SERVER_URL=http://localhost:4000
VITE_OTP_LENGTH=6
`

---

## 🚀 Running Locally

### 1. Start the Backend Service
`ash
cd backend
npm install
npm start
`
*Backend runs at http://localhost:4000 (Health check: http://localhost:4000/api/health).*

### 2. Start the Frontend Client
`ash
cd frontend
npm install
npm run dev
`
*Frontend runs at http://localhost:8080 or http://localhost:5173.*

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Import the repository in [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory** to rontend.
3. Configure Environment Variables:
   - VITE_SERVER_URL: URL of your deployed backend service (e.g., https://arua-backend.onrender.com).
4. Deploy. The included rontend/vercel.json provides single-page routing rewrites so deep links and refreshes function smoothly.

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to ackend.
3. Set **Build Command** to 
pm install.
4. Set **Start Command** to 
ode index.js.
5. Under Environment Variables, add MONGO_URI, DBName, JWT_SECRET, CLIENT_URL, GEMINI_API_KEY, APIEMAILADDRESS, APIEMAILPASS.
6. Health check path: /api/health.

---

## 🔒 Security & Privacy Architecture

- **Zero Client Secrets**: All Gemini AI prompts, Nodemailer credentials, and 2Factor secrets remain strictly on the backend.
- **Cryptographic Password Recovery**: Password reset tokens use crypto.randomBytes(32) with SHA-256 hashing and automatic 1-hour expiration in MongoDB.
- **Spam Throttling**: Budget limit alert emails include a 24-hour cooldown mechanism to prevent mailbox flooding.
- **Data Isolation**: All user goals, expenses, budgets, and financial reports are strictly partitioned by authenticated user identity.
