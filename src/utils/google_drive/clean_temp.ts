import getOrCreateFolderId from "./folder";
import drive from "./google_drive";
import getRootFolderId from "./root_folder";

export async function cleanFolder(folderId: any): Promise<void> {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "file(id, createdTime)",
    });
    const fileList = response.data.files;

    if (!fileList) {
      return;
    }

    fileList.forEach((file) => {
      if (!file.id || !file.createdTime) {
        return;
      }
      const createdTime = new Date(file.createdTime!);
      const currentTime = new Date();

      if (currentTime.getTime() - createdTime.getTime() > 7 * 60 * 60 * 1000) {
        drive.files
          .delete({ fileId: file.id })
          .then(() => console.log(`File ${file.id} is Deleted From Temp`));
      }
    });
  } catch (error) {
    console.log(error);
  }
}

export default function clearTempDrive() {
  setInterval(async () => {
    try {
      const rootFolderId = await getRootFolderId();
      const tempFolderId = await getOrCreateFolderId("tempory", rootFolderId);
      cleanFolder(tempFolderId);
    } catch (err) {
      console.error(err);
    }
  }, 2 * 60 * 60 * 1000);
}
