import { Star, Award, MapPin } from "lucide-react";
import { getCoachPhoto } from "@/lib/default-images";

interface CoachCardProps {
  name: string;
  photoUrl?: string | null;
  coachId?: number;
  specialties?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  bookedSeats?: number;
  maxSeats?: number;
  isCertified?: boolean;
  branchNames?: string[] | null;
}

export default function CoachCard({
  name,
  photoUrl,
  coachId,
  specialties,
  rating,
  reviewCount,
  bookedSeats = 0,
  maxSeats = 5,
  isCertified,
  branchNames,
}: CoachCardProps) {
  const resolvedPhoto = getCoachPhoto(name, coachId, photoUrl);
  const availableSeats = maxSeats - bookedSeats;
  const branches = branchNames ?? [];
  const shownBranches = branches.slice(0, 2);
  const extraBranches = branches.length - shownBranches.length;

  return (
    <div
      className="relative w-60 flex-shrink-0 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
      data-testid={`card-coach-${name}`}
    >
      <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-tiffany/20 to-tiffany/5">
        <img
          src={resolvedPhoto}
          alt={name}
          className="w-full h-full object-cover rounded-2xl"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl" />

        {isCertified && (
          <div className="absolute top-3 right-3 bg-tiffany text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <Award className="w-3 h-3" />
            認證
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-medium mb-0.5">{name}</h3>
          {specialties && specialties.length > 0 && (
            <p className="text-sm text-white/80 mb-1.5">
              {specialties.join(" · ")}
            </p>
          )}
          {rating != null && rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-warm text-amber-warm" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              {reviewCount != null && reviewCount > 0 && (
                <span className="text-xs text-white/60">({reviewCount})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {branches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5" data-testid={`branches-coach-${name}`}>
          {shownBranches.map((b, i) => (
            <span
              key={b}
              className="inline-flex items-center gap-0.5 bg-tiffany/10 border border-tiffany/40 text-[#2A8F86] rounded-full px-2 py-0.5 text-[11px] font-medium"
              data-testid={`branch-tag-${name}-${i}`}
            >
              {i === 0 && <MapPin className="w-3 h-3" />}
              {b}
            </span>
          ))}
          {extraBranches > 0 && (
            <span
              className="inline-flex items-center bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-[11px] font-medium"
              data-testid={`branch-overflow-${name}`}
            >
              +{extraBranches} 分校
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-3">
        {Array.from({ length: maxSeats }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
              i < bookedSeats
                ? "bg-tiffany border-tiffany"
                : "bg-transparent border-gray-300"
            }`}
            data-testid={`seat-${i}`}
          />
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-1">
        {availableSeats > 0 ? `餘位 ${availableSeats} / ${maxSeats}` : "已額滿"}
      </p>
    </div>
  );
}
