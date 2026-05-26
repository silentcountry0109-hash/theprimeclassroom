import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function CourseCancel() {
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
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #90A4AE 0%, #546E7A 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#546E7A', fontSize: 14 }}>❌ 課程取消通知</div>
                  <div className="ip-speech-sub" style={{ color: '#78909C', fontSize: 11 }}>點數已退回，期待下次見！</div>
                </div>
              </div>

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

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#78909C', color: 'white' }}>
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
