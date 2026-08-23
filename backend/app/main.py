from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    return {
        "received_job_text": data.job_text,
        "received_skills": data.student_skills,
        "message": "Analysis logic will be added in the next milestone."
    }