
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await db.collection("employees").orderBy('name', 'asc').get();
    if (snapshot.empty) {
        return NextResponse.json({ success: true, employees: [] });
    }
    const employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, employees });
  } catch (err: any) {
    console.error("Error listing employees:", err);
    return NextResponse.json({ error: err.message || "An unknown server error occurred" }, { status: 500 });
  }
}
