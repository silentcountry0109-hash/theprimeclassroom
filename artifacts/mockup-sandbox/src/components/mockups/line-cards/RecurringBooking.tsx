import { LineCardShell } from './_shared/LineCardShell';

const SLOTS = [
  { date: '2026/05/03（日）', time: '10:00 – 11:00' },
  { date: '2026/05/10（日）', time: '10:00 – 11:00' },
  { date: '2026/05/17（日）', time: '10:00 – 11:00' },
  { date: '2026/05/24（日）', time: '10:00 – 11:00' },
];

export function RecurringBooking() {
  return (
    <LineCardShell
      ip="ip-recurring.png"
      accent="linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)"
      title="📅 連排預約成功！"
      subtitle="共 12 堂課程已排定"
      titleColor="#2A8F86"
      subColor="#6acfc8"
      ctaLabel="查看完整課表 →"
      ctaBg="#81D8D0"
      timestamp="上午 11:08"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#4fbdb4' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {SLOTS.map((s) => (
          <div key={s.date} className="slot-list-item">
            <span className="dt">📅 {s.date}</span>
            <span className="tm">{s.time}</span>
          </div>
        ))}
        <div style={{ fontSize: 10.5, color: '#888', padding: '6px 0 0', textAlign: 'center' }}>
          …等共 12 堂
        </div>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">老師</span>
        <span className="info-value">林老師</span>
      </div>
      <div className="info-row">
        <span className="info-label">地點</span>
        <span className="info-value">台北信義分校</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">剩餘</span>
        <span className="info-value"><span className="credit-badge">🎫 8 堂</span></span>
      </div>
    </LineCardShell>
  );
}
