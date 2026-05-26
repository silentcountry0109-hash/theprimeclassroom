import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function NoCredits() {
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
            <div className="text-bubble danger">
              <span className="tb-title" style={{ color: '#B91C1C' }}>
                【質數教室】🔴 點數已用完
              </span>
              <strong>陳小明</strong> 目前點數為 <strong style={{ color: '#DC2626' }}>0 堂</strong>。
              <br />
              請盡快至 App 購買點數，確保課程不中斷。
              <br />
              <br />
              <span style={{ color: '#888', fontSize: 11 }}>
                💳 首購方案：12 堂 + 贈 1 堂
              </span>
            </div>
          </div>
          <div className="timestamp">下午 10:00</div>
        </div>
      </div>
    </div>
  );
}
