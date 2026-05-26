import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewLowCreditsNoIp() {
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
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #B45309 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#B45309', fontSize: 14 }}>⚠️ 點數即將用完</div>
                  <div className="ip-speech-sub" style={{ color: '#D97706', fontSize: 11 }}>建議盡快加值以免影響課程</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#B45309' }}>陳小明</span>
                </div>
                <div className="info-row">
                  <span className="info-label">剩餘</span>
                  <span className="info-value">
                    <span className="credit-badge" style={{ background: '#FEF3C7', borderColor: '#FCD34D', color: '#B45309' }}>
                      ⚠️ 僅剩 1 堂
                    </span>
                  </span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11.5, color: '#92400E', background: '#FFFBEB', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #FDE68A' }}>
                  💡 推薦方案：<strong>12 堂 + 贈 1 堂</strong>
                  <br />
                  立即加值可享首購優惠！
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#F59E0B', color: 'white' }}>
                  立即前往加值 →
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
