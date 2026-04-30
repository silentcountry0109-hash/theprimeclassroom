import './_group.css';

export function CourseCancel() {
  return (
    <div className="line-card-root">
      <div className="phone-shell">
        <div className="chat-header">
          <div className="chat-header-avatar">🎓</div>
          質數教室
        </div>

        <div className="chat-area">
          <div className="bubble-row">
            <div className="sender-avatar">🎓</div>
            <div className="flex-card">
              <div className="card-hero" style={{ background: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)' }}>
                <div className="card-hero-icon">❌</div>
                <div className="card-hero-text">
                  <div className="card-hero-title">課程已取消</div>
                  <div className="card-hero-sub">點數已自動退回</div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">孩子</span>
                  <span className="info-value" style={{ fontWeight: 700, color: '#555' }}>陳小明</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">日期</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#aaa' }}>2026/05/03（日）</span>
                </div>
                <div className="info-row">
                  <span className="info-label">時間</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#aaa' }}>10:00 – 11:00</span>
                </div>
                <div className="info-row">
                  <span className="info-label">老師</span>
                  <span className="info-value" style={{ textDecoration: 'line-through', color: '#aaa' }}>林老師</span>
                </div>
                <div className="divider" />
                <div className="info-row">
                  <span className="info-label">退回</span>
                  <span className="info-value">
                    <span className="credit-badge" style={{ background: '#E8F5E9', borderColor: '#A5D6A7', color: '#2E7D32' }}>
                      🎫 點數已退回・剩餘 6 堂
                    </span>
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: '#f5f5f5', color: '#555', border: '1px solid #ddd' }}>
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
