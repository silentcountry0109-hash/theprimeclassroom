const serif = { fontFamily: "'Shippori Mincho', serif" };

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-5 py-12" style={{ color: "#3C3A36" }}>
      <div className="w-full max-w-md text-center" data-testid="maintenance-page">
        <div style={{ ...serif, fontSize: 25, letterSpacing: "0.34em", color: "#2E2C28", paddingLeft: "0.34em" }}>
          質 數 教 室
        </div>
        <div style={{ fontSize: 11.5, letterSpacing: "0.16em", color: "#5FA9A2", marginTop: 9 }}>
          THE PRIME · 國小數學個別指導
        </div>

        <div style={{ width: 46, height: 1, background: "#E4E1D8", margin: "26px auto 30px" }} />

        <div
          style={{
            width: 104, height: 104, borderRadius: "50%", background: "#EAF6F4", border: "1px solid #CDEBE7",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 22px",
          }}
        >
          <div style={{ ...serif, fontSize: 30, letterSpacing: "0.04em", color: "#2F8F86", lineHeight: 1 }}>7／3</div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "#5FA9A2", marginTop: 5 }}>重新開放</div>
        </div>

        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "#EAF6F4", color: "#2F8F86",
            fontSize: 12.5, letterSpacing: "0.1em", padding: "6px 15px", borderRadius: 999, marginBottom: 20,
          }}
        >
          系統維護中
        </div>

        <div style={{ ...serif, fontSize: 22, lineHeight: 1.9, letterSpacing: "0.06em", color: "#33312D" }}>
          感謝各位家長<br />這一個月協助封測
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.95, color: "#54514A", marginTop: 18 }}>
          系統將在{" "}
          <span style={{ ...serif, color: "#D08378", fontSize: 17, letterSpacing: "0.02em" }}>7／3</span>{" "}
          重新開放,<br />您的一切資訊將會正確且正常上線。
        </div>

        <div
          style={{
            background: "#FFF9E5", border: "1px solid #F1E6BE", borderRadius: 14, padding: "17px 20px",
            margin: "26px 0 8px", textAlign: "center",
          }}
        >
          <div style={{ color: "#8A6D2F", fontSize: 12.5, letterSpacing: "0.08em", marginBottom: 9 }}>給正在上課的家長</div>
          <div style={{ fontSize: 14.5, lineHeight: 1.9, color: "#6B5A35" }}>
            有上課的家長請正常到班即可,<br />孩子的權益不會受到任何影響。
          </div>
        </div>

        <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "#9A968C", marginTop: 24 }}>
          THE PRIME 質數教室　敬上
        </div>
      </div>
    </div>
  );
}
