import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewLowCreditsV2() {
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
            <div className="typing-bubble">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>

          <div className="bubble-row" style={{ marginTop: 6 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card">
              <div className="card-header-band" style={{ background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 100%)' }}>
                <div className="card-header-emoji">⚠️</div>
                <div className="card-header-text">
                  <div className="card-header-title" style={{ color: '#7C2D12' }}>點數即將用完</div>
                  <div className="card-header-sub" style={{ color: '#9A3412' }}>僅剩 1 堂課可使用</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#D97706' }}>陳小明</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">點數</span>
                  <span className="info-value">
                    <span
                      className="credit-badge"
                      style={{ background: '#FFF3E0', borderColor: '#FFCC80', color: '#E65100' }}
                    >
                      ⚠️ 剩 1 堂
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">🕙 下次</span>
                  <span className="info-value" style={{ fontWeight: 700, fontSize: 13 }}>2026/05/05（二）16:30</span>
                </div>
                <div className="info-row">
                  <span className="info-label">👩‍🏫 老師</span>
                  <span className="info-value">林老師</span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11, color: '#B45309', lineHeight: 1.6, background: '#FFF8E1', borderRadius: 8, padding: '6px 8px' }}>
                  ⚠️ 為避免影響下一堂課，請盡快至 App 加值點數。
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#F59E0B', color: 'white' }}>
                  🛒 前往加值點數 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">下午 10:00</div>
        </div>
      </div>
    </div>
  );
}
