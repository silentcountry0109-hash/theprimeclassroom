import { LineCardShell } from './_shared/LineCardShell';

export function NoCredits() {
  return (
    <LineCardShell
      ip="ip-nocredits.png"
      accent="linear-gradient(135deg, #FFB7B2 0%, #C97B7B 100%)"
      title="🔴 點數已用完"
      subtitle="請盡快加值，確保課程不中斷"
      titleColor="#A85A5A"
      subColor="#C97B7B"
      ctaLabel="立即購買點數 →"
      ctaBg="#C97B7B"
      timestamp="下午 10:00"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#A85A5A' }}>陳小明</span>
      </div>
      <div className="info-row">
        <span className="info-label">剩餘</span>
        <span className="info-value">
          <span className="credit-badge" style={{ background: '#FFF0EE', borderColor: '#FFB7B2', color: '#A85A5A' }}>
            🔴 0 堂
          </span>
        </span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11.5, color: '#A85A5A', background: '#FFF5F4', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #FFD9D5' }}>
        💳 首購方案：<strong>12 堂 + 贈 1 堂</strong>
        <br />
        未加值將無法繼續預約課程。
      </div>
    </LineCardShell>
  );
}
