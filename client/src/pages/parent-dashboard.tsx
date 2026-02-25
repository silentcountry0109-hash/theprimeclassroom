import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Users,
  CalendarCheck,
  LogOut,
  Plus,
  Trash2,
  GraduationCap,
  Clock,
  MapPin,
  Search,
  CalendarDays,
  ChevronRight,
  BookOpen,
  Star,
  XCircle,
  CheckCircle2,
  Edit3,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { Child, Booking, Franchise } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";

interface BookingWithDetails extends Booking {
  slotDate?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  franchiseName?: string;
  coachName?: string;
  childName?: string;
}

interface FranchiseResult {
  franchise: Franchise;
  availableSlots: number;
  coachCount: number;
  coaches: string[];
  nextAvailable: string | null;
}

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
  coaches: { id: number; name: string; specialties: string[] | null; rating: number | null; isCertified: boolean }[];
  timeSlots: SlotWithCoach[];
}

const TAB_ITEMS = [
  { id: "overview", label: "首頁", icon: Home },
  { id: "book", label: "預約課程", icon: CalendarDays },
  { id: "children", label: "我的孩子", icon: Users },
  { id: "bookings", label: "預約紀錄", icon: CalendarCheck },
];

export default function ParentDashboard() {
  const { user: replitUser, isLoading: replitLoading, logout: replitLogout } = useAuth();
  const { user: credUser, isLoading: credLoading, logout: credLogout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const isLoading = replitLoading || credLoading;
  const user = credUser || replitUser;
  const isCredentialUser = !!credUser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-4">
            質數教室
          </h1>
          <Skeleton className="w-32 h-2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "parent") {
    window.location.href = "/parent-login";
    return null;
  }

  const handleLogout = () => {
    if (isCredentialUser) {
      credLogout();
      window.location.href = "/parent-login";
    } else {
      replitLogout();
    }
  };

  const typedUser = user as User;

  return (
    <div className="min-h-screen bg-washi">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <a href="/" className="font-serif text-lg tracking-[0.12em] text-foreground" data-testid="link-home">
                質數教室
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={typedUser.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-tiffany/10 text-tiffany text-sm">
                    {typedUser.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:inline" data-testid="text-user-name">
                  {typedUser.firstName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? "border-tiffany text-tiffany"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-200"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <OverviewTab user={typedUser} onNavigate={setActiveTab} />
        )}
        {activeTab === "book" && <BookingFlowTab />}
        {activeTab === "children" && <ChildrenTab />}
        {activeTab === "bookings" && <BookingsTab />}
      </main>
    </div>
  );
}

function OverviewTab({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: (tab: string) => void;
}) {
  const { data: children = [], isError: childrenError } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });
  const { data: bookings = [], isError: bookingsError } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => {
      const dateA = `${a.slotDate} ${a.slotStartTime}`;
      const dateB = `${b.slotDate} ${b.slotStartTime}`;
      return dateA.localeCompare(dateB);
    });

  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-welcome">
          {user.firstName ? `${user.firstName}，歡迎回來` : "歡迎回來"}
        </h1>
        <p className="text-sm text-muted-foreground">
          在這裡管理孩子的課程與預約
        </p>
      </div>

      {(childrenError || bookingsError) && (
        <div className="bg-white rounded-xl border border-red-200 p-4 flex items-center gap-3" data-testid="error-loading">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">部分資料載入失敗，請重新整理頁面再試</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate("children")}
          className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-left hover:border-tiffany/30 hover:shadow-sm transition-all group"
          data-testid="card-stat-children"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tiffany/10 flex items-center justify-center mb-2 sm:mb-3">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-tiffany" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{children.length}</p>
          <p className="text-xs text-muted-foreground">登記的孩子</p>
        </button>

        <button
          onClick={() => onNavigate("bookings")}
          className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-left hover:border-tiffany/30 hover:shadow-sm transition-all group"
          data-testid="card-stat-upcoming"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-tiffany/10 flex items-center justify-center mb-2 sm:mb-3">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-tiffany" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
          <p className="text-xs text-muted-foreground">即將上課</p>
        </button>

        <button
          onClick={() => onNavigate("bookings")}
          className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 text-left hover:border-gray-200 hover:shadow-sm transition-all group"
          data-testid="card-stat-completed"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 sm:mb-3">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {bookings.filter((b) => b.status === "completed").length}
          </p>
          <p className="text-xs text-muted-foreground">已完成課程</p>
        </button>

        <button
          onClick={() => onNavigate("book")}
          className="bg-gradient-to-br from-tiffany/5 to-coral/5 rounded-xl border border-tiffany/20 p-3 sm:p-4 text-left hover:shadow-sm transition-all group"
          data-testid="card-quick-book"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-coral/10 flex items-center justify-center mb-2 sm:mb-3">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-coral" />
          </div>
          <p className="text-sm font-semibold text-foreground">預約新課程</p>
          <p className="text-xs text-muted-foreground">搜尋可用時段</p>
        </button>
      </div>

      {children.length === 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              還沒有登記孩子
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              請先登記孩子的資料，才能開始預約課程
            </p>
            <Button
              onClick={() => onNavigate("children")}
              size="sm"
              className="rounded-full"
              style={{ backgroundColor: "#81D8D0", color: "white" }}
              data-testid="button-add-child-cta"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              登記孩子
            </Button>
          </div>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">即將到來的課程</h2>
            {upcomingBookings.length > 3 && (
              <button
                onClick={() => onNavigate("bookings")}
                className="text-xs text-tiffany hover:underline flex items-center gap-0.5"
                data-testid="link-view-all-bookings"
              >
                查看全部
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 4).map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:border-tiffany/20 transition-colors"
                data-testid={`booking-upcoming-${booking.id}`}
              >
                <div className="flex-shrink-0 text-center min-w-[52px]">
                  <div className="text-xs text-muted-foreground">
                    {booking.slotDate?.split("-").slice(1).join("/")}
                  </div>
                  <div className="text-lg font-bold text-tiffany">
                    {booking.slotStartTime?.slice(0, 5)}
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {booking.franchiseName || "教室"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {booking.coachName && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {booking.coachName}
                      </span>
                    )}
                    {booking.childName && (
                      <span className="bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full">
                        {booking.childName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs bg-tiffany/10 text-tiffany px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    已確認
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingBookings.length === 0 && children.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            還沒有預約的課程
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            立刻預約，讓孩子開始學習之旅
          </p>
          <Button
            onClick={() => onNavigate("book")}
            className="rounded-full"
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            data-testid="button-book-first"
          >
            <Search className="w-4 h-4 mr-1.5" />
            搜尋教室
          </Button>
        </div>
      )}
    </div>
  );
}

function BookingFlowTab() {
  const { toast } = useToast();
  const [step, setStep] = useState<"search" | "detail" | "confirm">("search");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null);
  const [bookingSlot, setBookingSlot] = useState<SlotWithCoach | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const districts = city ? TAIWAN_DISTRICTS[city] || [] : [];

  const queryParams = new URLSearchParams();
  if (city) queryParams.set("city", city);
  if (district) queryParams.set("district", district);

  const { data: results = [], isLoading: searchLoading } = useQuery<FranchiseResult[]>({
    queryKey: ["/api/search-franchises", city, district],
    queryFn: async () => {
      const res = await fetch(`/api/search-franchises?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery<FranchiseDetail>({
    queryKey: ["/api/franchises", selectedFranchiseId, "detail"],
    queryFn: async () => {
      const res = await fetch(`/api/franchises/${selectedFranchiseId}/detail`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!selectedFranchiseId,
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const bookMutation = useMutation({
    mutationFn: async (data: { slotId: number; childId: number }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "預約成功！", description: "您的課程已確認預約" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchises", selectedFranchiseId, "detail"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setBookingSlot(null);
      setSelectedChild("");
      setStep("detail");
    },
    onError: (error: Error) => {
      toast({ title: "預約失敗", description: error.message, variant: "destructive" });
    },
  });

  const selectFranchise = (id: number) => {
    setSelectedFranchiseId(id);
    setSelectedDate(null);
    setStep("detail");
  };

  const handleBook = (slot: SlotWithCoach) => {
    if (children.length === 0) {
      toast({ title: "請先登記孩子", description: "到「我的孩子」登記後再回來預約", variant: "destructive" });
      return;
    }
    setBookingSlot(slot);
    if (children.length === 1) {
      setSelectedChild(children[0].id.toString());
    }
    setStep("confirm");
  };

  const confirmBooking = () => {
    if (!bookingSlot || !selectedChild) return;
    bookMutation.mutate({ slotId: bookingSlot.id, childId: parseInt(selectedChild) });
  };

  const slots = detail?.timeSlots || [];
  const dates = [...new Set(slots.map((s) => s.date))].sort();
  const activeDate = selectedDate || dates[0] || null;
  const filteredSlots = activeDate ? slots.filter((s) => s.date === activeDate) : slots;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dow = d.getDay();
    const dayLabel = DAY_LABELS[dow.toString()] || "";
    return `${d.getMonth() + 1}/${d.getDate()} ${dayLabel}`;
  };

  if (step === "confirm" && bookingSlot && detail) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <button
            onClick={() => { setStep("detail"); setBookingSlot(null); setSelectedChild(""); }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
            data-testid="button-back-to-slots"
          >
            ← 返回時段列表
          </button>
          <h2 className="text-xl font-semibold text-foreground">確認預約</h2>
          <p className="text-sm text-muted-foreground">請確認以下資訊</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-tiffany" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{detail.franchise.name}</p>
              <p className="text-xs text-muted-foreground">{detail.franchise.city} {detail.franchise.district}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">日期</p>
              <p className="text-sm font-medium text-foreground">{formatDate(bookingSlot.date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">時間</p>
              <p className="text-sm font-medium text-foreground">{bookingSlot.startTime} - {bookingSlot.endTime}</p>
            </div>
            {bookingSlot.coachName && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">老師</p>
                <p className="text-sm font-medium text-foreground">{bookingSlot.coachName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">剩餘名額</p>
              <p className="text-sm font-medium text-tiffany">
                {bookingSlot.maxSeats - bookingSlot.bookedSeats} 位
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <Label className="text-sm font-medium mb-3 block">選擇上課的孩子</Label>
          {children.length === 1 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-tiffany/5 border border-tiffany/20">
              <div className="w-9 h-9 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-sm font-serif text-tiffany">{children[0].name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{children[0].name}</p>
                <p className="text-xs text-muted-foreground">{children[0].grade} 年級</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-tiffany ml-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id.toString())}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedChild === child.id.toString()
                      ? "bg-tiffany/5 border-tiffany/30"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                  data-testid={`select-child-${child.id}`}
                >
                  <div className="w-9 h-9 rounded-full bg-tiffany/10 flex items-center justify-center">
                    <span className="text-sm font-serif text-tiffany">{child.name[0]}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.grade} 年級</p>
                  </div>
                  {selectedChild === child.id.toString() && (
                    <CheckCircle2 className="w-4 h-4 text-tiffany ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => { setStep("detail"); setBookingSlot(null); setSelectedChild(""); }}
          >
            取消
          </Button>
          <Button
            className="flex-1 rounded-full"
            onClick={confirmBooking}
            disabled={!selectedChild || bookMutation.isPending}
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            data-testid="button-confirm-booking"
          >
            {bookMutation.isPending ? "預約中..." : "確認預約"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "detail" && selectedFranchiseId) {
    return (
      <div className="space-y-5">
        <div>
          <button
            onClick={() => { setStep("search"); setSelectedFranchiseId(null); }}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
            data-testid="button-back-to-search"
          >
            ← 返回搜尋結果
          </button>
        </div>

        {detailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : detail ? (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-serif text-xl tracking-[0.08em] text-foreground mb-2" data-testid="text-franchise-name">
                {detail.franchise.name}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-tiffany" />
                  {detail.franchise.city} {detail.franchise.district}
                </span>
                {detail.franchise.phone && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-tiffany" />
                    {detail.franchise.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-tiffany" />
                  {detail.coaches.length} 位老師
                </span>
              </div>
              {detail.franchise.description && (
                <p className="text-sm text-muted-foreground/80 mt-3">{detail.franchise.description}</p>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">可預約時段</h3>

              {dates.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
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
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">此日期沒有可預約的時段</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSlots.map((slot) => {
                    const available = slot.maxSeats - slot.bookedSeats;
                    return (
                      <div
                        key={slot.id}
                        className={`bg-white rounded-xl border p-4 transition-all ${
                          available > 0 ? "border-gray-100 hover:border-tiffany/30 hover:shadow-sm" : "border-gray-100 opacity-60"
                        }`}
                        data-testid={`slot-card-${slot.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-tiffany" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.coachName && (
                          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {slot.coachName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: slot.maxSeats }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < slot.bookedSeats ? "bg-tiffany" : "border border-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              餘 {available}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleBook(slot)}
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
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">預約課程</h2>
        <p className="text-sm text-muted-foreground">搜尋附近的教室並預約上課時段</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">縣市</Label>
            <Select value={city} onValueChange={(val) => { setCity(val); setDistrict(""); }}>
              <SelectTrigger className="text-sm" data-testid="filter-city">
                <SelectValue placeholder="選擇縣市" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">區/鄉鎮</Label>
            <Select value={district} onValueChange={setDistrict} disabled={!city}>
              <SelectTrigger className="text-sm" data-testid="filter-district">
                <SelectValue placeholder={city ? "選擇區域" : "先選縣市"} />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {searchLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            {city ? "沒有找到符合條件的教室" : "選擇地區開始搜尋"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {city ? "試試其他區域" : "選擇縣市和區域來尋找附近的教室"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const f = result.franchise;
            return (
              <button
                key={f.id}
                onClick={() => selectFranchise(f.id)}
                className="w-full bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-tiffany/30 hover:shadow-sm transition-all group"
                data-testid={`franchise-card-${f.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-tiffany transition-colors">
                    {f.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-tiffany transition-colors" />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {f.city} {f.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {result.coachCount} 位老師
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-tiffany flex items-center gap-1">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {result.availableSlots} 個可預約時段
                  </span>
                  {(f.rating ?? 0) >= 4.5 && (
                    <span className="text-xs text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {f.rating?.toFixed(1)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChildrenTab() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const getChildBookings = (childId: number) =>
    bookings.filter((b) => b.childId === childId);

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; grade: number; school?: string }) => {
      const res = await apiRequest("POST", "/api/children", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "新增成功" });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "新增失敗", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/children/${id}`);
    },
    onSuccess: () => {
      toast({ title: "已刪除孩子資料" });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingChild(null);
    setName("");
    setGrade("");
    setSchool("");
  };

  const openAdd = () => {
    setName("");
    setGrade("");
    setSchool("");
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    if (!name || !grade) return;
    addMutation.mutate({
      name,
      grade: parseInt(grade),
      school: school || undefined,
    });
  };

  const gradeLabel = (g: number) => {
    const labels = ["一", "二", "三", "四", "五", "六"];
    return labels[g - 1] ? `${labels[g - 1]}年級` : `${g} 年級`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-foreground">我的孩子</h2>
          <p className="text-sm text-muted-foreground">管理孩子的學習檔案</p>
        </div>
        <Button
          onClick={openAdd}
          className="rounded-full"
          style={{ backgroundColor: "#81D8D0", color: "white" }}
          data-testid="button-add-child"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          新增孩子
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            尚未新增孩子
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            新增孩子後即可開始預約課程
          </p>
          <Button
            onClick={openAdd}
            className="rounded-full"
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            data-testid="button-add-child-empty"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新增第一個孩子
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => {
            const childBookings = getChildBookings(child.id);
            const upcomingCount = childBookings.filter((b) => b.status === "confirmed").length;
            const completedCount = childBookings.filter((b) => b.status === "completed").length;

            return (
              <div
                key={child.id}
                className="bg-white rounded-xl border border-gray-100 p-5"
                data-testid={`card-child-${child.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-tiffany/15 to-tiffany/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-serif text-tiffany">
                      {child.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{child.name}</h3>
                      <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">
                        {gradeLabel(child.grade)}
                      </span>
                    </div>
                    {child.school && (
                      <p className="text-sm text-muted-foreground mb-2">{child.school}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3 text-tiffany" />
                        {upcomingCount} 堂待上課
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {completedCount} 堂已完成
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setDeleteTarget(child)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                      data-testid={`button-delete-child-${child.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增孩子</DialogTitle>
            <DialogDescription>填寫孩子的基本資料</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">姓名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入孩子的姓名"
                data-testid="input-child-name"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">年級</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger data-testid="select-child-grade">
                  <SelectValue placeholder="選擇年級" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      {g} 年級
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">學校（選填）</Label>
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="請輸入學校名稱"
                data-testid="input-child-school"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !grade || addMutation.isPending}
              style={{ backgroundColor: "#81D8D0", color: "white" }}
              data-testid="button-submit-child"
            >
              {addMutation.isPending ? "新增中..." : "確認新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除「{deleteTarget?.name}」的資料嗎？相關的預約紀錄也會一併刪除，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-red-500 text-white hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BookingsTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "completed" | "cancelled">("all");
  const [cancelTarget, setCancelTarget] = useState<BookingWithDetails | null>(null);

  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      toast({ title: "已取消預約" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setCancelTarget(null);
    },
    onError: (error: Error) => {
      toast({ title: "取消失敗", description: error.message, variant: "destructive" });
    },
  });

  const filtered = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  const sorted = [...filtered].sort((a, b) => {
    const dateA = `${a.slotDate} ${a.slotStartTime}`;
    const dateB = `${b.slotDate} ${b.slotStartTime}`;
    if (a.status === "confirmed" && b.status !== "confirmed") return -1;
    if (a.status !== "confirmed" && b.status === "confirmed") return 1;
    return dateB.localeCompare(dateA);
  });

  const statusConfig = {
    confirmed: { label: "已確認", icon: CheckCircle2, bgClass: "bg-tiffany/10", textClass: "text-tiffany", dotClass: "bg-tiffany" },
    cancelled: { label: "已取消", icon: XCircle, bgClass: "bg-gray-100", textClass: "text-gray-500", dotClass: "bg-gray-400" },
    completed: { label: "已完成", icon: CheckCircle2, bgClass: "bg-green-50", textClass: "text-green-600", dotClass: "bg-green-500" },
  };

  const filterTabs = [
    { id: "all" as const, label: "全部" },
    { id: "confirmed" as const, label: "即將上課" },
    { id: "completed" as const, label: "已完成" },
    { id: "cancelled" as const, label: "已取消" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">預約紀錄</h2>
        <p className="text-sm text-muted-foreground">查看和管理所有預約</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? "bg-tiffany text-white border-tiffany"
                : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
            }`}
            data-testid={`filter-status-${tab.id}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.id ? "bg-white/20" : "bg-gray-100"
            }`}>
              {statusCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CalendarCheck className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {statusFilter === "all" ? "尚無預約" : "沒有符合條件的預約"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {statusFilter === "all" ? "搜尋教室開始預約課程" : "切換篩選條件查看其他預約"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((booking) => {
            const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.confirmed;
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
                data-testid={`card-booking-${booking.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 text-center min-w-[52px]">
                    <div className="text-xs text-muted-foreground">
                      {booking.slotDate?.split("-").slice(1).join("/")}
                    </div>
                    <div className={`text-lg font-bold ${config.textClass}`}>
                      {booking.slotStartTime?.slice(0, 5)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ~ {booking.slotEndTime?.slice(0, 5)}
                    </div>
                  </div>

                  <div className={`w-px h-12 ${booking.status === "confirmed" ? "bg-tiffany/30" : "bg-gray-100"} flex-shrink-0`} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.franchiseName || "教室"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                      {booking.coachName && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {booking.coachName}
                        </span>
                      )}
                      {booking.childName && (
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded">
                          {booking.childName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.bgClass} ${config.textClass}`}>
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => setCancelTarget(booking)}
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors p-1"
                        data-testid={`button-cancel-booking-${booking.id}`}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>取消預約</AlertDialogTitle>
            <AlertDialogDescription>
              確定要取消這堂課嗎？
              {cancelTarget && (
                <span className="block mt-2 text-foreground font-medium">
                  {cancelTarget.franchiseName} · {cancelTarget.slotDate} {cancelTarget.slotStartTime} · {cancelTarget.childName}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>保留預約</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
              className="bg-red-500 text-white hover:bg-red-600"
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? "取消中..." : "確認取消"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
