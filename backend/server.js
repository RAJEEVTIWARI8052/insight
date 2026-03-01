import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
const app = express();



app.use(
  cors({
    origin: "https://codevirus-insights.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.options("*", cors());
app.use(express.json());


mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);



app.get("/", (req, res) => {
    res.send("Backend running ");
});


app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
