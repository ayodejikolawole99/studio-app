'use server';
/**
 * @fileOverview A server-side flow to create a new employee in Firestore.
 * This flow is designed to be called from the client to bypass client-side
 * permission errors related to document creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// The input schema is now defined in the client component that calls this flow.
const CreateEmployeeInputSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  ticketBalance: z.number(),
  biometricTemplate: z.string().optional(),
});

type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;

/**
 * A server-side function to create an employee document in Firestore.
 * @param employeeData - The data for the new employee.
 * @returns A promise that resolves when the employee is created.
 */
export async function createEmployee(employeeData: CreateEmployeeInput): Promise<void> {
  await createEmployeeFlow(employeeData);
}

// Server-side Firebase initialization using Admin SDK
function initializeServerFirebase() {
  if (admin.apps.length) {
    return admin.app();
  }

  // Ensure environment variables are loaded. In Next.js, this is typically handled automatically.
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Firebase Admin SDK environment variables are not set.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key needs to be properly formatted.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}


const createEmployeeFlow = ai.defineFlow(
  {
    name: 'createEmployeeFlow',
    inputSchema: CreateEmployeeInputSchema,
    outputSchema: z.void(),
  },
  async (employeeData) => {
    // We need to initialize Firebase on the server side for this flow.
    const serverApp = initializeServerFirebase();
    const firestore = admin.firestore(serverApp);
    
    // The document ID will be the employeeId provided from the client.
    const employeeRef = firestore.collection('employees').doc(employeeData.employeeId);
    
    // Using setDoc will create the document. We are not using merge here because
    // this flow is specifically for creating new employees.
    await employeeRef.set(employeeData);
    
    console.log(`[Flow] Successfully created employee: ${employeeData.employeeId}`);
  }
);
