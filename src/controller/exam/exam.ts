import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const GetDetails = async (req: Request, res: Response): Promise<any> => {
  const { userId, examId } = res.locals.jwtPayload;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    const exam = await prisma.exam.findUnique({
      where: {
        id: examId,
      },
      select: {
        id: true,
        title: true,
      },
    });
    return res.status(200).json({ user, exam });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GetQuestions = async (
  req: Request,
  res: Response
): Promise<any> => {
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
};

export const SubmitExam = async (req: Request, res: Response): Promise<any> => {
  const { examId, userId } = res.locals.jwtPayload;
  const { selectedAnswers, isCheated } = req.body;

  let cheated = isCheated;

  if (isCheated == null || isCheated == undefined) {
    cheated = false;
  }

  try {
    const userResult = await prisma.userResult.findFirst({
      where: { examId, userId },
    });

    if (userResult) {
      return res
        .status(200)
        .json({ message: "Already attempted!", score: userResult.score });
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
        isCheated: cheated,
      },
    });

    var resMessage = cheated ? "Exam Terminated" : "Result Submitted";

    console.log(result);
    res.status(200).json({ message: resMessage, score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
