import "./_group.css";
import { useState } from "react";

export function LineAuth({ onNext }: { onNext?: () => void } = {}) {
  const [addFriend, setAddFriend] = useState(true);

  return (
    <div style={{
      fontFamily: "'Noto Sans TC', sans-serif",
      backgroundColor: "#ffffff",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        background: "#06C755",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <svg viewBox="0 0 48 48" width="26" height="26" fill="white">
          <path d="M24 4C12.95 4 4 11.82 4 21.41c0 8.44 7.49 15.52 17.6 16.87l.68.1v6.62c0 .54.63.84 1.04.49l7.6-6.54c7.4-1.55 13.08-7.4 13.08-14.54C44 11.82 35.05 4 24 4z" />
        </svg>
        <span style={{ color: "white", fontWeight: 700, fontSize: 17, letterSpacing: "0.05em" }}>LINE</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>安全授權</span>
      </div>

      <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px", letterSpacing: "0.03em" }}>
          以下應用程式要求取得您的授權
        </p>
        <div style={{
          width: 68, height: 68,
          borderRadius: 16,
          background: "linear-gradient(135deg, #81D8D0 0%, #5ec8be 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 10px",
          boxShadow: "0 4px 14px rgba(129,216,208,0.4)",
        }}>
          <span style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 28, fontWeight: 600, color: "white",
          }}>質</span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 3px" }}>
          The Prime 質數教室
        </p>
        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 4px" }}>
          primeclassroom.tw
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "#f0faf4", borderRadius: 20,
          padding: "3px 10px", marginBottom: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06C755" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: 10, color: "#06C755", fontWeight: 600 }}>已驗證開發者</span>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#555", margin: "0 0 10px" }}>
          授權 The Prime 存取您的資料
        </p>
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          {[
            { icon: "👤", text: "取得您的個人資料（顯示名稱及大頭貼）" },
            { icon: "✉️", text: "取得您的電子郵件地址" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              borderBottom: i === 0 ? "1px solid #f5f5f5" : "none",
              background: "white",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 20px 0" }}>
        <div style={{
          border: "2px solid #06C755",
          borderRadius: 10,
          background: addFriend ? "#f0faf4" : "white",
          overflow: "hidden",
          transition: "all 0.2s",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            borderBottom: "1px solid #edf7f0",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #06C755 0%, #00a443 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(6,199,85,0.3)",
            }}>
              <span style={{
                fontFamily: "'Shippori Mincho', serif",
                fontSize: 18, fontWeight: 600, color: "white",
              }}>質</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: "0 0 2px" }}>
                同時加入好友
              </p>
              <p style={{ fontSize: 10, color: "#888", margin: 0 }}>
                質數教室 官方帳號
              </p>
            </div>
            <div
              onClick={() => setAddFriend(v => !v)}
              style={{
                width: 42, height: 24, borderRadius: 12,
                background: addFriend ? "#06C755" : "#ccc",
                position: "relative",
                transition: "background 0.2s",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: 2, left: addFriend ? 20 : 2,
                width: 20, height: 20,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "left 0.2s",
              }} />
            </div>
          </div>
          <div style={{ padding: "8px 14px" }}>
            <p style={{ fontSize: 10, color: addFriend ? "#06C755" : "#999", margin: 0, lineHeight: 1.5 }}>
              {addFriend
                ? "✓ 登入後自動加入好友，接收課程通知與老師訊息"
                : "關閉後，您仍可登入，但將無法接收課程相關通知"}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: 8,
          display: "flex", alignItems: "flex-start", gap: 6,
          padding: "8px 10px",
          background: "#fffbf0",
          borderRadius: 8,
          border: "1px solid #ffe8a0",
        }}>
          <span style={{ fontSize: 12, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 10, color: "#b58a00", margin: 0, lineHeight: 1.5 }}>
            「加入好友」步驟已整合於此授權流程，無需額外操作即可完成。
          </p>
        </div>
      </div>

      <div style={{ padding: "20px 20px 10px" }}>
        <button
          onClick={onNext}
          style={{
            width: "100%", padding: "13px 0",
            borderRadius: 10, border: "none",
            background: "#06C755", color: "white",
            fontWeight: 700, fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(6,199,85,0.35)",
            letterSpacing: "0.03em",
          }}
        >
          同意並登入
        </button>
        <button
          style={{
            width: "100%", padding: "11px 0", marginTop: 8,
            borderRadius: 10, border: "1px solid #e0e0e0",
            background: "white", color: "#666",
            fontWeight: 500, fontSize: 13,
            cursor: "pointer",
          }}
        >
          取消
        </button>
      </div>

      <p style={{
        textAlign: "center", fontSize: 10, color: "#ccc",
        padding: "0 20px 16px", margin: 0, lineHeight: 1.6,
      }}>
        同意後，質數教室可依其隱私政策使用您的資料。<br />
        LINE Login 提供安全授權，不會洩露您的密碼。
      </p>
    </div>
  );
}
