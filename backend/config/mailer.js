import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  return await resend.emails.send({
    from: `CodeVirus <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2><p>Expires in 5 minutes.</p>`,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return await resend.emails.send({
    from: `CodeVirus <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Welcome to CodeVirus 🎉",
    html: `<h2>Welcome ${name || "User"} 👋</h2>`,
  });
};
