import { LineCardShell } from './_shared/LineCardShell';

export function ContactBookFilled() {
  return (
    <LineCardShell
      ip="ip-contact.png"
      accent="linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)"
      title="📒 聯絡簿已填寫"
      subtitle="今日課後記錄已完成"
      titleColor="#e06860"
      subColor="#f0847c"
      ctaLabel="查看聯絡簿 →"
      ctaBg="#FFB7B2"
      timestamp="下午 12:05"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#f0847c' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 課程</span>
        <span className="info-value">2026/05/03（日）10:00</span>
      </div>
      <div className="info-row">
        <span className="info-label">👩‍🏫 老師</span>
        <span className="info-value">林老師</span>
      </div>
      <div className="info-row">
        <span className="info-label">📖 單元</span>
        <span className="info-value">三上 · 第 4 單元 分數的認識</span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11.5, color: '#444', background: '#FFF8F7', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #FFE4E1' }}>
        🎯 今日表現：<strong style={{ color: '#e06860' }}>★★★★☆</strong>
        <br />
        老師已完成今日課後紀錄，請至 App 查看詳情！
      </div>
    </LineCardShell>
  );
}
