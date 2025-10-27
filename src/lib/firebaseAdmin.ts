
import * as admin from "firebase-admin";

// This check is crucial to prevent re-initialization on hot reloads in development.
if (!admin.apps.length) {
  try {
    console.log("Firebase Admin SDK: Initializing...");

    // Use non-reserved names for environment variables, which are set as secrets.
    const projectId = process.env.ADMIN_PROJECT_ID;
    const clientEmail = process.env.ADMIN_CLIENT_EMAIL;
    // The private key secret is stored as a single string; replace escaped newlines.
    const privateKey = process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    // This check is crucial for server-side debugging.
    // If these variables are missing, the app will crash with a clear error.
    if (!projectId || !clientEmail || !privateKey) {
      console.error("CRITICAL: Missing Firebase Admin environment variables. These must be set as secrets in your Firebase project.");
      throw new Error("Missing Firebase Admin credentials in environment. Ensure ADMIN_PROJECT_ID, ADMIN_CLIENT_EMAIL, and ADMIN_PRIVATE_KEY secrets are set.");
    }
    
    // Log that credentials were found (but do not log the credentials themselves).
    console.log("Firebase Admin SDK: Credentials found in environment.");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("Firebase Admin SDK: Initialization successful.");

  } catch (e: any) {
    // This will catch any error during initialization, including from `admin.credential.cert`.
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK.", e);
    // Re-throw the error to ensure the process fails loudly if initialization is unsuccessful.
    // This will cause the API route to crash, which is expected behavior for a fatal config error.
    throw new Error(`Firebase Admin SDK initialization failed: ${e.message}`);
  }
}

// Export the initialized db and auth instances for use in server-side API routes.
export const db = admin.firestore();
export const auth = admin.auth();
