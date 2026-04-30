import "./_group.css";
import { useState } from "react";

const LINE_LOGO = (
  <svg viewBox="0 0 48 48" width="20" height="20" fill="white">
    <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
  </svg>
);

export function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", backgroundColor: "hsl(40 6% 97%)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="p-6">
        <span className="inline-flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: "hsl(220 8% 38%)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回官網
        </span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-8 pt-2">
        <div className="w-full" style={{ maxWidth: 360 }}>
          <div className="text-center mb-8">
            <h1 style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 24, letterSpacing: "0.15em", color: "hsl(220 9% 32%)", margin: "0 0 6px" }}>
              質數教室
            </h1>
            <p style={{ fontSize: 13, color: "hsl(220 8% 38%)", margin: 0 }}>
              {tab === "login" ? "家長登入" : "家長註冊"}
            </p>
          </div>

          <div className="flex gap-1 mb-4" style={{ backgroundColor: "hsl(40 8% 92%)", borderRadius: 8, padding: 4 }}>
            <button
              onClick={() => setTab("login")}
              className="flex-1 py-2 text-sm"
              style={{
                borderRadius: 6, border: "none", cursor: "pointer",
                background: tab === "login" ? "white" : "transparent",
                fontWeight: tab === "login" ? 500 : 400,
                color: tab === "login" ? "hsl(220 9% 32%)" : "hsl(220 8% 38%)",
                boxShadow: tab === "login" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              登入
            </button>
            <button
              onClick={() => setTab("register")}
              className="flex-1 py-2 text-sm"
              style={{
                borderRadius: 6, border: "none", cursor: "pointer",
                background: tab === "register" ? "white" : "transparent",
                fontWeight: tab === "register" ? 500 : 400,
                color: tab === "register" ? "hsl(220 9% 32%)" : "hsl(220 8% 38%)",
                boxShadow: tab === "register" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              註冊
            </button>
          </div>

          <div style={{ background: "white", borderRadius: 12, border: "1px solid hsl(40 6% 91%)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 24 }}>
            {tab === "login" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>帳號</label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      placeholder="請輸入帳號"
                      style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>密碼</label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="password"
                      placeholder="請輸入密碼"
                      style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" style={{ accentColor: "#81D8D0", width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: "hsl(220 8% 38%)" }}>記住帳號</span>
                </label>
                <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#81D8D0", color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                  登入
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
                  <span style={{ fontSize: 12, color: "hsl(220 8% 55%)", whiteSpace: "nowrap" }}>或</span>
                  <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
                </div>

                <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#06C755", color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {LINE_LOGO}
                  用 LINE 帳號繼續
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>姓名 <span style={{ color: "#FFB7B2" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <input placeholder="您的姓名" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>手機號碼 <span style={{ color: "#FFB7B2" }}>*</span></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input placeholder="0912345678" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <button style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid hsl(40 6% 85%)", background: "white", fontSize: 12, color: "hsl(220 9% 32%)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      發送驗證碼
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>Email <span style={{ color: "#FFB7B2" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input placeholder="your@email.com" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>帳號 <span style={{ color: "#FFB7B2" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <input placeholder="至少 3 個字元" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "hsl(220 9% 32%)", display: "block", marginBottom: 6 }}>密碼 <span style={{ color: "#FFB7B2" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(220 8% 38%)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input type="password" placeholder="至少 6 個字元" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: "1px solid hsl(40 6% 85%)", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#81D8D0", color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer", opacity: 0.5 }}>
                  註冊
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
                  <span style={{ fontSize: 12, color: "hsl(220 8% 55%)", whiteSpace: "nowrap" }}>或</span>
                  <div style={{ flex: 1, height: 1, background: "hsl(40 6% 88%)" }} />
                </div>

                <button style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#06C755", color: "white", fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {LINE_LOGO}
                  用 LINE 帳號繼續
                </button>
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "hsl(220 8% 55%)", marginTop: 20 }}>
            註冊即表示您同意我們的服務條款與隱私政策
          </p>
        </div>
      </div>
    </div>
  );
}
