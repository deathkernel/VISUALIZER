"use client";

import { useMemo, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Terminal,
  Box,
  GitBranch,
  Braces,
  Zap,
  ChevronRight,
  CircleDot
} from "lucide-react";

const defaultCode = `numbers = [5, 2, 8]
total = 0

for number in numbers:
    total = total + number

print(total)`;

const steps = [
  { line: 1, vars: { numbers: "[5, 2, 8]", total: "—" }, event: "Created array" },
  { line: 2, vars: { numbers: "[5, 2, 8]", total: "0" }, event: "Initialized total" },
  { line: 4, vars: { numbers: "[5, 2, 8]", total: "0" }, event: "Loop started" },
  { line: 5, vars: { numbers: "[5, 2, 8]", total: "5" }, event: "Added 5" },
  { line: 5, vars: { numbers: "[5, 2, 8]", total: "7" }, event: "Added 2" },
  { line: 5, vars: { numbers: "[5, 2, 8]", total: "15" }, event: "Added 8" },
  { line: 7, vars: { numbers: "[5, 2, 8]", total: "15" }, event: "Printed result" }
];

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const current = steps[stepIndex];

  const lines = useMemo(() => code.split("\n"), [code]);

  const nextStep = () => {
    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const reset = () => {
    setRunning(false);
    setStepIndex(0);
  };

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
          <button className="icon-button" title="Reset" onClick={reset}><RotateCcw size={17} /></button>
        </div>
      </header>

      <section className="toolbar">
        <button className="primary-button" onClick={() => setRunning((v) => !v)}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pause" : "Run"}
        </button>
        <button className="tool-button" onClick={nextStep}><SkipForward size={16} /> Step</button>
        <button className="tool-button" onClick={reset}><RotateCcw size={16} /> Reset</button>
        <div className="toolbar-spacer" />
        <div className="step-counter">Step <strong>{stepIndex + 1}</strong> / {steps.length}</div>
      </section>

      <section className="workspace">
        <aside className="editor-panel panel">
          <div className="panel-header">
            <div className="panel-title"><Braces size={15} /> Code</div>
            <span className="tiny-label">PYTHON</span>
          </div>

          <div className="editor">
            <div className="line-numbers">
              {lines.map((_, index) => (
                <div key={index} className={current.line === index + 1 ? "active-line-number" : ""}>
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="code-lines">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className={current.line === index + 1 ? "code-line active-code-line" : "code-line"}
                >
                  <input
                    value={line}
                    onChange={(event) => {
                      const next = [...lines];
                      next[index] = event.target.value;
                      setCode(next.join("\n"));
                    }}
                    spellCheck={false}
                    aria-label={`Line ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="editor-footer">
            <span>UTF-8</span>
            <span>Python 3</span>
          </div>
        </aside>

        <section className="visual-panel panel">
          <div className="panel-header">
            <div className="panel-title"><GitBranch size={15} /> Live Visualization</div>
            <span className="live-pill"><CircleDot size={12} /> LIVE</span>
          </div>

          <div className="visual-canvas">
            <div className="event-banner">
              <div className="event-kicker">CURRENT EVENT</div>
              <div className="event-text">{current.event}</div>
              <div className="event-line">Executing line {current.line}</div>
            </div>

            <div className="array-card">
              <div className="card-label">ARRAY · numbers</div>
              <div className="array-row">
                {[5, 2, 8].map((value, index) => (
                  <div
                    key={value}
                    className={stepIndex >= 3 + index ? "array-cell touched" : "array-cell"}
                  >
                    <span className="array-index">{index}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-arrow"><ChevronRight size={24} /></div>

            <div className="total-card">
              <div className="card-label">VARIABLE · total</div>
              <div className="total-value">{current.vars.total}</div>
              <div className="total-caption">Accumulated value</div>
            </div>
          </div>
        </section>

        <aside className="inspector">
          <div className="panel panel-grow">
            <div className="panel-header">
              <div className="panel-title"><Box size={15} /> Variables</div>
            </div>

            <div className="variable-list">
              {Object.entries(current.vars).map(([key, value]) => (
                <div className="variable-row" key={key}>
                  <div className="variable-name">{key}</div>
                  <div className="variable-value">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel console-panel">
            <div className="panel-header">
              <div className="panel-title"><Terminal size={15} /> Console</div>
            </div>
            <div className="console-body">
              <div><span className="prompt">&gt;</span> python main.py</div>
              <div className="console-result">{stepIndex >= steps.length - 1 ? "15" : "_"}</div>
            </div>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <span>Visualizer V1</span>
        <span>Execution engine coming next</span>
      </footer>
    </main>
  );
}
