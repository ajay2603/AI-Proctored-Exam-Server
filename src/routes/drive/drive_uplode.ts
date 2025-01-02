import exp from "constants";
import { Router } from "express";
const router = Router();
import multer from "multer";
const uplode = multer();
import uplodeTemp from "../../utils/google_drive/uplode_temp";

router.post(
  "/temp/upload",
  uplode.single("image"),
  async (req, res): Promise<any> => {
    if (!req.file) {
      return res.status(400).json({ message: "No file found" });
    }

    if (!req.file.mimetype.startsWith("image")) {
      return res.status(400).json({ message: "Only images are allowed" });
    }

    try {
      const newfile = await uplodeTemp(req.file);
      return res
        .status(200)
        .json({ message: "File uploaded", id: newfile.data.id });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error in uplode" });
    }
  }
);

export default router;
