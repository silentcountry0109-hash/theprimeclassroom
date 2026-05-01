import { useState } from 'react';

const LINE_GREEN = '#06C755';

type Status = 'unread' | 'processing' | 'done';
type Tab = 'all' | 'unread' | 'processing' | 'done';

interface Message {
  id: number;
  from: 'user' | 'admin';
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  status: Status;
  unreadCount: number;
  messages: Message[];
}

const INIT_CONVOS: Conversation[] = [
  {
    id: 1, name: '陳大文爸爸', avatar: '陳', preview: '好的，謝謝老師！', time: '08:55',
    status: 'processing', unreadCount: 0,
    messages: [
      { id: 1, from: 'user', text: '想詢問一下孩子的學習進度', time: '08:30' },
      { id: 2, from: 'admin', text: '您好！我們已將您的問題轉給台北信義分校主任，稍後會與您聯繫。', time: '08:45' },
      { id: 3, from: 'user', text: '好的，謝謝老師！', time: '08:55' },
    ],
  },
  {
    id: 2, name: '李小芸媽媽', avatar: '李', preview: '收到，我們等通知。', time: '昨天',
    status: 'processing', unreadCount: 0,
    messages: [
      { id: 1, from: 'user', text: '請問下個月的課表什麼時候出來？', time: '昨天 14:20' },
      { id: 2, from: 'admin', text: '預計這週五公告，我們會提前通知您！', time: '昨天 15:00' },
      { id: 3, from: 'user', text: '收到，我們等通知。', time: '昨天 15:05' },
    ],
  },
  {
    id: 3, name: '吳雅惠媽媽', avatar: '吳', preview: '請問可以幫孩子轉班嗎？', time: '週二',
    status: 'unread', unreadCount: 1,
    messages: [
      { id: 1, from: 'user', text: '你好，我的孩子目前在週三下午班，想詢問是否可以改到週六上午班？', time: '週二 16:45' },
    ],
  },
];

const STATUS_LABEL: Record<Status, { label: string; color: string; bg: string }> = {
  unread: { label: '未讀', color: '#ef4444', bg: '#fee2e2' },
  processing: { label: '處理中', color: '#f59e0b', bg: '#fef3c7' },
  done: { label: '已完成', color: '#6b7280', bg: '#f3f4f6' },
};

export function FranchiseInbox() {
  const [convos, setConvos] = useState<Conversation[]>(INIT_CONVOS);
  const [selected, setSelected] = useState<number>(1);
  const [tab, setTab] = useState<Tab>('all');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const current = convos.find(c => c.id === selected)!;

  const filtered = convos.filter(c => {
    const matchTab = tab === 'all' || c.status === tab;
    const matchSearch = !search || c.name.includes(search) || c.preview.includes(search);
    return matchTab && matchSearch;
  });

  function selectConvo(id: number) {
    setSelected(id);
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  }

  function send() {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setConvos(prev => prev.map(c => c.id === selected ? {
      ...c,
      preview: input.trim(),
      time: timeStr,
      messages: [...c.messages, { id: Date.now(), from: 'admin', text: input.trim(), time: timeStr }],
    } : c));
    setInput('');
  }

  function markDone() {
    setConvos(prev => prev.map(c => c.id === selected ? { ...c, status: 'done' } : c));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'unread', label: '未讀' },
    { key: 'processing', label: '處理中' },
    { key: 'done', label: '已完成' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Noto Sans TC', sans-serif", background: '#f0f0f0', overflow: 'hidden' }}>
      {/* ── 左欄 ── */}
      <div style={{ width: 320, minWidth: 320, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        {/* 標頭 */}
        <div style={{ background: '#1d4ed8', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 40 40" width="22" height="22"><path d="M20 4C11.163 4 4 10.268 4 18c0 4.942 2.868 9.28 7.24 11.944L9.6 36l6.52-3.424A18.3 18.3 0 0 0 20 32c8.837 0 16-5.373 16-12S28.837 4 20 4z" fill={LINE_GREEN}/></svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>分校主任專區</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>只顯示指派給您的對話</div>
          </div>
        </div>
        {/* 提示橫幅 */}
        <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>ℹ️</span>
          <span style={{ fontSize: 11, color: '#1d4ed8' }}>以下對話已由總部指派給您處理</span>
        </div>
        {/* 搜尋 */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋對話…"
            style={{ width: '100%', padding: '7px 12px', borderRadius: 20, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }}
          />
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '8px 0', fontSize: 12, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#1d4ed8' : '#6b7280',
              borderBottom: tab === t.key ? '2px solid #1d4ed8' : '2px solid transparent',
              background: 'none', border: 'none', borderBottomWidth: 2,
              borderBottomStyle: 'solid', borderBottomColor: tab === t.key ? '#1d4ed8' : 'transparent',
              cursor: 'pointer', transition: 'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
        {/* 對話列表 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>沒有符合的對話</div>
          )}
          {filtered.map(c => {
            const sl = STATUS_LABEL[c.status];
            return (
              <div key={c.id} onClick={() => selectConvo(c.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                background: selected === c.id ? '#eff6ff' : '#fff',
                borderLeft: selected === c.id ? '3px solid #1d4ed8' : '3px solid transparent',
                borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: LINE_GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{c.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {c.unreadCount > 0 && (
                        <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{c.unreadCount}</span>
                      )}
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.time}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: sl.bg, color: sl.color, fontWeight: 600 }}>{sl.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 右欄 ── */}
      {current && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* 頂部工具列 */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: LINE_GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{current.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{current.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>指派給您的對話</div>
            </div>
            <button onClick={markDone} style={{
              padding: '5px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none',
              background: current.status === 'done' ? '#6b7280' : '#1d4ed8', color: '#fff', cursor: 'pointer',
            }}>{current.status === 'done' ? '已完成 ✓' : '標記完成'}</button>
          </div>

          {/* 聊天氣泡 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f0f0f0' }}>
            {current.messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'admin' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {m.from === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: LINE_GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{current.avatar}</div>
                )}
                <div style={{ maxWidth: '60%' }}>
                  <div style={{
                    padding: '9px 13px', borderRadius: m.from === 'admin' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: m.from === 'admin' ? '#1d4ed8' : '#fff',
                    color: m.from === 'admin' ? '#fff' : '#111',
                    fontSize: 14, lineHeight: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
                  }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, textAlign: m.from === 'admin' ? 'right' : 'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 輸入框 */}
          <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="輸入回覆訊息…"
              style={{ flex: 1, padding: '9px 14px', borderRadius: 24, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', background: '#f9fafb' }}
            />
            <button onClick={send} style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none',
              background: input.trim() ? '#1d4ed8' : '#d1d5db', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s',
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
