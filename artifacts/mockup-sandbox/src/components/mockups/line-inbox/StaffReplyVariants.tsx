const LINE_GREEN = '#06C755';
const TIFFANY = '#81D8D0';
const CORAL = '#FFB7B2';

interface FlexMsg {
  avatar: string;
  avatarGradient: [string, string];
  senderName: string;
  senderRole: string;
  body: string;
  time: string;
}

interface Msg {
  from: 'parent' | 'staff-flex' | 'staff-text';
  text?: string;
  flex?: FlexMsg;
  time: string;
}

function StatusBar() {
  return (
    <div style={{ background: 'transparent', padding: '10px 18px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="15" height="11" viewBox="0 0 15 11"><rect x="0" y="4" width="3" height="7" rx="1" fill="white"/><rect x="4" y="2.5" width="3" height="8.5" rx="1" fill="white"/><rect x="8" y="1" width="3" height="10" rx="1" fill="white"/><rect x="12" y="0" width="3" height="11" rx="1" fill="white"/></svg>
        <svg width="16" height="12" viewBox="0 0 24 12"><path d="M12 2C8.14 2 4.66 3.53 2.12 6.07L0 4C3.1 1.49 7.38 0 12 0s8.9 1.49 12 4l-2.12 2.07C19.34 3.53 15.86 2 12 2z" fill="white"/><path d="M12 6c-2.76 0-5.26 1.11-7.08 2.92L3 7C5.38 4.65 8.52 3 12 3s6.62 1.65 9 4l-1.92 1.92A9.95 9.95 0 0012 6z" fill="white"/><circle cx="12" cy="11" r="2" fill="white"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0" y="1" width="20" height="9" rx="2" stroke="white" strokeWidth="1" fill="none"/><rect x="1.5" y="2.5" width="15" height="6" rx="1" fill="white"/><path d="M21 3.5v4a2 2 0 000-4z" fill="white"/></svg>
      </div>
    </div>
  );
}

function ChatHeader({ color }: { color: string }) {
  return (
    <div style={{ background: color, padding: '8px 14px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 7H2v5h20V7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>The Prime 質數教室</div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill="white"/><circle cx="12" cy="12" r="1.5" fill="white"/><circle cx="12" cy="19" r="1.5" fill="white"/></svg>
    </div>
  );
}

function ParentBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 6px rgba(124,58,237,0.35)' }}>王</div>
      <div>
        <div style={{ background: '#fff', borderRadius: '4px 14px 14px 14px', padding: '9px 13px', fontSize: 13, color: '#1a1a1a', lineHeight: 1.6, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', maxWidth: 190 }}>{text}</div>
        <span style={{ fontSize: 10, color: '#aaa', marginTop: 3, display: 'block' }}>{time}</span>
      </div>
    </div>
  );
}

function FlexBubble({ flex }: { flex: FlexMsg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
      <span style={{ fontSize: 10, color: '#aaa', alignSelf: 'flex-end', marginBottom: 2 }}>{flex.time}</span>
      <div style={{ maxWidth: 210, borderRadius: 14, overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ background: `linear-gradient(135deg, ${flex.avatarGradient[0]}, ${flex.avatarGradient[1]})`, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', border: '1.5px solid rgba(255,255,255,0.7)', color: '#1a5c59', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{flex.avatar}</div>
          <div>
            <div style={{ color: '#1a4a48', fontWeight: 700, fontSize: 12, letterSpacing: 0.3 }}>{flex.senderName}</div>
            <div style={{ color: '#2d6b68', fontSize: 10 }}>{flex.senderRole}</div>
          </div>
        </div>
        <div style={{ background: '#fff', padding: '11px 13px', fontSize: 12.5, color: '#1a1a1a', lineHeight: 1.65 }}>{flex.body}</div>
      </div>
    </div>
  );
}

function TextBubble({ text, time }: { text: string; time: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
      <span style={{ fontSize: 10, color: '#aaa', alignSelf: 'flex-end', marginBottom: 2 }}>{time}</span>
      <div style={{ maxWidth: 200, background: LINE_GREEN, borderRadius: '14px 4px 14px 14px', padding: '10px 13px', fontSize: 12.5, color: '#fff', lineHeight: 1.65, whiteSpace: 'pre-line', boxShadow: '0 2px 8px rgba(6,199,85,0.3)' }}>{text}</div>
    </div>
  );
}

function ChatInput() {
  return (
    <div style={{ background: '#f8f8f8', borderTop: '1px solid #e8e8e8', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#aaa" strokeWidth="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="10" r="1" fill="#aaa"/><circle cx="15" cy="10" r="1" fill="#aaa"/></svg>
      <div style={{ flex: 1, background: '#fff', borderRadius: 20, padding: '7px 13px', fontSize: 13, color: '#bbb', border: '1px solid #e5e5e5' }}>輸入訊息…</div>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: LINE_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(6,199,85,0.4)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

function Phone({ label, labelColor, labelBg, headerColor, messages }: {
  label: string; labelColor: string; labelBg: string; headerColor: string; messages: Msg[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ background: labelBg, color: labelColor, borderRadius: 20, padding: '5px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ width: 320, borderRadius: 36, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)', border: '8px solid #1a1a1a', background: '#1a1a1a', position: 'relative' }}>
        <div style={{ background: '#1a1a1a', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 8, borderRadius: 4, background: '#333' }} />
        </div>
        <div style={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          <div style={{ background: headerColor }}>
            <StatusBar />
            <ChatHeader color={headerColor} />
          </div>
          <div style={{ background: '#ebebeb', padding: '14px 12px', minHeight: 420, overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#888', background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: '2px 10px' }}>今天</span>
            </div>
            {messages.map((m, i) => {
              if (m.from === 'parent') return <ParentBubble key={i} text={m.text!} time={m.time} />;
              if (m.from === 'staff-flex') return <FlexBubble key={i} flex={m.flex!} />;
              return <TextBubble key={i} text={m.text!} time={m.time} />;
            })}
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}

const FLEX_MSGS: Msg[] = [
  { from: 'parent', text: '你好，請問孩子下週五的課可以改時間嗎？', time: '14:20' },
  {
    from: 'staff-flex', time: '14:35',
    flex: { avatar: '信', avatarGradient: [TIFFANY, CORAL], senderName: '台北信義分校', senderRole: '陳怡君主任', body: '您好！已幫您確認，下週五可改到週六上午 10:00，請放心！😊', time: '14:35' },
  },
  { from: 'parent', text: '太好了，謝謝！', time: '14:37' },
  {
    from: 'staff-flex', time: '14:38',
    flex: { avatar: '信', avatarGradient: [TIFFANY, CORAL], senderName: '台北信義分校', senderRole: '陳怡君主任', body: '不客氣！如有任何問題隨時詢問我們，祝孩子學習愉快 🌟', time: '14:38' },
  },
];

const TEXT_MSGS: Msg[] = [
  { from: 'parent', text: '你好，請問孩子下週五的課可以改時間嗎？', time: '14:20' },
  { from: 'staff-text', text: '【台北信義分校 陳主任】\n您好！已幫您確認，下週五可改到週六上午 10:00，請放心！😊', time: '14:35' },
  { from: 'parent', text: '太好了，謝謝！', time: '14:37' },
  { from: 'staff-text', text: '【台北信義分校 陳主任】\n不客氣！如有任何問題隨時詢問我們，祝孩子學習愉快 🌟', time: '14:38' },
];

export default function StaffReplyVariants() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdf4 40%, #faf5ff 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '36px 24px 48px', gap: 36,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>家長 LINE 收到的回覆樣式</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>選擇最適合您品牌的顯示方式</div>
      </div>

      <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Phone
            label="方案 A — Flex 卡片署名"
            labelColor="#0e7b76" labelBg="#d0f5f3"
            headerColor={LINE_GREEN}
            messages={FLEX_MSGS}
          />
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#374151', width: 280, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: '#0e7b76', marginBottom: 6 }}>✦ 方案 A 特色</div>
            ✅ 分校頭像 + 姓名一目了然<br/>
            ✅ 彩色漸層，品牌感強<br/>
            ✅ 可依分校設定不同顏色<br/>
            ⚠️ 每則訊息略大，需用 Flex API
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Phone
            label="方案 B — 文字署名"
            labelColor="#374151" labelBg="#f3f4f6"
            headerColor={LINE_GREEN}
            messages={TEXT_MSGS}
          />
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#374151', width: 280, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>✦ 方案 B 特色</div>
            ✅ 輕量，傳送速度快<br/>
            ✅ 所有 LINE 帳號皆支援<br/>
            ✅ 開發成本低<br/>
            ⚠️ 視覺較樸素，無品牌色
          </div>
        </div>
      </div>
    </div>
  );
}
