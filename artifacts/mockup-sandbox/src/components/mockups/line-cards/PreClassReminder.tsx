import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;
const ipChar = `${import.meta.env.BASE_URL}ip-reminder.png`; // 機器人笑臉

export function PreClassReminder() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">

        <div className="chat-header">
          <div className="chat-header-avatar">
            <img src={logo} alt="質數教室" />
          </div>
          質數教室
        </div>

        <div className="chat-area">
          <div className="bubble-row">
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="typing-bubble">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>

          <div className="bubble-row" style={{ marginTop: 6 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card">
              {/* Hero 色條 */}
              <div className="card-hero" style={{ background: 'linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)' }}>
                <div className="card-hero-icon">⏰</div>
                <div className="card-hero-text">
                  <div className="card-hero-title">上課提醒</div>
                  <div className="card-hero-sub">距離開課還有 2 小時</div>
                </div>
              </div>

              {/* IP 角色 */}
              <div className="card-ip-banner" style={{ background: 'linear-gradient(180deg, #fff4f3 0%, #fff9f9 100%)' }}>
                <img src={ipChar} alt="質數先生" />
              </div>

              <div className="card-body">
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
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#FFB7B2', color: 'white' }}>
                  查看課程資訊 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 08:03</div>
        </div>
      </div>
    </div>
  );
}
