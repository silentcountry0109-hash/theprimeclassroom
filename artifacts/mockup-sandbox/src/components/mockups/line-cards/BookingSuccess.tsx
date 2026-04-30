import './_group.css';

export function BookingSuccess() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">
        <div className="chat-header">
          <div className="chat-header-avatar">🎓</div>
          質數教室
        </div>

        <div className="chat-area">
          <div className="bubble-row">
            <div className="sender-avatar">🎓</div>
            <div className="flex-card">
              <div className="card-hero" style={{ background: 'linear-gradient(135deg, #81D8D0 0%, #5bbfb7 100%)' }}>
                <div className="card-hero-icon">✅</div>
                <div className="card-hero-text">
                  <div className="card-hero-title">課程預約成功</div>
                  <div className="card-hero-sub">The Prime 質數教室</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#81D8D0' }}>陳小明</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">日期</span>
                  <span className="info-value">2026/05/03（日）</span>
                </div>
                <div className="info-row">
                  <span className="info-label">時間</span>
                  <span className="info-value">10:00 – 11:00</span>
                </div>
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
                    <span className="credit-badge">🎫 5 堂</span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#81D8D0', color: 'white' }}>
                  查看預約詳情 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 10:23</div>
        </div>
      </div>
    </div>
  );
}
