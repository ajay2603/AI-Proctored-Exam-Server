import { Router } from "express";
import AuthAccessToken from "../../tokens/access_token";
import ExamCreateController from "../../controller/exam/create/exam_create";
import QuestionCreateController from "../../controller/exam/create/question_create";

const router = Router();

router.post("/", AuthAccessToken, ExamCreateController);
router.post("/:examId/question", AuthAccessToken, QuestionCreateController);

export default router;
