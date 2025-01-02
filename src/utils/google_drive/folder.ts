import drive from "./google_drive";
import getRootFolderId from "./root_folder";

async function getOrCreateFolderId(
  folderName: string,
  parentFolderId: string
): Promise<string> {
  try {
    // Check if the folder exists in the parent folder
    const res = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)", // Fetch only necessary fields
    });

    const existingFolder = res.data.files?.[0];
    if (existingFolder) {
      // If folder exists, return its ID
      console.log(
        `Found existing folder '${folderName}' with ID: ${existingFolder.id}`
      );
      return existingFolder.id!;
    } else {
      // If folder doesn't exist, create it
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId],
        },
        fields: "id", // Fetch only the ID of the newly created folder
      });

      console.log(
        `Created new folder '${folderName}' with ID: ${folder.data.id}`
      );
      return folder.data.id!;
    }
  } catch (error) {
    console.error(
      `Error in getting or creating folder '${folderName}':`,
      error
    );
    throw error;
  }
}

export default getOrCreateFolderId;
