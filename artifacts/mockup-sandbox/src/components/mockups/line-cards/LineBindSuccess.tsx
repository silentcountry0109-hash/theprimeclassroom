import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function LineBindSuccess() {
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

          {/* 教室回覆 */}
          <div className="bubble-row" style={{ marginTop: 8 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="text-bubble success">
              <span className="tb-title" style={{ color: '#15803D' }}>
                ✅ 綁定成功！
              </span>
              家長 <strong>陳家爸爸</strong> 的 LINE 帳號已完成綁定。
              <br />
              之後將透過此帳號接收課程相關通知，謝謝！
              <br />
              <br />
              <span style={{ color: '#15803D', fontSize: 11 }}>
                🔔 您將收到：預約確認・上課提醒・聯絡簿・點數通知
              </span>
            </div>
          </div>
          <div className="timestamp">上午 09:32</div>
        </div>
      </div>
    </div>
  );
}
