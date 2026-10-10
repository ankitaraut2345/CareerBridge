# CareerBridge

> **Where Talent Meets Opportunity & the Right Guidance**

CareerBridge is a unified campus placement, internship, and alumni networking platform designed for higher education institutions. It connects **Students**, **Alumni**, **TPOs (Training & Placement Officers)**, and **Admins** into a single, cohesive career acceleration ecosystem.

---

## 🚀 Technology Stack

### Frontend
- **Framework:** React.js (Vite) with React Router (v6)
- **Styling:** Tailwind CSS (v3 with locked brand design tokens)
- **HTTP Client:** Axios (centralized instance with request/response interceptors & JWT injection)
- **Real-Time Client:** Socket.IO Client (WebSocket + polling fallback, auto-reconnect)
- **Icons:** Lucide React

### Backend
- **Runtime & Framework:** Node.js & Express.js
- **Database Layer:** MongoDB with Mongoose ODM (includes in-memory dual-mode fallback)
- **Authentication & Authorization:** JSON Web Tokens (JWT) & Role-Based Access Control (RBAC)
- **Real-Time Engine:** Socket.IO Server (scoped conversation rooms, handshake JWT authentication)
- **Resume Storage:** Cloudinary (PDF uploads with secure URL storage)
- **AI Intelligence:** Google Gemini API (Resume ATS Analysis & Interview Preparation)
- **Security & Protocol:** In-memory sliding-window rate limiters, security headers, CORS origin enforcement

---

## 🎨 Locked Design System Palette

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `#4F46E5` | Indigo | Primary buttons, active states, key CTAs |
| **Secondary** | `#7C3AED` | Violet | Alumni accents, badges, secondary actions |
| **Accent** | `#38BDF8` | Sky Blue | Ribbon accents, tags, highlights |
| **Background**| `#F8FAFC` | Cool Off-White | Application background |
| **Text** | `#172033` | Deep Slate | Primary typography |
| **White** | `#FFFFFF` | Pure White | Cards, containers, modals |

---

## 📦 Platform Modules & Core Capabilities

