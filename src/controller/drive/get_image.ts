import { Request, Response } from "express";
import drive from "../../utils/google_drive/google_drive";

export default async function GetImageController(
  req: Request,
  res: Response
): Promise<any> {
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
  } catch (err) {
    res.status(500).json({ message: "Error in getting image" });
  }
}
