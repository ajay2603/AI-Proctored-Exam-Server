import { Router } from "express";
const router = Router();
import TempUplodeController from "../../controller/drive/temp_uplode";
import GetImageController from "../../controller/drive/get_image";

import multer from "multer";
const uplode = multer();
router.post("/temp/upload", uplode.single("image"), TempUplodeController);
router.get("/image/:id", GetImageController);

export default router;
