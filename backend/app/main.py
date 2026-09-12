import csv
import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

from .rules import detect_scam_signals, calculate_risk_score, get_risk_level, detect_sensitive_info
from .analysis import (
    analyze_salary,
    analyze_skill_match,
    calculate_opportunity_score,
    SAFE_APPLY_CHECKLIST,
)
from .verification import verify_recruiter_email, verify_company_presence, check_suspicious_links
from .companies import suggest_companies
from .email_check import verify_email

load_dotenv()

app = FastAPI(title="CareerTrust AI - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "CareerTrust AI backend is running"}


class AnalyzeRequest(BaseModel):
    job_text: str
    student_skills: str
    company_name: str = ""


@app.post("/analyze")
def analyze_opportunity(data: AnalyzeRequest):
    warnings = detect_scam_signals(data.job_text)
    risk_score = calculate_risk_score(warnings)
    risk_level = get_risk_level(risk_score)
    sensitive_info = detect_sensitive_info(data.job_text)

    salary_info = analyze_salary(data.job_text)
    skill_info = analyze_skill_match(data.job_text, data.student_skills)
    suggested_companies = suggest_companies(data.student_skills)

    recruiter_info = verify_recruiter_email(data.job_text, data.company_name)
    company_info = verify_company_presence(data.company_name)
    link_info = check_suspicious_links(data.job_text)

    opportunity_score = calculate_opportunity_score(
        risk_score, salary_info["status"], skill_info["skill_match_percent"]
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "opportunity_score": opportunity_score,
        "scam_indicators": warnings,
        "sensitive_data_check": sensitive_info,
        "salary_analysis": salary_info,
        "skill_match": skill_info,
        "suggested_companies": suggested_companies,
        "recruiter_verification": recruiter_info,
        "company_verification": company_info,
        "link_check": link_info,
        "safe_apply_checklist": SAFE_APPLY_CHECKLIST,
        "disclaimer": "This score is an indication based on common scam patterns and typical ranges. It is not final legal or factual proof of fraud. Always verify independently before applying or paying any money.",
    }


class SignupRequest(BaseModel):
    name: str
    email: str
    phone: str = ""


SIGNUP_FILE = os.path.join(os.path.dirname(__file__), "signups.csv")


@app.post("/signup")
def signup(data: SignupRequest):
    file_exists = os.path.isfile(SIGNUP_FILE)
    with open(SIGNUP_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["timestamp", "name", "email", "phone"])

class EmailCheckRequest(BaseModel):
    email: str


@app.post("/verify-email")
def check_email(data: EmailCheckRequest):
    return verify_email(data.email)

openai_client = None
_api_key = os.getenv("OPENAI_API_KEY")
if _api_key:
    openai_client = OpenAI(api_key=_api_key)

SYSTEM_PROMPT = (
    "You are the CareerTrust AI assistant, embedded in a website that helps students "
    "detect scam job/internship offers and evaluate career opportunities. "
    "Answer questions about scam warning signs, risk scores, OTP/payment red flags, "
    "salary checks, skill matching, and general career/job-search safety advice. "
    "Keep answers concise (2-5 sentences), friendly, and practical. "
    "If asked something totally unrelated, answer briefly and steer back to career safety topics."
)


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []  


@app.post("/chat")
def chat(data: ChatRequest):
    if not openai_client:
        return {
            "reply": "AI chat isn't configured yet. Add OPENAI_API_KEY to the backend .env file to enable it.",
            "error": "missing_api_key",
        }

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in data.history[-10:]:
        role = "assistant" if m.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": m.get("content", "")})
    messages.append({"role": "user", "content": data.message})

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=300,
            temperature=0.6,
        )
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        return {"reply": "Sorry, I couldn't reach the AI service right now. Please try again in a moment.", "error": str(e)}