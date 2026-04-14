import { useState } from "react";

const TIFFANY = "#81D8D0";
const CORAL = "#FFB7B2";

const units = [
  { id: 1, unitCode: "A_01", unitName: "整數與數線", covered: true, lastDate: "2026/03/05", lastScore: 95, lastTotal: 100, sessionCount: 2 },
  { id: 2, unitCode: "A_02", unitName: "加減法應用", covered: true, lastDate: "2026/03/18", lastScore: 88, lastTotal: 100, sessionCount: 1 },
  { id: 3, unitCode: "A_03", unitName: "乘法與倍數", covered: true, lastDate: "2026/04/01", lastScore: 72, lastTotal: 100, sessionCount: 3 },
  { id: 4, unitCode: "A_04", unitName: "除法基礎", covered: true, lastDate: "2026/04/08", lastScore: 80, lastTotal: 100, sessionCount: 1 },
  { id: 5, unitCode: "A_05", unitName: "分數概念", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 6, unitCode: "A_06", unitName: "小數與計算", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 7, unitCode: "A_07", unitName: "幾何圖形", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 8, unitCode: "A_08", unitName: "面積與周長", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 9, unitCode: "A_09", unitName: "時間與單位", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 10, unitCode: "A_10", unitName: "統計與圖表", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 11, unitCode: "A_11", unitName: "應用題解析", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
  { id: 12, unitCode: "A_12", unitName: "綜合練習", covered: false, lastDate: null, lastScore: null, lastTotal: null, sessionCount: 0 },
];

const covered = units.filter(u => u.covered);
const avgScore = Math.round(covered.reduce((s, u) => s + (u.lastScore ?? 0), 0) / covered.length);

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{ color, fontWeight: 600, fontSize: 12 }}>
      {score}/{total}
    </span>
  );
}

function UnitCard({ unit }: { unit: typeof units[0] }) {
  const [open, setOpen] = useState(false);

  if (unit.covered) {
    return (
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: `${TIFFANY}22`,
          border: `1.5px solid ${TIFFANY}`,
          borderRadius: 10,
          padding: "12px 14px",
          cursor: "pointer",
          transition: "box-shadow 0.15s",
          boxShadow: open ? `0 0 0 2px ${TIFFANY}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: TIFFANY, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0, marginTop: 1
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 1 }}>{unit.unitCode}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", lineHeight: 1.3 }}>{unit.unitName}</div>
            {!open && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#6b7280" }}>
                {unit.lastDate} · <ScoreBadge score={unit.lastScore!} total={unit.lastTotal!} />
              </div>
            )}
          </div>
        </div>
        {open && (
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: `1px solid ${TIFFANY}55`,
            fontSize: 12, color: "#374151",
            display: "flex", flexDirection: "column", gap: 4
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>最近上課</span>
              <span style={{ fontWeight: 500 }}>{unit.lastDate}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>測驗成績</span>
              <ScoreBadge score={unit.lastScore!} total={unit.lastTotal!} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>上課次數</span>
              <span style={{ fontWeight: 500 }}>{unit.sessionCount} 次</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "#f9fafb",
      border: "1.5px solid #e5e7eb",
      borderRadius: 10,
      padding: "12px 14px",
      opacity: 0.75,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          border: "1.5px solid #d1d5db",
          background: "white",
          flexShrink: 0, marginTop: 1
        }} />
        <div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 1 }}>{unit.unitCode}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af", lineHeight: 1.3 }}>{unit.unitName}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: "#d1d5db" }}>尚未涉及</div>
        </div>
      </div>
    </div>
  );
}

export function LearningMap() {
  const pct = Math.round((covered.length / units.length) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Noto Sans TC', sans-serif",
      padding: "0 0 40px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #f0f0f0",
        padding: "16px 20px 14px",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: `${TIFFANY}22`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={TIFFANY} strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill={TIFFANY} stroke="none"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>小明的學習地圖</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>四年級・2025–2026 學年</div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>

        {/* Summary row */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10, marginBottom: 16
        }}>
          {[
            { label: "已學單元", value: `${covered.length}`, sub: `共 ${units.length} 單元`, color: TIFFANY },
            { label: "學習覆蓋率", value: `${pct}%`, sub: "依聯絡簿計算", color: "#6366f1" },
            { label: "平均測驗", value: `${avgScore}`, sub: "分（滿分 100）", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{
              background: "white", borderRadius: 10,
              border: "1px solid #f0f0f0",
              padding: "12px 12px 10px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          background: "white", borderRadius: 10,
          border: "1px solid #f0f0f0",
          padding: "12px 16px", marginBottom: 16
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>課程進度</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{covered.length} / {units.length} 單元</span>
          </div>
          <div style={{
            height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden"
          }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: `linear-gradient(90deg, ${TIFFANY}, #6ee7b7)`,
              borderRadius: 999, transition: "width 0.6s ease"
            }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#9ca3af" }}>
            ✓ 點擊已學習的單元格，可查看詳細紀錄
          </div>
        </div>

        {/* Section title */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          📚 四年級教材單元（共 {units.length} 個）
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10
        }}>
          {units.map(u => <UnitCard key={u.id} unit={u} />)}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 16, display: "flex", gap: 16,
          fontSize: 12, color: "#6b7280"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: TIFFANY }} />
            已學習
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1.5px solid #d1d5db", background: "white" }} />
            尚未涉及
          </div>
        </div>

      </div>
    </div>
  );
}
