import { NextResponse } from "next/server";
import { CONTRACT_SPEC } from "@/lib/contract/types";

export async function GET() {
  return NextResponse.json(CONTRACT_SPEC, {
    headers: {
      "x-eximia-contract-version": "v1",
    },
  });
}
