import type { ReactNode } from 'react';
import './_group.css';
import './_shell.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;

export type Tone = 'success' | 'reminder' | 'cancel' | 'warning' | 'info' | 'welcome';

const TONE_MAP: Record<Tone, { ipBg: string; titleColor: string; subColor: string; cta: string }> = {
  success: { ipBg: 'linear-gradient(135deg, #81D8D0 0%, #4fbdb4 100%)', titleColor: '#3ab5ab', subColor: '#6acfc8', cta: '#81D8D0' },
  reminder:{ ipBg: 'linear-gradient(135deg, #FFB7B2 0%, #f0847c 100%)', titleColor: '#e06860', subColor: '#f0847c', cta: '#FFB7B2' },
  cancel:  { ipBg: 'linear-gradient(135deg, #90A4AE 0%, #546E7A 100%)', titleColor: '#546E7A', subColor: '#78909C', cta: '#78909C' },
  warning: { ipBg: 'linear-gradient(135deg, #FFE082 0%, #FFB300 100%)', titleColor: '#B45309', subColor: '#D97706', cta: '#F59E0B' },
  info:    { ipBg: 'linear-gradient(135deg, #A5D6A7 0%, #66BB6A 100%)', titleColor: '#2E7D32', subColor: '#43A047', cta: '#66BB6A' },
  welcome: { ipBg: 'linear-gradient(135deg, #81D8D0 0%, #06C755 100%)', titleColor: '#15803D', subColor: '#06C755', cta: '#06C755' },
};

interface ShellProps {
  tone: Tone;
  ipImg: string;        // e.g. "ip-poses/ip-thumbs-up.png"
  title: string;
  subtitle: string;
  ctaLabel: string;
  timestamp: string;
  children: ReactNode; // card body rows
}

export function LineCardShell({ tone, ipImg, title, subtitle, ctaLabel, timestamp, children }: ShellProps) {
  const t = TONE_MAP[tone];
  const ipSrc = `${import.meta.env.BASE_URL}${ipImg}`;
  return (
    <div className="line-card-root">
      <div className="phone-shell shell-v2">
        <div className="chat-header">
          <div className="chat-header-avatar"><img src={logo} alt="質數教室" /></div>
          質數教室
        </div>

        <div className="chat-area shell-chat">
          <div className="bubble-row">
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="typing-bubble">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>

          <div className="bubble-row" style={{ marginTop: 6 }}>
            <div className="sender-avatar"><img src={logo} alt="質數教室" /></div>
            <div className="flex-card flex-card-v2">
              <div className="card-ip-row card-ip-row-v2" style={{ background: t.ipBg }}>
                <img className="card-ip-img card-ip-img-v2" src={ipSrc} alt="質數先生" />
                <div className="ip-speech-bubble ip-speech-v2">
                  <div className="ip-speech-title" style={{ color: t.titleColor }}>{title}</div>
                  <div className="ip-speech-sub" style={{ color: t.subColor }}>{subtitle}</div>
                </div>
              </div>

              <div className="card-body card-body-v2">
                {children}
              </div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: t.cta, color: 'white' }}>
                  {ctaLabel}
                </button>
              </div>
            </div>
          </div>
          <div className="timestamp">{timestamp}</div>
        </div>
      </div>
    </div>
  );
}

/* 共用 row 元件，給卡片 body 使用 */
export function InfoRow({ label, value, valueColor, strike }: { label: string; value: ReactNode; valueColor?: string; strike?: boolean }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span
        className="info-value"
        style={{
          ...(valueColor ? { color: valueColor, fontWeight: 700 } : null),
          ...(strike ? { textDecoration: 'line-through', color: '#bbb' } : null),
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function Divider() { return <div className="divider" />; }

export function Hint({ tone = 'neutral', children }: { tone?: 'neutral' | 'warn' | 'info' | 'success' | 'danger'; children: ReactNode }) {
  const styles: Record<string, { bg: string; bd: string; fg: string }> = {
    neutral: { bg: '#FAFAF7', bd: '#EAEAEA', fg: '#555' },
    warn:    { bg: '#FFF8E1', bd: '#FFE082', fg: '#B45309' },
    info:    { bg: '#F0F9FF', bd: '#BAE6FD', fg: '#0369A1' },
    success: { bg: '#F0FDFA', bd: '#99F6E4', fg: '#0F766E' },
    danger:  { bg: '#FFEBEE', bd: '#FFCDD2', fg: '#B91C1C' },
  };
  const s = styles[tone];
  return (
    <div style={{ fontSize: 11, color: s.fg, background: s.bg, borderRadius: 8, padding: '7px 10px', lineHeight: 1.5, border: `1px solid ${s.bd}` }}>
      {children}
    </div>
  );
}
