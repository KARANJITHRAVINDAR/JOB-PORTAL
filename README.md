# Workforce Platform 🚀

A state-of-the-art **Hyperlocal Gig-Matching & Job Portal** designed to seamlessly connect local employers and gig workers in India. Built with a rich set of modern features, this platform leverages spatial database indexing, real-time communication with automated translation, gamified reputation systems, secure escrow payments, and Google Gemini AI.

---

## 🌟 Key Features

### 👤 1. Multi-Role Account Management
*   **Dual Personas**: Support for both **Workers (Seekers)** and **Employers**. Users can register, log in, and manage profiles customized to their roles.
*   **Squad Hire Support**: Workers can specify a `squad_size` on their profiles, allowing them to apply for jobs and claim multiple slots at once for their group/squad.

### 📍 2. Hyperlocal Job Posting & Matching
*   **Spatial Database Indexing**: Jobs and workers store latitude/longitude as spatial `POINT` data in MySQL.
*   **Nearby Search**: Utilizes `ST_Distance_Sphere` to query and calculate the precise geodesic distance between jobs and seekers.
*   **Radius Filtering**: Filter jobs or workers within a specified radius (e.g., 5km, 10km) in real-time.

### 🎮 3. Gamification & Reputation System
*   **Progression Loop**: Workers earn **Experience Points (XP)** upon successfully completing jobs (50 XP per job).
*   **Leveling Up**: Automated level recalculation based on accumulated XP (Level = `FLOOR(XP/100) + 1`).
*   **Reputation Score**: A sliding reliability `trust_score` (defaulting to 100) tracks worker completion rates and feedback.
*   **Badges System**: Employers can award specific badges (e.g., *Punctual*, *Skilled*, *Hard Worker*) to workers upon completing a job, which are visible on their public profiles.

### 💳 4. Escrow & Wallet Payments
*   **Automatic Escrow Lock**: When an employer accepts a worker's application, the full wage is locked in an escrow account.
*   **Travel Advance Payout**: Instantly releases a **10% travel advance** to the worker's wallet to cover initial transport costs.
*   **Completion Release**: The remaining **90%** of the wage is automatically released from escrow to the worker's wallet once the job is marked complete.

### 🤖 5. Google Gemini AI Integrations (Powered by Gemini 2.5 Flash)
*   **Voice-to-Text Parsing**: Employers can dictate jobs in plain language. The AI parses the transcript to extract structured JSON data including:
    *   `category` (e.g., Plumber, Electrician, Construction)
    *   `urgency` (HIGH or NORMAL)
    *   `estimated_wage`
    *   `workers_needed`
    *   `intent` (HIRE or WORK)
*   **Real-time Multilingual Translation**: Seamlessly translates chat messages between employers and workers in real-time, removing linguistic barriers.

### ⏰ 6. Attendance & Verification
*   **Clock-in/Clock-out**: Digital attendance tracking with timestamps.
*   **Secure OTP Completion**: When the worker requests job completion, the system generates a secure 4-digit OTP. The employer enters this code to confirm job completion and release the escrow funds.

### 🛠️ 7. Tool Rental Store
*   **Lending & Renting**: Workers can view and rent tools (e.g., drills, saws, agricultural equipment) listed by other local owners at hourly rates, fully integrated with location coordinates.

---

## 🛠️ Tech Stack

### Frontend
*   **Next.js 16** (React 19 App Router)
*   **TailwindCSS v4** (Advanced layout and styles)
*   **Framer Motion** (Smooth visual transitions and micro-animations)
*   **Leaflet & React Leaflet** (Interfacing interactive maps)
*   **Socket.IO Client** (Real-time message synchronization)
*   **Zustand** (Sleek client-side state management)
*   **Lucide React** (Modern, consistent iconography)

