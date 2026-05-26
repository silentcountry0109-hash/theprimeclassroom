import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewNoCreditsNoIp() {
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
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #F87171 0%, #B91C1C 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#B91C1C', fontSize: 14 }}>🔴 點數已用完</div>
                  <div className="ip-speech-sub" style={{ color: '#DC2626', fontSize: 11 }}>請盡快加值，確保課程不中斷</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#B91C1C' }}>陳小明</span>
                </div>
                <div className="info-row">
                  <span className="info-label">剩餘</span>
                  <span className="info-value">
                    <span className="credit-badge" style={{ background: '#FEE2E2', borderColor: '#FCA5A5', color: '#B91C1C' }}>
                      🔴 0 堂
                    </span>
                  </span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11.5, color: '#7F1D1D', background: '#FEF2F2', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #FECACA' }}>
                  💳 首購方案：<strong>12 堂 + 贈 1 堂</strong>
                  <br />
                  未加值將無法繼續預約課程。
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#DC2626', color: 'white' }}>
                  立即購買點數 →
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
