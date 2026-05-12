import { NextResponse } from "next/server";
import { getHistoryWithCounts } from "@/lib/storage";

export async function GET(): Promise<NextResponse> {
  const summaries = await getHistoryWithCounts();
  return NextResponse.json(summaries);
}
