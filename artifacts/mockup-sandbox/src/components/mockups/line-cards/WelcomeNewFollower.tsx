import { LineCardShell } from './_shared/LineCardShell';

export function WelcomeNewFollower() {
  return (
    <LineCardShell
      ip="ip-welcome.png"
      accent="linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)"
      title="🎉 歡迎加入質數教室！"
      subtitle="立即預約免費診斷課程"
      titleColor="#2A8F86"
      subColor="#6acfc8"
      ctaLabel="📅 立即預約免費診斷 →"
      ctaBg="#81D8D0"
      timestamp="上午 11:20"
    >
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
    </LineCardShell>
  );
}
