import { Router } from "express";
import AuthAccessToken from "../../tokens/access_token";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/", AuthAccessToken, async (req, res): Promise<any> => {
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

    return res
      .status(201)
      .json({
        message: "Exam created successfully",
        id: exam.id,
        authorId: exam.authorId,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
