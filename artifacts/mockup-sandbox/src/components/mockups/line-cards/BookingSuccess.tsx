import { LineCardShell } from './_shared/LineCardShell';

export function BookingSuccess() {
  return (
    <LineCardShell
      ip="ip-booking.png"
      accent="linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)"
      title="✅ 課程預約成功！"
      subtitle="The Prime 質數教室"
      titleColor="#2A8F86"
      subColor="#6acfc8"
      ctaLabel="查看預約詳情 →"
      ctaBg="#81D8D0"
      timestamp="上午 10:23"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#4fbdb4' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 日期</span>
        <span className="info-value">2026/05/03（日）</span>
      </div>
      <div className="info-row">
        <span className="info-label">🕙 時間</span>
        <span className="info-value">10:00 – 11:00</span>
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
      <div className="info-row">
        <span className="info-label">剩餘</span>
        <span className="info-value"><span className="credit-badge">🎫 5 堂</span></span>
      </div>
    </LineCardShell>
  );
}
