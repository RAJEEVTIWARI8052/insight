import express from "express";
import { registerUser, loginUser, verifyOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, (req, res) => {
    res.status(200).json(req.user);
});

router.post("/toggle-role", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.role = user.role === "expert" ? "user" : "expert";
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
