import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function LowCredits() {
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
            <div className="text-bubble warn">
              <span className="tb-title" style={{ color: '#B45309' }}>
                【質數教室】⚠️ 點數提醒
              </span>
              <strong>陳小明</strong> 的點數僅剩 <strong style={{ color: '#D97706' }}>1 堂</strong>，
              請盡快購買以免影響課程。
              <br />
              <br />
              <span style={{ color: '#888', fontSize: 11 }}>
                👉 前往 App 「點數」分頁加值
              </span>
            </div>
          </div>
          <div className="timestamp">下午 10:00</div>
        </div>
      </div>
    </div>
  );
}
