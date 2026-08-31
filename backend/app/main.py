import csv
import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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