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
    {"company": "HCL Technologies", "skills": ["java", "sql", "python", "networking"]},
    {"company": "Tech Mahindra", "skills": ["java", "python", "sql", "networking", "communication"]},
    {"company": "IBM", "skills": ["python", "java", "cloud", "aws", "machine learning"]},
    {"company": "Capgemini", "skills": ["java", "python", "sql", "cloud", "communication"]},
    {"company": "L&T Infotech (LTIMindtree)", "skills": ["java", "python", "sql", "cloud"]},
    {"company": "Mindtree", "skills": ["java", "python", "sql", "communication"]},
    {"company": "Mphasis", "skills": ["python", "java", "sql", "cloud"]},
    {"company": "Hexaware Technologies", "skills": ["java", "sql", "python", "excel"]},
    {"company": "Oracle", "skills": ["sql", "java", "python", "cloud"]},
    {"company": "SAP Labs", "skills": ["java", "python", "sql", "communication"]},
    {"company": "Adobe", "skills": ["javascript", "css", "html", "python", "figma"]},
    {"company": "Flipkart", "skills": ["java", "python", "sql", "react", "machine learning"]},
    {"company": "Swiggy", "skills": ["java", "python", "react", "node", "sql"]},
    {"company": "Zomato", "skills": ["react", "node", "javascript", "python", "sql"]},
    {"company": "Paytm", "skills": ["java", "python", "sql", "android", "communication"]},
    {"company": "PhonePe", "skills": ["java", "python", "sql", "android"]},
    {"company": "Razorpay", "skills": ["node", "javascript", "python", "sql", "react"]},
    {"company": "CRED", "skills": ["react", "node", "typescript", "javascript"]},
    {"company": "Byju's", "skills": ["java", "python", "android", "react"]},
    {"company": "Ola", "skills": ["java", "python", "android", "sql"]},
    {"company": "Uber India", "skills": ["python", "java", "sql", "machine learning"]},
    {"company": "Meesho", "skills": ["react", "node", "python", "sql"]},
    {"company": "Myntra", "skills": ["java", "react", "python", "sql"]},
    {"company": "Nykaa", "skills": ["react", "javascript", "css", "html"]},
    {"company": "Zerodha", "skills": ["python", "javascript", "sql", "react"]},
    {"company": "Freshdesk", "skills": ["react", "node", "javascript", "css"]},
    {"company": "Postman", "skills": ["javascript", "node", "typescript", "react"]},
    {"company": "Chargebee", "skills": ["react", "node", "javascript", "sql"]},
    {"company": "Zoho Desk", "skills": ["java", "javascript", "css", "html"]},
    {"company": "Deloitte", "skills": ["excel", "sql", "communication", "python"]},
    {"company": "EY (Ernst & Young)", "skills": ["excel", "sql", "communication", "python"]},
    {"company": "PwC", "skills": ["excel", "communication", "sql", "python"]},
    {"company": "KPMG", "skills": ["excel", "communication", "sql"]},
    {"company": "Genpact", "skills": ["excel", "communication", "sql", "python"]},
    {"company": "Concentrix", "skills": ["communication", "excel", "sql"]},
    {"company": "Sutherland Global", "skills": ["communication", "excel", "sql"]},
    {"company": "Qualcomm India", "skills": ["c++", "python", "networking", "java"]},
    {"company": "Intel India", "skills": ["c++", "python", "networking"]},
    {"company": "Samsung R&D Bangalore", "skills": ["java", "android", "c++", "python"]},
    {"company": "Dell Technologies", "skills": ["python", "java", "networking", "cloud"]},
]


def suggest_companies(student_skills: str, top_n: int = 5):
    """
    Compares student skills against a curated static skill-to-company reference
    dataset and returns best-matching companies. This is NOT live job-market data —
    it is a fixed reference list updated periodically.
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