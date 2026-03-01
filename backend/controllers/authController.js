import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendOtpEmail, sendWelcomeEmail } from "../config/mailer.js";


/* SEND OTP */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email, otp, otpExpiry, isVerified: false });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    await sendOtpEmail(email, otp);

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("OTP sending error:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

/* VERIFY OTP */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* REGISTER AFTER OTP */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" }); // Optional: change message
    }

    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = name;
    user.password = hashedPassword;
    await user.save();


    await sendWelcomeEmail(email, name);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Registration successful! Welcome to CodeVirus.",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* LOGIN */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ message: "User not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email } // Send only necessary user data
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};