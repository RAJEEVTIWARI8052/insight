import resend
from app.config import get_settings

settings = get_settings()
resend.api_key = settings.RESEND_API_KEY


async def send_otp_email(email: str, otp: str) -> dict:
    """Send OTP verification email using Resend."""
    try:
        return resend.Emails.send(
            {
                "from": f"CodeVirus <{settings.EMAIL_FROM}>",
                "to": email,
                "subject": "Your OTP Code",
                "html": f"<h2>Your OTP is: {otp}</h2><p>Expires in 5 minutes.</p>",
            }
        )
    except Exception as e:
        print(f"Email sending error: {e}")
        raise


async def send_welcome_email(email: str, name: str = "User") -> dict:
    """Send welcome email using Resend."""
    try:
        return resend.Emails.send(
            {
                "from": f"CodeVirus <{settings.EMAIL_FROM}>",
                "to": email,
                "subject": "Welcome to CodeVirus 🎉",
                "html": f"<h2>Welcome {name} 👋</h2>",
            }
        )
    except Exception as e:
        print(f"Email sending error: {e}")
        raise
