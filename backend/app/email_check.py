import re
import dns.resolver


def is_valid_email_format(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$", email))


def domain_can_receive_mail(email: str) -> bool:
    try:
        domain = email.split("@")[1]
        answers = dns.resolver.resolve(domain, "MX", lifetime=5)
        return len(answers) > 0
    except Exception:
        return False


def verify_email(email: str):
    if not is_valid_email_format(email):
        return {"valid": False, "reason": "Email format is invalid."}
    if not domain_can_receive_mail(email):
        return {"valid": False, "reason": "This email domain does not appear to accept mail. Check for typos."}
    return {"valid": True, "reason": "Email domain verified."}