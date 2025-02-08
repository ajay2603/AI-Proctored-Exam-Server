import { Router } from "express";
import authAccessToken from "../../tokens/access_token";
import GetQuestionsController from "../../controller/exam/read/get_questions";

const router = Router();

router.get("/questions/:examId", authAccessToken, GetQuestionsController);

export default router;
