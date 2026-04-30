import "./_group.css";
import { useState } from "react";

export function OtpVerify() {
  const [otpValues] = useState(["", "", "", "", "", ""]);
  const [countdown] = useState(60);
  const phone = "0912***678";

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", backgroundColor: "hsl(40 6% 97%)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 24px 12px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "hsl(220 8% 38%)", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "8px 16px 32px" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(129,216,208,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              border: "2px solid rgba(129,216,208,0.3)"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#81D8D0" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
                <path d="M9 9l1.5 1.5L12 9" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 20, letterSpacing: "0.1em", color: "hsl(220 9% 32%)", margin: "0 0 8px" }}>
              手機驗證
            </h2>
            <p style={{ fontSize: 13, color: "hsl(220 8% 38%)", margin: "0 0 4px" }}>
              驗證碼已發送至
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#81D8D0", margin: 0 }}>
              {phone}
            </p>
          </div>

          <div style={{ background: "white", borderRadius: 12, border: "1px solid hsl(40 6% 91%)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "28px 24px 24px" }}>
            <p style={{ fontSize: 13, color: "hsl(220 8% 38%)", textAlign: "center", marginTop: 0, marginBottom: 24 }}>
              請輸入 6 位數驗證碼
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  defaultValue={val}
                  style={{
                    width: 44, height: 52,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 500,
                    border: i === 0
                      ? "2px solid #81D8D0"
                      : "1px solid hsl(40 6% 82%)",
                    borderRadius: 10,
                    outline: "none",
                    color: "hsl(220 9% 32%)",
                    background: i === 0 ? "rgba(129,216,208,0.04)" : "white",
                    boxSizing: "border-box",
                    boxShadow: i === 0 ? "0 0 0 3px rgba(129,216,208,0.15)" : "none",
                    transition: "all 0.15s"
                  }}
                />
              ))}
            </div>

            <p style={{ fontSize: 12, color: "hsl(220 8% 55%)", textAlign: "center", margin: "12px 0 0" }}>
              簡訊可能需要 30–60 秒才會送達
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {countdown > 0 ? (
                <span style={{ fontSize: 13, color: "hsl(220 8% 50%)" }}>
                  重新發送（
                  <span style={{ color: "#81D8D0", fontVariantNumeric: "tabular-nums" }}>{countdown}s</span>
                  ）
                </span>
              ) : (
                <button style={{ fontSize: 13, color: "#81D8D0", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  重新發送驗證碼
                </button>
              )}
            </div>

            <button style={{
              width: "100%", padding: "11px 0", borderRadius: 8,
              border: "none",
              background: "#81D8D0",
              color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer",
              opacity: 0.5
            }}>
              驗證並完成
            </button>
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(129,216,208,0.08)", borderRadius: 10, border: "1px solid rgba(129,216,208,0.2)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81D8D0" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ fontSize: 12, color: "hsl(220 8% 45%)", margin: 0, lineHeight: 1.6 }}>
                驗證成功後，您可使用 LINE 一鍵登入質數教室，無需記憶帳號密碼
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
