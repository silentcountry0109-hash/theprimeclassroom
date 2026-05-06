import "./_group.css";

export function LoginEntry({ onNext }: { onNext?: () => void } = {}) {
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
        padding: "36px 24px 28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -10,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          position: "relative",
        }}>
          <span style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 32, fontWeight: 600,
            color: "#81D8D0",
          }}>質</span>
        </div>
        <h1 style={{
          fontFamily: "'Shippori Mincho', serif",
          fontSize: 20, fontWeight: 600,
          color: "white",
          margin: "0 0 4px",
          letterSpacing: "0.1em",
        }}>
          The Prime 質數教室
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0, letterSpacing: "0.05em" }}>
          專為國小生設計的數學精修課程
        </p>
      </div>

      <div style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 18, fontWeight: 500,
            color: "hsl(220 9% 32%)",
            margin: "0 0 6px",
            letterSpacing: "0.06em",
          }}>
            歡迎登入
          </h2>
          <p style={{ fontSize: 12, color: "hsl(220 8% 50%)", margin: 0 }}>
            使用 LINE 帳號快速登入，無需另外註冊
          </p>
        </div>

        <div style={{
          background: "white",
          borderRadius: 14,
          border: "1px solid hsl(40 6% 88%)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          padding: "24px 20px",
          marginBottom: 20,
        }}>
          <button
            onClick={onNext}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 10,
              border: "none",
              background: "#06C755",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 14px rgba(6,199,85,0.35)",
              letterSpacing: "0.03em",
            }}
          >
            <svg viewBox="0 0 48 48" width="22" height="22" fill="white">
              <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4z" />
            </svg>
            用 LINE 帳號登入
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
            <span style={{ fontSize: 11, color: "hsl(220 8% 55%)" }}>安全授權</span>
            <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            {[
              { icon: "🔒", text: "LINE 官方授權" },
              { icon: "📱", text: "OTP 雙重驗證" },
              { icon: "🛡️", text: "資料安全加密" },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{item.icon}</div>
                <div style={{ fontSize: 10, color: "hsl(220 8% 50%)", lineHeight: 1.3, whiteSpace: "nowrap" }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: "rgba(129,216,208,0.08)",
          borderRadius: 10,
          border: "1px solid rgba(129,216,208,0.25)",
          padding: "12px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>ℹ️</span>
          <p style={{ fontSize: 11, color: "hsl(220 8% 42%)", margin: 0, lineHeight: 1.6 }}>
            登入時將同時加入質數教室 LINE 官方帳號，方便接收課程通知與老師訊息。
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <p style={{ fontSize: 10, color: "hsl(220 8% 58%)", textAlign: "center", margin: "16px 0 0", lineHeight: 1.7 }}>
          登入即表示您同意本平台的
          <span style={{ color: "#81D8D0", textDecoration: "underline", cursor: "pointer" }}>服務條款</span>
          {" "}與{" "}
          <span style={{ color: "#81D8D0", textDecoration: "underline", cursor: "pointer" }}>隱私政策</span>
        </p>
      </div>
    </div>
  );
}
