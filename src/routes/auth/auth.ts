import { Router } from "express";
import SignInController from "../../controller/auth/signin";
import SignUpController from "../../controller/auth/signup";
import RefreshTokenController from "../../controller/auth/refresh_token";
import authRefreshToken from "../../tokens/refresh_token";
import ValidateOTPController from "../../controller/auth/validate_otp";
import { ValidateExamToken } from "../../controller/auth/exam_token";
import { GetDetails } from "../../controller/exam/exam";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/token-refresh", authRefreshToken, RefreshTokenController);
router.post("/sign-in", SignInController);
router.post("/sign-up", SignUpController);
router.post("/sign-up/verify-otp", ValidateOTPController);
router.post("/exam-token", ValidateExamToken, GetDetails);

export default router;
