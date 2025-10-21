'use server';
/**
 * @fileOverview A server-side flow to create a new employee in Firestore.
 * This flow uses the Firebase Admin SDK to bypass client-side security rules.
 */

import { z } from 'zod';
import * as admin from 'firebase-admin';

// Define the input schema for the employee data.
const CreateEmployeeInputSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  ticketBalance: z.number(),
  biometricTemplate: z.string().optional(),
});

type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;

/**
 * Initializes the Firebase Admin SDK on the server, ensuring it only happens once.
 * It uses environment variables for credentials, which is the correct pattern for Next.js server environments.
 * Throws an error if required environment variables are not set.
 */
if (!admin.apps.length) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error("Firebase Admin SDK environment variables are not set. Cannot initialize admin SDK.");
    }
    try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
    } catch (error) {
        console.error('Firebase Admin SDK initialization failed:', error);
        // We re-throw the error to ensure the server doesn't start in a broken state.
        throw new Error("Firebase Admin SDK failed to initialize.");
    }
}

/**
 * A server-side async function (Server Action) to create an employee document in Firestore.
 * This function is called from the client to perform a privileged write operation that bypasses security rules.
 * @param employeeData - The data for the new employee.
 * @returns A promise that resolves with a structured response indicating success or failure.
 */
export async function createEmployee(employeeData: CreateEmployeeInput): Promise<{ success: boolean; id?: string; error?: string; }> {
  try {
    // Validate input data against the schema.
    const validatedData = CreateEmployeeInputSchema.parse(employeeData);
    
    const firestore = admin.firestore();
    
    // The document ID will be the employeeId provided from the client.
    const employeeRef = firestore.collection('employees').doc(validatedData.employeeId);
    
    // Check if the employee already exists to prevent overwriting.
    const doc = await employeeRef.get();
    if (doc.exists) {
        return { success: false, error: `Employee with ID ${validatedData.employeeId} already exists.` };
    }
    
    // Use the Admin SDK to set the document. This bypasses client-side security rules.
    await employeeRef.set(validatedData);
    
    console.log(`[Server Action] Successfully created employee: ${validatedData.employeeId}`);
    return { success: true, id: validatedData.employeeId };
  } catch (err) {
      const error = err as Error;
      console.error("[Server Action] createEmployee failed:", error);
      // Pass a generic or specific error message back to the client.
      return { success: false, error: error.message || "An unknown error occurred on the server." };
  }
}
