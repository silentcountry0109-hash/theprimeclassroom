type MsgType = 'Flex' | 'Text' | 'Reply';

interface Msg {
  no: number;
  trigger: string;
  type: MsgType;
  alt?: string;
  header?: string;
  body: string;
  source: string;
}

interface Group {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
  messages: Msg[];
}

const GROUPS: Group[] = [
  {
    key: 'A',
    title: 'A. 預約相關',
    subtitle: '家長／管理員下單後立即推送',
    accent: '#4FBDB4',
    bg: '#E8FAF9',
    messages: [
      {
        no: 1,
        trigger: '單筆預約成功',
        type: 'Flex',
        alt: '✅ 課程預約成功！{childName} {date} {time}',
        header: '✅ 課程預約成功！',
        body: '孩子・📅 日期・🕙 時間・👩‍🏫 老師・📍 地點・剩餘 🎫 {credits} 堂',
        source: 'server/line.ts:231',
      },
      {
        no: 2,
        trigger: '連排預約成功',
        type: 'Flex',
        alt: '✅ 連排預約成功！{childName} 共 {totalCount} 堂',
        header: '✅ 連排預約成功！',
        body: '孩子・日期/時間清單（最多列前幾堂 + …等共 N 堂）・剩餘 🎫 {credits} 堂',
        source: 'server/line.ts:410',
      },
      {
        no: 3,
        trigger: '管理員代為加排',
        type: 'Flex',
        alt: '✅ 課程已加排！{childName} {date} {time}',
        header: '✅ 課程已加排！',
        body: '孩子・📅 日期・🕙 時間・👩‍🏫 老師・📍 地點',
        source: 'server/line.ts:498',
      },
    ],
  },
  {
    key: 'B',
    title: 'B. 上課提醒與聯絡簿',
    subtitle: '課程當天與課後自動推播',
    accent: '#F0847C',
    bg: '#FFF4F3',
    messages: [
      {
        no: 4,
        trigger: '上課提醒',
        type: 'Flex',
        alt: '⏰ 上課提醒：{childName} 今天 {time}',
        header: '⏰ 上課提醒',
        body: '距離開課還有 {hours} 小時⋯🙌 請提前 10 分鐘抵達，今天的課程已準備好囉！',
        source: 'server/line.ts:328',
      },
      {
        no: 5,
        trigger: '聯絡簿已填寫',
        type: 'Flex',
        alt: '📒 聯絡簿通知：{childName} 今日課後記錄已填寫',
        header: '📒 聯絡簿通知',
        body: '🎯 老師已完成今日課後紀錄，請至 App 查看詳情！',
        source: 'server/line.ts:563',
      },
    ],
  },
  {
    key: 'C',
    title: 'C. 取消相關',
    subtitle: '家長或教室端取消後立刻通知',
    accent: '#C97B7B',
    bg: '#FBEEEE',
    messages: [
      {
        no: 6,
        trigger: '家長自行取消',
        type: 'Flex',
        alt: '😢 課程已取消：{childName} {date} {time}',
        header: '😢 課程已取消',
        body: '✅ 點數已退回・剩餘 {credits} 堂',
        source: 'server/line.ts:1345',
      },
      {
        no: 7,
        trigger: '教室端取消',
        type: 'Text',
        body: '【質數教室】❌ 課程已取消\n{childName} 在 {date} {time}（{franchiseName}）的課程已被教室取消，已退回 1 堂，剩餘 {credits} 堂。',
        source: 'server/storage.ts:2396',
      },
    ],
  },
  {
    key: 'D',
    title: 'D. 點數提醒',
    subtitle: '預約扣點後若觸發門檻',
    accent: '#D9A441',
    bg: '#FFF7E5',
    messages: [
      {
        no: 8,
        trigger: '點數不足提醒（剩 1 堂）',
        type: 'Text',
        body: '【質數教室】⚠️ 點數提醒\n{childName} 的點數僅剩 1 堂，請盡快購買以免影響課程。',
        source: 'server/routes.ts:1309',
      },
      {
        no: 9,
        trigger: '點數已用完',
        type: 'Text',
        body: '【質數教室】🔴 點數已用完\n請盡快至 App 購買點數，確保課程不中斷。',
        source: 'server/routes.ts:1308',
      },
    ],
  },
  {
    key: 'E',
    title: 'E. 帳號綁定 / 歡迎訊息',
    subtitle: 'Webhook reply token 即時回應',
    accent: '#6B9F8C',
    bg: '#EAF4EF',
    messages: [
      {
        no: 10,
        trigger: 'LINE 綁定成功',
        type: 'Reply',
        body: '✅ 綁定成功！家長 {displayName} 的 LINE 帳號已完成綁定。\n之後將透過此帳號接收課程相關通知，謝謝！',
        source: 'server/routes.ts:998',
      },
      {
        no: 11,
        trigger: '新追蹤者歡迎訊息',
        type: 'Reply',
        alt: '歡迎加入質數教室 LINE！立即預約免費診斷課程',
        header: '🎉 歡迎加入質數教室！',
        body: '感謝您關注質數教室⋯📚 我們能為您做什麼⋯（含預約 CTA）',
        source: 'server/line.ts:954',
      },
    ],
  },
];

const TYPE_STYLES: Record<MsgType, { bg: string; fg: string; border: string; label: string }> = {
  Flex: { bg: '#E0F2FE', fg: '#0369A1', border: '#7DD3FC', label: 'Flex' },
  Text: { bg: '#F1F5F9', fg: '#475569', border: '#CBD5E1', label: 'Text' },
  Reply: { bg: '#DCFCE7', fg: '#15803D', border: '#86EFAC', label: 'Reply' },
};

