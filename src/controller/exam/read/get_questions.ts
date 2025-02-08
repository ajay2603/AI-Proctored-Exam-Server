import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function GetQuestionsController(
  req: Request,
  res: Response
): Promise<any> {
  const examId = req.params.examId;
  const userId = res.locals.jwtPayload.id;

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!(exam.authorId == userId)) {
      return res
        .status(401)
        .json({ message: "Not Authorized to access this Exam" });
    }

    const questions = await prisma.question.findMany({
      where: { examId },
      include: {
        context: true,
        options: {
          include: {
            context: true,
          },
        },
      },
    });

    return res.status(200).json({ questions: questions ? questions : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
