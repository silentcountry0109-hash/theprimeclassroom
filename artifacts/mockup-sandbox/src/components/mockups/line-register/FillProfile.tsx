import "./_group.css";

const LINE_LOGO_SMALL = (
  <svg viewBox="0 0 48 48" width="14" height="14" fill="white">
    <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
  </svg>
);

export function FillProfile() {
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
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#06C755", color: "white", borderRadius: 20, padding: "4px 12px 4px 8px", fontSize: 12, marginBottom: 16 }}>
              {LINE_LOGO_SMALL}
              已透過 LINE 授權
            </div>

            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #06C755 0%, #00a443 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 4px 12px rgba(6,199,85,0.3)"
              }}>
                <svg viewBox="0 0 48 48" width="42" height="42" fill="white">
                  <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
                </svg>
              </div>
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 22, height: 22, borderRadius: "50%",
                background: "#81D8D0", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <p style={{ fontSize: 15, fontWeight: 500, color: "hsl(220 9% 32%)", margin: "10px 0 2px" }}>王小明</p>
            <p style={{ fontSize: 12, color: "hsl(220 8% 55%)", margin: 0 }}>LINE 顯示名稱（已預填）</p>
          </div>

          <div style={{ background: "white", borderRadius: 12, border: "1px solid hsl(40 6% 91%)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 24 }}>
            <p style={{ fontSize: 13, color: "hsl(220 8% 38%)", marginBottom: 20, marginTop: 0 }}>
              請補充以下資料以完成註冊
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>
                  姓名 <span style={{ color: "#FFB7B2" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <input
                    defaultValue="王小明"
                    style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", color: "hsl(220 9% 32%)" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>
                  帳號 <span style={{ color: "#FFB7B2" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    placeholder="設定登入帳號（至少 3 個字元）"
                    style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>
                  密碼 <span style={{ color: "#FFB7B2" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    placeholder="設定密碼（至少 6 個字元）"
                    style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>
                  手機號碼 <span style={{ color: "#FFB7B2" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      placeholder="0912345678"
                      style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <button style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid hsl(40 6% 85%)", background: "white", fontSize: 12, color: "hsl(220 9% 32%)", cursor: "pointer", whiteSpace: "nowrap" }}>
                    發送驗證碼
                  </button>
                </div>
              </div>

              <button style={{ width: "100%", padding: "11px 0", borderRadius: 8, border: "none", background: "#81D8D0", color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer", marginTop: 4 }}>
                完成註冊
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "hsl(220 8% 55%)", marginTop: 20 }}>
            完成後可繼續使用 LINE 一鍵登入
          </p>
        </div>
      </div>
    </div>
  );
}
