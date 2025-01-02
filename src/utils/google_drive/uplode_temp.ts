import { Readable } from "stream"; // Import Readable stream
import drive from "./google_drive";
import getOrCreateFolderId from "./folder";
import getRootFolderId from "./root_folder";
import { v4 as uuid } from "uuid";

export default async function uplodeTemp(
  file: Express.Multer.File
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const rootFolderId = await getRootFolderId();
      const folderId = await getOrCreateFolderId("tempory", rootFolderId);

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const newFile = await drive.files.create({
        requestBody: {
          name: uuid(),
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
      });

      console.log("File uploaded successfully.");

      // Ensure the file ID is a valid string (non-null)
      const fileId = newFile.data.id;
      if (!fileId) {
        throw new Error("File upload failed: no file ID returned.");
      }

      // Set permissions to allow anyone to read the file
      await drive.permissions.create({
        fileId: fileId, // Ensure fileId is a valid string
        requestBody: {
          role: "reader", // Grant read access
          type: "anyone", // Make the file accessible to anyone with the link
        },
      });

      resolve(newFile);
    } catch (err) {
      console.error("Error uploading file:", err);
      reject(err);
    }
  });
}
