import { LineCardShell } from './_shared/LineCardShell';

export function LowCredits() {
  return (
    <LineCardShell
      ip="ip-lowcredits.png"
      accent="linear-gradient(135deg, #F5D77E 0%, #C99544 100%)"
      title="⚠️ 點數即將用完"
      subtitle="建議盡快加值以免影響課程"
      titleColor="#8B6914"
      subColor="#A87D2E"
      ctaLabel="立即前往加值 →"
      ctaBg="#C99544"
      timestamp="下午 10:00"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#8B6914' }}>陳小明</span>
      </div>
      <div className="info-row">
        <span className="info-label">剩餘</span>
        <span className="info-value">
          <span className="credit-badge" style={{ background: '#FFF9E5', borderColor: '#F5D77E', color: '#8B6914' }}>
            ⚠️ 僅剩 1 堂
          </span>
        </span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11.5, color: '#8B6914', background: '#FFF9E5', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #F5E5B0' }}>
        💡 推薦方案：<strong>12 堂 + 贈 1 堂</strong>
        <br />
        立即加值可享首購優惠！
      </div>
    </LineCardShell>
  );
}
