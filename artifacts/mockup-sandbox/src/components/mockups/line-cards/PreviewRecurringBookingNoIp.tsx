import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

const SLOTS = [
  { date: '2026/05/03（日）', time: '10:00 – 11:00' },
  { date: '2026/05/10（日）', time: '10:00 – 11:00' },
  { date: '2026/05/17（日）', time: '10:00 – 11:00' },
  { date: '2026/05/24（日）', time: '10:00 – 11:00' },
];

export function PreviewRecurringBookingNoIp() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">
        <div className="chat-header">
          <div className="chat-header-avatar"><img src={logo} alt="質數教室" /></div>
          質數教室
        </div>

        <div className="chat-area">
          <div className="bubble-row">
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card">
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ fontSize: 14 }}>📅 連排預約成功！</div>
                  <div className="ip-speech-sub" style={{ fontSize: 11 }}>共 12 堂課程已排定</div>
                </div>
              </div>

              <div className="card-body">
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
                  <span className="info-value">
                    <span className="credit-badge">🎫 8 堂</span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#81D8D0', color: 'white' }}>
                  查看完整課表 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 11:08</div>
        </div>
      </div>
    </div>
  );
}
