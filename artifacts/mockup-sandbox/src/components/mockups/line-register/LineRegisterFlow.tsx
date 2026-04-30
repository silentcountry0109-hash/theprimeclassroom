import "./_group.css";
import { useState } from "react";
import { LineAuth } from "./LineAuth";
import { BindLineOfficial } from "./BindLineOfficial";
import { OtpVerify } from "./OtpVerify";

const STEPS = [
  { label: "LINE 授權登入", sub: "步驟 1 / 3" },
  { label: "綁定官方帳號", sub: "步驟 2 / 3" },
  { label: "手機驗證", sub: "步驟 3 / 3" },
];

function FlowArrow({ active }: { active: boolean }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flexShrink: 0,
      width: 56,
    }}>
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
        <defs>
          <marker id={`arrow-${active ? "active" : "inactive"}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={active ? "#06C755" : "#d1d5db"} />
          </marker>
        </defs>
        <line
          x1="2" y1="12" x2="38" y2="12"
          stroke={active ? "#06C755" : "#d1d5db"}
          strokeWidth={active ? 2.5 : 2}
          markerEnd={`url(#arrow-${active ? "active" : "inactive"})`}
          strokeDasharray={active ? "none" : "5 3"}
        />
      </svg>
      {active && (
        <span style={{
          fontSize: 10,
          color: "#06C755",
          fontWeight: 600,
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          繼續 →
        </span>
      )}
    </div>
  );
}

function StepBadge({ step, active, done }: { step: number; active: boolean; done: boolean }) {
  const bg = done ? "#06C755" : active ? "#81D8D0" : "hsl(40 6% 82%)";
  const color = done || active ? "white" : "hsl(220 8% 55%)";
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 13,
      boxShadow: active ? "0 0 0 4px rgba(129,216,208,0.25)" : done ? "0 0 0 4px rgba(6,199,85,0.18)" : "none",
      transition: "all 0.25s",
    }}>
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : step + 1}
    </div>
  );
}

export function LineRegisterFlow() {
  const [step, setStep] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "hsl(220 14% 14%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "36px 24px 48px",
      fontFamily: "'Noto Sans TC', sans-serif",
    }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "hsl(40 6% 92%)",
          letterSpacing: "0.08em",
          margin: "0 0 6px",
          fontFamily: "'Shippori Mincho', serif",
        }}>
          家長綁定流程
        </h1>
        <p style={{ fontSize: 12, color: "hsl(220 8% 55%)", margin: 0 }}>
          LINE 授權 → 綁定官方帳號 → 手機驗證
        </p>
      </div>

      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 0,
        width: "100%",
        maxWidth: 960,
      }}>
        {STEPS.map((s, i) => {
          const isActive = step === i;
          const isDone = step > i;

          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
                }}>
                  <StepBadge step={i} active={isActive} done={isDone} />
                  <div>
                    <p style={{
                      fontSize: 13, fontWeight: 600,
                      color: isActive ? "hsl(40 6% 92%)" : isDone ? "hsl(140 40% 55%)" : "hsl(220 8% 45%)",
                      margin: 0,
                      transition: "color 0.25s",
                    }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 10, color: "hsl(220 8% 40%)", margin: 0 }}>{s.sub}</p>
                  </div>
                </div>

                <div style={{
                  width: 270,
                  height: 540,
                  borderRadius: 28,
                  overflow: "hidden",
                  boxShadow: isActive
                    ? "0 0 0 3px #81D8D0, 0 20px 60px rgba(0,0,0,0.5)"
                    : isDone
                    ? "0 0 0 2px #06C755, 0 8px 24px rgba(0,0,0,0.3)"
                    : "0 0 0 1px hsl(220 14% 22%), 0 4px 16px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.3s",
                  position: "relative",
                  background: "white",
                  opacity: isActive ? 1 : isDone ? 0.75 : 0.5,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transitionProperty: "box-shadow, opacity, transform",
                }}>
                  {isDone && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      background: "rgba(6,199,85,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: "rgba(6,199,85,0.85)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 8px rgba(6,199,85,0.2)",
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div style={{ height: "100%", overflowY: "auto" }}>
                    {i === 0 && <LineAuth onNext={() => setStep(1)} />}
                    {i === 1 && <BindLineOfficial onNext={() => setStep(2)} />}
                    {i === 2 && <OtpVerify />}
                  </div>
                </div>

                {isActive && (
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    style={{
                      fontSize: 12, color: "hsl(220 8% 45%)", background: "none",
                      border: "1px solid hsl(220 14% 26%)", borderRadius: 6,
                      padding: "5px 12px", cursor: step === 0 ? "not-allowed" : "pointer",
                      opacity: step === 0 ? 0.3 : 1,
                      transition: "all 0.15s",
                    }}
                    disabled={step === 0}
                  >
                    ← 上一步
                  </button>
                )}
              </div>

              {i < STEPS.length - 1 && (
                <FlowArrow active={step > i} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 36,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: step === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: step > i ? "#06C755" : step === i ? "#81D8D0" : "hsl(220 14% 28%)",
              transition: "all 0.25s",
              cursor: "pointer",
            }}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: "hsl(220 8% 38%)" }}>
        點擊下方圓點可直接跳至任一步驟
      </p>
    </div>
  );
}
