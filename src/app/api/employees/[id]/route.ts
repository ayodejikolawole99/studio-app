import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

// Schema for updating an employee. Note: employeeId is not updatable.
const UpdateEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  biometricTemplate: z.string().optional(),
});


// PUT /api/employees/:id -> update employee
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
        return NextResponse.json({ error: "Employee ID is required in URL path." }, { status: 400 });
    }
    const body = await req.json();
    const validation = UpdateEmployeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", issues: validation.error.issues }, { status: 400 });
    }

    const { name, department, biometricTemplate } = validation.data;

    const ref = db.collection("employees").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: `Employee ${params.id} not found` },
        { status: 404 }
      );
    }
    
    const updateData = {
        name,
        department,
        biometricTemplate: biometricTemplate || doc.data()?.biometricTemplate || undefined, // Preserve existing if not provided
        updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.update(updateData);
    
    // Return the full updated object
    const updatedDoc = await ref.get();
    const updatedEmployee = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json(
      { success: true, employee: updatedEmployee },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in PUT /api/employees/:id:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/:id -> remove employee
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
        return NextResponse.json({ error: "Employee ID is required in URL path." }, { status: 400 });
    }
    
    const ref = db.collection("employees").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: `Employee ${params.id} not found` },
        { status: 404 }
      );
    }

    await ref.delete();
    return NextResponse.json(
      { success: true, message: `Employee ${params.id} deleted` },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in DELETE /api/employees/:id:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}
