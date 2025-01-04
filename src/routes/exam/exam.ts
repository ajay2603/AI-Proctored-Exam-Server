import { Router } from "express";
const router = Router();

import ExamCreateRoutes from "./create";
router.use("/create", ExamCreateRoutes);

export default router;
