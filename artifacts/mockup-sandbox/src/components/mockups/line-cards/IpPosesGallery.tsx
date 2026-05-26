const base = `${import.meta.env.BASE_URL}ip-poses/`;

const POSES = [
  { file: 'ip-thumbs-up.png',       label: '比讚', use: '預約成功', tone: '#4fbdb4' },
  { file: 'ip-holding-books.png',   label: '抱多本書', use: '連排預約', tone: '#4fbdb4' },
  { file: 'ip-salute.png',          label: '敬禮', use: '管理員代為加排', tone: '#0EA5E9' },
  { file: 'ip-pointing-clock.png',  label: '指時鐘', use: '上課提醒', tone: '#f0847c' },
  { file: 'ip-writing-notebook.png',label: '寫筆記', use: '聯絡簿已填寫', tone: '#f0847c' },
  { file: 'ip-bowing.png',          label: '鞠躬', use: '家長自行取消', tone: '#78909C' },
  { file: 'ip-hands-together.png',  label: '雙手合十', use: '教室端取消', tone: '#78909C' },
  { file: 'ip-warning-sign.png',    label: '舉警示牌', use: '點數剩 1 堂', tone: '#F59E0B' },
  { file: 'ip-empty-wallet.png',    label: '空荷包', use: '點數已用完', tone: '#DC2626' },
  { file: 'ip-handshake.png',       label: '握手', use: 'LINE 綁定成功', tone: '#15803D' },
  { file: 'ip-waving.png',          label: '揮手', use: '新追蹤者歡迎', tone: '#06C755' },
];

export function IpPosesGallery() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FAF9F6 0%, #F4F6F5 100%)',
        padding: '32px 28px 48px',
        fontFamily: '"Noto Sans TC", system-ui, -apple-system, sans-serif',
        color: '#1F2937',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#06C755', fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>
            IP MASCOT · 11 種動作表情
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              fontFamily: '"Shippori Mincho", serif',
              letterSpacing: 1,
            }}
          >
            質數先生 · 表情動作總表
          </h1>
          <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>
            同一隻吉祥物搭配 11 種動作／表情，對應家長端 LINE 11 則訊息情境。所有姿勢都保持相同的角色設計、配色與比例，確保視覺一致。
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {POSES.map((p) => (
            <div
              key={p.file}
              style={{
                background: 'white',
                borderRadius: 14,
                border: '1px solid #ECECEC',
                borderTop: `3px solid ${p.tone}`,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  background: '#FAFAF7',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}
              >
                <img
                  src={`${base}${p.file}`}
                  alt={p.label}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>
                {p.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: p.tone,
                  background: `${p.tone}15`,
                  border: `1px solid ${p.tone}40`,
                  borderRadius: 999,
                  padding: '2px 10px',
                }}
              >
                {p.use}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IpPosesGallery;
