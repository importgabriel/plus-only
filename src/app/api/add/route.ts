/**
 * POST /api/add  — accepts { a, b }, computes a + b, persists to Supabase, returns AdditionResult.
 * GET  /api/add  — returns the full addition history as AdditionResult[], newest first.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import type { AdditionRow } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Shared response type (exported so UI components can import it).
// Matches the AdditionResult interface contract: { a, b, sum, created_at }
// ---------------------------------------------------------------------------
export interface AdditionResult {
  a: number;
  b: number;
  sum: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a raw DB row to the API response shape. */
function rowToResult(row: AdditionRow): AdditionResult {
  return {
    a: row.operand_a,
    b: row.operand_b,
    sum: row.sum,
    created_at: row.created_at,
  };
}

/** Returns a JSON error response with the given status code. */
function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// ---------------------------------------------------------------------------
// POST /api/add
// ---------------------------------------------------------------------------

interface AddRequestBody {
  a: unknown;
  b: unknown;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Parse request body
  let body: AddRequestBody;
  try {
    body = (await request.json()) as AddRequestBody;
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { a, b } = body;

  // 2. Validate inputs
  if (typeof a !== "number" || typeof b !== "number") {
    return errorResponse(
      'Both "a" and "b" must be numbers.',
      400
    );
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return errorResponse(
      '"a" and "b" must be finite numbers (not Infinity or NaN).',
      400
    );
  }

  // 3. Compute sum
  const sum = a + b;

  // 4. Persist to database
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("additions")
    .insert({ operand_a: a, operand_b: b, sum })
    .select()
    .single<AdditionRow>();

  if (error || !data) {
    console.error("[POST /api/add] Supabase insert error:", error);
    return errorResponse("Failed to save addition. Please try again.", 500);
  }

  // 5. Return result
  return NextResponse.json(rowToResult(data), { status: 201 });
}

// ---------------------------------------------------------------------------
// GET /api/add
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("additions")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AdditionRow[]>();

  if (error) {
    console.error("[GET /api/add] Supabase select error:", error);
    return errorResponse("Failed to retrieve addition history.", 500);
  }

  const results: AdditionResult[] = (data ?? []).map(rowToResult);
  return NextResponse.json(results, { status: 200 });
}
