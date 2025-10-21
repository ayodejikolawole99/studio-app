import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

// Schema for creating an employee. ticketBalance is handled server-side.
const CreateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  biometricTemplate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("API Route /api/employees received body:", body);

    const validatedData = CreateEmployeeSchema.parse(body);

    const ref = db.collection("employees").doc(validatedData.employeeId);

    // Prevent overwriting existing employee
    const existing = await ref.get();
    if (existing.exists) {
      console.warn(`Attempted to create duplicate employee: ${validatedData.employeeId}`);
      return NextResponse.json(
        { error: `Employee with ID ${validatedData.employeeId} already exists.` },
        { status: 409 } // 409 Conflict is more appropriate
      );
    }

    // New employees start with 0 tickets.
    const newEmployeePayload = {
      ...validatedData,
      ticketBalance: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    await ref.set(newEmployeePayload);
    console.log(`Successfully created employee ${validatedData.employeeId}`);

    return NextResponse.json({ success: true, id: validatedData.employeeId });
  } catch (err: any) {
    console.error("Error in /api/employees POST:", err);

    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input data", details: err.errors }, { status: 400 });
    }
    
    // Default server error
    return NextResponse.json({ error: err.message || "An unknown server error occurred" }, { status: 500 });
  }
}
