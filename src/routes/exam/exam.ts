import { Router } from "express";
const router = Router();

import ExamCreateRoutes from "./create";
router.use("/create", ExamCreateRoutes);
import ExamReadRoutes from "./read";
router.use("/", ExamReadRoutes);

export default router;
