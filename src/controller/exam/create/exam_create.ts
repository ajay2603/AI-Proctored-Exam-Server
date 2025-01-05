import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export default async function ExamCreateController(
  req: Request,
  res: Response
): Promise<any> {
  if (!req.body.title) {
    return res.status(400).json({ message: "Title is missing" });
  }

  try {
    const id = res.locals.jwtPayload.id;

    const exam = await prisma.exam.create({
      data: {
        title: req.body.title,
        author: { connect: { id } },
      },
    });

    return res.status(201).json({
      message: "Exam created successfully",
      id: exam.id,
      authorId: exam.authorId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
