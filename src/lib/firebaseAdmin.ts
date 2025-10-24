
import * as admin from "firebase-admin";

// This check is crucial to prevent re-initialization on hot reloads in development.
if (!admin.apps.length) {
  const projectId = process.env.ADMIN_PROJECT_ID;
  const clientEmail = process.env.ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  console.log("ENV CHECK", {
    projectId: process.env.ADMIN_PROJECT_ID,
    clientEmail: process.env.ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.ADMIN_PRIVATE_KEY,
  });

  // This check is crucial for server-side debugging.
  // If these variables are missing, the app will crash with a clear error.
  if (!projectId || !clientEmail || !privateKey) {
    console.error("CRITICAL: Missing Firebase Admin environment variables. Please set them in your deployment environment using Firebase secrets.");
    // In a serverless environment, throwing an error is often the best way
    // to signal a fatal configuration problem.
    throw new Error("Missing Firebase Admin credentials in environment. Run `firebase functions:secrets:set` for ADMIN_PROJECT_ID, ADMIN_CLIENT_EMAIL, and ADMIN_PRIVATE_KEY.");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", e);
    // Re-throw the error to ensure the process fails loudly if initialization is unsuccessful.
    throw new Error(`Firebase Admin SDK initialization failed: ${e.message}`);
  }
}

// Export the initialized db and auth instances for use in server-side API routes.
export const db = admin.firestore();
export const auth = admin.auth();
