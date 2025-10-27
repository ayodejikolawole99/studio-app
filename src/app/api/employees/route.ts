import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await db.collection("employees").get(); // ✅ works now
    const employees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ employees }, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching employees:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch employees" },
      { status: 500 }
    );
  }
}