### Backend
*   **Node.js & Express**
*   **TypeScript** (Executed via `ts-node`)
*   **Socket.IO** (Websocket server for chat and live notifications)
*   **MySQL2** (Promise-based MySQL client)
*   **Google GenAI SDK** (`@google/genai` integration with Gemini 2.5 Flash)

---

## 📁 Project Directory Structure

```text
job-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handler controllers (Auth, AI, Jobs, Escrow, Tools, etc.)
│   │   ├── routes/           # Express routes mapping HTTP paths to controllers
│   │   ├── db.ts             # Connection pool settings for MySQL80 database
│   │   ├── index.ts          # Main entrypoint server file (Port 4000)
│   │   ├── schema.ts         # Database initialization schema queries
│   │   └── socket.ts         # WebSockets event logic (messaging and notifications)
│   ├── alter_db_*.ts/js      # DB column and index migrations/updates
│   ├── package.json          # Dependency listings and packages config
│   └── tsconfig.json         # TypeScript configuration settings
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router folders and routes
│   │   │   ├── (auth)/       # Register & Login routes
│   │   │   ├── (employer)/   # Employer dashboard, job poster, nearby worker map
│   │   │   ├── (seeker)/     # Seeker dashboard, nearby jobs list/map, my jobs tracker
│   │   │   ├── messages/     # Multilingual real-time chat page
│   │   │   └── tools/        # Tool lending and renting catalog page
│   │   ├── components/       # Shared UI components (Report Modal, Notifications banner)
│   │   ├── context/          # React contexts
│   │   └── locales/          # Localization strings
│   ├── package.json          # Next.js dependencies list
│   └── next.config.ts        # Next.config compiler parameters
└── start.bat                 # Convenience startup windows script
```

---

## 💾 Database Schema

The system uses the following primary tables in MySQL database `workforce_platform`:
*   **`users`**: Stores user profiles (names, phones, roles, addresses, preferred language, coords, `squad_size`, `xp`, `level`, and `trust_score`). Contains a spatial index on geographical coordinates.
*   **`jobs`**: Tracks gig requests posted by employers, including coordinates, wage, status, and custom negotiations.
*   **`applications`**: Captures job applications submitted by workers (squad sizes, queue position, clocked-in timestamps, and application statuses).
*   **`wallet_escrows`**: Logs payments locked in escrow, tracking advance payments and statuses (`PENDING`, `RELEASED`, `REFUNDED`, etc.).
*   **`tools`**: Lists local items available for rent with coordinates and hourly rates.
*   **`completion_otps`**: Stores temporary codes for secure workflow completion verification.
*   **`user_badges`**: Keeps track of custom feedback badges awarded to workers.
*   **`chat_messages`**: Logs messaging history with source text, translated text, and language codes.
*   **`notifications`**: Manages real-time notifications for users.
*   **`reports`**: Allows reporting of misconduct.

---

## 🚀 Setup & Execution Guide

### Prerequisites
1.  **Node.js**: Version 18 or above recommended.
2.  **MySQL Server**: MySQL 8.0 running locally on standard port (user: `root`, password: `Ks@kbd23777`).

### 1. Database Initialization
Navigate to the `backend/` directory and run the initialization commands:
```bash
cd backend

# Initialize the main tables structure
npx ts-node --transpile-only src/schema.ts

# Apply subsequent alterations (adds negotiable column, notifications, and reports tables)
npx ts-node --transpile-only alter_db_v2.ts

# Run other minor schema updates
node alter_db_novelty.js
node alter_db_badges.js
```

### 2. Launching Servers
You can run the servers in separate terminals, or use the automated batch script:

#### Using Terminal 1 (Backend Server)
```bash
cd backend
npx ts-node --transpile-only src/index.ts
```
*Backend runs on: `http://localhost:4000`*

#### Using Terminal 2 (Frontend Dev Server)
```bash
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

#### Quick Start (Windows Script)
Double-click or run `start.bat` in the project root:
```bash
.\start.bat
```
This automatically launches both processes in separate command windows and redirects you to `http://localhost:3000`.
