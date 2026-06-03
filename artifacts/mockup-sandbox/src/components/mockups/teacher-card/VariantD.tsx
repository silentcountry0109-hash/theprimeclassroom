import { MapPin } from 'lucide-react';
import { TeacherCardFrame, SAMPLE, TIFFANY_DARK } from './_shared/TeacherCardFrame';

const BRANCHES = ['台北信義', '台北大安', '桃園中壢'];

export function VariantD() {
  const shown = BRANCHES.slice(0, 2);
  const extra = BRANCHES.length - shown.length;

  return (
    <TeacherCardFrame
      {...SAMPLE}
      label="方案 D · 多分校標籤（可教多間）"
      belowPhoto={
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {shown.map((b, i) => (
            <span
              key={b}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(129,216,208,0.12)',
                border: '1px solid rgba(129,216,208,0.45)',
                borderRadius: 999,
                padding: '3px 9px',
                fontSize: 11,
                color: TIFFANY_DARK,
                fontWeight: 500,
              }}
            >
              {i === 0 && <MapPin size={11} />} {b}
            </span>
          ))}
          {extra > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f3f4f6',
                borderRadius: 999,
                padding: '3px 9px',
                fontSize: 11,
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              +{extra} 分校
            </span>
          )}
        </div>
      }
    />
  );
}
