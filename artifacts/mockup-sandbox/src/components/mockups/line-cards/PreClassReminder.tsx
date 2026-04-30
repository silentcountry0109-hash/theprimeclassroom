import './_group.css';

export function PreClassReminder() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">

        {/* LINE OA 頂欄 */}
        <div className="chat-header">
          <div className="chat-header-avatar">
            <img src="/logo.png" alt="質數教室" />
          </div>
          質數教室
        </div>

        {/* 聊天區 */}
        <div className="chat-area">

          {/* Typing indicator */}
          <div className="bubble-row">
            <div className="sender-avatar">
              <img src="/logo.png" alt="質數教室" />
            </div>
            <div className="typing-bubble">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>

          {/* Flex Message 卡片 */}
          <div className="bubble-row" style={{ marginTop: 6 }}>
            <div className="sender-avatar">
              <img src="/logo.png" alt="質數教室" />
            </div>
            <div className="flex-card">

              {/* Hero：珊瑚橘 */}
              <div className="card-hero" style={{ background: 'linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)', minHeight: 68 }}>
                <div className="card-hero-icon">⏰</div>
                <div className="card-hero-text">
                  <div className="card-hero-title">上課提醒</div>
                  <div className="card-hero-sub">距離開課還有 2 小時</div>
                </div>
                <img className="card-hero-mascot" src="/mascot.gif" alt="質數先生"
                  style={{ animationDelay: '0.3s' }} />
              </div>

              {/* Body */}
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
                  🙌 請提前 10 分鐘抵達，我們已準備好今天的課程囉！
                </div>
              </div>

              {/* Footer */}
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
