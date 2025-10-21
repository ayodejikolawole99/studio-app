import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from 'firebase-admin/firestore';

// Schema for updating an employee. All fields are optional.
const UpdateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  department: z.string().min(1, "Department is required").optional(),
  biometricTemplate: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required." }, { status: 400 });
    }
    
    const body = await req.json();
    console.log(`API Route /api/employees/${employeeId} received body:`, body);

    const validatedData = UpdateEmployeeSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
        return NextResponse.json({ error: "No fields to update provided." }, { status: 400 });
    }

    const ref = db.collection("employees").doc(employeeId);
    
    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json(
        { error: `Employee with ID ${employeeId} not found.` },
        { status: 404 }
      );
    }
    
    const updatePayload = {
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.update(updatePayload);
    console.log(`Successfully updated employee ${employeeId}`);

    return NextResponse.json({ success: true, id: employeeId });
  } catch (err: any) {
    console.error(`Error in /api/employees/${(err as any)?.params?.id} PUT:`, err);

    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input data", details: err.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: err.message || "An unknown server error occurred" }, { status: 500 });
  }
}
