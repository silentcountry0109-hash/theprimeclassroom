import { LineCardShell } from './_shared/LineCardShell';

export function LineBindSuccess() {
  return (
    <LineCardShell
      ip="ip-bind.png"
      accent="linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)"
      title="✅ LINE 綁定成功！"
      subtitle="之後將透過此帳號接收通知"
      titleColor="#2A8F86"
      subColor="#6acfc8"
      ctaLabel="前往家長首頁 →"
      ctaBg="#81D8D0"
      timestamp="上午 09:32"
    >
      <div className="info-row">
        <span className="info-label">家長</span>
        <span className="info-value" style={{ fontWeight: 700, color: '#2A8F86' }}>陳家爸爸</span>
      </div>
      <div className="info-row">
        <span className="info-label">綁定碼</span>
        <span className="info-value" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>ABC123</span>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11, color: '#2A8F86', background: '#F0FBFA', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #B8EAE5' }}>
        🔔 您將收到：
        <br />
        預約確認・上課提醒・聯絡簿・點數通知
      </div>
    </LineCardShell>
  );
}
