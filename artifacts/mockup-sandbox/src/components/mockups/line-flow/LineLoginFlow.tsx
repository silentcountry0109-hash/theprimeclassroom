import "./_group.css";
import { useState } from "react";
import { LoginEntry } from "./LoginEntry";
import { LineAuth } from "./LineAuth";
import { PhoneOtp } from "./PhoneOtp";

const STEPS = [
  {
    label: "登入入口",
    sub: "步驟 1 / 2",
    desc: "點擊「用 LINE 帳號登入」",
    color: "#81D8D0",
  },
  {
    label: "LINE 授權頁",
    sub: "步驟 1.5（LINE 官方頁面）",
    desc: "同意授權＋勾選加好友",
    color: "#06C755",
  },
  {
    label: "手機 OTP 驗證",
    sub: "步驟 2 / 2",
    desc: "輸入手機號碼並驗證",
    color: "#81D8D0",
  },
];

function FlowArrow({ active, label }: { active: boolean; label: string }) {
  const color = active ? "#06C755" : "#d1d5db";
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      flexShrink: 0,
      width: 64,
    }}>
      <svg width="52" height="20" viewBox="0 0 52 20" fill="none">
        <defs>
          <marker
            id={`arrowhead-${active ? "a" : "i"}-${label}`}
            markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={color} />
          </marker>
        </defs>
        <line
          x1="2" y1="10" x2="40" y2="10"
          stroke={color}
          strokeWidth={active ? 2.5 : 1.5}
          strokeDasharray={active ? "none" : "5 3"}
          markerEnd={`url(#arrowhead-${active ? "a" : "i"}-${label})`}
        />
      </svg>
      <span style={{
        fontSize: 9,
        color: active ? "#06C755" : "#b0b8c4",
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
        maxWidth: 64,
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        {label}
      </span>
    </div>
  );
}

function StepBadge({ index, active, done }: { index: number; active: boolean; done: boolean }) {
  const bg = done ? "#06C755" : active ? "#81D8D0" : "hsl(40 6% 82%)";
  const color = done || active ? "white" : "hsl(220 8% 58%)";
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%",
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 12, flexShrink: 0,
      boxShadow: active ? "0 0 0 4px rgba(129,216,208,0.25)"
        : done ? "0 0 0 4px rgba(6,199,85,0.18)" : "none",
      transition: "all 0.25s",
    }}>
      {done ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : index + 1}
    </div>
  );
}

export function LineLoginFlow() {
  const [step, setStep] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "hsl(220 14% 13%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "32px 20px 48px",
      fontFamily: "'Noto Sans TC', sans-serif",
    }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #81D8D0 0%, #5ec8be 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 16, color: "white", fontWeight: 600 }}>質</span>
          </div>
          <h1 style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 18, fontWeight: 600,
            color: "hsl(40 6% 92%)",
            letterSpacing: "0.1em",
            margin: 0,
          }}>
            LINE 新登入流程模擬圖
          </h1>
        </div>
        <p style={{ fontSize: 11, color: "hsl(220 8% 48%)", margin: 0 }}>
          整合 bot_prompt 加好友・從三步縮減為兩步
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginTop: 10,
          background: "rgba(6,199,85,0.1)", borderRadius: 20,
          padding: "4px 12px",
          border: "1px solid rgba(6,199,85,0.2)",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06C755" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: 10, color: "#06C755", fontWeight: 600, letterSpacing: "0.03em" }}>
            已移除獨立「加好友」頁面
          </span>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 0,
        width: "100%",
        maxWidth: 1060,
      }}>
        {STEPS.map((s, i) => {
          const isActive = step === i;
          const isDone = step > i;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7, marginBottom: 2,
                }}>
                  <StepBadge index={i} active={isActive} done={isDone} />
                  <div>
                    <p style={{
                      fontSize: 12, fontWeight: 600,
                      color: isActive ? "hsl(40 6% 92%)"
                        : isDone ? "hsl(140 40% 55%)" : "hsl(220 8% 42%)",
                      margin: 0, transition: "color 0.25s",
                    }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 9, color: "hsl(220 8% 38%)", margin: 0 }}>{s.sub}</p>
                  </div>
                </div>

                <div style={{
                  width: 290,
                  height: 580,
                  borderRadius: 28,
                  overflow: "hidden",
                  boxShadow: isActive
                    ? `0 0 0 3px ${s.color}, 0 20px 60px rgba(0,0,0,0.55)`
                    : isDone
                    ? "0 0 0 2px #06C755, 0 8px 24px rgba(0,0,0,0.3)"
                    : "0 0 0 1px hsl(220 14% 22%), 0 4px 16px rgba(0,0,0,0.25)",
                  transition: "box-shadow 0.3s, opacity 0.3s, transform 0.3s",
                  position: "relative",
                  background: "white",
                  opacity: isActive ? 1 : isDone ? 0.7 : 0.45,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  cursor: "pointer",
                }}
                  onClick={() => setStep(i)}
                >
                  {isDone && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      background: "rgba(6,199,85,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "rgba(6,199,85,0.85)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 8px rgba(6,199,85,0.18)",
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div style={{ height: "100%", overflowY: "auto" }}>
                    {i === 0 && <LoginEntry onNext={() => setStep(1)} />}
                    {i === 1 && <LineAuth onNext={() => setStep(2)} />}
                    {i === 2 && <PhoneOtp />}
                  </div>
                </div>

                <div style={{
                  background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                  borderRadius: 8, padding: "6px 10px",
                  border: isActive ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  maxWidth: 290,
                }}>
                  <p style={{
                    fontSize: 10, color: isActive ? "hsl(40 6% 75%)" : "hsl(220 8% 38%)",
                    margin: 0, textAlign: "center", lineHeight: 1.5,
                  }}>
                    {s.desc}
                  </p>
                </div>

                {isActive && i > 0 && (
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    style={{
                      fontSize: 11, color: "hsl(220 8% 45%)", background: "none",
                      border: "1px solid hsl(220 14% 26%)", borderRadius: 6,
                      padding: "5px 12px", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    ← 上一步
                  </button>
                )}
              </div>

              {i < STEPS.length - 1 && (
                <FlowArrow
                  active={step > i}
                  label={i === 0 ? "跳轉 LINE" : "授權完成"}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 32,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: step === i ? 24 : 8,
              height: 8, borderRadius: 4,
              background: step > i ? "#06C755" : step === i ? "#81D8D0" : "hsl(220 14% 28%)",
              transition: "all 0.25s",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <p style={{ marginTop: 10, fontSize: 10, color: "hsl(220 8% 36%)" }}>
        點擊手機畫面或下方圓點可切換步驟
      </p>

      <div style={{
        marginTop: 24,
        padding: "12px 20px",
        background: "rgba(255,183,178,0.08)",
        borderRadius: 10,
        border: "1px solid rgba(255,183,178,0.15)",
        maxWidth: 600,
        width: "100%",
      }}>
        <p style={{ fontSize: 10, color: "hsl(220 8% 48%)", margin: 0, textAlign: "center", lineHeight: 1.7 }}>
          <span style={{ color: "#FFB7B2", fontWeight: 600 }}>新流程說明：</span>
          原三步驟（LINE 授權 → 加好友 → 手機驗證）已整合為兩步，
          透過 LINE OAuth 的 <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: 10, color: "#81D8D0" }}>bot_prompt=aggressive</code> 參數，
          讓加好友在授權當下一併完成，大幅簡化家長註冊體驗。
        </p>
      </div>
    </div>
  );
}
