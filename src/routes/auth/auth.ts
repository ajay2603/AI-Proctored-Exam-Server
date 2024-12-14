import { Router } from "express";
import signInRoutes from "./signin";
import signUpRoutes from "./signup";
import refreshToken from "./refresh_token"

const router = Router();

router.use("/token-refresh", refreshToken);
router.use("/sign-in", signInRoutes);
router.use("/sign-up", signUpRoutes);

export default router;
