import "./_group.css";
import { useState } from "react";

export function PhoneOtp() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown] = useState(60);

  const handleOtpChange = (i: number, val: string) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
  };

  return (
    <div style={{
      fontFamily: "'Noto Sans TC', sans-serif",
      backgroundColor: "hsl(40 6% 97%)",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #81D8D0 0%, #5ec8be 100%)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span style={{
          fontFamily: "'Shippori Mincho', serif",
          color: "white", fontWeight: 600, fontSize: 16, letterSpacing: "0.06em",
        }}>
          The Prime 質數教室
        </span>
      </div>

      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(129,216,208,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            border: "2px solid rgba(129,216,208,0.3)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#81D8D0" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 18, fontWeight: 500,
            color: "hsl(220 9% 32%)",
            margin: "0 0 5px",
            letterSpacing: "0.08em",
          }}>
            手機 OTP 驗證
          </h2>
          <p style={{ fontSize: 12, color: "hsl(220 8% 48%)", margin: 0 }}>
            步驟 2 / 2：驗證您的手機號碼
          </p>
        </div>

        <div style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid hsl(40 6% 89%)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          padding: "20px 18px",
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "hsl(220 9% 32%)", marginTop: 0, marginBottom: 10 }}>
            輸入手機號碼
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)",
              }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 52%)" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input
                type="tel"
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 30, paddingRight: 10,
                  paddingTop: 9, paddingBottom: 9,
                  border: "1px solid hsl(40 6% 82%)",
                  borderRadius: 8, fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  color: "hsl(220 9% 32%)",
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              />
            </div>
            <button
              onClick={() => phone.length >= 10 && setSent(true)}
              style={{
                padding: "9px 10px", borderRadius: 8,
                border: "none",
                background: phone.length >= 10 ? "#81D8D0" : "hsl(40 6% 82%)",
                color: phone.length >= 10 ? "white" : "hsl(220 8% 55%)",
                fontSize: 11, fontWeight: 600,
                cursor: phone.length >= 10 ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}
            >
              發送驗證碼
            </button>
          </div>
          <p style={{ fontSize: 10, color: "hsl(220 8% 55%)", margin: 0 }}>
            請輸入台灣手機號碼（09 開頭，共 10 碼）
          </p>
        </div>

        <div style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid hsl(40 6% 89%)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          padding: "20px 18px",
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 12, color: "hsl(220 8% 40%)", textAlign: "center", marginTop: 0, marginBottom: 4 }}>
            {sent ? `驗證碼已發送至 ${phone.slice(0, 4)}***${phone.slice(7)}` : "請輸入 6 位數驗證碼"}
          </p>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 4 }}>
            {otp.map((val, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={val}
                onChange={e => handleOtpChange(i, e.target.value)}
                style={{
                  width: 38, height: 48,
                  textAlign: "center",
                  fontSize: 20, fontWeight: 600,
                  border: i === 0 ? "2px solid #81D8D0" : "1px solid hsl(40 6% 82%)",
                  borderRadius: 9,
                  outline: "none",
                  color: "hsl(220 9% 32%)",
                  background: i === 0 ? "rgba(129,216,208,0.05)" : "white",
                  boxSizing: "border-box",
                  boxShadow: i === 0 ? "0 0 0 3px rgba(129,216,208,0.15)" : "none",
                  transition: "all 0.15s",
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: 10, color: "hsl(220 8% 55%)", textAlign: "center", margin: "8px 0 12px" }}>
            簡訊可能需要 30–60 秒才會送達
          </p>

          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "hsl(220 8% 50%)" }}>
              重新發送（
              <span style={{ color: "#81D8D0", fontVariantNumeric: "tabular-nums" }}>
                {countdown}s
              </span>
              ）
            </span>
          </div>

          <button style={{
            width: "100%", padding: "11px 0", borderRadius: 8,
            border: "none",
            background: "#81D8D0",
            color: "white", fontWeight: 700, fontSize: 14,
            cursor: "pointer",
            letterSpacing: "0.04em",
            opacity: otp.every(v => v !== "") ? 1 : 0.45,
          }}>
            驗證並進入
          </button>
        </div>

        <div style={{
          padding: "10px 12px",
          background: "rgba(129,216,208,0.08)",
          borderRadius: 10,
          border: "1px solid rgba(129,216,208,0.2)",
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#81D8D0" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: 10, color: "hsl(220 8% 45%)", margin: 0, lineHeight: 1.6 }}>
            驗證成功後，您可使用 LINE 一鍵登入質數教室，無需記憶帳號密碼。
          </p>
        </div>
      </div>
    </div>
  );
}
