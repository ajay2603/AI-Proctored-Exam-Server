import { Router } from "express";
import drive from "../../utils/google_drive/google_drive";

const router = Router();
router.get("/image/:id", async (req, res): Promise<any> => {
  const fileId = req.params.id;
  if (!fileId) {
    return res.status(400).json({ message: "No file ID provided" });
  }
  try {
    const file = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    file.data.pipe(res);
  } catch (err) {}
});

export default router;
