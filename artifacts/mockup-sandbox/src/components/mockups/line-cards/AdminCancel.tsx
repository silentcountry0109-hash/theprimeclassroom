import { LineCardShell } from './_shared/LineCardShell';

export function AdminCancel() {
  return (
    <LineCardShell
      ip="ip-admincancel.png"
      accent="linear-gradient(135deg, #90A4AE 0%, #546E7A 100%)"
      title="❌ 課程已被教室取消"
      subtitle="點數已退回，請聯繫分校"
      titleColor="#546E7A"
      subColor="#78909C"
      ctaLabel="重新預約課程 →"
      ctaBg="#78909C"
      timestamp="下午 04:18"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#546E7A' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 日期</span>
        <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>2026/05/03（日）10:00</span>
      </div>
      <div className="info-row">
        <span className="info-label">📍 地點</span>
        <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>台北信義分校</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">退回</span>
        <span className="info-value">
          <span className="credit-badge" style={{ background: '#E8F5E9', borderColor: '#A5D6A7', color: '#2E7D32' }}>
            ✅ 1 堂・剩餘 6 堂
          </span>
        </span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6, background: '#F5F7F8', borderRadius: 8, padding: '6px 10px' }}>
        📞 如有疑問請聯繫分校：02-2345-6789
      </div>
    </LineCardShell>
  );
}
