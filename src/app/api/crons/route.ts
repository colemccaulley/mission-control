import { NextResponse } from "next/server";
import { getCrons } from "@/lib/data";

export async function GET() {
  const crons = getCrons();
  return NextResponse.json(crons);
}
