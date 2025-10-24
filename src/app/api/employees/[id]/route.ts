import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

// Schema for updating an employee
const UpdateEmployeeSchema = z.object({
  name: z.string().optional(),
  department: z.string().optional(),
  biometricTemplate: z.string().optional(),
  ticketBalance: z.number().optional(),
});

// GET /api/employees/:id → fetch one employee
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ref = db.collection("employees").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: `Employee ${params.id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
  } catch (err: any) {
    console.error("Error in GET /api/employees/:id:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

// PUT /api/employees/:id → update employee
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = UpdateEmployeeSchema.parse(body);

    const ref = db.collection("employees").doc(params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: `Employee ${params.id} not found` },
        { status: 404 }
      );
    }

    await ref.update({
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { success: true, id: params.id, ...validatedData },
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

// DELETE /api/employees/:id → remove employee
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
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