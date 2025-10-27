// src/lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

function getAdminApp() {
  if (!app) {
    const projectId = process.env.PROJECT_ID;
    const clientEmail = process.env.CLIENT_EMAIL;
    const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

    // ✅ Don’t throw during build — only warn
    if (!projectId || !clientEmail || !privateKey) {
      console.warn("⚠️ Firebase Admin credentials are not set (likely build-time).");
      // Return an already initialized app if one exists, otherwise a dummy init
      return admin.apps[0] ?? admin.initializeApp();
    }

    // ✅ Initialize with real credentials at runtime
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return app;
}

// ✅ Export Firestore and Auth instances
export const db = getAdminApp().firestore();
export const auth = getAdminApp().auth();