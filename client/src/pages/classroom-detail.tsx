import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Award,
  GraduationCap,
  Phone,
  Users,
  Sparkles,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Franchise, Coach, Child } from "@shared/schema";
import { DAY_LABELS } from "@shared/constants";

import teacher1Img from "@assets/teacher_1.png";
import teacher2Img from "@assets/teacher_2.png";
import teacher3Img from "@assets/teacher_3.png";
import teacher4Img from "@assets/teacher_4.png";
import teacher5Img from "@assets/teacher_5.png";
import teacher6Img from "@assets/teacher_6.png";

const TEACHER_PHOTOS: Record<string, string> = {
  "林佳慧": teacher1Img,
  "陳志明": teacher2Img,
  "王雅琪": teacher3Img,
  "張育銘": teacher4Img,
  "李美玲": teacher5Img,
  "黃建宏": teacher6Img,
};

interface SlotWithCoach {
  id: number;
  franchiseId: number;
  coachId: number | null;
  date: string;
  startTime: string;
  endTime: string;
  maxSeats: number;
  bookedSeats: number;
  isActive: boolean;
  coachName: string | null;
}

interface FranchiseDetail {
  franchise: Franchise;
  coaches: Coach[];
  timeSlots: SlotWithCoach[];
}

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "家長好評推薦": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "年度績優校區": { bg: "bg-tiffany/10", text: "text-tiffany", border: "border-tiffany/30" },
  "成績進步快速": { bg: "bg-coral/10", text: "text-coral", border: "border-coral/30" },
};

