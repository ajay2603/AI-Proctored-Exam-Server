import { Router } from "express";
import AuthAccessToken from "../../tokens/access_token";
import ExamCreateController from "../../controller/exam/create/exam_create";
import QuestionCreateController from "../../controller/exam/create/question_create";
import { GenerateExamToken } from "../../controller/auth/exam_token";

const router = Router();

router.post("/", AuthAccessToken, ExamCreateController);
router.post("/:examId/question", AuthAccessToken, QuestionCreateController);
router.post("/:examId/token", AuthAccessToken, GenerateExamToken);

export default router;
