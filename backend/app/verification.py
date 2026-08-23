import re


def verify_recruiter_email(job_text: str, company_name: str = ""):
    """
    Checks whether a recruiter email in the text looks official or personal.
    """
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', job_text)

    if not email_match:
        return {
            "email_found": None,
            "domain_type": "Not Found",
            "verified": False,
            "note": "No recruiter email found in the message. Ask for an official company email before proceeding.",
        }

    email = email_match.group(0)
    domain = email.split('@')[-1].lower()
    personal_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com"]

    if domain in personal_domains:
        return {
            "email_found": email,
            "domain_type": "Personal Email",
            "verified": False,
            "note": f"The recruiter is using a personal email domain ({domain}). Genuine company recruiters usually use an official company email.",
        }

    company_clean = re.sub(r'[^a-z0-9]', '', company_name.lower()) if company_name else ""
    domain_clean = re.sub(r'[^a-z0-9]', '', domain.split('.')[0])

    if company_clean and company_clean in domain_clean:
        return {
            "email_found": email,
            "domain_type": "Company Domain (Matches Name)",
            "verified": True,
            "note": "The recruiter's email domain appears to match the company name. Still confirm through official channels.",
        }

    return {
        "email_found": email,
        "domain_type": "Company Domain (Unverified Match)",
        "verified": None,
        "note": "The recruiter is using a company-style domain, but it could not be automatically matched to the company name. Verify manually.",
    }


def verify_company_presence(company_name: str):
    """
    MVP placeholder: without a live web-search API call, we give guidance
    rather than a false 'verified' status.
    """
    if not company_name or not company_name.strip():
        return {
            "company_name": None,
            "status": "Not Provided",
            "note": "No company name was provided. Add the company name for a more complete check.",
        }

    return {
        "company_name": company_name.strip(),
        "status": "Needs Manual Verification",
        "note": f"Search for '{company_name.strip()} careers' and '{company_name.strip()} reviews' on Google, and check LinkedIn for official employee profiles before proceeding.",
    }


def check_suspicious_links(job_text: str):
    shortened_domains = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "shorturl.at", "is.gd"]
    found_links = re.findall(r'https?://[^\s]+', job_text)

    suspicious = [link for link in found_links if any(d in link for d in shortened_domains)]

    return {
        "links_found": found_links,
        "suspicious_links": suspicious,
        "note": "Shortened links can hide the real destination. Avoid clicking them; ask for the full official URL instead." if suspicious else "No obviously shortened/suspicious links detected.",
    }