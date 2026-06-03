import { MapPin } from 'lucide-react';
import { TeacherCardFrame, SAMPLE } from './_shared/TeacherCardFrame';

export function VariantB() {
  return (
    <TeacherCardFrame
      {...SAMPLE}
      label="方案 B · 名稱下方資訊列"
      underName={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
            margin: '0 0 4px',
          }}
        >
          <MapPin size={11} /> 台北信義分校
        </div>
      }
    />
  );
}
