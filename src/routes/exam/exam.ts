import { SubmitExam, GetQuestions } from "../../controller/exam/exam";
import { ValidateExamToken } from "../../controller/auth/exam_token";
import { Router } from "express";
const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.post("/questions", ValidateExamToken, GetQuestions);
router.post("/submit", ValidateExamToken, SubmitExam);

import ExamCreateRoutes from "./create";
router.use("/create", ExamCreateRoutes);
import ExamReadRoutes from "./read";
router.use("/", ExamReadRoutes);

export default router;
