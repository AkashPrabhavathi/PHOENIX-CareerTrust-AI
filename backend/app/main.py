import csv
import os
import io
from datetime import datetime

from fastapi import FastAPI, UploadFile, File
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
    extract_skills_from_text,
)
from .verification import verify_recruiter_email, verify_company_presence, check_suspicious_links
from .companies import suggest_companies, check_company_database
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
    db_check = check_company_database(data.company_name)
    link_info = check_suspicious_links(data.job_text)

    # If company is blacklisted, add extra risk points
    if db_check["status"] == "blacklisted":
        risk_score = min(risk_score + 40, 100)
        risk_level = get_risk_level(risk_score)

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
        "company_db_check": db_check,
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

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """Accept a PDF resume, extract text, detect skills."""
    try:
        contents = await file.read()
      
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception:
            return {"error": "Could not read PDF. Make sure it is a text-based PDF (not a scanned image)."}

        if not text.strip():
            return {"error": "PDF appears to be empty or image-based. Try a text-based PDF."}

        skills = extract_skills_from_text(text)
        # also return raw text snippet for debugging
        return {
            "skills": skills,
            "skills_string": ", ".join(skills),
            "text_preview": text[:300].strip(),
            "page_count": len(reader.pages),
        }
    except Exception as e:
        return {"error": f"Failed to process resume: {str(e)}"}


import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

otp_store = {}  # { email: { otp, expires } }

class OTPRequest(BaseModel):
    email: str
    name: str = ""

class OTPVerify(BaseModel):
    email: str
    otp: str

@app.post("/send-otp")
def send_otp(data: OTPRequest):
    import time
    otp = str(random.randint(100000, 999999))
    otp_store[data.email] = {"otp": otp, "expires": time.time() + 300}  # 5 min

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")

    if not smtp_user or not smtp_pass:

        return {"sent": False, "dev_otp": otp, "message": "SMTP not configured. Use this OTP for testing."}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your CareerTrust AI Login OTP"
        msg["From"] = smtp_user
        msg["To"] = data.email
        html = f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:30px;background:#f0fdf9;border-radius:12px;">
          <h2 style="color:#028090;">🛡️ CareerTrust AI</h2>
          <p>Hi {data.name or 'there'},</p>
          <p>Your one-time login code is:</p>
          <div style="font-size:36px;font-weight:bold;color:#02c39a;letter-spacing:8px;margin:20px 0;">{otp}</div>
          <p style="color:#666;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, data.email, msg.as_string())
        return {"sent": True, "message": "OTP sent to your email."}
    except Exception as e:
        return {"sent": False, "error": str(e), "message": "Could not send email. Check SMTP settings."}

@app.post("/verify-otp")
def verify_otp(data: OTPVerify):
    import time
    record = otp_store.get(data.email)
    if not record:
        return {"valid": False, "reason": "No OTP found for this email. Please request a new one."}
    if time.time() > record["expires"]:
        del otp_store[data.email]
        return {"valid": False, "reason": "OTP expired. Please request a new one."}
    if data.otp.strip() != record["otp"]:
        return {"valid": False, "reason": "Incorrect OTP. Please try again."}
    del otp_store[data.email]
    return {"valid": True, "message": "Email verified successfully!"}


import urllib.request
import json as json_lib

@app.get("/scam-news")
def get_scam_news():
    """Fetch recent job scam news from GNews API or return curated static feed."""
    api_key = os.getenv("GNEWS_API_KEY", "")
    if api_key:
        try:
            url = f"https://gnews.io/api/v4/search?q=job+scam+india&lang=en&country=in&max=6&apikey={api_key}"
            with urllib.request.urlopen(url, timeout=5) as r:
                data = json_lib.loads(r.read())
                articles = data.get("articles", [])
                return {"articles": [{"title": a["title"], "url": a["url"], "source": a["source"]["name"], "date": a["publishedAt"][:10]} for a in articles]}
        except Exception:
            pass

    return {"articles": [
        {"title": "Beware of fake WFH job offers asking for registration fees", "url": "https://www.indiatoday.in", "source": "India Today", "date": "2026-09-01"},
        {"title": "Cybercrime police warn students about LinkedIn job scams", "url": "https://timesofindia.com", "source": "Times of India", "date": "2026-08-28"},
        {"title": "How to identify fake internship offers on WhatsApp", "url": "https://economictimes.com", "source": "Economic Times", "date": "2026-08-20"},
        {"title": "Rising job fraud cases: Students lose thousands to fake HR firms", "url": "https://hindustantimes.com", "source": "Hindustan Times", "date": "2026-08-15"},
        {"title": "Fake offer letters from reputed MNCs — how scammers operate", "url": "https://moneycontrol.com", "source": "Moneycontrol", "date": "2026-08-10"},
        {"title": "Task-based job scam: Pay ₹500 to unlock ₹5000 earnings — red flag", "url": "https://ndtv.com", "source": "NDTV", "date": "2026-08-05"},
    ]}