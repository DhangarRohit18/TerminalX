# InterviewIQ AI 🚀

> **Hackathon-winning AI-Powered Mock Interview Platform**

A production-grade SaaS platform that helps candidates prepare for technical interviews through adaptive AI-driven mock interviews, real-time evaluation, readiness scoring, and personalized improvement plans.

---

## ✨ Features

- 🧠 **Adaptive AI Engine** — Questions dynamically adjust difficulty based on live performance
- 🎯 **Resume × JD Match** — Skill gap analysis with match percentage scores
- 🎙️ **Voice Mode** — Speech-to-text answers & text-to-speech questions (Web Speech API)
- 📊 **Deep Analytics** — Radar charts, heatmaps, readiness trends, hiring probability
- 🏆 **Gamification** — XP, Levels, Achievements, Streaks, Leaderboard
- 📄 **PDF Reports** — Downloadable professional interview report
- 👥 **Recruiter View** — Browse & compare candidates by readiness score
- 🗺️ **Learning Roadmap** — AI-generated 7/15/30-day personalized study plans

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Vanilla CSS (custom design system) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google + Email) |
| AI Engine | Google Gemini 2.0 Flash |
| Voice | Web Speech API |
| Charts | Recharts |
| PDF | jsPDF + html2canvas |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/DhangarRohit18/TerminalX.git
cd TerminalX
npm install
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get your **Gemini API Key** free from [Google AI Studio](https://aistudio.google.com/)

### 3. Firebase Setup
1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Google + Email/Password
3. Enable **Firestore Database** (start in test mode)

### 4. Run
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Deploy to Vercel

```bash
npx vercel --prod
```

Add your `.env` variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

## 📁 Project Structure

```
src/
├── ai/              # Gemini AI engines (questions, evaluation, resume, JD, match, roadmap, report)
├── firebase/        # Firebase config, auth helpers, Firestore CRUD
├── context/         # React contexts (Auth)
├── hooks/           # Custom hooks (useVoice, useTimer)
├── pages/           # 15 full pages
├── components/      # Layout (Sidebar, Navbar) + UI components
└── index.css        # Complete design system
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#09090B` |
| Surface | `#18181B` |
| Primary | `#7C3AED` |
| Secondary | `#2563EB` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |

---

## 📄 License

MIT © 2026 InterviewIQ AI
