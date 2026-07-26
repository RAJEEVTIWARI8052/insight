import { Router } from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications
router.get("/", authenticate, (req, res) => {
  const list = db.listNotifications(req.user.id);
  return res.json(list);
});

// GET /api/notifications/unread-count
router.get("/unread-count", authenticate, (req, res) => {
  const count = db.getUnreadNotificationCount(req.user.id);
  return res.json({ count });
});

// PUT /api/notifications/mark-read
router.put("/mark-read", authenticate, (req, res) => {
  db.markNotificationsAsRead(req.user.id);
  return res.json({ message: "Notifications marked as read" });
});

export default router;
