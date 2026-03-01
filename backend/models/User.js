import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },

    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
