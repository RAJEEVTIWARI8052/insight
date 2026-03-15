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
        
        if (user.role === "user") {
            const experience = Number(req.body.experience) || 0;
            const expertise = Array.isArray(req.body.expertise) ? req.body.expertise : [];
            
            if (experience < 4) {
                return res.status(400).json({ message: "You need at least 4 years of experience to become an expert." });
            }
            if (expertise.length === 0) {
                 return res.status(400).json({ message: "You must provide at least one area of expertise." });
            }
            user.role = "expert";
            user.experience = experience;
            user.expertise = expertise;
        } else {
            user.role = "user";
        }
        
        await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/experts", protect, async (req, res) => {
    try {
        const experts = await User.find({ role: "expert" }).select("_id name avatar username email bio experience expertise createdAt");
        res.status(200).json(experts);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
