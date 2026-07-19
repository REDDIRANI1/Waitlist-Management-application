# Early Access & Waitlist Management Application

A secure, mobile-responsive, full-stack Waitlist Management web application built with a modern design system. It allows users to register for early access, validates contact channels, supports dual authentication paths (Google OAuth and Email/Password), and includes a protected Admin Dashboard for managing submissions.

## Live URL & Source
- **Live Deployed Application**:  https://waitlist-management-application-854.vercel.app
- **Repository URL**: `git@github.com:REDDIRANI1/Waitlist-Management-application.git`

---

## 🛠️ Technology Stack
- **Framework**: Next.js 14+ (App Router) with TypeScript.
- **Styling**: Vanilla CSS & CSS Modules (no Tailwind CSS, adhering to custom glassmorphic guidelines).
- **ORM**: Prisma ORM (v5).
- **Database**: PostgreSQL (hosted on Neon/Supabase).
- **Authentication**: Custom JWT session engine supporting Google OAuth 2.0 and Credentials (email/password).
- **Icons**: Lucide React.
- **Deployment**: Vercel (Frontend & Serverless API Routes).

---

## 🔐 Authentication & Session Design

### Unified User System
We built a unified user table mapping multiple registration types:
- **Email & Password**: Passwords are secure-hashed using `bcryptjs` (salt rounds: 10) on the server.
- **Google OAuth**: A custom OAuth2 flow processes credentials natively. The server exchanges authorization codes for ID and profile tokens directly with Google API servers.
- **Unified Profile Checks**: During Google logins, the system verifies if the email was previously registered via passwords to prevent account takeover and displays helpful mismatch directions.

### Session Management
Sessions are managed via secure, client-side HTTP cookies:
- Tokens are signed with `jsonwebtoken` containing: `userId`, `email`, `name`, and `role` (`user` | `admin`).
- Saved in an `HttpOnly`, `Secure` (production only), `SameSite=Lax` cookie named `session`.
- Cleared from browsers upon triggering the POST logout endpoint.

### Admin Access Authorization Gate
- **Predefined Email Lock**: The dashboard is restricted to a single whitelisted email address configured by the `ADMIN_EMAIL` environment variable.
- **OAuth Only**: Administrators must authenticate strictly using Google OAuth.
- **Gatekeeper**: In the callback, if the logging-in user requested admin status (`state=admin`), their profile email is validated against the whitelist. Any non-matching Google profile is blocked and redirected to a clean Access Denied page.
- **Route Protectors**: A Next.js middleware file (`src/middleware.ts`) protects `/admin/dashboard` by checking the session cookie, and the API routes verify that the token's decoded role is `"admin"` before returning or mutating data.

---

## 🛡️ Validation Engine

### Email Verification
1. **Format Validation**: Standard email structure regex check.
2. **Duplicate Prevention**: Queries the database using Prisma to ensure the email is unique in the waitlist registry.
3. **Disposable Domain Filters**: Compares domains against a blacklist of common temporary email providers (e.g. `mailinator.com`, `yopmail.com`, `tempmail.com`, etc.).
4. **Real Domain DNS Lookup**: Executes a server-side asynchronous lookup using Node.js's native `dns.promises.resolveMx(domain)`. If a domain does not have active MX records, it cannot receive emails and is marked `invalid` (or blocked).

### Phone Verification
1. **Indian Mobile Format**: Enforces standard Indian format using `/^(?:91|0)?[6-9]\d{9}$/`.
2. **Normalization**: Strips prefixes (`+91`, `91`, `0`) and non-digit characters to store a clean 10-digit number.
3. **Duplicate Prevention**: Checks the database for entries with the normalized 10-digit number.
4. **Dummy Sequence Detection**: Detects repeating dummy digits (e.g., `9999999999`) or sequential series (e.g., `1234567890`) and rejects them.

*Note: If structural formats fail, the submission is blocked. If secondary logical checks fail (e.g. MX lookup warning), the submission is recorded, but flags are marked as `invalid` for the admin to inspect and manually override (approved/invalid/valid) inside the Dashboard.*

---

## 📁 Repository Structure
```
├── prisma/
│   └── schema.prisma         # Postgres database schema
├── src/
│   ├── app/
│   │   ├── globals.css        # Ambient glassmorphic dark-theme styles
│   │   ├── layout.tsx         # Layout with dynamic navbar and ambient glow
│   │   ├── page.tsx           # Home landing page
│   │   ├── apply/             # Early Access submission form & status card
│   │   ├── auth/              # Login & Signup credentials pages
│   │   ├── admin/             # Admin login, unauthorized, and dashboard panels
│   │   └── api/               # Serverless authentication and waitlist routes
│   ├── components/
│   │   └── Header.tsx         # Responsive navbar checking session states
│   ├── lib/
│   │   ├── db.ts              # Prisma Client singleton
│   │   ├── jwt.ts             # JWT token signers and verifiers
│   │   └── validation.ts      # Server-side validation engines (DNS, regex, logic)
│   └── middleware.ts          # Edge middleware path protections
├── .env.example               # Template environment parameters
├── README.md                  # System design manual
└── tsconfig.json              # TypeScript compilation rules
```

---

## 🚀 Local Installation & Setup

### 1. Clone & Install
```bash
git clone git@github.com:REDDIRANI1/Waitlist-Management-application.git
cd Waitlist-Management-application
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```
- Set up a Google Cloud Developer console application and populate `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Configure `ADMIN_EMAIL` to your test Google account.
- Provide a PostgreSQL database string in `DATABASE_URL`.

### 3. Setup Database Schema
Initialize database tables and generate client types:
```bash
# Push schema structure to PostgreSQL
npx prisma db push

# Generate client types
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the application.

---

## 🌐 Production Deployment (Vercel)
1. Import this repository into Vercel.
2. Select **Next.js** as the framework template.
3. Configure all variables listed in `.env` inside Vercel's Environment Variables section.
4. Vercel automatically runs the build and deploys the full-stack serverless application.

---

## 🧠 Assumptions Made
- The real-world verification logic relies on `dns` module lookups for MX records, which works reliably in standard Node.js server environments but might face restrictions on edge network deployments unless configured correctly.
- Users who sign up via Google OAuth are not required to set a password. Their identity is verified by Google.
- Admin role is exclusively granted to the single email specified in `ADMIN_EMAIL`. We assume only one admin exists for this prototype.
- Only Indian phone numbers are accepted for this assignment, as per the "+91" restrictions requested.
