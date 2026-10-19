import { NextResponse } from "next/server";

// MathsLab computes values in the browser and does not execute arbitrary code.
export async function POST() {
  return NextResponse.json({ ok: false, error: "Python code execution is not part of MathsLab. Use the interactive maths topics instead." }, { status: 410 });
}
