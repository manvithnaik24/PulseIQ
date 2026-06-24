# PulseIQ — Next-Gen AI-Powered Health & Telemetry Platform

PulseIQ is a comprehensive, modern healthcare SaaS platform designed for patient monitoring, medical report simplification, AI-driven diagnostics, family care coordination, and emergency response. Built with a robust Python/FastAPI backend and a highly polished React/Vite/Tailwind frontend, it offers real-time telemetry, GPS tracking, and intelligent medical analyses.

---

## 🚀 Key Features

*   **AI Medical Report Simplifier**: Upload PDF, JPG, or PNG clinical documents (up to 20MB) to extract text and analyze biomarkers using Google Gemini, producing printable, mobile-friendly PDF summaries.
*   **Real-Time Telemetry Stream**: Connect via WebSockets to see live updates of patient health scores, heart rate, and SpO2 levels.
*   **Family Care Hub**: Manage family contacts (Father, Mother, Brother, Sister, Doctor, etc.) with quick profiles, emergency contacts, and vital summaries.
*   **Emergency SOS System**: A 5-second countdown panic button that captures GPS coordinates, shares location via Google Maps, and updates the database while alerting designated family contacts.
*   **Interactive AI Health Assistant**: Ask questions about symptoms, medications, or reports using the built-in clinical assistant powered by Gemini.
*   **Medication Planner & Tracker**: Track daily doses, set custom reminders, and monitor adherence in real-time.
*   **Premium Viewport-Optimized Landing Page**: A gorgeous, trust-building, fully responsive landing page featuring smooth gradients and glassmorphism.

---

## 📸 Screenshots

> [!NOTE]
> Add your actual screenshots in a `docs/screenshots/` directory within the repository and update the paths below.

| Hero Section (Landing Page) | Live Dashboard |
|---|---|
| `docs/screenshots/landing_hero.png` | `docs/screenshots/dashboard.png` |

| AI Report Analysis | Family Hub |
|---|---|
| `docs/screenshots/report_analysis.png` | `docs/screenshots/family_hub.png` |

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite-powered)
*   **Styling**: Tailwind CSS & Framer Motion (premium animations)
*   **Charts**: Recharts (smooth SVG visualization)
*   **Authentication**: Clerk (enterprise-grade authentication)
*   **State Management**: React Hooks & Contexts
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI (Asynchronous Python REST framework)
*   **Database**: Neon Serverless Postgres (via SQLAlchemy)
*   **AI Integration**: Google Gemini API (with Groq API fallback)
*   **Real-Time Communication**: WebSockets
*   **PDF Generation**: ReportLab
*   **Task Runners/Servers**: Uvicorn

---

## ⚙️ Environment Variables

PulseIQ requires several environment variables to function correctly. Examples are provided in the respective `.env.example` files.

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
# Database connection (Neon Postgres recommended)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Clerk Authentication Secrets
CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://api.clerk.com/v1/jwks

# AI API Keys
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
# Clerk Authentication Publishable Key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   Git

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set up environment variables by copying `.env.example` to `.env`.
5.  Start the development server:
    ```bash
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Set up environment variables by copying `.env.example` to `.env.local`.
4.  Run the Vite development server:
    ```bash
    npm run dev
    ```

---

## 🌐 Deployment Guide

### Render Deployment (Recommended)
This repository contains a pre-configured `render.yaml` blueprint. You can import this into Render for one-click setup:
1.  Connect your GitHub repository to Render.
2.  Create a new **Blueprint** instance.
3.  Render will automatically provision:
    *   A FastAPI web service (`pulseiq-backend`).
    *   A static web site (`pulseiq-frontend`).
4.  Configure all required environment variables in the Render Dashboard during setup.
