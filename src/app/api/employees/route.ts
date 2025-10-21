import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/firebaseAdmin";

const CreateEmployeeSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string(),
  ticketBalance: z.number(),
  biometricTemplate: z.string().optional(), // fingerprint data (simulated or real)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateEmployeeSchema.parse(body);

    const ref = db.collection("employees").doc(validated.employeeId);

    // Optional: prevent overwriting existing employee
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
    console.error("Error creating employee:", err);
    if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input data", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "An unknown server error occurred" }, { status: 500 });
  }
}
