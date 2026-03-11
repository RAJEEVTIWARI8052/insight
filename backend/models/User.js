import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },

    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "expert"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
