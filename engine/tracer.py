import ast
import io
import json
import sys

MAX_STEPS = 500


def safe_value(value):
    try:
        return repr(value)[:500]
    except Exception:
        return f"<{type(value).__name__}>"


def snapshot(frame):
    return {k: safe_value(v) for k, v in frame.f_locals.items() if not k.startswith("__")}


def execute(code):
    try:
        tree = ast.parse(code, filename="main.py", mode="exec")
    except SyntaxError as exc:
        return {"ok": False, "error": f"SyntaxError: {exc}", "steps": [], "output": ""}

    steps = []
    output = io.StringIO()

    def trace(frame, event, arg):
        if frame.f_code.co_filename != "main.py":
            return trace
        if event == "line" and len(steps) < MAX_STEPS:
            steps.append({
                "line": frame.f_lineno,
                "event": "Executing line",
                "variables": snapshot(frame),
            })
        return trace

    old_trace = sys.gettrace()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    try:
        compiled = compile(tree, "main.py", "exec")
        namespace = {"__name__": "__main__"}

        sys.stdout = output
        sys.stderr = output
        sys.settrace(trace)
        exec(compiled, namespace, namespace)

    except Exception as exc:
        return {
            "ok": False,
            "error": f"{type(exc).__name__}: {exc}",
            "steps": steps,
            "output": output.getvalue(),
        }
    finally:
        sys.settrace(old_trace)
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    return {
        "ok": True,
        "steps": steps,
        "output": output.getvalue(),
        "truncated": len(steps) >= MAX_STEPS,
    }


if __name__ == "__main__":
    payload = json.load(sys.stdin)
    result = execute(payload.get("code", ""))
    print(json.dumps(result))
