import '../_group.css';

const logo = `${import.meta.env.BASE_URL}logo.png`;
const ipBase = `${import.meta.env.BASE_URL}images/`;

export interface LineCardShellProps {
  /** mascot image filename inside public/images, e.g. "ip-booking.png" */
  ip: string;
  /** gradient (or color) for the IP banner row background */
  accent: string;
  /** speech-bubble heading */
  title: React.ReactNode;
  /** speech-bubble sub line */
  subtitle: React.ReactNode;
  /** speech-bubble heading colour */
  titleColor?: string;
  /** speech-bubble sub colour */
  subColor?: string;
  /** card body rows */
  children: React.ReactNode;
  /** CTA button label */
  ctaLabel: React.ReactNode;
  /** CTA button background */
  ctaBg: string;
  /** CTA text colour */
  ctaColor?: string;
  /** chat timestamp */
  timestamp: string;
}

/**
 * Unified shell for every parent-facing LINE Flex card.
 * Guarantees an identical phone shell, chat header, IP-character + speech-bubble
 * row, body layout and CTA across all cards so only the content varies.
 */
export function LineCardShell({
  ip,
  accent,
  title,
  subtitle,
  titleColor = '#2A8F86',
  subColor = '#6acfc8',
  children,
  ctaLabel,
  ctaBg,
  ctaColor = 'white',
  timestamp,
}: LineCardShellProps) {
  return (
    <div className="line-card-root">
      <div className="phone-shell">
        <div className="chat-header">
          <div className="chat-header-avatar">
            <img src={logo} alt="質數教室" />
          </div>
          質數教室
        </div>

        <div className="chat-area">
          <div className="bubble-row">
            <div className="sender-avatar">
              <img src={logo} alt="質數教室" />
            </div>
            <div className="flex-card">
              <div className="card-ip-row" style={{ background: accent }}>
                <img className="card-ip-img" src={`${ipBase}${ip}`} alt="質數小精靈" />
                <div className="ip-speech-bubble">
                  <div className="ip-speech-title" style={{ color: titleColor, fontSize: 13.5 }}>
                    {title}
                  </div>
                  <div className="ip-speech-sub" style={{ color: subColor, fontSize: 10.5 }}>
                    {subtitle}
                  </div>
                </div>
              </div>

              <div className="card-body">{children}</div>

              <div className="card-footer">
                <button className="cta-btn" style={{ background: ctaBg, color: ctaColor }}>
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