1. **Authentication & RBAC:** Public student/alumni registration with email verification; protected administrative roles (TPO/Admin); bcrypt password hashing; stateless JWT session management.
2. **Student Profiles & Resumes:** Comprehensive academic records (CGPA, backlogs, department, graduation year, verified skills); PDF resume storage via Cloudinary.
3. **Alumni Network & Verification:** Two-phase alumni profile creation and administrator verification gating before enabling mentorship or referrals.
4. **Recruitment Opportunities:** Full-time placements and seasonal internships created by TPOs; deadline enforcement; status transitions (`DRAFT` → `PUBLISHED` → `CLOSED` → `ARCHIVED`).
5. **Deterministic Eligibility Engine:** Multi-factor criteria verification (CGPA thresholds, maximum backlogs, department match, graduation year, required skill matches) before allowing applications.
6. **Application Workflow & Tracking:** Transparent lifecycle tracking (`APPLIED` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` / `REJECTED` / `WAITLISTED`); embedded interview scheduling.
7. **Alumni Mentorship:** Verified alumni discovery by company/industry; mentorship request submission and status tracking.
8. **Referral Hub:** Job opening referral postings from verified alumni; request matching and application tracking.
9. **Real-Time 1-to-1 Chat:** Persistent Socket.IO messaging scoped to verified relationships (`canUsersChat` authorization); message history; instant notification dispatch.
10. **In-App Notifications:** Real-time push and database alerts for interview invites, application status updates, mentorship requests, and referral responses.
11. **Role-Specific Dashboards:** Custom analytics, application pipelines, and administrative overview for each of the 4 user roles.
12. **AI Resume Analysis:** Tailors student profile and PDF resume to opportunity requirements, providing match scoring, skill gap detection, and ATS suggestions.
13. **AI Interview Preparation:** Opportunity-grounded technical questions, project deep-dives, and behavioral interview coaching.

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
# Server Mode & Port
NODE_ENV=development
PORT=5000

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/careerbridge

# JWT Authentication
JWT_SECRET=your_jwt_secret_minimum_32_characters_here
JWT_EXPIRES_IN=7d

# Allowed Frontend Client Origin
CLIENT_URL=http://localhost:5173

# Cloudinary Storage (for Resumes)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Features (Google Gemini API)
GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-1.5-flash

# Seed Data (Development only)
DEMO_ACCOUNTS_PASSWORD=CareerBridgeDemo@2026

# Instant Login / Quick Access Feature Flag (Default: false in production)
ENABLE_DEMO_LOGIN=true
```

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api

# Optional: Dedicated Socket.IO URL (automatically defaults to VITE_API_URL without /api)
VITE_SOCKET_URL=http://localhost:5000

# Optional: Show Quick Access Demo Login buttons on the Login page (Default: false in production)
VITE_ENABLE_DEMO_LOGIN=true
```

---

## ⚡ Instant Login (Quick Access)

For evaluation and rapid role demonstrations, CareerBridge provides a secure 1-click **Quick Access** feature:

- **Roles Supported:**
  - `Continue as Student` → redirects to `/student`
  - `Continue as Alumni` → redirects to `/alumni`
  - `Continue as TPO` → redirects to `/tpo`
  - `Continue as Admin` → redirects to `/admin`
- **Security & Feature Flag:**
  - Backend controlled via `ENABLE_DEMO_LOGIN` environment variable (defaults strictly to `false`).
  - When disabled, backend returns `403 Forbidden` for any direct API calls to `/api/auth/demo-login`.
  - Reuses the existing JWT issuance mechanism (`generateToken`), standard login payload (`{ token, user }`), and existing RBAC middleware without exposing secrets or credentials to the client.
- **Endpoints:**
  - `GET /api/auth/demo-login`: Returns status `{ success: true, enabled, roles }`
  - `POST /api/auth/demo-login`: Accepts `{ role }`, verifies feature flag, and returns authenticated session token.

---

## 🛠️ Local Development & Quickstart

### 1. Install Dependencies
```bash
# From repository root
npm run install:all
```
*(Or install in both directories: `cd server && npm install && cd ../client && npm install`)*

### 2. Run the Development Servers
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend Client (port 5173)
npm run dev:client
```

### 3. Seed Demo Data (Optional for Development)
```bash
# From server directory
cd server
npm run seed
```
*Note: The seeder is strictly protected against execution when `NODE_ENV=production`.*

---

## 🧪 Testing & Verification Commands

```bash
# Backend Security & RBAC Test Suite (50 automated tests)
cd server
npm test

# Specialized Seed Data Integrity Test (41 assertions)
node test_phase15_seed.js

# AI Interview Preparation Test Suite (34 assertions)
node test_phase14_full.js

# AI Resume Analysis Test Suite (36 assertions)
node test_phase13_full.js

# Frontend Production Build & Linter
cd ../client
npm run lint
npm run build
```

---

## 🌐 Production Deployment Guide

CareerBridge uses a decoupled production architecture:
- **Frontend:** Hosted as a static Single Page Application (SPA) on **Vercel** or **Netlify**.
- **Backend:** Hosted as a persistent Node.js web service on **Render**, **Railway**, or **AWS ECS/EC2**.
- **Database:** Hosted on **MongoDB Atlas** (Managed Cloud M0/M10 cluster).
- **Media & File Storage:** **Cloudinary** (secure cloud PDF asset storage).

---

### Step 1: MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create or select an organization/project.
2. Deploy a free **M0 Sandbox** cluster (AWS or GCP region closest to your users).
3. Under **Database Access**, create a database user:
   - Built-in role: `Read and write to any database`.
   - Set a strong, secure password.
4. Under **Network Access**, add an IP Access entry:
   - For Render/cloud services: allow access from anywhere (`0.0.0.0/0`).
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/careerbridge?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your created database credentials.

---

### Step 2: Backend Deployment (Render Web Service)
1. Push your repository to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
3. Connect your repository and configure:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free or Starter (persistent WebSockets supported).
4. In the **Environment Variables** tab, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A strong random string, at least 32 characters>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-frontend.vercel.app` *(set this once frontend URL is assigned)*
   - `CLOUDINARY_CLOUD_NAME`: `<Your Cloudinary cloud name>`
   - `CLOUDINARY_API_KEY`: `<Your Cloudinary API key>`
   - `CLOUDINARY_API_SECRET`: `<Your Cloudinary API secret>`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`
   - `AI_MODEL`: `gemini-1.5-flash`
5. Deploy the service and note your backend URL (e.g. `https://careerbridge-api.onrender.com`).
6. Test health check: `GET https://careerbridge-api.onrender.com/api/health`.

---

### Step 3: Frontend Deployment (Vercel)
1. In [Vercel Dashboard](https://vercel.com), click **Add New...** → **Project**.
2. Import your GitHub repository.
3. Configure the Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://careerbridge-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://careerbridge-api.onrender.com`
5. Click **Deploy**.
6. Once deployed, copy your production domain (e.g. `https://careerbridge.vercel.app`).
7. **Important:** Return to your backend host (Render) and set `CLIENT_URL` to `https://careerbridge.vercel.app` so CORS and Socket.IO handshakes are authorized!

---

## ⚠️ Service Limitations & Free-Tier Notes

1. **Render Free Tier Cold Starts:**
   - Free Render instances spin down after 15 minutes of inactivity. The first request after sleep may take 30–50 seconds to respond.
   - For instant zero-latency production deployments, use a Render Starter plan or equivalent active container instance.
2. **WebSockets & Serverless:**
   - CareerBridge real-time chat utilizes persistent Socket.IO connections. It requires a long-running Node.js process (like Render, Railway, or EC2) rather than purely stateless serverless functions (like Vercel Serverless Functions).
3. **MongoDB Atlas M0 Free Tier:**
   - Atlas free tier provides 512MB storage and 100 max connections, which is sufficient for campus demonstrations and testing.
4. **Cloudinary Free Tier:**
   - Standard PDF uploads are supported under Cloudinary's monthly credit allowance.

---

## 🔒 Security Best Practices

- Never commit `.env` files or API secrets to version control.
- Ensure `JWT_SECRET` is unique to production and distinct from development.
- The `npm run seed` command is guarded and will refuse to run if `NODE_ENV=production`.
- API endpoints are protected against brute-force attacks via sliding window rate limiting.
