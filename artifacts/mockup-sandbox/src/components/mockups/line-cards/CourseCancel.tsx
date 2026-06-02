import { LineCardShell } from './_shared/LineCardShell';

export function CourseCancel() {
  return (
    <LineCardShell
      ip="ip-cancel.png"
      accent="linear-gradient(135deg, #90A4AE 0%, #546E7A 100%)"
      title="❌ 課程取消通知"
      subtitle="點數已退回，期待下次見！"
      titleColor="#546E7A"
      subColor="#78909C"
      ctaLabel="重新預約課程 →"
      ctaBg="#78909C"
      timestamp="下午 02:15"
    >
      <div className="info-row">
        <span className="info-label">孩子</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#555' }}>陳小明</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">📅 日期</span>
        <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>2026/05/03（日）</span>
      </div>
      <div className="info-row">
        <span className="info-label">🕙 時間</span>
        <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>10:00 – 11:00</span>
      </div>
      <div className="info-row">
        <span className="info-label">👩‍🏫 老師</span>
        <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>林老師</span>
      </div>
      <div className="divider" />
      <div className="info-row">
        <span className="info-label">退回</span>
        <span className="info-value">
          <span className="credit-badge" style={{ background: '#E8F5E9', borderColor: '#A5D6A7', color: '#2E7D32' }}>
            ✅ 點數已退回・剩餘 6 堂
          </span>
        </span>
      </div>
    </LineCardShell>
  );
}
