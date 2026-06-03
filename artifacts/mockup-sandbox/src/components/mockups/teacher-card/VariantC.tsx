import { MapPin } from 'lucide-react';
import { TeacherCardFrame, SAMPLE, TIFFANY_DARK } from './_shared/TeacherCardFrame';

export function VariantC() {
  return (
    <TeacherCardFrame
      {...SAMPLE}
      label="方案 C · 卡片底部分校條"
      footer={
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            background: 'rgba(129,216,208,0.12)',
            border: '1px solid rgba(129,216,208,0.45)',
            borderRadius: 10,
            padding: '7px 10px',
            fontSize: 12,
            color: TIFFANY_DARK,
            fontWeight: 500,
          }}
        >
          <MapPin size={12} /> 授課分校 · 台北信義
        </div>
      }
    />
  );
}
