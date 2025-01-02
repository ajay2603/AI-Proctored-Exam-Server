import { google } from "googleapis";
import path from "path";

// Use absolute path to the credentials JSON file
const credentialsPath = path.resolve(
  __dirname,
  "../../../ai-exam-445907-e7cc7cdc3660.json"
);

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

// Function to initiate Drive and get user info
export async function initiateDrive() {
  try {
    // Fetch about info of the authenticated user
    const driveStatus = await drive.about.get({
      fields: "user,storageQuota", // Request specific fields
    });
    return driveStatus.data; // Return the data fetched from Google Drive API
  } catch (err) {
    console.error("Error initiating Google Drive:", err);
    throw err; // Propagate the error
  }
}

export default drive;
