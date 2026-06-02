import { LineCardShell } from './_shared/LineCardShell';

export function AdminBooked() {
  return (
    <LineCardShell
      ip="ip-admin.png"
      accent="linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)"
      title={<>✅ 課程已加排！<span className="admin-tag">分校代加</span></>}
      subtitle="由分校主任協助為您安排"
      titleColor="#2A8F86"
      subColor="#6acfc8"
      ctaLabel="查看課程詳情 →"
      ctaBg="#81D8D0"
      timestamp="下午 03:42"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#4fbdb4' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 日期</span>
        <span className="info-value">2026/05/05（二）</span>
      </div>
      <div className="info-row">
        <span className="info-label">🕙 時間</span>
        <span className="info-value">16:30 – 17:30</span>
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
      <div style={{ fontSize: 11, color: '#0369A1', background: '#F0F9FF', borderRadius: 8, padding: '7px 10px', lineHeight: 1.5, border: '1px solid #BAE6FD' }}>
        ℹ️ 此堂為分校主任代為加排，已扣 1 堂點數。如需異動請聯繫教室。
      </div>
    </LineCardShell>
  );
}
