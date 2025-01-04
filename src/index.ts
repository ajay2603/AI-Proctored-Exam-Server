import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import cookirParser from "cookie-parser";
import "./tokens/clean_expired_tokens";
const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookirParser());
app.use(express.static("public"));
app.use(express.raw({ type: "image/*", limit: "5mb" }));
app.use(
  cors({
    origin: process.env.CORS_SITES?.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

import authRoutes from "./routes/auth/auth";
app.use("/auth", authRoutes);
import examRoutes from "./routes/exam/exam";
app.use("/exam", examRoutes);
import googleDriveRoutes from "./routes/drive/google_drive";
app.use("/drive", googleDriveRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    title: "AI Proctored Exam",
    college: "SRKR Engineering College",
    branch: "Artificial Intelligence and Data Science",
    mentor: "Dr. Kishore Raju",
    lead: "Narendra",
    developers: ["Narendra", "Sujith", "Atchuta Rama Raju Jampana", "Chandu"],
    team: 7,
    description: "This project is a part of our final year project.",
  });
});

import { startRedisServer } from "./utils/redis";
startRedisServer();

import { initiateDrive } from "./utils/google_drive/google_drive";
initiateDrive()
  .then((driveStatus) => {
    console.log("Google Drive is ready to use");
  })
  .catch((err) => {
    console.log("Error in Google Drive: ", err);
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
