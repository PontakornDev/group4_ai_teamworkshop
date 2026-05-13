import { NextResponse } from "next/server";
import { getTopDogs } from "@/lib/storage";

export async function GET() {
  const result = await getTopDogs();
  return NextResponse.json(result);
}
