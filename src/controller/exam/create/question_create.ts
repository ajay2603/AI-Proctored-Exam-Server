import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import isValidTemp from "../../../routes/drive/valid_temp";
import getRootFolderId from "../../../utils/google_drive/root_folder";
import getOrCreateFolderId from "../../../utils/google_drive/folder";
import uplodeUser from "../../../utils/google_drive/uplode_user";
const prisma = new PrismaClient();

export default async function QuestionCreateController(
  req: Request,
  res: Response
): Promise<any> {
  console.log(req.body);
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

  const questionImages = req.body.question
    .filter((q: { type: string; content: string }) => q.type === "image")
    .map((q: { content: string }) => q.content);

  const optionImages = req.body.option
    .flatMap((opt: Array<{ type: string; content: string }>) =>
      opt.filter((o: { type: string }) => o.type === "image")
    )
    .map((o: { content: string }) => o.content);

  const images = [...questionImages, ...optionImages];
  console.log(images);

  try {
    const validateImages = images.map((image) => {
      return isValidTemp(image);
    });

    const validatedImages = await Promise.all(validateImages);

    if (validatedImages.indexOf(false) !== -1) {
      return res.status(410).json({
        message: "Expired or InValid Image found. Check again",
      });
    }

    const rootFolderId = await getRootFolderId();
    const tempFolderId = await getOrCreateFolderId("tempory", rootFolderId);
    const userFolderId = await getOrCreateFolderId(userId, rootFolderId);

    images.map((imageId) => uplodeUser(imageId, userFolderId, tempFolderId));

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

export function checkValidQuestion(question: any): boolean {
  if (!question) {
    return false;
  }

  if (
    !question.question ||
    !question.option ||
    typeof question.answer !== "number"
  ) {
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

  // Validate question array
  for (const q of question.question) {
    if (
      !q.type ||
      q.content === undefined ||
      (q.type !== "image" && q.type !== "text")
    ) {
      return false;
    }
  }

  // Validate options array
  for (const opt of question.option) {
    if (!Array.isArray(opt)) {
      return false;
    }
    for (const o of opt) {
      if (
        !o.type ||
        o.content === undefined ||
        (o.type !== "image" && o.type !== "text")
      ) {
        return false;
      }
    }
  }

  return true;
}
