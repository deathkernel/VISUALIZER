"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, SkipForward, Terminal, Box, GitBranch, Braces, Zap, CircleDot } from "lucide-react";

const defaultCode = `numbers = [5, 2, 8]
total = 0

for number in numbers:
    total = total + number

print(total)`;

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationRef = useRef([]);

  const current = steps[stepIndex] || {
    line: 1,
    event: "Run your code to create execution steps",
    variables: {},
  };

  async function runCode() {
    setRunning(true);
    setStatus("Executing…");
    setError("");
    setSteps([]);
    setStepIndex(0);
    setOutput("");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      if (!data.ok) {
        setError(data.error || "Execution failed");
        setStatus("Error");
        return;
      }

      setSteps(data.steps || []);
      setOutput(data.output || "");
      setStatus(`Completed · ${data.steps?.length || 0} steps`);
    } catch (e) {
      setError(e.message || "Could not connect to execution engine");
      setStatus("Connection error");
    } finally {
      setRunning(false);
    }
  }

  function nextStep() {
    if (steps.length) setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function reset() {
    setRunning(false);
    setStepIndex(0);
    setSteps([]);
    setOutput("");
    setError("");
    setStatus("Ready");
  }

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addAction({
      id: "visualizer-run-code",
      label: "Run Visualizer Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: runCode,
    });

    editor.focus();
  }

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !steps.length) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const line = Math.max(1, current.line || 1);

    decorationRef.current = editor.deltaDecorations(decorationRef.current, [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "execution-line",
          glyphMarginClassName: "execution-glyph",
        },
      },
    ]);

    editor.revealLineInCenterIfOutsideViewport(line);
  }, [current.line, steps.length]);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Zap size={17} /></div>
          <div>
            <div className="brand-name">VISUALIZER</div>
            <div className="brand-tag">Write code. Watch it think.</div>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="status-pill"><span className="status-dot" /> Python</span>
          <button className="icon-button" onClick={reset} title="Reset"><RotateCcw size={17} /></button>
        </div>
      </header>

      <section className="toolbar">
        <button className="primary-button" onClick={runCode} disabled={running}>
          <Play size={16} /> {running ? "Running…" : "Run"}
        </button>
        <button className="tool-button" onClick={nextStep} disabled={!steps.length}>
          <SkipForward size={16} /> Step
        </button>
        <button className="tool-button" onClick={reset}>
          <RotateCcw size={16} /> Reset
        </button>
        <div className="toolbar-spacer" />
        <div className="step-counter">
          {status}{steps.length ? ` · Step ${stepIndex + 1}/${steps.length}` : ""}
        </div>
      </section>

      <section className="workspace">
        <aside className="editor-panel panel">
          <div className="panel-header">
            <div className="panel-title"><Braces size={15} /> Code</div>
            <span className="tiny-label">PYTHON</span>
          </div>

          <div className="monaco-editor-wrap">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              onMount={handleEditorMount}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineHeight: 21,
                lineNumbers: "on",
                glyphMargin: true,
                folding: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: "off",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                renderWhitespace: "selection",
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                cursorBlinking: "smooth",
                contextmenu: true,
              }}
            />
          </div>

          <div className="editor-footer">
            <span>UTF-8</span>
            <span>Python 3 · Ctrl+Enter to Run</span>
          </div>
        </aside>

        <section className="visual-panel panel">
          <div className="panel-header">
            <div className="panel-title"><GitBranch size={15} /> Live Visualization</div>
            <span className="live-pill"><CircleDot size={12} /> {running ? "RUNNING" : "LIVE"}</span>
          </div>
          <div className="visual-canvas">
            <div className="event-banner">
              <div className="event-kicker">CURRENT EVENT</div>
              <div className="event-text">{current.event}</div>
              <div className="event-line">{steps.length ? `Executing line ${current.line}` : "No execution yet"}</div>
            </div>
            <div className="array-card">
              <div className="card-label">EXECUTION STATE</div>
              <div className="state-grid">
                {Object.entries(current.variables || {}).length ? Object.entries(current.variables).map(([key, value]) => (
                  <div className="state-item" key={key}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                )) : <div className="empty-state">Press Run to generate real execution states.</div>}
              </div>
            </div>
          </div>
        </section>

        <aside className="inspector">
          <div className="panel panel-grow">
            <div className="panel-header"><div className="panel-title"><Box size={15} /> Variables</div></div>
            <div className="variable-list">
              {Object.entries(current.variables || {}).map(([key, value]) => (
                <div className="variable-row" key={key}>
                  <div className="variable-name">{key}</div>
                  <div className="variable-value">{String(value)}</div>
                </div>
              ))}
              {!Object.keys(current.variables || {}).length && <div className="muted-note">Variables appear here after execution.</div>}
            </div>
          </div>
          <div className="panel console-panel">
            <div className="panel-header"><div className="panel-title"><Terminal size={15} /> Console</div></div>
            <div className="console-body">
              <div><span className="prompt">&gt;</span> python main.py</div>
              {error ? <div className="error-result">{error}</div> : <div className="console-result">{output || "_"}</div>}
            </div>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <span>Visualizer V3 · Monaco Python Editor</span>
        <span>5s execution limit</span>
      </footer>
    </main>
  );
}
