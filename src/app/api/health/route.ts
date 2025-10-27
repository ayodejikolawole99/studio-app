// app/api/health/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const { db } = await import("@/lib/firebaseAdmin");
  const projectId = process.env.PROJECT_ID;
  return NextResponse.json({ status: "ok", projectId });
}