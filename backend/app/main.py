from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .rules import detect_scam_signals, calculate_risk_score, get_risk_level
from .analysis import (
    analyze_salary,
    analyze_skill_match,
    calculate_opportunity_score,
    SAFE_APPLY_CHECKLIST,
)

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


@app.post("/analyze")
def analyze_opportunity(data: AnalyzeRequest):
    warnings = detect_scam_signals(data.job_text)
    risk_score = calculate_risk_score(warnings)
    risk_level = get_risk_level(risk_score)

    salary_info = analyze_salary(data.job_text)
    skill_info = analyze_skill_match(data.job_text, data.student_skills)

    opportunity_score = calculate_opportunity_score(
        risk_score, salary_info["status"], skill_info["skill_match_percent"]
    )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "opportunity_score": opportunity_score,
        "scam_indicators": warnings,
        "salary_analysis": salary_info,
        "skill_match": skill_info,
        "safe_apply_checklist": SAFE_APPLY_CHECKLIST,
        "disclaimer": "This score is an indication based on common scam patterns and typical ranges. It is not final legal or factual proof of fraud. Always verify independently before applying or paying any money.",
    }