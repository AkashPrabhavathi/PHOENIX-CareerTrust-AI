from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .rules import detect_scam_signals, calculate_risk_score, get_risk_level
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

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "scam_indicators": warnings,
        "disclaimer": "This score is an indication based on common scam patterns. It is not final legal or factual proof of fraud. Always verify independently before applying or paying any money.",
        "received_skills": data.student_skills,
    }