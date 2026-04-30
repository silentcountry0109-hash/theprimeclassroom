import "./_group.css";
import { useState } from "react";

const LINE_LOGO = (
  <svg viewBox="0 0 48 48" width="22" height="22" fill="white">
    <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
  </svg>
);

function QRCodeIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="44" height="44" rx="4" fill="none" stroke="#333" strokeWidth="4" />
      <rect x="18" y="18" width="24" height="24" rx="2" fill="#333" />
      <rect x="68" y="8" width="44" height="44" rx="4" fill="none" stroke="#333" strokeWidth="4" />
      <rect x="78" y="18" width="24" height="24" rx="2" fill="#333" />
      <rect x="8" y="68" width="44" height="44" rx="4" fill="none" stroke="#333" strokeWidth="4" />
      <rect x="18" y="78" width="24" height="24" rx="2" fill="#333" />
      <rect x="68" y="68" width="8" height="8" fill="#333" />
      <rect x="82" y="68" width="8" height="8" fill="#333" />
      <rect x="96" y="68" width="16" height="8" fill="#333" />
      <rect x="68" y="82" width="16" height="8" fill="#333" />
      <rect x="90" y="82" width="8" height="8" fill="#333" />
      <rect x="68" y="96" width="8" height="16" fill="#333" />
      <rect x="82" y="96" width="16" height="8" fill="#333" />
      <rect x="104" y="96" width="8" height="16" fill="#333" />
      <rect x="104" y="82" width="8" height="8" fill="#333" />
    </svg>
  );
}

export function BindLineOfficial({ onNext }: { onNext?: () => void } = {}) {
  const [joined, setJoined] = useState(false);

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
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(6,199,85,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              border: "2px solid rgba(6,199,85,0.25)"
            }}>
              <svg viewBox="0 0 48 48" width="32" height="32" fill="#06C755">
                <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 20, letterSpacing: "0.1em", color: "hsl(220 9% 32%)", margin: "0 0 6px" }}>
              綁定官方帳號
            </h2>
            <p style={{ fontSize: 13, color: "hsl(220 8% 45%)", margin: 0 }}>
              步驟 2 / 3：加入 LINE 官方帳號以接收通知
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: 14,
            border: "1px solid hsl(40 6% 91%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
            marginBottom: 16,
          }}>
            <div style={{ background: "#06C755", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {LINE_LOGO}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 2px" }}>質數教室 官方帳號</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: 0 }}>@primeclassroom</p>
              </div>
            </div>

            <div style={{ padding: "20px 16px" }}>
              <p style={{ fontSize: 12, color: "hsl(220 8% 45%)", textAlign: "center", marginTop: 0, marginBottom: 16 }}>
                使用手機掃描 QR Code，或點擊下方按鈕加入
              </p>
              <div style={{
                display: "flex", justifyContent: "center",
                padding: "16px",
                background: "hsl(40 6% 97%)",
                borderRadius: 10,
                border: "1px dashed hsl(40 6% 82%)",
                marginBottom: 16,
              }}>
                <QRCodeIcon />
              </div>

              <p style={{ fontSize: 11, color: "hsl(220 8% 55%)", textAlign: "center", margin: "0 0 14px" }}>
                掃描後，點擊「加入好友」即可完成綁定
              </p>

              <a
                href="#"
                onClick={e => e.preventDefault()}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "12px 0",
                  borderRadius: 10, border: "none",
                  background: "#06C755", color: "white",
                  fontWeight: 700, fontSize: 14,
                  cursor: "pointer",
                  textDecoration: "none",
                  boxSizing: "border-box",
                  boxShadow: "0 3px 10px rgba(6,199,85,0.3)",
                }}
              >
                {LINE_LOGO}
                點此加入好友
              </a>
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid hsl(40 6% 91%)",
            padding: "14px 16px",
            marginBottom: 20,
          }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={joined}
                onChange={e => setJoined(e.target.checked)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
              />
              <div
                aria-hidden="true"
                style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: joined ? "none" : "2px solid hsl(40 6% 75%)",
                  background: joined ? "#06C755" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {joined && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, color: "hsl(220 9% 32%)", lineHeight: 1.4 }}>
                我已加入「質數教室官方帳號」好友
              </span>
            </label>
          </div>

          <button
            disabled={!joined}
            onClick={joined ? onNext : undefined}
            style={{
              width: "100%", padding: "13px 0",
              borderRadius: 10, border: "none",
              background: joined ? "#81D8D0" : "hsl(40 6% 82%)",
              color: joined ? "white" : "hsl(220 8% 55%)",
              fontWeight: 700, fontSize: 14,
              cursor: joined ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: joined ? "0 3px 10px rgba(129,216,208,0.35)" : "none",
            }}
          >
            下一步：手機驗證
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "hsl(220 8% 55%)", marginTop: 16 }}>
            加入官方帳號後，即可接收課程通知與老師訊息
          </p>
        </div>
      </div>
    </div>
  );
}
