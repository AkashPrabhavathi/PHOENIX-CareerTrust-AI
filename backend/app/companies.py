COMPANY_SKILL_MAP = [
    {"company": "TCS", "skills": ["java", "python", "sql", "communication", "html", "css"]},
    {"company": "Infosys", "skills": ["java", "python", "sql", "cloud", "communication"]},
    {"company": "Wipro", "skills": ["python", "java", "networking", "sql", "excel"]},
    {"company": "Zoho Corporation", "skills": ["react", "javascript", "python", "css", "html", "figma"]},
    {"company": "Freshworks", "skills": ["react", "node", "javascript", "typescript", "css"]},
    {"company": "Accenture", "skills": ["sql", "excel", "communication", "python", "cloud"]},
    {"company": "Cognizant", "skills": ["java", "sql", "python", "communication"]},
    {"company": "Amazon", "skills": ["python", "aws", "java", "sql", "machine learning"]},
    {"company": "Google", "skills": ["python", "machine learning", "c++", "java", "typescript"]},
    {"company": "Microsoft", "skills": ["c++", "python", "javascript", "aws", "sql"]},
    {"company": "Zoho", "skills": ["react", "css", "javascript", "figma"]},
    {"company": "HCL Technologies", "skills": ["java", "sql", "python", "networking"]},
]


def suggest_companies(student_skills: str, top_n: int = 3):
    """
    Compares student skills against a static skill map and returns best-matching companies.
    This is a simple keyword-overlap MVP, not a live job-market API.
    """
    if not student_skills:
        return []

    student_list = [s.strip().lower() for s in student_skills.replace("/", ",").split(",") if s.strip()]
    if not student_list:
        return []

    results = []
    for entry in COMPANY_SKILL_MAP:
        overlap = set(student_list) & set(entry["skills"])
        if overlap:
            match_percent = round((len(overlap) / len(entry["skills"])) * 100)
            results.append({
                "company": entry["company"],
                "match_percent": min(match_percent + 10, 100),
                "matched_skills": list(overlap),
            })

    results.sort(key=lambda x: x["match_percent"], reverse=True)
    return results[:top_n]