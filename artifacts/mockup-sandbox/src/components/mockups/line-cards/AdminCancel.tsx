import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function AdminCancel() {
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
            <div className="text-bubble">
              <span className="tb-title">【質數教室】❌ 課程已取消</span>
              陳小明 在 <strong>2026/05/03（日）10:00</strong>
              （台北信義分校）的課程
              <br />
              <span style={{ color: '#C97B7B' }}>已被教室取消</span>，
              已退回 <strong>1 堂</strong>，剩餘 <strong>6 堂</strong>。
              <br />
              <br />
              <span style={{ color: '#888', fontSize: 11 }}>
                如有疑問請聯繫分校：02-2345-6789
              </span>
            </div>
          </div>
          <div className="timestamp">下午 04:18</div>
        </div>
      </div>
    </div>
  );
}
