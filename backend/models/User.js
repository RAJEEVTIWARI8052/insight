import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    username: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    clerkId: { type: String, unique: true, sparse: true },
    password: { type: String, default: null },
    avatar: { type: String, default: null },
    bio: { type: String, default: null },

    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "expert"], default: "user" },
    experience: { type: Number, default: 0 },
    expertise: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