const LAST_UPDATED = '2026/05/26';

function TypeBadge({ type }: { type: MsgType }) {
  const s = TYPE_STYLES[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        padding: '2px 9px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {s.label}
    </span>
  );
}

function MessageCard({ msg, accent }: { msg: Msg; accent: string }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
        border: '1px solid #EAEAEA',
        borderTop: `3px solid ${accent}`,
        padding: '14px 16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 6,
            background: accent,
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {msg.no}
        </span>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#1F2937', lineHeight: 1.3 }}>
          {msg.trigger}
        </div>
        <TypeBadge type={msg.type} />
      </div>

      {msg.alt && (
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          <span style={{ color: '#9CA3AF', marginRight: 4 }}>Alt</span>
          {msg.alt}
        </div>
      )}

      {msg.header && (
        <div style={{ fontSize: 12, fontWeight: 600, color: accent }}>
          {msg.header}
        </div>
      )}

      <div
        style={{
          background: '#FAFAF7',
          border: '1px dashed #E5E7EB',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 12,
          color: '#374151',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          fontFamily: '"Noto Sans TC", system-ui, sans-serif',
        }}
      >
        {msg.body}
      </div>

      <div
        style={{
          fontSize: 10.5,
          color: '#9CA3AF',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing: 0.2,
        }}
      >
        📄 {msg.source}
      </div>
    </div>
  );
}

function GroupSection({ group }: { group: Group }) {
  return (
    <section
      style={{
        background: group.bg,
        borderRadius: 16,
        padding: '18px 18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        border: `1px solid ${group.accent}33`,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: group.accent, margin: 0, letterSpacing: 0.5 }}>
          {group.title}
        </h2>
        <span style={{ fontSize: 12, color: '#6B7280' }}>{group.subtitle}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: group.accent,
            background: 'white',
            border: `1px solid ${group.accent}66`,
            borderRadius: 999,
            padding: '2px 10px',
            fontWeight: 700,
          }}
        >
          {group.messages.length} 則訊息
        </span>
      </header>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {group.messages.map((m) => (
          <MessageCard key={m.no} msg={m} accent={group.accent} />
        ))}
      </div>
    </section>
  );
}

export function ParentMessagesBoard() {
  const total = GROUPS.reduce((acc, g) => acc + g.messages.length, 0);
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #FAF9F6 0%, #F4F6F5 100%)',
        padding: '32px 28px 56px',
        fontFamily: '"Noto Sans TC", system-ui, -apple-system, sans-serif',
        color: '#1F2937',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <header
          style={{
            background: 'white',
            borderRadius: 18,
            padding: '22px 26px',
            border: '1px solid #ECECEC',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                fontSize: 12,
                color: '#06C755',
                fontWeight: 700,
                letterSpacing: 1.5,
                marginBottom: 6,
              }}
            >
              LINE OFFICIAL ACCOUNT · 家長端
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                fontFamily: '"Shippori Mincho", serif',
                color: '#1F2937',
                letterSpacing: 1,
              }}
            >
              家長端 LINE 訊息總覽
            </h1>
            <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>
              The Prime 質數教室 透過 LINE 官方帳號主動推送給家長的所有自動化訊息。涵蓋預約、提醒、取消、點數與綁定 5 大情境，每張卡片標示觸發時機、訊息類型與來源檔案位置。
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                background: '#F8FBFA',
                border: '1px solid #E2E8E5',
                borderRadius: 10,
                padding: '10px 14px',
                minWidth: 92,
              }}
            >
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: 0.5 }}>訊息總數</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#06C755' }}>{total}</div>
            </div>
            <div
              style={{
                background: '#F8FBFA',
                border: '1px solid #E2E8E5',
                borderRadius: 10,
                padding: '10px 14px',
                minWidth: 92,
              }}
            >
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: 0.5 }}>情境分組</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#4FBDB4' }}>{GROUPS.length}</div>
            </div>
            <div
              style={{
                background: '#F8FBFA',
                border: '1px solid #E2E8E5',
                borderRadius: 10,
                padding: '10px 14px',
                minWidth: 120,
              }}
            >
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: 0.5 }}>最後更新</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginTop: 4 }}>{LAST_UPDATED}</div>
            </div>
          </div>
        </header>

        {/* 圖例 */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '10px 14px',
            background: 'white',
            borderRadius: 12,
            border: '1px solid #ECECEC',
            fontSize: 12,
            color: '#6B7280',
          }}
        >
          <span style={{ fontWeight: 700, color: '#1F2937' }}>訊息類型圖例：</span>
          <TypeBadge type="Flex" />
          <span>視覺化 Flex Message（圖文卡片）</span>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <TypeBadge type="Text" />
          <span>純文字 Push 訊息</span>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <TypeBadge type="Reply" />
          <span>Webhook Reply（即時回應）</span>
        </div>

        {GROUPS.map((g) => (
          <GroupSection key={g.key} group={g} />
        ))}

        <footer
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#9CA3AF',
            paddingTop: 8,
          }}
        >
          本看板僅整理寄送給「家長」的 LINE 訊息，不含老師／分校主任／總部端推播，也不含 App 內 toast 與通知中心鈴鐺。
        </footer>
      </div>
    </div>
  );
}

export default ParentMessagesBoard;
