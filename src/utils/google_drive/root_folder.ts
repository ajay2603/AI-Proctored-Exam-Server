import drive from "./google_drive";

async function getRootFolderId(): Promise<string> {
  try {
    // Check if the "ai_exam" folder exists at the root level
    const res = await drive.files.list({
      q: "name='ai_exam' and 'root' in parents and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)", // Fetch only necessary fields
    });

    const existingFolder = res.data.files?.[0];
    if (existingFolder) {
      // If folder exists, return its ID
      console.log(
        `Found existing root folder 'ai_exam' with ID: ${existingFolder.id}`
      );
      return existingFolder.id!;
    } else {
      // If folder doesn't exist, create it
      const folder = await drive.files.create({
        requestBody: {
          name: "ai_exam",
          mimeType: "application/vnd.google-apps.folder",
          parents: ["root"], // Place it in the root
        },
        fields: "id", // Fetch only the ID of the newly created folder
      });

      console.log(
        `Created new root folder 'ai_exam' with ID: ${folder.data.id}`
      );
      return folder.data.id!;
    }
  } catch (error) {
    console.error("Error in getting or creating root folder 'ai_exam':", error);
    throw error;
  }
}

export default getRootFolderId;
