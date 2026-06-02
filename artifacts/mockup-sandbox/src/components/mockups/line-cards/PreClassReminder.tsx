import { LineCardShell } from './_shared/LineCardShell';

export function PreClassReminder() {
  return (
    <LineCardShell
      ip="ip-reminder.png"
      accent="linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)"
      title="⏰ 上課提醒"
      subtitle="距離開課還有 2 小時"
      titleColor="#e06860"
      subColor="#f0847c"
      ctaLabel="查看課程資訊 →"
      ctaBg="#FFB7B2"
      timestamp="上午 08:03"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#f0847c' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 今天</span>
        <span className="info-value">2026/05/03（日）</span>
      </div>
      <div className="info-row">
        <span className="info-label">🕙 時間</span>
        <span className="info-value" style={{ fontWeight: 700, fontSize: 13 }}>10:00 – 11:00</span>
      </div>
      <div className="info-row">
        <span className="info-label">👩‍🏫 老師</span>
        <span className="info-value">林老師</span>
      </div>
      <div className="info-row">
        <span className="info-label">📍 地點</span>
        <span className="info-value">台北信義分校</span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, background: '#fff8f7', borderRadius: 8, padding: '6px 8px' }}>
        🙌 請提前 10 分鐘抵達，今天的課程已準備好囉！
      </div>
    </LineCardShell>
  );
}
