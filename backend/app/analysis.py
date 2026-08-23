import re

SALARY_BASELINES = [
    {"keywords": ["intern", "internship"], "min": 8000, "max": 25000},
    {"keywords": ["software engineer", "developer", "sde"], "min": 25000, "max": 60000},
    {"keywords": ["data analyst", "data science"], "min": 20000, "max": 50000},
    {"keywords": ["designer", "ui/ux"], "min": 15000, "max": 40000},
    {"keywords": ["sales", "marketing"], "min": 10000, "max": 30000},
]

DEFAULT_BASELINE = {"min": 10000, "max": 35000}


def extract_offered_salary(job_text: str):
    """
    Extract a numeric salary/stipend mentioned in the text, if any.
    Looks for patterns like '15000', '15,000', '15k', 'Rs 15000', '₹15000'.
    """
    text = job_text.lower()
    patterns = [
        r'(?:rs\.?|inr|₹)\s?(\d[\d,]{2,7})',
        r'(\d[\d,]{2,7})\s?(?:rs|inr|₹|per month|/month|pm)',
        r'(\d{1,3})\s?k\b',
    ]
    for pat in patterns:
        match = re.search(pat, text)
        if match:
            value = match.group(1).replace(",", "")
            try:
                num = int(value)
                if pat.endswith(r'k\b'):
                    num *= 1000
                return num
            except ValueError:
                continue
    return None


def get_salary_baseline(job_text: str):
    text = job_text.lower()
    for entry in SALARY_BASELINES:
        for kw in entry["keywords"]:
            if kw in text:
                return entry
    return DEFAULT_BASELINE


def analyze_salary(job_text: str):
    offered = extract_offered_salary(job_text)
    baseline = get_salary_baseline(job_text)

    if offered is None:
        return {
            "offered_salary": None,
            "estimated_range": f"₹{baseline['min']} - ₹{baseline['max']}",
            "status": "Not Mentioned",
            "explanation": "No clear salary or stipend amount was found in the text. Ask the recruiter to confirm this in writing.",
        }

    if offered < baseline["min"] * 0.7:
        status = "Low"
        explanation = "The offered amount is noticeably below the typical range for this type of role."
    elif offered <= baseline["max"]:
        status = "Fair"
        explanation = "The offered amount falls within a typical range for this type of role."
    elif offered <= baseline["max"] * 1.5:
        status = "High"
        explanation = "The offered amount is above the typical range. This alone is not proof of a scam, but verify the company carefully."
    else:
        status = "Unusually High"
        explanation = "The offered amount is significantly above the typical range for this type of role. Combined with other risk indicators, this warrants extra caution."

    return {
        "offered_salary": offered,
        "estimated_range": f"₹{baseline['min']} - ₹{baseline['max']}",
        "status": status,
        "explanation": explanation,
    }


def analyze_skill_match(job_text: str, student_skills: str):
    """
    Very simple keyword-overlap based skill match for MVP.
    """
    if not student_skills:
        return {
            "skill_match_percent": 0,
            "matched_skills": [],
            "missing_skills": [],
            "recommendation": "Add your skills to get a match score.",
        }

    student_skill_list = [s.strip().lower() for s in re.split(r',|/', student_skills) if s.strip()]
    text_lower = job_text.lower()

    matched = [s for s in student_skill_list if s in text_lower]
    missing_candidates = []

    # common tech skill keywords to check if job mentions them but student doesn't have them
    common_skills = ["python", "java", "javascript", "react", "node", "sql", "html", "css",
                      "fastapi", "django", "flask", "git", "aws", "machine learning", "excel",
                      "communication", "figma", "c++", "typescript"]
    for skill in common_skills:
        if skill in text_lower and skill not in student_skill_list:
            missing_candidates.append(skill)

    match_percent = 0
    if student_skill_list:
        match_percent = round((len(matched) / len(student_skill_list)) * 100)
        match_percent = min(match_percent + (20 if matched else 0), 100)  # small boost if any match found

    if match_percent >= 70:
        recommendation = "Strong skill match. Worth applying after verifying the company."
    elif match_percent >= 40:
        recommendation = "Moderate skill match. Consider learning the missing skills before applying."
    else:
        recommendation = "Low skill match based on keywords found. Review the role requirements carefully."

    return {
        "skill_match_percent": match_percent,
        "matched_skills": matched,
        "missing_skills": missing_candidates[:5],
        "recommendation": recommendation,
    }


def calculate_opportunity_score(risk_score: int, salary_status: str, skill_match_percent: int):
    """
    Combines risk score (inverted), salary fairness, and skill match into one opportunity score.
    """
    safety_component = max(0, 100 - risk_score)  # lower risk = higher safety

    salary_component_map = {
        "Fair": 90, "High": 75, "Low": 50, "Unusually High": 40, "Not Mentioned": 60,
    }
    salary_component = salary_component_map.get(salary_status, 60)

    skill_component = skill_match_percent

    overall = round((safety_component * 0.4) + (salary_component * 0.3) + (skill_component * 0.3))
    return min(max(overall, 0), 100)


SAFE_APPLY_CHECKLIST = [
    "Verify the job on the official company website.",
    "Check whether the recruiter uses an official company email.",
    "Do not pay registration or processing fees.",
    "Do not share OTP, Aadhaar, PAN, bank details, or passwords.",
    "Confirm the interview process.",
    "Check the company location and contact details.",
    "Read the offer letter carefully before signing.",
    "Report suspicious opportunities to your placement cell or trusted platform.",
]