
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY) {
    // This will cause the server to crash on startup if variables are missing,
    // which is good for debugging.
    throw new Error("Missing Firebase Admin environment variables. Check your .env or hosting configuration.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key must have newlines restored.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
