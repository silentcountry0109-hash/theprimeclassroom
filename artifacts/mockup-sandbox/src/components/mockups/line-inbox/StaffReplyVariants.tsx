const LINE_GREEN = '#06C755';
const TIFFANY = '#81D8D0';
const BUBBLE_PARENT = '#fff';
const BUBBLE_STAFF_BG = '#06C755';

interface PhoneChatProps {
  title: string;
  messages: ChatMessage[];
  accent: string;
}

interface ChatMessage {
  from: 'parent' | 'staff';
  type: 'text' | 'flex';
  text?: string;
  flex?: {
    senderAvatar: string;
    senderAvatarColor: string;
    senderName: string;
    senderRole: string;
    body: string;
  };
  time: string;
}

function FlexReplyBubble({ flex, time }: { flex: NonNullable<ChatMessage['flex']>; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12, justifyContent: 'flex-end' }}>
      <span style={{ fontSize: 10, color: '#9ca3af', alignSelf: 'flex-end', marginBottom: 2 }}>{time}</span>
      <div style={{ maxWidth: 240, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.13)' }}>
        <div style={{ background: flex.senderAvatarColor, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{flex.senderAvatar}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{flex.senderName}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{flex.senderRole}</div>
          </div>
        </div>
        <div style={{ background: '#fff', padding: '12px 14px', fontSize: 13, color: '#222', lineHeight: 1.6 }}>{flex.body}</div>
      </div>
    </div>
  );
}

function TextReplyBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12, justifyContent: 'flex-end' }}>
      <span style={{ fontSize: 10, color: '#9ca3af', alignSelf: 'flex-end', marginBottom: 2 }}>{time}</span>
      <div style={{ maxWidth: 240, background: LINE_GREEN, borderRadius: '18px 18px 4px 18px', padding: '10px 14px', fontSize: 13, color: '#fff', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{text}</div>
    </div>
  );
}

function ParentBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>王</div>
      <div>
        <div style={{ background: BUBBLE_PARENT, borderRadius: '4px 18px 18px 18px', padding: '10px 14px', fontSize: 13, color: '#222', lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: 220 }}>{text}</div>
        <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, display: 'block' }}>{time}</span>
      </div>
    </div>
  );
}

function PhoneChat({ title, messages, accent }: PhoneChatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent, background: `${accent}18`, padding: '4px 16px', borderRadius: 20 }}>{title}</div>
      <div style={{ width: 340, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', background: '#fff', border: '1px solid #e5e7eb' }}>
        <div style={{ background: accent, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>P</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>The Prime 質數教室</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>官方帳號</div>
          </div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '16px 14px', minHeight: 480, overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>今天</div>
          {messages.map((m, i) => {
            if (m.from === 'parent') return <ParentBubble key={i} text={m.text!} time={m.time} />;
            if (m.type === 'flex' && m.flex) return <FlexReplyBubble key={i} flex={m.flex} time={m.time} />;
            return <TextReplyBubble key={i} text={m.text!} time={m.time} />;
          })}
        </div>
        <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: '#9ca3af' }}>輸入訊息…</div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: LINE_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', maxWidth: 300 }}>↑ 家長在 LINE 看到的畫面</div>
    </div>
  );
}

const FLEX_MESSAGES: ChatMessage[] = [
  { from: 'parent', type: 'text', text: '你好，請問孩子下週五的課程可以改時間嗎？', time: '14:20' },
  {
    from: 'staff', type: 'flex', time: '14:35',
    flex: {
      senderAvatar: '信',
      senderAvatarColor: '#1d4ed8',
      senderName: '台北信義分校',
      senderRole: '陳主任',
      body: '您好！已幫您確認，下週五改到週六上午 10:00 完全沒問題，已更新排課系統，請放心！',
    },
  },
  { from: 'parent', type: 'text', text: '太好了，謝謝！', time: '14:37' },
  {
    from: 'staff', type: 'flex', time: '14:38',
    flex: {
      senderAvatar: '信',
      senderAvatarColor: '#1d4ed8',
      senderName: '台北信義分校',
      senderRole: '陳主任',
      body: '不客氣😊 如有任何問題隨時可以詢問我們，祝孩子學習愉快！',
    },
  },
];

const TEXT_MESSAGES: ChatMessage[] = [
  { from: 'parent', type: 'text', text: '你好，請問孩子下週五的課程可以改時間嗎？', time: '14:20' },
  {
    from: 'staff', type: 'text', time: '14:35',
    text: '【台北信義分校 陳主任】\n您好！已幫您確認，下週五改到週六上午 10:00 完全沒問題，已更新排課系統，請放心！',
  },
  { from: 'parent', type: 'text', text: '太好了，謝謝！', time: '14:37' },
  {
    from: 'staff', type: 'text', time: '14:38',
    text: '【台北信義分校 陳主任】\n不客氣😊 如有任何問題隨時可以詢問我們，祝孩子學習愉快！',
  },
];

export default function StaffReplyVariants() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', gap: 32, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>家長 LINE 收到回覆的樣式</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>兩種顯示分校＋客服人員的方案比較</div>
      </div>

      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#1d4ed8', color: '#fff', borderRadius: 10, padding: '10px 20px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
            方案 A：Flex Message 卡片
          </div>
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#1d4ed8', textAlign: 'center' }}>
            每則回覆都帶有彩色頭部，顯示分校名稱＋人員姓名
          </div>
          <PhoneChat title="家長視角（卡片式）" messages={FLEX_MESSAGES} accent={LINE_GREEN} />
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#166534' }}>
            ✅ 視覺辨識度高，風格一致<br/>
            ✅ 可自訂頭像顏色（依分校）<br/>
            ⚠️ 每則訊息體積略大
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#374151', color: '#fff', borderRadius: 10, padding: '10px 20px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
            方案 B：文字署名
          </div>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#374151', textAlign: 'center' }}>
            訊息開頭加上【分校 姓名】標示
          </div>
          <PhoneChat title="家長視角（文字式）" messages={TEXT_MESSAGES} accent={LINE_GREEN} />
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#374151' }}>
            ✅ 輕量，傳送速度快<br/>
            ✅ 所有 LINE 帳號皆相容<br/>
            ⚠️ 視覺較為樸素
          </div>
        </div>
      </div>
    </div>
  );
}
