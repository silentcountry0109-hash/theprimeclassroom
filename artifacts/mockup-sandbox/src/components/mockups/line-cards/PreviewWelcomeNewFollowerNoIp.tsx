import './_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export function PreviewWelcomeNewFollowerNoIp() {
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
              感謝您關注 <strong style={{ color: '#06C755' }}>The Prime 質數教室</strong>！🎉
              <br />
              我們是專注國小數學個別指導的教室～
            </div>
          </div>

          <div className="bubble-row" style={{ marginTop: 6 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card">
              <div className="card-ip-row" style={{ background: 'linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)', padding: '14px 14px' }}>
                <div className="ip-speech-bubble" style={{ flex: 1, padding: '10px 14px' }}>
                  <div className="ip-speech-title" style={{ fontSize: 14 }}>🎉 歡迎加入質數教室！</div>
                  <div className="ip-speech-sub" style={{ fontSize: 11 }}>立即預約免費診斷課程</div>
                </div>
              </div>

              <div className="card-body">
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>
                  📚 我們能為您做什麼
                </div>
                <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.8 }}>
                  ✓ 一對一精準診斷孩子數學起點<br />
                  ✓ 量身設計每週個人化學習計畫<br />
                  ✓ 課後聯絡簿，學習進度透明<br />
                  ✓ 全台多間分校就近上課
                </div>
                <div className="divider" />
                <div style={{ fontSize: 11, color: '#0F766E', background: '#F0FDFA', borderRadius: 8, padding: '7px 10px', lineHeight: 1.5, border: '1px solid #99F6E4' }}>
                  🎁 首次預約贈送 <strong>免費 60 分鐘診斷課</strong>
                </div>
              </div>

              <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="cta-btn" style={{ background: '#81D8D0', color: 'white' }}>
                  📅 立即預約免費診斷 →
                </button>
                <button className="cta-btn" style={{ background: 'white', color: '#4fbdb4', border: '1.5px solid #81D8D0' }}>
                  🏠 查看分校位置
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">上午 11:20</div>
        </div>
      </div>
    </div>
  );
}
