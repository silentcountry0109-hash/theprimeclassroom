import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewLineBindSuccessNoIp() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">
        <div className="chat-header">
          <div className="chat-header-avatar"><img src={logo} alt="質數教室" /></div>
          質數教室
        </div>

        <div className="chat-area">
          {/* 家長傳送的綁定指令 */}
          <div className="user-bubble-row">
            <div className="user-bubble">綁定 ABC123</div>
          </div>
          <div className="timestamp" style={{ alignSelf: 'flex-end', paddingLeft: 0, paddingRight: 8 }}>
            上午 09:32
          </div>

          <div className="bubble-row" style={{ marginTop: 8 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card">
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #34D399 0%, #15803D 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#15803D', fontSize: 14 }}>✅ LINE 綁定成功！</div>
                  <div className="ip-speech-sub" style={{ color: '#15803D', fontSize: 11 }}>之後將透過此帳號接收通知</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">家長</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#15803D' }}>陳家爸爸</span>
                </div>
                <div className="info-row">
                  <span className="info-label">綁定碼</span>
                  <span className="info-value" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>ABC123</span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11, color: '#15803D', background: '#F0FDF4', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #BBF7D0' }}>
                  🔔 您將收到：
                  <br />
                  預約確認・上課提醒・聯絡簿・點數通知
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#22C55E', color: 'white' }}>
                  前往家長首頁 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 09:32</div>
        </div>
      </div>
    </div>
  );
}
