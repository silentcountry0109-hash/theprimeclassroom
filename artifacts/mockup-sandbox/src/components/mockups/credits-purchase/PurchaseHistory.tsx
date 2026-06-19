import { useState } from "react";
import {
  Search,
  CreditCard,
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Wallet,
  TrendingUp,
  Coins,
  ChevronDown,
  Filter,
  CalendarDays,
  X,
} from "lucide-react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Shippori+Mincho:wght@500;600;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  .font-serif { font-family: 'Shippori Mincho', serif; }
`;

type Status = "paid" | "pending" | "failed" | "refunded";
type Method = "credit_card" | "manual";

interface PurchaseRecord {
  id: string;
  date: string;
  packageName: string;
  credits: number;
  amount: number;
  status: Status;
  method: Method;
  transactionId: string;
  note?: string;
}

const RECORDS: PurchaseRecord[] = [
  {
    id: "1",
    date: "2026-06-15",
    packageName: "標準包 20堂",
    credits: 20,
    amount: 2800,
    status: "paid",
    method: "credit_card",
    transactionId: "ECPay-20260615-001",
  },
  {
    id: "2",
    date: "2026-06-10",
    packageName: "體驗包 8堂",
    credits: 8,
    amount: 1200,
    status: "paid",
    method: "credit_card",
    transactionId: "ECPay-20260610-034",
  },
  {
    id: "3",
    date: "2026-06-08",
    packageName: "手動補點（客服調整）",
    credits: 5,
    amount: 0,
    status: "paid",
    method: "manual",
    transactionId: "MANUAL-20260608-007",
    note: "課程延誤補償",
  },
  {
    id: "4",
    date: "2026-05-30",
    packageName: "衝刺包 40堂",
    credits: 40,
    amount: 5200,
    status: "refunded",
    method: "credit_card",
    transactionId: "ECPay-20260530-019",
    note: "家長申請全額退款",
  },
  {
    id: "5",
    date: "2026-05-22",
    packageName: "標準包 20堂",
    credits: 20,
    amount: 2800,
    status: "paid",
    method: "credit_card",
    transactionId: "ECPay-20260522-088",
  },
  {
    id: "6",
    date: "2026-05-18",
    packageName: "體驗包 8堂",
    credits: 8,
    amount: 1200,
    status: "failed",
    method: "credit_card",
    transactionId: "ECPay-20260518-102",
    note: "信用卡授權失敗",
  },
  {
    id: "7",
    date: "2026-05-10",
    packageName: "新生禮免費體驗",
    credits: 3,
    amount: 0,
    status: "paid",
    method: "manual",
    transactionId: "MANUAL-20260510-004",
    note: "新生報名贈點",
  },
  {
    id: "8",
    date: "2026-04-28",
    packageName: "標準包 20堂",
    credits: 20,
    amount: 2800,
    status: "pending",
    method: "credit_card",
    transactionId: "ECPay-20260428-055",
    note: "等待 ECPay 確認中",
  },
  {
    id: "9",
    date: "2026-04-15",
    packageName: "衝刺包 40堂",
    credits: 40,
    amount: 5200,
    status: "paid",
    method: "credit_card",
    transactionId: "ECPay-20260415-071",
  },
  {
    id: "10",
    date: "2026-03-20",
    packageName: "手動補點（促銷活動）",
    credits: 10,
    amount: 0,
    status: "paid",
    method: "manual",
    transactionId: "MANUAL-20260320-002",
    note: "春季優惠補發",
  },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  paid: { label: "已付款", color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle },
  pending: { label: "待確認", color: "#d97706", bg: "#fffbeb", icon: Clock },
  failed: { label: "失敗", color: "#dc2626", bg: "#fef2f2", icon: XCircle },
  refunded: { label: "已退款", color: "#7c3aed", bg: "#f5f3ff", icon: RotateCcw },
};

const METHOD_CONFIG: Record<Method, { label: string; icon: typeof CreditCard }> = {
  credit_card: { label: "線上刷卡", icon: CreditCard },
  manual: { label: "手動加點", icon: Gift },
};

const STATUS_FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "paid", label: "已付款" },
  { key: "pending", label: "待確認" },
  { key: "failed", label: "失敗" },
  { key: "refunded", label: "已退款" },
];

function formatAmount(amount: number) {
  return amount === 0 ? "免費" : `NT$ ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function PurchaseHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [methodFilter, setMethodFilter] = useState<Method | "all">("all");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);

  const filtered = RECORDS.filter((r) => {
    const matchSearch =
      !search ||
      r.packageName.includes(search) ||
      r.transactionId.includes(search) ||
      (r.note && r.note.includes(search));
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchMethod = methodFilter === "all" || r.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const stats = {
    total: RECORDS.filter((r) => r.status === "paid" || r.status === "refunded").length,
    revenue: RECORDS.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0),
    credits: RECORDS.filter((r) => r.status === "paid").reduce((s, r) => s + r.credits, 0),
  };

  const statCards = [
    {
      label: "購買筆數",
      value: stats.total,
      unit: "筆",
      icon: TrendingUp,
      color: "#81D8D0",
      bg: "rgba(129,216,208,0.1)",
    },
    {
      label: "累計收款金額",
      value: `NT$ ${stats.revenue.toLocaleString()}`,
      unit: "",
      icon: Wallet,
      color: "#FFB7B2",
      bg: "rgba(255,183,178,0.1)",
    },
    {
      label: "發放堂數",
      value: stats.credits,
      unit: "堂",
      icon: Coins,
      color: "#d97706",
      bg: "#fffbeb",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF9F6",
        fontFamily: "'Noto Sans TC', system-ui, sans-serif",
        color: "#1e293b",
        fontSize: 14,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Shippori Mincho', serif", letterSpacing: "0.05em" }}>
          點數購買紀錄
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
          查看所有點數購買交易與發放記錄
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px" }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: 20, height: 20, color: card.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                    {card.value}
                    {card.unit && <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280", marginLeft: 3 }}>{card.unit}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
              <Search
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="搜尋方案名稱、交易編號..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  paddingLeft: 32,
                  paddingRight: search ? 32 : 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#f9fafb",
                  color: "#1e293b",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9ca3af",
                    display: "flex",
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Date Range (decorative) */}
            <button
              style={{
                height: 36,
                padding: "0 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                background: "#f9fafb",
                color: "#374151",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <CalendarDays style={{ width: 14, height: 14, color: "#6b7280" }} />
              2026/03 – 2026/06
            </button>

            {/* Method Filter */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                style={{
                  height: 36,
                  padding: "0 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  background: methodFilter !== "all" ? "rgba(129,216,208,0.08)" : "#f9fafb",
                  borderColor: methodFilter !== "all" ? "#81D8D0" : "#e5e7eb",
                  color: methodFilter !== "all" ? "#2C857D" : "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <Filter style={{ width: 14, height: 14 }} />
                {methodFilter === "all" ? "付款方式" : METHOD_CONFIG[methodFilter].label}
                <ChevronDown style={{ width: 13, height: 13, color: "#9ca3af" }} />
              </button>
              {showMethodDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: 40,
                    left: 0,
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    zIndex: 10,
                    minWidth: 140,
                    overflow: "hidden",
                  }}
                >
                  {(["all", "credit_card", "manual"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMethodFilter(m); setShowMethodDropdown(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 14px",
                        fontSize: 13,
                        background: methodFilter === m ? "rgba(129,216,208,0.1)" : "transparent",
                        color: methodFilter === m ? "#2C857D" : "#374151",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: methodFilter === m ? 600 : 400,
                      }}
                    >
                      {m === "all" ? "全部方式" : METHOD_CONFIG[m].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map((f) => {
              const isActive = statusFilter === f.key;
              const cfg = f.key !== "all" ? STATUS_CONFIG[f.key] : null;
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  style={{
                    height: 30,
                    padding: "0 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    border: isActive ? `1.5px solid ${cfg?.color ?? "#81D8D0"}` : "1px solid #e5e7eb",
                    background: isActive ? (cfg?.bg ?? "rgba(129,216,208,0.12)") : "#fff",
                    color: isActive ? (cfg?.color ?? "#2C857D") : "#6b7280",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                  {f.key !== "all" && (
                    <span
                      style={{
                        marginLeft: 5,
                        background: isActive ? (cfg?.color ?? "#81D8D0") : "#e5e7eb",
                        color: isActive ? "#fff" : "#6b7280",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                      }}
                    >
                      {RECORDS.filter((r) => r.status === f.key).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 90px 110px 90px 100px",
              padding: "10px 16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.04em",
            }}
          >
            <div>日期</div>
            <div>方案名稱</div>
            <div style={{ textAlign: "center" }}>發放堂數</div>
            <div style={{ textAlign: "right" }}>金額</div>
            <div style={{ textAlign: "center" }}>付款方式</div>
            <div style={{ textAlign: "center" }}>狀態</div>
          </div>

          {/* Table Body */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              沒有符合條件的記錄
            </div>
          ) : (
            filtered.map((record, idx) => {
              const statusCfg = STATUS_CONFIG[record.status];
              const methodCfg = METHOD_CONFIG[record.method];
              const StatusIcon = statusCfg.icon;
              const MethodIcon = methodCfg.icon;
              return (
                <div
                  key={record.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 90px 110px 90px 100px",
                    padding: "13px 16px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                    alignItems: "center",
                    transition: "background 0.1s",
                    background: record.status === "failed" ? "#fef9f9" : record.status === "pending" ? "#fffdf5" : "transparent",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      record.status === "failed" ? "#fef9f9" : record.status === "pending" ? "#fffdf5" : "transparent";
                  }}
                >
                  {/* Date */}
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{formatDate(record.date)}</div>

                  {/* Package Name */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{record.packageName}</div>
                    {record.note && (
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{record.note}</div>
                    )}
                    <div style={{ fontSize: 10, color: "#c4c9d1", marginTop: 1, fontFamily: "monospace" }}>
                      {record.transactionId}
                    </div>
                  </div>

                  {/* Credits */}
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#81D8D0",
                      }}
                    >
                      {record.credits}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 2 }}>堂</span>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: record.amount === 0 ? "#9ca3af" : "#0f172a",
                      }}
                    >
                      {formatAmount(record.amount)}
                    </span>
                  </div>

                  {/* Method */}
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        background: record.method === "credit_card" ? "rgba(129,216,208,0.1)" : "rgba(255,183,178,0.1)",
                        color: record.method === "credit_card" ? "#2C857D" : "#c75d56",
                        fontWeight: 500,
                      }}
                    >
                      <MethodIcon style={{ width: 11, height: 11 }} />
                      {methodCfg.label}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        padding: "4px 9px",
                        borderRadius: 12,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        fontWeight: 600,
                      }}
                    >
                      <StatusIcon style={{ width: 11, height: 11 }} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Footer */}
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#9ca3af",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>共 {filtered.length} 筆記錄</span>
          <span>顯示 {filtered.length} / {RECORDS.length} 筆</span>
        </div>
      </div>
    </div>
  );
}

export default PurchaseHistory;
