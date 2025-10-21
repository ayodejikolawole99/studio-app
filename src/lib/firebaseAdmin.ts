
import * as admin from "firebase-admin";

// This check is crucial to prevent re-initialization on hot reloads in development.
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // The private key must have newlines restored from the environment variable.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // This check is crucial for server-side debugging.
  // If these variables are missing, the app will crash with a clear error.
  if (!projectId || !clientEmail || !privateKey) {
    console.error("CRITICAL: Missing Firebase Admin environment variables. Please set them in your deployment environment.");
    // In a serverless environment, throwing an error is often the best way
    // to signal a fatal configuration problem.
    throw new Error("Missing Firebase Admin credentials in environment.");
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
