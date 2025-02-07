import drive from "./google_drive";

export default function isValidTemp(fileId: string) {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const file = await drive.files.get({
        fileId,
        fields: "id, createdTime",
      });
      if (!file) {
        resolve(false);
      }

      const createdTime: Date = new Date(file.data.createdTime!);
      const currentTime: Date = new Date();
      const isFileExpired =
        currentTime.getTime() - createdTime.getTime() > 6 * 60 * 60 * 1000
          ? true
          : false;

      if (isFileExpired) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
