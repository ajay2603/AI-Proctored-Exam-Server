import { Router } from "express";
const router = Router();

import { ValidateExamToken } from "../../controller/auth/exam_token";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.get(
  "/questions",
  (req, res, next) => {
    console.log("hello");
    next();
  },
  ValidateExamToken,
  async (req, res): Promise<any> => {
    const { examId, userId } = res.locals.jwtPayload;
    try {
      const questions = await prisma.question.findMany({
        where: { examId },
        select: {
          id: true,
          context: true,
          options: {
            include: {
              context: true,
            },
          },
        },
      });

      return res.status(200).json({ questions });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post("/submit", ValidateExamToken, async (req, res): Promise<any> => {
  const { examId, userId } = res.locals.jwtPayload;
  const { selectedAnswers } = req.body;

  console.log("hello hello");
  console.log(req.body);

  try {
    const userResult = await prisma.userResult.findFirst({
      where: { examId, userId },
    });

    if (userResult) {
      return res
        .status(200)
        .json({ message: "Result already submitted", score: userResult.score });
    }

    let score = 0;
    const answers = await prisma.question.findMany({
      where: { examId },
      select: { id: true, answer: true },
    });
    for (let i = 0; i < answers.length; i++) {
      const selectedAnswer = selectedAnswers[answers[i].id];
      if (!selectedAnswer) {
        continue;
      }

      if (selectedAnswer === answers[i].answer) {
        score++;
      }
    }

    const result = await prisma.userResult.create({
      data: {
        userId,
        examId,
        score,
      },
    });

    console.log(result);
    res.status(200).json({ message: "Result Submitted", score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

import ExamCreateRoutes from "./create";
router.use("/create", ExamCreateRoutes);
import ExamReadRoutes from "./read";
router.use("/", ExamReadRoutes);

export default router;
