import express from "express";
import { registerUser, loginUser, verifyOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import prisma from "../prisma.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, (req, res) => {
    res.status(200).json(req.user);
});

router.post("/toggle-role", protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "user") {
            const experience = Number(req.body.experience) || 0;
            const expertise = Array.isArray(req.body.expertise) ? req.body.expertise : [];

            if (experience < 4) {
                return res.status(400).json({ message: "You need at least 4 years of experience to become an expert." });
            }
            if (expertise.length === 0) {
                return res.status(400).json({ message: "You must provide at least one area of expertise." });
            }

            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { role: "expert", experience, expertise: JSON.stringify(expertise) }
            });
            return res.status(200).json({ ...updated, expertise: JSON.parse(updated.expertise || "[]") });
        } else {
            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { role: "user" }
            });
            return res.status(200).json(updated);
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/experts", protect, async (req, res) => {
    try {
        const experts = await prisma.user.findMany({
            where: { role: "expert" },
            select: { id: true, name: true, avatar: true, username: true, email: true, bio: true, experience: true, expertise: true, createdAt: true }
        });
        const normalized = experts.map(e => ({
            ...e,
            _id: e.id,
            expertise: (() => { 
                try { 
                    return JSON.parse(e.expertise || "[]"); 
                } catch (err) { 
                    return []; 
                } 
            })()
        }));
        res.status(200).json(normalized);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

export default router;
