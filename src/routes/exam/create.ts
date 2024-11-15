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
    const user = await prisma.user.findUnique({
      where: { id: res.locals.jwtPayload.id },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await prisma.exam.create({
      data: {
        title: req.body.title,
        author: { connect: { id: user.id } },
      },
    });

    return res.status(201).json({ message: "Exam created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
