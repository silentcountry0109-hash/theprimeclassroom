import { LineCardShell, InfoRow, Divider, Hint } from './_shell';

export function PreviewLowCredits() {
  return (
    <LineCardShell
      tone="warning"
      ipImg="ip-poses/ip-warning-sign.png"
      title="點數即將用完"
      subtitle="僅剩 1 堂課"
      ctaLabel="🛒 前往加值點數 →"
      timestamp="下午 10:00"
    >
      <InfoRow label="孩子" value="陳小明" valueColor="#D97706" />
      <Divider />
      <InfoRow
        label="點數"
        value={
          <span
            className="credit-badge"
            style={{ background: '#FFF3E0', borderColor: '#FFCC80', color: '#E65100' }}
          >
            ⚠️ 剩 1 堂
          </span>
        }
      />
      <InfoRow label="🕙 下次" value="2026/05/05（二）16:30" />
      <Divider />
      <Hint tone="warn">
        ⚠️ 為避免影響下一堂課，請盡快至 App 加值點數。
      </Hint>
    </LineCardShell>
  );
}
