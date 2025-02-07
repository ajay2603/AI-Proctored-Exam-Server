import JWT from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

export async function GenerateExamToken(
  req: Request,
  res: Response
): Promise<any> {
  const { examId } = req.params;
  const userId = res.locals.jwtPayload.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ message: "Exam Not Found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const examToken = JWT.sign(
    { userId, examId },
    process.env.JWT_EXAM_SECRET as string
  );

  return res.status(200).json({ message: "Token Created", examToken });
}

export async function ValidateExamToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const token: string = req.headers.authorization || "";

  try {
    var paylode = JWT.verify(token, process.env.JWT_EXAM_SECRET as string);
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  paylode = paylode as { userId: string; examId: string };

  const { userId, examId } = paylode;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      next("User not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
    next("Internal Server Error");
  }

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      res.status(404).json({ message: "Exam Not Found" });
      next("Exam Not Found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
    next("Internla Server Error");
  }

  res.locals.jwtPayload = paylode;
  next();
}
