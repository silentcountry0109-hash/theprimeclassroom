import { MapPin } from 'lucide-react';
import { TeacherCardFrame, SAMPLE, TIFFANY_DARK } from './_shared/TeacherCardFrame';

export function VariantA() {
  return (
    <TeacherCardFrame
      {...SAMPLE}
      label="方案 A · 照片左上角標"
      photoBadgeLeft={
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(255,255,255,0.92)',
            color: TIFFANY_DARK,
            fontSize: 11.5,
            padding: '4px 9px',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          <MapPin size={11} /> 台北信義
        </div>
      }
    />
  );
}
