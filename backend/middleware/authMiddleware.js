import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Not authorized, no Clerk session" });
    }
    console.log("Clerk Auth UserId:", userId);

    // Find or create user in MongoDB based on Clerk ID
    let user = await User.findOne({ email: userId });

    if (!user) {
      console.log("Creating new user for Clerk ID:", userId);
      // Create a default user if not found
      user = await User.create({
        email: userId,
        role: "user"
      });
    }

    req.user = user;
    console.log("Attached User to Req:", user._id, user.role);
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Not authorized, session verification failed" });
  }
};