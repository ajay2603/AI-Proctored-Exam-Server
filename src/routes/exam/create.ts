import { Router } from "express";
import AuthAccessToken from "../../tokens/access_token";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();
const router = Router();

router.post("/", AuthAccessToken, async (req, res): Promise<any> => {
  console.log(req.body);
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
});

const checkValidQuestion = (question: any): boolean => {
  if (!question) {
    return false;
  }

  if (!question.question || !question.option || !question.answer) {
    return false;
  }

  if (
    !Array.isArray(question.question) ||
    !Array.isArray(question.option) ||
    !Number.isInteger(question.answer)
  ) {
    return false;
  }

  if (question.question.length === 0 || question.option.length === 0) {
    return false;
  }

  if (question.answer < 0 || question.answer >= question.option.length) {
    return false;
  }

  question.question.forEach((q: any) => {
    if (!q.type || !q.content) {
      return false;
    }

    if (q.type !== "image" && q.type !== "text") {
      return false;
    }
  });

  question.option.forEach((opt: any) => {
    opt.forEach((o: any) => {
      if (!o.type || !o.content) {
        return false;
      }

      if (o.type !== "image" && o.type !== "text") {
        return false;
      }
    });
  });

  return true;
};

router.post(
  "/:examId/question",
  AuthAccessToken,
  async (req, res): Promise<any> => {
    if (!checkValidQuestion(req.body)) {
      return res.status(400).json({ message: "Invalid question structure" });
    }

    const examId = req.params.examId;
    const userId = res.locals.jwtPayload.id;

    // Fetch the exam to ensure the exam exists and the user is authorized
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.authorId !== userId) {
      return res.status(403).json({ message: "Unauthorized to this exam" });
    }

    try {
      // Step 1: Create the Question Record
      const question = await prisma.question.create({
        data: {
          examId: exam.id,
          answer: null,
        },
      });

      // Step 2: Create the QuestionContext (for question content like text/image)
      const questionContexts = req.body.question.map((context: any) => {
        return {
          type: context.type,
          text: context.type === "text" ? context.content : null,
          url: context.type === "image" ? context.content : null,
        };
      });

      // Insert all the contexts for the question
      await prisma.questionContext.createMany({
        data: questionContexts.map((context: any) => ({
          ...context,
          questionId: question.id,
        })),
      });
      // Step 3: Create the Option records (each option with its own contexts)
      const options = req.body.option.map(async (option: any, index: any) => {
        const optionId = uuid();
        if (index === req.body.answer) {
          await prisma.question.update({
            where: { id: question.id },
            data: { answer: optionId },
          });
        }
        return prisma.option.create({
          data: {
            id: optionId,
            questionId: question.id,
            context: {
              create: option.map((opt: any) => ({
                type: opt.type,
                text: opt.type === "text" ? opt.content : null,
                url: opt.type === "image" ? opt.content : null,
              })),
            },
          },
        });
      });

      // Step 4: Await all options creation
      await Promise.all(options);

      res.status(200).json({ message: "Question created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create question" });
    }
  }
);

export default router;

/*
  const questionImages = req.body.question
      .filter((q: { type: string; content: string }) => q.type === "image")
      .map((q: { content: string }) => q.content);

    const optionImages = req.body.option
      .flatMap((opt: Array<{ type: string; content: string }>) =>
        opt.filter((o: { type: string }) => o.type === "image")
      )
      .map((o: { content: string }) => o.content);

    const images = [...questionImages, ...optionImages];
    console.log("Images:");
    console.log(images);
*/
