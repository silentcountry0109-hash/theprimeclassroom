import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function ContactBookFilled() {
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
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ color: '#e06860', fontSize: 14 }}>📒 聯絡簿已填寫</div>
                  <div className="ip-speech-sub" style={{ color: '#f0847c', fontSize: 11 }}>今日課後記錄已完成</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#f0847c' }}>陳小明</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">📅 課程</span>
                  <span className="info-value">2026/05/03（日）10:00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">👩‍🏫 老師</span>
                  <span className="info-value">林老師</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📖 單元</span>
                  <span className="info-value">三上 · 第 4 單元 分數的認識</span>
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11.5, color: '#444', background: '#FFF8F7', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6, border: '1px solid #FFE4E1' }}>
                  🎯 今日表現：<strong style={{ color: '#e06860' }}>★★★★☆</strong>
                  <br />
                  老師已完成今日課後紀錄，請至 App 查看詳情！
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#FFB7B2', color: 'white' }}>
                  查看聯絡簿 →
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">下午 12:05</div>
        </div>
      </div>
    </div>
  );
}
