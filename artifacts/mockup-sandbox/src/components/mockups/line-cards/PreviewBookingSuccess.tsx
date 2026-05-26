import { LineCardShell, InfoRow, Divider } from './_shell';

export function PreviewBookingSuccess() {
  return (
    <LineCardShell
      tone="success"
      ipImg="ip-poses/ip-thumbs-up.png"
      title="課程預約成功！"
      subtitle="The Prime 質數教室"
      ctaLabel="查看預約詳情 →"
      timestamp="上午 10:23"
    >
      <InfoRow label="孩子" value="陳小明" valueColor="#4fbdb4" />
      <Divider />
      <InfoRow label="📅 日期" value="2026/05/03（日）" />
      <InfoRow label="🕙 時間" value="10:00 – 11:00" />
      <InfoRow label="👩‍🏫 老師" value="林老師" />
      <InfoRow label="📍 地點" value="台北信義分校" />
      <Divider />
      <InfoRow label="剩餘" value={<span className="credit-badge">🎫 5 堂</span>} />
    </LineCardShell>
  );
}