export default function ClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [bookingSlot, setBookingSlot] = useState<SlotWithCoach | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: detail, isLoading } = useQuery<FranchiseDetail>({
    queryKey: ["/api/franchises", id, "detail"],
    queryFn: async () => {
      const res = await fetch(`/api/franchises/${id}/detail`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
    enabled: isAuthenticated,
  });

  const bookMutation = useMutation({
    mutationFn: async (data: { slotId: number; childId: number }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "預約成功", description: "您的預約已確認" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchises", id, "detail"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setBookingSlot(null);
      setSelectedChild("");
    },
    onError: (error: Error) => {
      toast({
        title: "預約失敗",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBook = (slot: SlotWithCoach) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (children.length === 0) {
      toast({
        title: "請先新增孩子",
        description: "請到家長面板新增孩子後再進行預約",
        variant: "destructive",
      });
      return;
    }
    setBookingSlot(slot);
  };

  const confirmBooking = () => {
    if (!bookingSlot || !selectedChild) return;
    bookMutation.mutate({
      slotId: bookingSlot.id,
      childId: parseInt(selectedChild),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-washi">
        <Navbar />
        <div className="pt-24 pb-16 px-4 md:px-6 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-washi">
        <Navbar />
        <div className="pt-24 pb-16 px-6 text-center">
          <div className="text-6xl mb-4 opacity-20">🏫</div>
          <h2 className="text-lg font-medium mb-4">找不到此教室</h2>
          <Link href="/search">
            <Button className="rounded-full" data-testid="button-back-search">返回搜尋</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { franchise: f, coaches: coachList, timeSlots: slots } = detail;

  const dates = [...new Set(slots.map((s) => s.date))].sort();
  const activeDate = selectedDate || dates[0] || null;

  const filteredSlots = activeDate
    ? slots.filter((s) => s.date === activeDate)
    : slots;

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dow = d.getDay();
    return DAY_LABELS[dow.toString()] || "";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${getDayLabel(dateStr)}`;
  };

  return (
    <div className="min-h-screen bg-washi">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-5xl mx-auto">
        <Link href="/search">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-6 block" data-testid="link-back-search">
            <ArrowLeft className="w-4 h-4" />
            返回搜尋結果
          </span>
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <h1 className="font-serif text-2xl md:text-3xl tracking-[0.08em] text-foreground" data-testid="text-franchise-name">
                  {f.name}
                </h1>
                {(f.rating ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-sm bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full border border-amber-200 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {f.rating?.toFixed(1)}
                    <span className="text-xs text-amber-500 ml-0.5">({f.reviewCount})</span>
                  </span>
                )}
              </div>

              {f.tags && f.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {f.tags.map((tag) => {
                    const style = TAG_STYLES[tag] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
                    return (
                      <span key={tag} className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {tag === "家長好評推薦" && <Award className="w-3 h-3" />}
                        {tag === "年度績優校區" && <Sparkles className="w-3 h-3" />}
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-tiffany" />
                  {f.city} {f.district} {f.address}
                </p>
                {f.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-tiffany" />
                    {f.phone}
                  </p>
                )}
              </div>

              {f.description && (
                <p className="text-sm text-muted-foreground/80 mt-3 leading-relaxed">
                  {f.description}
                </p>
              )}

              {f.nearbySchools && f.nearbySchools.length > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-2">
                  鄰近學校：{f.nearbySchools.join("、")}
                </p>
              )}
            </div>
          </div>
        </div>

        {f.photos && f.photos.length > 0 && (
          <PhotoCarousel photos={f.photos} />
        )}

        {coachList.length > 0 && (
          <div className="mb-6">
            <h2 className="font-serif text-lg tracking-[0.08em] text-foreground mb-3" data-testid="text-coaches-title">
              教學老師
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {coachList.map((coach) => (
                <div key={coach.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3" data-testid={`coach-card-${coach.id}`}>
                  {TEACHER_PHOTOS[coach.name] ? (
                    <img
                      src={TEACHER_PHOTOS[coach.name]}
                      alt={coach.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-tiffany/20 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-tiffany" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">{coach.name}</span>
                      {coach.isCertified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" />
                          認證
                        </span>
                      )}
                    </div>
                    {coach.specialties && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {coach.specialties.map((s) => (
                          <span key={s} className="text-[10px] text-muted-foreground bg-gray-50 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {(coach.rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-muted-foreground">
                          {coach.rating?.toFixed(1)} ({coach.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-serif text-lg tracking-[0.08em] text-foreground mb-3" data-testid="text-slots-title">
            可預約時段
          </h2>

          {dates.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all ${
                    activeDate === date
                      ? "bg-tiffany text-white border-tiffany"
                      : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                  }`}
                  data-testid={`date-tab-${date}`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          )}

          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="text-4xl mb-3 opacity-20">📅</div>
              <p className="text-sm text-muted-foreground">此日期沒有可預約的時段</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredSlots.map((slot) => {
                const available = slot.maxSeats - slot.bookedSeats;
                return (
                  <div
                    key={slot.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:border-tiffany/20 hover:shadow-sm transition-all"
                    data-testid={`slot-card-${slot.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-tiffany" />
                        <span className="font-medium text-foreground">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: slot.maxSeats }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < slot.bookedSeats
                                ? "bg-tiffany"
                                : "border border-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {slot.coachName && (
                      <div className="flex items-center gap-2 mb-3">
                        {TEACHER_PHOTOS[slot.coachName] ? (
                          <img
                            src={TEACHER_PHOTOS[slot.coachName]}
                            alt={slot.coachName}
                            className="w-7 h-7 rounded-full object-cover border border-tiffany/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-tiffany/10 flex items-center justify-center">
                            <GraduationCap className="w-3.5 h-3.5 text-tiffany" />
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">{slot.coachName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        餘位 {available}/{slot.maxSeats}
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(slot);
                        }}
                        disabled={available <= 0}
                        className="rounded-full px-4 text-xs"
                        style={available > 0 ? { backgroundColor: "#81D8D0", color: "white" } : {}}
                        data-testid={`button-book-${slot.id}`}
                      >
                        {available > 0 ? "預約" : "已滿"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!bookingSlot}
        onOpenChange={() => {
          setBookingSlot(null);
          setSelectedChild("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認預約</DialogTitle>
          </DialogHeader>
          {bookingSlot && (
            <div className="space-y-4 py-4">
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">教室：</span>
                  {f.name}
                </p>
                <p>
                  <span className="text-muted-foreground">日期：</span>
                  {bookingSlot.date}
                </p>
                <p>
                  <span className="text-muted-foreground">時間：</span>
                  {bookingSlot.startTime} - {bookingSlot.endTime}
                </p>
                {bookingSlot.coachName && (
                  <p>
                    <span className="text-muted-foreground">老師：</span>
                    {bookingSlot.coachName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  選擇孩子
                </label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger data-testid="select-child-booking">
                    <SelectValue placeholder="請選擇孩子" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id.toString()}>
                        {child.name} ({child.grade}年級)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBookingSlot(null);
                setSelectedChild("");
              }}
            >
              取消
            </Button>
            <Button
              onClick={confirmBooking}
              disabled={!selectedChild || bookMutation.isPending}
              style={{ backgroundColor: "#81D8D0", color: "white" }}
              data-testid="button-confirm-booking"
            >
              {bookMutation.isPending ? "預約中..." : "確認預約"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1));

  return (
    <div className="mb-6" data-testid="photo-carousel">
      <h2 className="font-serif text-lg tracking-[0.08em] text-foreground mb-3 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-tiffany" />
        教室環境
      </h2>
      <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <img
            src={photos[current]}
            alt={`教室照片 ${current + 1}`}
            className="w-full h-full object-cover"
            data-testid={`photo-slide-${current}`}
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                data-testid="button-photo-prev"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                data-testid="button-photo-next"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-tiffany" : "bg-white/60"}`}
                data-testid={`photo-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
