import re

# Each rule: keywords to search for, warning title, reason, risk points
SCAM_RULES = [
    {
        "id": "registration_fee",
        "keywords": ["registration fee", "reg fee", "pay to register", "registration charge"],
        "title": "Registration Fee Requested",
        "reason": "Legitimate companies do not usually charge students a fee to register for a job or internship.",
        "points": 25,
    },
    {
        "id": "processing_fee",
        "keywords": ["processing fee", "processing charge"],
        "title": "Processing Fee Requested",
        "reason": "Asking for a processing fee before hiring is a common scam tactic.",
        "points": 20,
    },
    {
        "id": "training_fee",
        "keywords": ["training fee", "pay for training", "training charge"],
        "title": "Training Fee Requested",
        "reason": "Genuine employers usually do not charge candidates for training.",
        "points": 20,
    },
    {
        "id": "security_deposit",
        "keywords": ["security deposit", "refundable deposit", "deposit amount"],
        "title": "Security Deposit Requested",
        "reason": "Requesting a refundable or non-refundable deposit before joining is a red flag.",
        "points": 25,
    },
    {
        "id": "payment_before_interview",
        "keywords": ["pay before interview", "payment to confirm interview", "pay to confirm"],
        "title": "Payment Requested Before Interview",
        "reason": "Being asked to pay before even being interviewed is highly suspicious.",
        "points": 30,
    },
    {
        "id": "guaranteed_job",
        "keywords": ["guaranteed job", "100% job guarantee", "guaranteed placement", "guaranteed selection"],
        "title": "Guaranteed Job Claim",
        "reason": "No genuine recruiter can guarantee a job without an interview or evaluation process.",
        "points": 20,
    },
    {
        "id": "immediate_selection",
        "keywords": ["immediate selection", "selected without interview", "no interview required", "instant selection"],
        "title": "Immediate Selection Without Interview",
        "reason": "Skipping the interview process entirely is unusual for legitimate hiring.",
        "points": 20,
    },
    {
        "id": "urgent_payment",
        "keywords": ["pay immediately", "urgent payment", "pay within 24 hours", "limited time offer", "act now"],
        "title": "Urgent Payment Pressure",
        "reason": "Scammers often create urgency to pressure victims into paying before they can think it through.",
        "points": 20,
    },
    {
        "id": "otp_request",
        "keywords": ["share your otp", "send otp", "otp verification", "provide otp"],
        "title": "OTP Request",
        "reason": "No legitimate employer will ever ask for an OTP. This is a major red flag.",
        "points": 35,
    },
    {
        "id": "sensitive_info_request",
        "keywords": ["aadhaar number", "pan card number", "bank account number", "share your password", "cvv", "debit card number", "credit card number"],
        "title": "Sensitive Personal Information Requested",
        "reason": "Legitimate employers do not need Aadhaar, PAN, bank details, or passwords before hiring.",
        "points": 35,
    },
    {
        "id": "personal_email",
        "keywords": ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"],
        "title": "Personal Email Domain Used by Recruiter",
        "reason": "Genuine company recruiters usually contact through an official company email domain, not a personal Gmail/Yahoo/Outlook address.",
        "points": 15,
    },
    {
        "id": "unofficial_platform_pressure",
        "keywords": ["contact us on telegram", "message on whatsapp only", "chat on telegram", "reach us only on whatsapp"],
        "title": "Pressure to Move to Unofficial Platform",
        "reason": "Being pushed to communicate only through unofficial channels like Telegram/WhatsApp instead of official email can indicate a scam.",
        "points": 15,
    },
    {
        "id": "shortened_link",
        "keywords": ["bit.ly", "tinyurl", "t.co/", "cutt.ly", "shorturl"],
        "title": "Suspicious or Shortened Link",
        "reason": "Shortened links can hide the real destination and are often used in phishing scams.",
        "points": 15,
    },
]


def detect_scam_signals(job_text: str):
    """
    Scans the job_text for scam keywords and returns matched warnings.
    Returns a list of dicts: title, reason, evidence, points
    """
    text_lower = job_text.lower()
    warnings = []

    for rule in SCAM_RULES:
        for keyword in rule["keywords"]:
            if keyword.lower() in text_lower:
                # find the actual sentence/snippet containing the keyword for evidence
                evidence = extract_evidence(job_text, keyword)
                warnings.append({
                    "id": rule["id"],
                    "title": rule["title"],
                    "reason": rule["reason"],
                    "evidence": evidence,
                    "points": rule["points"],
                })
                break  

    return warnings


def extract_evidence(text: str, keyword: str) -> str:
    """
    Returns a short snippet of text around the matched keyword.
    """
    index = text.lower().find(keyword.lower())
    if index == -1:
        return keyword
    start = max(0, index - 20)
    end = min(len(text), index + len(keyword) + 20)
    snippet = text[start:end].strip()
    return f"...{snippet}..."


def calculate_risk_score(warnings):
    """
    Adds up points from all matched warnings, capped at 100.
    """
    total = sum(w["points"] for w in warnings)
    return min(total, 100)


def get_risk_level(score: int) -> str:
    if score <= 30:
        return "Low Risk"
    elif score <= 60:
        return "Needs Verification"
    elif score <= 80:
        return "High Risk"
    else:
        return "Very High Risk"

def detect_sensitive_info(job_text: str):
    """
    Detects if the JOB TEXT itself is asking the student to share sensitive info.
    (This is different from scam rules - this specifically flags requests for
    Aadhaar, PAN, bank details, OTP, passwords, card numbers.)
    """
    sensitive_patterns = [
        {"label": "Aadhaar Number", "pattern": r'\b\d{4}\s?\d{4}\s?\d{4}\b'},
        {"label": "PAN Number", "pattern": r'\b[A-Z]{5}\d{4}[A-Z]\b'},
        {"label": "Bank Account Number", "pattern": r'\b\d{9,18}\b'},
        {"label": "OTP", "pattern": r'\botp\b'},
        {"label": "Password", "pattern": r'\bpassword\b'},
        {"label": "Card Number", "pattern": r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'},
    ]

    detected = []
    text_lower = job_text.lower()

    for item in sensitive_patterns:
        if re.search(item["pattern"], text_lower, re.IGNORECASE):
            detected.append(item["label"])

    if detected:
        return {
            "sensitive_data_requested": True,
            "types_detected": detected,
            "warning": "This message appears to request sensitive personal information. Never share Aadhaar, PAN, bank details, OTP, passwords, or card numbers with an unverified recruiter.",
        }

    return {
        "sensitive_data_requested": False,
        "types_detected": [],
        "warning": "No direct request for sensitive personal information was detected in this text. Still remain cautious.",
    }