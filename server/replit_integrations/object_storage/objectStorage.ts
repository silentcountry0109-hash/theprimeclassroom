import { Storage } from "@google-cloud/storage";

// 離開 Replit 後改用標準 Google Cloud Storage 認證:
//  - 本機開發:設定 GOOGLE_APPLICATION_CREDENTIALS 指向 service account 金鑰檔
//  - Cloud Run:直接掛載 service account,走 ADC(Application Default Credentials),無需金鑰檔
// (原本是透過 Replit sidecar http://127.0.0.1:1106 取得臨時憑證,離開平台後即失效。)
export const objectStorageClient = new Storage({
  projectId: process.env.GCS_PROJECT_ID || undefined,
  ...(process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
    : {}),
});
