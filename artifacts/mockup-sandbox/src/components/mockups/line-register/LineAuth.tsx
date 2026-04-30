import "./_group.css";
import { useState } from "react";

export function LineAuth() {
  const [addFriend, setAddFriend] = useState(true);

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{
        background: "#06C755",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <svg viewBox="0 0 48 48" width="28" height="28" fill="white">
          <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4zm-6.5 20.5h-4v-9.5h2v7.5h2v2zm3 0h-2v-9.5h2v9.5zm8 0h-2l-4-6v6h-2v-9.5h2l4 6v-6h2v9.5zm5 0h-5.5v-9.5h5.5v2H28v1.75h3v2h-3v1.75h3.5v2z" />
        </svg>
        <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: "0.05em" }}>LINE</span>
      </div>

      <div style={{ padding: "28px 24px 0", textAlign: "center" }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: 16,
          background: "linear-gradient(135deg, #81D8D0 0%, #4db8af 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          boxShadow: "0 4px 14px rgba(129,216,208,0.4)"
        }}>
          <span style={{ fontSize: 28 }}>質</span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: "0 0 4px" }}>
          質數教室
        </p>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          primeclassroom.tw
        </p>
      </div>

      <div style={{ padding: "24px 24px 0" }}>
        <p style={{ fontSize: 13, color: "#333", margin: "0 0 12px", fontWeight: 500 }}>
          申請取得以下權限
        </p>
        <div style={{ border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
          {[
            { icon: "👤", text: "取得您的個人資料（顯示名稱及大頭貼）" },
            { icon: "✉️", text: "取得您的電子郵件地址" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "13px 16px",
              borderBottom: i === 0 ? "1px solid #f0f0f0" : "none",
              background: "white",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#444", lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <div style={{
          border: "1px solid #e8e8e8",
          borderRadius: 10,
          background: "white",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid #f0f0f0",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #06C755 0%, #00a443 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(6,199,85,0.3)"
            }}>
              <span style={{ fontSize: 20 }}>質</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: "0 0 2px" }}>
                質數教室 官方帳號
              </p>
              <p style={{ fontSize: 11, color: "#888", margin: 0 }}>
                課程通知・點數提醒・老師訊息
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <div
                onClick={() => setAddFriend(v => !v)}
                style={{
                  width: 44, height: 26, borderRadius: 13,
                  background: addFriend ? "#06C755" : "#ccc",
                  position: "relative",
                  transition: "background 0.2s",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 3, left: addFriend ? 21 : 3,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s",
                }} />
              </div>
            </label>
          </div>
          <div style={{ padding: "10px 16px" }}>
            <p style={{ fontSize: 11, color: "#999", margin: 0, lineHeight: 1.5 }}>
              {addFriend
                ? "✓ 將自動加入好友，往後可接收課程通知與老師訊息"
                : "關閉後，您仍可登入，但將無法接收課程相關通知"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 24px 12px" }}>
        <button
          style={{
            width: "100%", padding: "13px 0",
            borderRadius: 10, border: "none",
            background: "#06C755", color: "white",
            fontWeight: 700, fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(6,199,85,0.35)",
          }}
        >
          同意並繼續
        </button>
        <button
          style={{
            width: "100%", padding: "12px 0", marginTop: 10,
            borderRadius: 10, border: "1px solid #e0e0e0",
            background: "white", color: "#555",
            fontWeight: 500, fontSize: 14,
            cursor: "pointer",
          }}
        >
          取消
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", padding: "0 24px 24px", margin: 0, lineHeight: 1.6 }}>
        同意後，質數教室可依其隱私政策使用您的資料。<br />
        LINE Login 提供安全授權，不會洩露您的密碼。
      </p>
    </div>
  );
}
