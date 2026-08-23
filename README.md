<div align="center">



\# CareerTrust AI



\### Don't just detect scams. Make smarter career decisions.



\*\*Team PHOENIX\*\* \&nbsp;|\&nbsp; HackSpora 2.0 \&nbsp;|\&nbsp; Karpagam College



<img alt="React" src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-0F6E56?style=flat-square" />

<img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI-0F6E56?style=flat-square" />

<img alt="Python" src="https://img.shields.io/badge/Python-3.10%2B-0F6E56?style=flat-square" />

<img alt="Status" src="https://img.shields.io/badge/Status-MVP-02C39A?style=flat-square" />



</div>



<br/>



\## Problem statement



Students receive job and internship offers through WhatsApp, email, LinkedIn, and other platforms every day. Most of the time, they have no easy way to know:



\- Whether the opportunity is genuine or a scam

\- Whether the company or recruiter is trustworthy

\- Whether the salary or stipend being offered is fair

\- Whether the role actually matches their skills



<br/>



\## Proposed solution



\*\*CareerTrust AI\*\* is an AI-powered career safety and decision-support platform. A student pastes a job or internship message, adds their skills, and (optionally) the company name — and receives a complete \*\*Opportunity Trust Report\*\* that combines scam detection, salary analysis, skill match, and company/recruiter verification, all in one place.



<br/>



\## Features



<table>

<tr>

<td width="50%" valign="top">



\*\*Scam detection engine\*\*

Rule-based detection of 13+ common scam patterns — registration fees, OTP requests, personal email domains, urgent payment pressure, shortened links — each backed by evidence pulled from the text.



\*\*Risk score (0–100)\*\*

Clear risk levels: Low Risk / Needs Verification / High Risk / Very High Risk.



\*\*Opportunity score (0–100)\*\*

Combines safety, salary fairness, and skill match into one overall score.



\*\*Salary analysis\*\*

Compares the offered stipend against a typical range for the role type.



</td>

<td width="50%" valign="top">



\*\*Skill match\*\*

Compares student skills against the job description and highlights what's missing.



\*\*Company verification\*\*

Guidance on verifying the company through official channels.



\*\*Recruiter verification\*\*

Flags personal-domain recruiter emails (Gmail/Yahoo/etc.) vs a company domain.



\*\*Suspicious link detection\*\*

Flags shortened/obscured links commonly used in phishing.



\*\*Safe apply checklist\*\*

A clear list of safety steps before applying or paying any money.



</td>

</tr>

</table>



<br/>



\## Responsible AI \& privacy note



> CareerTrust AI does \*\*not\*\* claim to detect scams with 100% accuracy. All scores are indicators based on common patterns — not legal or factual proof of fraud. Users are always advised to verify independently before applying, paying money, or sharing sensitive information. The system does not store submitted job text or personal data beyond the current session in this MVP.



<br/>



\## Technology stack



| Layer | Choice |

|---|---|

| Frontend | React + Vite |

| Backend | Python, FastAPI, Pydantic |

| Detection engine | Rule-based (keyword + pattern matching), built to extend with AI/ML models |



<br/>



\## System workflow



<div align="center">



`Student pastes job text + skills`  →  `Frontend calls FastAPI /analyze`  →  `Rules + scoring engine runs`  →  `Opportunity Trust Report returned`  →  `Frontend renders full report`



</div>



<br/>



\## Installation \& setup



\### Prerequisites

Node.js (v18+) \&nbsp;•\&nbsp; Python (3.10+) \&nbsp;•\&nbsp; Git



\### Backend

```powershell

cd backend

python -m venv venv

venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload

```

Runs at `http://127.0.0.1:8000` \&nbsp;•\&nbsp; Docs at `http://127.0.0.1:8000/docs`



\### Frontend

```powershell

cd frontend

npm install

npm run dev

```

Runs at `http://localhost:5173`



<br/>



\## API endpoints



| Method | Endpoint | Description |

|:---:|---|---|

| `GET` | `/` | Health check |

| `POST` | `/analyze` | Submit job text, skills, and company name → get a full Opportunity Trust Report |



<br/>



\## Future enhancements



\- Screenshot upload with OCR text extraction

\- Live company/recruiter verification via web search APIs

\- Community scam report database

\- Multilingual support (Tamil, Hindi)

\- User accounts with saved reports

\- Multiple offer comparison dashboard



<br/>



\## Screenshots



<div align="center">



\*\*Low risk / genuine-looking opportunity\*\*



<img src="docs/screenshots/low-risk-1.png" width="45%" />

<img src="docs/screenshots/low-risk-2.png" width="45%" />



\*\*High risk / scam opportunity\*\*



<img src="docs/screenshots/high-risk-1.png" width="30%" />

<img src="docs/screenshots/high-risk-2.png" width="30%" />

<img src="docs/screenshots/high-risk-3.png" width="30%" />



</div>



<br/>



<div align="center">



\---



\*\*Built for HackSpora 2.0, Karpagam College, by Team PHOENIX\*\*



Akash S (Team Lead) \&nbsp;•\&nbsp; Boobalan D \&nbsp;•\&nbsp; Bhavan V \&nbsp;•\&nbsp; Akash K \&nbsp;•\&nbsp; Devapriyan V



</div>



