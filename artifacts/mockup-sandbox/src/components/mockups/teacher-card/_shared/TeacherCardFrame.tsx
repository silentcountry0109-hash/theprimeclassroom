import '../_group.css';
import { Star, Award } from 'lucide-react';

export const TIFFANY = '#81D8D0';
export const TIFFANY_DARK = '#2A8F86';

export interface TeacherCardFrameProps {
  name: string;
  photo: string;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  bookedSeats?: number;
  maxSeats?: number;
  isCertified?: boolean;
  /** variant caption shown above the card */
  label?: string;
  /** overlay badge pinned to the top-left of the photo */
  photoBadgeLeft?: React.ReactNode;
  /** rendered inside the photo overlay, directly under the name */
  underName?: React.ReactNode;
  /** rendered between the photo and the seat dots */
  belowPhoto?: React.ReactNode;
  /** rendered below the availability text */
  footer?: React.ReactNode;
}

/**
 * Faithful port of the live site CoachCard (client/src/components/coach-card.tsx)
 * with named slots so every "授課分校" placement variant shares an identical base.
 */
export function TeacherCardFrame({
  name,
  photo,
  specialties,
  rating,
  reviewCount,
  bookedSeats = 0,
  maxSeats = 5,
  isCertified,
  label,
  photoBadgeLeft,
  underName,
  belowPhoto,
  footer,
}: TeacherCardFrameProps) {
  const availableSeats = maxSeats - bookedSeats;

  return (
    <div
      className="teacher-card-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#FAF9F6',
        padding: 28,
      }}
    >
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: 1 }}>
          {label}
        </div>
      )}

      <div style={{ width: 240 }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '3 / 4',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(129,216,208,0.2), rgba(129,216,208,0.05))',
          }}
        >
          <img
            src={photo}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1) 50%, transparent)',
            }}
          />

          {isCertified && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: TIFFANY,
                color: '#fff',
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500,
              }}
            >
              <Award size={12} /> 認證
            </div>
          )}

          {photoBadgeLeft}

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, color: '#fff' }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 2px' }}>{name}</h3>
            {underName}
            {specialties && specialties.length > 0 && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 6px' }}>
                {specialties.join(' · ')}
              </p>
            )}
            {rating != null && rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} style={{ fill: '#FFCC4D', color: '#FFCC4D' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{rating.toFixed(1)}</span>
                {reviewCount != null && reviewCount > 0 && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {belowPhoto}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          {Array.from({ length: maxSeats }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                border: '2px solid',
                borderColor: i < bookedSeats ? TIFFANY : '#d1d5db',
                background: i < bookedSeats ? TIFFANY : 'transparent',
              }}
            />
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
          {availableSeats > 0 ? `餘位 ${availableSeats} / ${maxSeats}` : '已額滿'}
        </p>

        {footer}
      </div>
    </div>
  );
}

export const SAMPLE = {
  name: '林佳慧',
  photo: `${import.meta.env.BASE_URL}images/teacher_1.png`,
  specialties: ['代數思維', '幾何啟蒙'],
  rating: 4.9,
  reviewCount: 128,
  bookedSeats: 3,
  maxSeats: 5,
  isCertified: true,
};
