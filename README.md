\# CareerTrust AI



\*\*Team:\*\* PHOENIX



\*\*Tagline:\*\* Don't just detect scams. Make smarter career decisions.



\## Problem Statement



Students receive many job and internship offers through WhatsApp, email, LinkedIn, and other platforms, and often cannot tell whether an opportunity is genuine, whether the company/recruiter is trustworthy, whether the salary is fair, or whether the role matches their skills.



\## Proposed Solution



CareerTrust AI is an AI-powered career safety and decision-support platform. A student pastes a job/internship message, enters their skills and (optionally) the company name, and receives a complete Opportunity Trust Report — combining scam detection, salary analysis, skill match, and company/recruiter verification — in one place.



\## Features



\- \*\*Scam Detection Engine\*\* – Rule-based detection of 13+ common scam patterns (registration fees, OTP requests, personal email domains, urgent payment pressure, shortened links, etc.), each with evidence extracted from the submitted text.

\- \*\*Risk Score (0–100)\*\* – Clear risk level: Low Risk / Needs Verification / High Risk / Very High Risk.

\- \*\*Opportunity Score (0–100)\*\* – Combines safety, salary fairness, and skill match into one overall score.

\- \*\*Salary Analysis\*\* – Compares the offered salary/stipend against a typical range for the role type.

\- \*\*Skill Match\*\* – Compares student skills against the job description and highlights missing skills.

\- \*\*Company Verification\*\* – Guidance on verifying the company through official channels.

\- \*\*Recruiter Verification\*\* – Detects whether the recruiter's email uses a personal domain (Gmail/Yahoo/etc.) vs a company domain.

\- \*\*Suspicious Link Detection\*\* – Flags shortened/obscured links commonly used in phishing.

\- \*\*Safe Apply Checklist\*\* – A clear list of safety steps before applying or paying any money.



\## Responsible AI \& Privacy Note



CareerTrust AI does \*\*not\*\* claim to detect scams with 100% accuracy. All scores are indicators based on common patterns, not legal or factual proof of fraud. Users are always advised to verify independently before applying, paying money, or sharing sensitive information. The system does not store submitted job text or personal data beyond the current session in this MVP.



\## Technology Stack



\- \*\*Frontend:\*\* React + Vite

\- \*\*Backend:\*\* Python, FastAPI, Pydantic

\- \*\*Detection Engine:\*\* Rule-based (keyword + pattern matching), designed to be extended with AI/ML models later



\## System Workflow



1\. Student pastes job/internship text, enters skills and company name.

2\. Frontend sends the data to the FastAPI backend (`/analyze`).

3\. Backend runs the scam detection engine, salary analysis, skill match, and verification checks.

4\. Backend returns a combined Opportunity Trust Report.

5\. Frontend displays the report with risk score, opportunity score, warnings, and a safe-apply checklist.



\## Installation \& Setup



\### Prerequisites

\- Node.js (v18+)

\- Python (3.10+)

\- Git



\### Backend Setup

```powershell

cd backend

python -m venv venv

venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload

```

Backend runs at: `http://127.0.0.1:8000`

API docs at: `http://127.0.0.1:8000/docs`



\### Frontend Setup

```powershell

cd frontend

npm install

npm run dev

```

Frontend runs at: `http://localhost:5173`



\## API Endpoints



| Method | Endpoint    | Description                              |

|--------|-------------|-------------------------------------------|

| GET    | `/`         | Health check                              |

| POST   | `/analyze`  | Submit job text, skills, company name and receive a full Opportunity Trust Report |



\## Future Enhancements



\- Screenshot upload with OCR text extraction

\- Live company/recruiter verification via web search APIs

\- Community scam report database

\- Multilingual support (Tamil, Hindi)

\- User accounts with saved reports

\- Multiple offer comparison dashboard



\## Screenshots



\### Low Risk / Genuine-looking Opportunity

!\[Low Risk 1](docs/screenshots/low-risk-1.png)

!\[Low Risk 2](docs/screenshots/low-risk-2.png)



\### High Risk / Scam Opportunity

!\[High Risk 1](docs/screenshots/high-risk-1.png)

!\[High Risk 2](docs/screenshots/high-risk-2.png)

!\[High Risk 3](docs/screenshots/high-risk-3.png)



Built for HackSpora 2.0/Hackathon by Team PHOENIX.

