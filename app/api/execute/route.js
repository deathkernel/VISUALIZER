import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code : "";
    if (!code.trim()) return NextResponse.json({ ok: false, error: "Code is empty." }, { status: 400 });
    if (code.length > 20000) return NextResponse.json({ ok: false, error: "Code is too large (20,000 characters max)." }, { status: 400 });

    const script = path.join(process.cwd(), "engine", "tracer.py");
    const python = process.platform === "win32" ? "python" : "python3";

    const result = await new Promise((resolve) => {
      const child = spawn(python, [script], { stdio: ["pipe", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      let settled = false;
      const finish = (value) => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } };
      const timer = setTimeout(() => { child.kill(); finish({ ok: false, error: "Execution timed out after 5 seconds." }); }, 5000);

      child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
      child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
      child.on("error", (error) => finish({ ok: false, error: `Could not start Python: ${error.message}` }));
      child.on("close", (code) => {
        if (code !== 0 && !stdout.trim()) return finish({ ok: false, error: stderr.trim() || `Python exited with code ${code}.` });
        try { finish(JSON.parse(stdout)); }
        catch { finish({ ok: false, error: stderr.trim() || "Invalid execution response from Python." }); }
      });
      child.stdin.end(JSON.stringify({ code }));
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Request failed." }, { status: 500 });
  }
}
