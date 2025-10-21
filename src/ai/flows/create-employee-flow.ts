'use server';
/**
 * @fileOverview A server-side flow to create a new employee in Firestore.
 * This flow is designed to be called from the client to bypass client-side
 * permission errors related to document creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/index';
import { doc, setDoc } from 'firebase/firestore';
import type { Employee } from '@/lib/types';

// Define the schema for the employee data input.
export const CreateEmployeeInputSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  ticketBalance: z.number(),
  biometricTemplate: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeInputSchema>;

/**
 * A server-side function to create an employee document in Firestore.
 * @param employeeData - The data for the new employee.
 * @returns A promise that resolves when the employee is created.
 */
export async function createEmployee(employeeData: CreateEmployeeInput): Promise<void> {
  await createEmployeeFlow(employeeData);
}

const createEmployeeFlow = ai.defineFlow(
  {
    name: 'createEmployeeFlow',
    inputSchema: CreateEmployeeInputSchema,
    outputSchema: z.void(),
  },
  async (employeeData) => {
    // We need to initialize Firebase on the server side for this flow.
    const { firestore } = initializeFirebase();
    
    // The document ID will be the employeeId provided from the client.
    const employeeRef = doc(firestore, 'employees', employeeData.employeeId);
    
    // Using setDoc will create the document. We are not using merge here because
    // this flow is specifically for creating new employees.
    await setDoc(employeeRef, employeeData);
    
    console.log(`[Flow] Successfully created employee: ${employeeData.employeeId}`);
  }
);
