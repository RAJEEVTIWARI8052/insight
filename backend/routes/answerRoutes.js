import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ msg: "Answers route working" });
});

export default router;
