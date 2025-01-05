import getOrCreateFolderId from "./folder";
import drive from "./google_drive";
import getRootFolderId from "./root_folder";

export default async function uplodeUser(
  fileId: string,
  userId: string,
  tempId: string | null = null
) {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      if (!tempId) {
        const rootFolderId = await getRootFolderId();
        tempId = await getOrCreateFolderId("tempory", rootFolderId);
      }
      // Get the file's parent(s)
      const file = await drive.files.get({
        fileId: fileId,
        fields: "id, parents",
      });

      const parents = file.data.parents || [];

      if (parents.includes(tempId)) {
        // Move the file from tempId to userId
        await drive.files.update({
          fileId: fileId,
          addParents: userId,
          removeParents: tempId,
        });
        console.log(`File ${fileId} moved from tempId to userId.`);
      } else if (parents.includes(userId)) {
        // File is already in userId, do nothing
        console.log(`File ${fileId} is already in userId.`);
      } else {
        // Copy the file to userId
        await drive.files.copy({
          fileId: fileId,
          requestBody: {
            parents: [userId],
          },
        });
        console.log(`File ${fileId} copied to userId.`);
      }
      resolve(fileId);
    } catch (error) {
      console.error("Error handling file:", error);
      reject(error);
    }
  });
}
