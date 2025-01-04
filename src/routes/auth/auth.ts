import { Router } from "express";
import SignInController from "../../controller/auth/signin";
import SignUpController from "../../controller/auth/signup";
import RefreshTokenController from "../../controller/auth/refresh_token";
import authRefreshToken from "../../tokens/refresh_token";
import ValidateOTPController from "../../controller/auth/validate_otp";

const router = Router();

router.post("/token-refresh", authRefreshToken, RefreshTokenController);
router.post("/sign-in", SignInController);
router.post("/sign-up", SignUpController);
router.post("/sign-up/verify-otp", ValidateOTPController);

export default router;
