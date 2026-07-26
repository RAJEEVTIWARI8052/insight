import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_123456789";
const resend = new Resend(resendApiKey);
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendOtpEmail(email, otp) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Your Insight Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Insight Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 10px 20px; display: inline-block; letter-spacing: 4px;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err.message);
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to Insight!",
      html: `<p>Hi ${name}, welcome to Insight - Cybersecurity Q&A Platform!</p>`,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
  }
}
