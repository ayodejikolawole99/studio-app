import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import * as admin from 'firebase-admin';

// Schema for creating an employee, ticketBalance is not included as it defaults to 0
const CreateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  ticketBalance: z.number().int().min(0),
  biometricTemplate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateEmployeeSchema.parse(body);

    const ref = db.collection("employees").doc(validated.employeeId);

    // Prevent overwriting existing employee
    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json(
        { error: "Employee with this ID already exists" },
        { status: 409 } // 409 Conflict is more appropriate
      );
    }

    // Use server timestamp for creation date
    await ref.set({
      ...validated,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: validated.employeeId });
  } catch (err: any) {
    console.error("Error in /api/employees POST:", err);

    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input data", details: err.errors }, { status: 400 });
    }
    
    // Default server error
    return NextResponse.json({ error: err.message || "An unknown server error occurred" }, { status: 500 });
  }
}
