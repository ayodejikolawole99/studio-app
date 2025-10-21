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
 * It uses environment variables for credentials. This should run at the module level.
 */
if (!admin.apps.length) {
    // Ensure environment variables are set for the server-side flow.
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        // This log is for server-side debugging. It won't be visible in the browser.
        console.error('Firebase Admin SDK environment variables are not set. The createEmployee flow will fail.');
    } else {
        try {
            admin.initializeApp({
              credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The private key from the environment variable needs to have its newlines restored.
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              }),
            });
        } catch (error) {
            console.error('Firebase Admin SDK initialization failed:', error);
        }
    }
}

/**
 * A server-side async function (Server Action) to create an employee document in Firestore.
 * This function is called from the client to perform a privileged write operation.
 * @param employeeData - The data for the new employee.
 * @returns A promise that resolves when the employee is created.
 */
export async function createEmployee(employeeData: CreateEmployeeInput): Promise<void> {
  // Validate input data against the schema.
  const validatedData = CreateEmployeeInputSchema.parse(employeeData);
  
  if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK is not initialized. Cannot create employee.');
  }
  
  const firestore = admin.firestore();
  
  // The document ID will be the employeeId provided from the client.
  const employeeRef = firestore.collection('employees').doc(validatedData.employeeId);
  
  // Use the Admin SDK to set the document. This bypasses client-side security rules.
  await employeeRef.set(validatedData);
  
  console.log(`[Server Action] Successfully created employee: ${validatedData.employeeId}`);
}
