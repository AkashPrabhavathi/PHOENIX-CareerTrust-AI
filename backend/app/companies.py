SCAM_COMPANIES = [
    {"name": "Data Entry Hub", "reason": "Known fake data entry job scam, charges registration fee"},
    {"name": "Work From Home Solutions", "reason": "Generic WFH scam company, no real office"},
    {"name": "Easy Jobs India", "reason": "Reported for fake job offers and fee collection"},
    {"name": "Shine Bright HR", "reason": "Fake HR firm, collects training fees then disappears"},
    {"name": "Global Recruitment Services", "reason": "Impersonates MNC recruiters, charges security deposit"},
    {"name": "Smart Career Solutions", "reason": "Multiple fraud reports, fake offer letters"},
    {"name": "Online Earning Hub", "reason": "MLM/pyramid scheme disguised as job"},
    {"name": "Digital Marketing Pro", "reason": "Charges course fees upfront, no real job"},
    {"name": "Home Based Jobs India", "reason": "Task-based scam, withholds payments"},
    {"name": "National Recruitment Agency", "reason": "Impersonates govt body, collects fees"},
    {"name": "Apex Consultancy", "reason": "Multiple fraud FIRs filed across India"},
    {"name": "Future Jobs Hub", "reason": "Fake placement agency, collects registration fee"},
    {"name": "Career Point India", "reason": "Reported for fake internship certificates"},
    {"name": "HR Solutions India", "reason": "Generic name used by multiple scammers"},
    {"name": "TechSoft Solutions", "reason": "Fake tech company, collects training deposit"},
]

LEGIT_COMPANIES = [
    "tcs", "tata consultancy", "infosys", "wipro", "hcl", "tech mahindra",
    "accenture", "cognizant", "capgemini", "ibm", "oracle", "sap",
    "amazon", "google", "microsoft", "meta", "apple", "adobe",
    "flipkart", "swiggy", "zomato", "paytm", "phonepe", "razorpay",
    "zoho", "freshworks", "postman", "chargebee", "browserstack",
    "ola", "uber", "meesho", "myntra", "nykaa", "zerodha", "cred",
    "deloitte", "ey", "ernst", "pwc", "kpmg", "genpact",
    "qualcomm", "intel", "samsung", "dell", "hp", "cisco",
    "byju", "unacademy", "vedantu", "upgrad",
    "l&t", "ltimindtree", "mphasis", "hexaware",
    "mindtree", "concentrix", "sutherland",
]

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
    {"company": "Postman", "skills": ["javascript", "node", "typescript", "react"]},
    {"company": "Deloitte", "skills": ["excel", "sql", "communication", "python"]},
    {"company": "EY (Ernst & Young)", "skills": ["excel", "sql", "communication", "python"]},
    {"company": "PwC", "skills": ["excel", "communication", "sql", "python"]},
    {"company": "KPMG", "skills": ["excel", "communication", "sql"]},
    {"company": "Qualcomm India", "skills": ["c++", "python", "networking", "java"]},
    {"company": "Intel India", "skills": ["c++", "python", "networking"]},
    {"company": "Samsung R&D Bangalore", "skills": ["java", "android", "c++", "python"]},
    {"company": "Dell Technologies", "skills": ["python", "java", "networking", "cloud"]},
]


def check_company_database(company_name: str) -> dict:
    """Check if company is in scam blacklist or legit whitelist."""
    if not company_name:
        return {"status": "unknown", "message": "No company name provided.", "badge": "❓"}

    name_lower = company_name.lower().strip()

  
    for scam in SCAM_COMPANIES:
        if scam["name"].lower() in name_lower or name_lower in scam["name"].lower():
            return {
                "status": "blacklisted",
                "badge": "🚨 KNOWN SCAM",
                "message": f"WARNING: This company is on our scam blacklist. Reason: {scam['reason']}",
                "color": "#c62828",
            }

    for legit in LEGIT_COMPANIES:
        if legit in name_lower or name_lower in legit:
            return {
                "status": "verified",
                "badge": "✅ VERIFIED COMPANY",
                "message": "This company is a known, established organization in India.",
                "color": "#2e7d32",
            }

    return {
        "status": "unknown",
        "badge": "🔍 NOT IN DATABASE",
        "message": "This company is not in our database. Verify independently on LinkedIn, MCA website, or Glassdoor.",
        "color": "#f9a825",
    }


def suggest_companies(student_skills: str, top_n: int = 5):
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