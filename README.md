# 🏥 Project Sanjeevani: Neural Health Intelligence

Project Sanjeevani is a clinical-grade, AI-powered healthcare platform designed for rural accessibility, distributed disease surveillance, and high-fidelity medical triage.

Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**, the platform bridges the gap between urban clinical excellence and rural medical isolation.

---

## 🚀 Core Architecture & USPs

### 🧪 1. Neural AI Triage Pipeline
- **Conversational Diagnostics:** Streams clinical-grade probing using the Vercel AI SDK and Gemini 1.5 Flash.
- **Structured Risk Scoring:** Second-stage background analysis that detects "Red Flags" and assigns an Emergency Priority (Critical/High/Medium/Low).

### 🛡️ 2. Zero-Knowledge Health Vault
- **Client-Side Encryption:** All PHI (Personal Health Information) is encrypted using **AES-256** in the patient's browser before persistence.
- **Privacy-Sovereign:** The server never sees raw clinical data; citizens own their cryptographic keys.

### 📄 3. Multimodal OCR Engine
- **Image-to-Clinical Meta:** Advanced Vision AI parses photos of medical reports (Blood Work, Imaging) and extracts structured vitals and findings.

### 📡 4. Offline-First Infrastructure
- **Finite-State Sync:** Firestore-backed IndexedDB persistence allows field workers to record data in zero-connectivity village zones.
- **Automatic Reconciliation:** Data auto-syncs to the district cloud as soon as a 3G/4G signal is regained.

---

## 🏗️ The Multi-Portal Ecosystem

- **`/triage`**: Citizen-facing AI symptom assessment.
- **`/dashboard`**: Personal Health Intelligence Hub.
- **`/records`**: The Secure Records Vault.
- **`/clinical`**: Physician's High-Priority Queue (RBAC Protected).
- **`/field`**: Frontline Healthcare Worker Operational Shield.
- **`/analytics`**: Government Disease Surveillance Heatmap.

---

## 🛠️ Tech Stack & Compliance

- **Framework:** Next.js 16 (App Router)
- **Intelligence:** Vercel AI SDK + Gemini Multimodal
- **Infrastructure:** Firebase (Firestore, Auth, Storage)
- **Security:** AES-256 Client-Side Encryption + HIPAA-Ready Firestore Rules
- **Deployment:** Vercel Edge Optimized

---

## 📦 Deployment

1. **Environmental Variables:**
   - `NEXT_PUBLIC_FIREBASE_...`: Core infra keys.
   - `GOOGLE_GENERATIVE_AI_API_KEY`: AI Triage engine.
   - `NEXT_PUBLIC_ENCRYPTION_KEY`: Master Vault Key.

2. **Deploy via Vercel:**
   `vercel deploy --prod`

---

## 🏛️ Project Ethos
Project Sanjeevani is built on the belief that **Healthcare is a Human Right**, and **Privacy is a Universal Standard**. We leverage neural intelligence to ensure no citizen is left behind.
