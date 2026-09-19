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
    ignored = {"__name__", "__builtins__", "print"}
    return {
        k: safe_value(v)
        for k, v in frame.f_locals.items()
        if k not in ignored and not k.startswith("__") and not callable(v)
    }


def execute(code):
    try:
        tree = ast.parse(code, filename="main.py", mode="exec")
    except SyntaxError as exc:
        return {"ok": False, "error": f"SyntaxError: {exc}", "steps": [], "output": ""}

    steps = []
    output = io.StringIO()
    pending = None

    def captured_print(*args, sep=" ", end="\n", **kwargs):
        output.write(sep.join(str(value) for value in args))
        output.write(end)

    def trace(frame, event, arg):
        nonlocal pending
        if frame.f_code.co_filename != "main.py":
            return trace

        if event == "line":
            if pending is not None:
                pending["variables"] = snapshot(frame)

            if len(steps) < MAX_STEPS:
                pending = {
                    "line": frame.f_lineno,
                    "event": "Executing line",
                    "variables": {},
                }
                steps.append(pending)
            else:
                pending = None

        elif event == "return" and pending is not None:
            pending["variables"] = snapshot(frame)
            pending = None

        return trace

    old_trace = sys.gettrace()
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    try:
        compiled = compile(tree, "main.py", "exec")
        namespace = {
            "__name__": "__main__",
            "print": captured_print,
        }

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
