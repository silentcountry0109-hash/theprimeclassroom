export function PurchaseHistoryCanvas() {
  const previewUrl = `${import.meta.env.BASE_URL}preview/credits-purchase/PurchaseHistory`.replace(/\/\//g, "/");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px 24px 48px",
        fontFamily: "'Noto Sans TC', system-ui, sans-serif",
      }}
    >
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#1e293b",
            letterSpacing: "0.04em",
          }}
        >
          點數購買紀錄 — 頁面模擬預覽
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          1280 × 900 · 假資料模擬 · 互動功能可用
        </p>
      </div>

      <div
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          width: 1280,
          height: 900,
          background: "#FAF9F6",
          flexShrink: 0,
        }}
      >
        <iframe
          src={previewUrl}
          style={{
            width: 1280,
            height: 900,
            border: "none",
            display: "block",
          }}
          title="點數購買紀錄模擬"
        />
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#94a3b8",
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <span>✓ 統計卡（筆數、收款金額、發放堂數）</span>
        <span>✓ 篩選列（搜尋、日期、方式、狀態）</span>
        <span>✓ 資料表格（10 筆模擬資料）</span>
        <span>✓ 互動篩選</span>
      </div>
    </div>
  );
}

export default PurchaseHistoryCanvas;
