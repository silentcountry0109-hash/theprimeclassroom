import './_group.css';

export function CourseCancel() {
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

              {/* Hero：灰藍（低調） */}
              <div className="card-hero" style={{ background: 'linear-gradient(135deg, #78909C 0%, #546E7A 100%)', minHeight: 68 }}>
                <div className="card-hero-icon">😢</div>
                <div className="card-hero-text">
                  <div className="card-hero-title">課程已取消</div>
                  <div className="card-hero-sub">點數已自動退回，期待下次見！</div>
                </div>
                <img className="card-hero-mascot" src="/mascot.gif" alt="質數先生"
                  style={{ animationDelay: '0.6s', filter: 'grayscale(30%) drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
              </div>

              {/* Body */}
              <div className="card-body">
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
              </div>

              {/* Footer */}
              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#81D8D0', color: 'white' }}>
                  重新預約課程 →
                </button>
              </div>
            </div>
          </div>

          <div className="timestamp">下午 02:15</div>
        </div>
      </div>
    </div>
  );
}
