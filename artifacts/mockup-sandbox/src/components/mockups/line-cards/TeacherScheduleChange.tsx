import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;
const ipChar = `${import.meta.env.BASE_URL}ip-character.png`;

export function TeacherScheduleChange() {
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
              {/* IP 角色 + 說話泡泡 */}
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #FFA726 0%, #E65100 100%)' }}>
                <img
                  className="card-ip-img"
                  src={ipChar}
                  alt="質數先生"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2)) hue-rotate(30deg)' }}
                />
                <div className="ip-speech-bubble">
                  <div className="ip-speech-title" style={{ color: '#E65100' }}>課程異動通知</div>
                  <div className="ip-speech-sub" style={{ color: '#F57C00' }}>您的排課時段已更新</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">老師</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#E65100' }}>林老師</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">📅 原時段</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#bbb' }}>2026/05/06（三）14:00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🔄 新時段</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#E65100' }}>2026/05/08（五）16:00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">👦 學生</span>
                  <span className="info-value">陳小明</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📍 地點</span>
                  <span className="info-value">台北信義分校</span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, background: '#FFF3E0', borderRadius: 8, padding: '6px 8px' }}>
                  ⚠️ 如有疑問，請聯繫分校主任確認。
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#FFA726', color: 'white' }}>
                  查看課表異動詳情 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 09:45</div>
        </div>
      </div>
    </div>
  );
}
