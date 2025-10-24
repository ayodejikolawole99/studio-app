import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { z } from 'zod';
import { FieldValue } from "firebase-admin/firestore";

const CreateEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  biometricTemplate: z.string().optional(),
});


// POST /api/employees -> create new employee
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = CreateEmployeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", issues: validation.error.issues }, { status: 400 });
    }
    
    const { employeeId, name, department, biometricTemplate } = validation.data;

    const ref = db.collection("employees").doc(employeeId);
    const doc = await ref.get();

    if (doc.exists) {
      return NextResponse.json({ error: `Employee with ID ${employeeId} already exists.` }, { status: 409 });
    }

    const newEmployeeData = {
      name,
      department,
      employeeId,
      biometricTemplate: biometricTemplate || undefined,
      ticketBalance: 0,
      createdAt: FieldValue.serverTimestamp(),
    };

    await ref.set(newEmployeeData);

    const savedEmployee = {
      id: ref.id,
      ...newEmployeeData,
      // The timestamp will be a server-side object, so we omit it or handle it as needed.
      // For the return, we can just confirm what was saved.
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, employee: savedEmployee }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/employees:", err);
    return NextResponse.json({ error: err.message || "Failed to create employee" }, { status: 500 });
  }
}
