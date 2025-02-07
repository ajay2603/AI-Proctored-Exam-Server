import { Request, Response } from "express";
import uplodeTemp from "../../utils/google_drive/uplode_temp";
import drive from "../../utils/google_drive/google_drive";

export default async function TempUplodeController(
  req: Request,
  res: Response
): Promise<any> {
  if (!req.file) {
    return res.status(400).json({ message: "No file found" });
  }

  if (!req.file.mimetype.startsWith("image")) {
    return res.status(400).json({ message: "Only images are allowed" });
  }

  const rfid = req.body.fileId;
  console.log("rem file: " + req.body.fileId);
  if (rfid)
    drive.files
      .delete({ fileId: rfid })
      .then((_) => console.log("prev file removed"))
      .catch((err) => console.error(err));

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
