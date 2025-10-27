// app/api/employees/[id]/route.ts
import { NextResponse } from "next/server";

// ✅ Prevent Next.js from pre-rendering this route at build time
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // ✅ Lazy import Admin SDK only at runtime
  const { db } = await import("@/lib/firebaseAdmin");

  try {
    const doc = await db.collection("employees").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error("Error fetching employee:", err);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}