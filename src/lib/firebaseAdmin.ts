
import * as admin from "firebase-admin";

// This check is crucial to prevent re-initialization on hot reloads in development.
if (!admin.apps.length) {
  // Check for environment variables and throw an error if they are missing.
  // This is crucial for server-side debugging.
  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY) {
    // In a serverless environment, you might not want to throw, but log.
    // However, for this app's setup, if these are missing, nothing will work.
    console.error("CRITICAL: Missing Firebase Admin environment variables.");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have newlines restored from the environment variable.
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, "\n"),
      }),
    });
  } catch (e: any) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", e);
  }
}

// Export the initialized db and auth instances for use in server-side API routes.
export const db = admin.firestore();
export const auth = admin.auth();
