<div align="center">

# 🛡️ CareerTrust AI

### Don't just detect scams. Make smarter career decisions.

**Team PHOENIX** &nbsp;|&nbsp; HackSpora 2.0 &nbsp;|&nbsp; Karpagam College of Engineering

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python)](https://python.org)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square)](https://web.dev/progressive-web-apps/)
[![Status](https://img.shields.io/badge/Status-Active-02C39A?style=flat-square)]()

> **CareerTrust AI** is a free, AI-powered web app that helps students in India instantly detect scam job and internship offers — before they lose money or personal data.

</div>

---

## 🎯 The Problem

Every year, thousands of Indian students fall victim to fake job offers on WhatsApp, LinkedIn, and email:
- Fake offer letters from known MNCs (TCS, Infosys, Amazon)
- "Registration fee" or "security deposit" collection
- OTP / Aadhaar / bank details requests
- Suspiciously high salaries with no interview process

**CareerTrust AI gives every student a free, instant first line of defense.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Scam Risk Analysis** | Scans job text for 13+ scam patterns with weighted scoring |
| 📊 **Risk + Opportunity Score** | How risky (0–100) and how good (0–100) the offer is |
| 🏢 **Company Database** | Blacklist of known scam companies + whitelist of verified legit companies |
| 📄 **Resume Upload** | Upload PDF resume → auto-extract skills → match against job |
| 📸 **Screenshot OCR** | Upload a WhatsApp/email screenshot → text extracted automatically |
| 🎤 **Voice Input** | Dictate the job offer using your microphone |
| 📧 **OTP Email Verification** | Real email OTP login — no fake accounts |
| 💰 **Salary Analysis** | Compares offered salary to typical market range |
| 🧠 **Skill Match** | Shows match %, matched skills, and missing skills |
| 🤖 **AI Chatbot** | Smart assistant (OpenAI GPT / smart local fallback) |
| 📰 **Scam News Feed** | Latest job scam alerts from India |
| 💡 **Interview Tips** | Role-based interview preparation tips |
| 🚀 **Career Guide** | Salary insights, skill roadmaps, career red flags |
| 🖼️ **Share as Image** | Download and share report as a WhatsApp-ready image card |
| 🌙 **Dark Mode** | Full dark/light theme toggle |
| 🌐 **Tamil/English** | Bilingual support |
| 📱 **PWA** | Install as a mobile/desktop app — works offline |

---

## 🏗️ Tech Stack

```
Frontend              Backend               AI & Analysis
─────────────────     ─────────────────     ──────────────────
React 18 + Vite       FastAPI (Python)      Rule-based NLP
CSS3 Animations       Uvicorn               DNS MX validation
Canvas API            dnspython             OCR (Tesseract.js)
PWA / Service Worker  PyPDF2                OpenAI GPT-4o-mini
Tesseract.js (OCR)    python-multipart      Skill extraction
```

---

## 📂 Project Structure

```
PHOENIX-CareerTrust-AI/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React app (all pages + logic)
│   │   └── App.css          # Styles, animations, sidebar
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   ├── sw.js            # Service worker (offline support)
│   │   ├── icon-192.png     # PWA icon
│   │   └── icon-512.png     # PWA icon
│   └── index.html           # HTML entry + PWA meta tags
│
└── backend/
    └── app/
        ├── main.py          # FastAPI routes & endpoints
        ├── rules.py         # Scam detection rules & scoring
        ├── analysis.py      # Salary, skill match, opportunity score
        ├── companies.py     # Company blacklist/whitelist database
        ├── verification.py  # Recruiter & company verification
        ├── email_check.py   # DNS MX email validation
        └── __init__.py
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AkashPrabhavathi/PHOENIX-CareerTrust-AI.git
cd PHOENIX-CareerTrust-AI
```

### 2. Start the Backend

```bash
cd backend
pip install fastapi uvicorn python-dotenv dnspython openai requests python-multipart PyPDF2
python -m uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Optional: Configure AI & Email OTP

Create `backend/.env`:

```env
OPENAI_API_KEY=sk-your-key-here      # For real AI chatbot
SMTP_USER=your@gmail.com             # For real OTP emails
SMTP_PASS=your-app-password
GNEWS_API_KEY=your-gnews-key         # For live scam news
```

> All features work without these keys — the app falls back to smart local alternatives.

---

## 🧠 How the Algorithm Works

### Scam Detection (Rule-Based NLP)
```
Job Text Input
      ↓
Pattern Matching (13+ rules)
  • Registration/training fee?      → +25 pts
  • OTP or Aadhaar request?         → +30 pts
  • Personal email (gmail/yahoo)?   → +15 pts
  • Urgent pressure language?       → +10 pts
  • Guaranteed job promise?         → +20 pts
  • Suspicious link detected?       → +15 pts
      ↓
Risk Score (0–100)
  0–30   → ✅ Low Risk
  31–60  → 🤔 Needs Verification
  61–80  → ⚠️  High Risk
  81–100 → 🚨 Very High Risk
```

### Company Database Check
```
Company Name → Blacklist → 🚨 KNOWN SCAM
             → Whitelist → ✅ VERIFIED
             → Unknown   → 🔍 NOT IN DATABASE
```

### Skill Matching
```
Resume PDF  → Extract Text → Detect Skills (100+ known skills)
Job Text    → Extract Skills →  ↗
                               Set Intersection → Match % + Missing Skills
```

---

## 🛣️ Roadmap

- [x] Scam detection with 13+ rules
- [x] Company blacklist/whitelist database
- [x] Resume PDF skill extraction
- [x] OTP email verification
- [x] Scam news feed
- [x] Interview tips + career guide
- [x] PWA (installable app)
- [x] WhatsApp image share
- [ ] Deploy on Render + Vercel
- [ ] Dashboard with report trend graphs
- [ ] Community scam report submission
- [ ] Mobile app (React Native)

---

## 👨‍💻 Built By

**Akash S** — Team PHOENIX  
Karpagam College of Engineering  
HackSpora 2.0 Hackathon Project

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

**⭐ Star this repo if it helped you stay safe from job scams!**

Made with ❤️ for students across India 🇮🇳

</div>