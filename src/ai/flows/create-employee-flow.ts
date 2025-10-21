'use server';
/**
 * @fileOverview A server-side flow to create a new employee in Firestore.
 * This flow uses the Firebase Admin SDK to bypass client-side security rules
 * that may prevent document creation.
 */

import { z } from 'zod';
import * as admin from 'firebase-admin';

// This is the schema for the data coming from the client.
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
 * It uses environment variables for credentials.
 */
function initializeServerFirebase() {
  if (!admin.apps.length) {
    // Ensure environment variables are set.
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Firebase Admin SDK environment variables are not set.');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key from the environment variable needs to have its newlines restored.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin;
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
  
  const serverAdmin = initializeServerFirebase();
  const firestore = serverAdmin.firestore();
  
  // The document ID will be the employeeId provided from the client.
  const employeeRef = firestore.collection('employees').doc(validatedData.employeeId);
  
  // Use the Admin SDK to set the document. This bypasses client-side security rules.
  await employeeRef.set(validatedData);
  
  console.log(`[Server Action] Successfully created employee: ${validatedData.employeeId}`);
}
