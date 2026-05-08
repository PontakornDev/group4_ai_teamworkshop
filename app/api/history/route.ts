import { NextResponse } from "next/server";
import { readDogs } from "@/lib/storage";

export async function GET(): Promise<NextResponse> {
  const records = await readDogs();
  return NextResponse.json(records);
}
