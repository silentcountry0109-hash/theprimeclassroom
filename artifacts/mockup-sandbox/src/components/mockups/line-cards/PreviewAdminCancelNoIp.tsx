import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewAdminCancelNoIp() {
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
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #C97B7B 0%, #8B3A3A 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#8B3A3A', fontSize: 14 }}>❌ 課程已被教室取消</div>
                  <div className="ip-speech-sub" style={{ color: '#C97B7B', fontSize: 11 }}>點數已退回</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#8B3A3A' }}>陳小明</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">📅 日期</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>2026/05/03（日）10:00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📍 地點</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>台北信義分校</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">退回</span>
                  <span className="info-value">
                    <span className="credit-badge" style={{ background: '#E8F5E9', borderColor: '#A5D6A7', color: '#2E7D32' }}>
                      ✅ 1 堂・剩餘 6 堂
                    </span>
                  </span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, background: '#FFF5F5', borderRadius: 8, padding: '6px 10px' }}>
                  📞 如有疑問請聯繫分校：02-2345-6789
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#C97B7B', color: 'white' }}>
                  重新預約課程 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">下午 04:18</div>
        </div>
      </div>
    </div>
  );
}
