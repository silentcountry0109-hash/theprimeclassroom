import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Link } from "wouter";
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
  Users,
  GraduationCap,
  ArrowLeft,
  Calendar,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Child } from "@shared/schema";

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

interface SlotResult {
  slot: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    maxSeats: number;
    bookedSeats: number;
  };
  franchise: {
    id: number;
    name: string;
    city: string;
    district: string;
    address: string;
  };
  coach: {
    id: number;
    name: string;
    specialties: string[] | null;
    isCertified: boolean;
    rating: number | null;
  } | null;
}

export default function SearchResults() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const city = params.get("city") || "";
  const grade = params.get("grade") || "";
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [bookingSlot, setBookingSlot] = useState<SlotResult | null>(null);
  const [selectedChild, setSelectedChild] = useState("");

  const { data: results = [], isLoading } = useQuery<SlotResult[]>({
    queryKey: ["/api/search-slots", city, grade],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (city) p.set("city", city);
      if (grade) p.set("grade", grade);
      const res = await fetch(`/api/search-slots?${p.toString()}`);
      if (!res.ok) throw new Error("Search failed");
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
      queryClient.invalidateQueries({ queryKey: ["/api/search-slots"] });
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

  const handleBook = (slot: SlotResult) => {
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
      slotId: bookingSlot.slot.id,
      childId: parseInt(selectedChild),
    });
  };

  const gradeLabel = grade
    ? `${["一", "二", "三", "四", "五", "六"][parseInt(grade) - 1]}年級`
    : "";

  return (
    <div className="min-h-screen bg-washi">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-4 block">
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </span>
          </Link>
          <h1
            className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-foreground mb-2"
            data-testid="text-search-title"
          >
            搜尋結果
          </h1>
          <p className="text-sm text-muted-foreground">
            {city && <span className="mr-2">{city}</span>}
            {gradeLabel && <span className="mr-2">{gradeLabel}</span>}
            {results.length > 0 && (
              <span>
                — 找到 {results.length} 個可預約時段
              </span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-md" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📐</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              目前沒有符合條件的時段
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              試試其他地區或年級？
            </p>
            <Link href="/">
              <Button className="rounded-full" data-testid="button-back-search">
                重新搜尋
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const available =
                result.slot.maxSeats - result.slot.bookedSeats;
              return (
                <div
                  key={result.slot.id}
                  className="bg-white rounded-md border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-4"
                  data-testid={`slot-card-${result.slot.id}`}
                >
                  {result.coach && TEACHER_PHOTOS[result.coach.name] && (
                    <div className="flex-shrink-0">
                      <img
                        src={TEACHER_PHOTOS[result.coach.name]}
                        alt={result.coach.name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-tiffany/20"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground">
                        {result.franchise.name}
                      </h3>
                      {result.coach?.isCertified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3" />
                          認證老師
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {result.franchise.city} {result.franchise.district}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {result.slot.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {result.slot.startTime} - {result.slot.endTime}
                      </span>
                      {result.coach && (
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {result.coach.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {Array.from({ length: result.slot.maxSeats }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < result.slot.bookedSeats
                                  ? "bg-tiffany"
                                  : "border border-gray-300"
                              }`}
                            />
                          )
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        餘位 {available}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleBook(result)}
                      disabled={available <= 0}
                      className="rounded-full px-6"
                      style={
                        available > 0
                          ? { backgroundColor: "#81D8D0", color: "white" }
                          : {}
                      }
                      data-testid={`button-book-${result.slot.id}`}
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
                  {bookingSlot.franchise.name}
                </p>
                <p>
                  <span className="text-muted-foreground">時間：</span>
                  {bookingSlot.slot.date} {bookingSlot.slot.startTime} -{" "}
                  {bookingSlot.slot.endTime}
                </p>
                {bookingSlot.coach && (
                  <p>
                    <span className="text-muted-foreground">老師：</span>
                    {bookingSlot.coach.name}
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
