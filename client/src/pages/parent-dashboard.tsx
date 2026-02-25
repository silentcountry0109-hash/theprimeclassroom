import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Home,
  Users,
  CalendarCheck,
  CalendarPlus,
  LogOut,
  Plus,
  Minus,
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
  ChevronLeft,
  ShoppingBag,
  ShoppingCart,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Child, Booking, Franchise, Product, CartItem, Order, OrderItem } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";
import avatarBoyPath from "../assets/avatar-boy.png";
import avatarGirlPath from "../assets/avatar-girl.png";

interface BookingWithDetails extends Booking {
  slotDate?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  franchiseName?: string;
  coachName?: string;
  childName?: string;
  childGender?: string;
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

function PhotoCarousel({ photos, alt, height = "h-36", showControls = false }: { photos: string[]; alt: string; height?: string; showControls?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos.length, paused]);

  if (!photos || photos.length === 0) return null;

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div
      className={`relative w-full ${height} overflow-hidden group`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="photo-carousel"
    >
      {photos.map((photo, idx) => (
        <img
          key={photo}
          src={photo}
          alt={`${alt} ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === current ? "bg-white w-4" : "bg-white/50"}`}
                data-testid={`carousel-dot-${idx}`}
              />
            ))}
          </div>
          {showControls && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="carousel-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="carousel-next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

const TAB_ITEMS = [
  { id: "overview", label: "首頁", icon: Home },
  { id: "book", label: "預約課程", icon: CalendarDays },
  { id: "children", label: "我的孩子", icon: Users },
  { id: "bookings", label: "預約紀錄", icon: CalendarCheck },
  { id: "shop", label: "商城", icon: ShoppingBag },
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

  const handleLogout = async () => {
    if (isCredentialUser) {
      await fetch("/api/credential-logout", { method: "POST", credentials: "include" });
    }
    window.location.href = "/api/logout";
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
        {activeTab === "shop" && <ShopTab />}
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

interface RecurringSlotInfo {
  weekOffset: number;
  date: string;
  slotId: number | null;
  available: number;
  alreadyBooked: boolean;
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
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlotInfo[]>([]);
  const [selectedRecurringSlots, setSelectedRecurringSlots] = useState<Set<number>>(new Set());
  const [recurringLoading, setRecurringLoading] = useState(false);

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
    onSuccess: async () => {
      toast({ title: "預約成功！", description: "您的課程已確認預約" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchises", selectedFranchiseId, "detail"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });

      if (bookingSlot && selectedChild) {
        try {
          setRecurringLoading(true);
          const res = await fetch(
            `/api/bookings/recurring-slots?slotId=${bookingSlot.id}&weeks=4&childId=${selectedChild}`,
            { credentials: "include" }
          );
          if (res.ok) {
            const slots: RecurringSlotInfo[] = await res.json();
            const availableSlots = slots.filter((s) => s.slotId && s.available > 0 && !s.alreadyBooked);
            if (availableSlots.length > 0) {
              setRecurringSlots(slots);
              setSelectedRecurringSlots(new Set(availableSlots.map((s) => s.slotId!)));
              setShowRecurringDialog(true);
              setRecurringLoading(false);
              return;
            }
          }
        } catch {
        }
        setRecurringLoading(false);
      }

      setBookingSlot(null);
      setSelectedChild("");
      setStep("detail");
    },
    onError: (error: Error) => {
      toast({ title: "預約失敗", description: error.message, variant: "destructive" });
    },
  });

  const recurringMutation = useMutation({
    mutationFn: async (data: { slotIds: number[]; childId: number }) => {
      const res = await apiRequest("POST", "/api/bookings/recurring", data);
      return res.json();
    },
    onSuccess: (data: { results: Array<{ slotId: number; success: boolean; message?: string }> }) => {
      const successCount = data.results.filter((r) => r.success).length;
      const failCount = data.results.filter((r) => !r.success).length;
      if (successCount > 0) {
        toast({
          title: `成功預約 ${successCount} 週課程`,
          description: failCount > 0 ? `${failCount} 個時段無法預約` : "週期性排課完成",
        });
      }
      if (failCount > 0 && successCount === 0) {
        toast({ title: "預約失敗", description: "所有時段皆無法預約", variant: "destructive" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/franchises", selectedFranchiseId, "detail"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowRecurringDialog(false);
      setRecurringSlots([]);
      setSelectedRecurringSlots(new Set());
      setBookingSlot(null);
      setSelectedChild("");
      setStep("detail");
    },
    onError: (error: Error) => {
      toast({ title: "週期預約失敗", description: error.message, variant: "destructive" });
    },
  });

  const handleRecurringConfirm = () => {
    if (selectedRecurringSlots.size === 0 || !selectedChild) return;
    recurringMutation.mutate({
      slotIds: Array.from(selectedRecurringSlots),
      childId: parseInt(selectedChild),
    });
  };

  const handleRecurringSkip = () => {
    setShowRecurringDialog(false);
    setRecurringSlots([]);
    setSelectedRecurringSlots(new Set());
    setBookingSlot(null);
    setSelectedChild("");
    setStep("detail");
  };

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
            disabled={!selectedChild || bookMutation.isPending || recurringLoading}
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            data-testid="button-confirm-booking"
          >
            {bookMutation.isPending ? "預約中..." : recurringLoading ? "處理中..." : "確認預約"}
          </Button>
        </div>

        <Dialog open={showRecurringDialog} onOpenChange={(open) => { if (!open) handleRecurringSkip(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="w-5 h-5 text-tiffany" />
                週期性排課
              </DialogTitle>
              <DialogDescription>
                {bookingSlot && (
                  <span>
                    每週{["日", "一", "二", "三", "四", "五", "六"][new Date(bookingSlot.date + "T00:00:00").getDay()]}
                    {" "}{bookingSlot.startTime}-{bookingSlot.endTime}，是否同時預約未來幾週？
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto py-2">
              {recurringSlots.map((rs) => {
                const dateObj = new Date(rs.date + "T00:00:00");
                const weekday = ["日", "一", "二", "三", "四", "五", "六"][dateObj.getDay()];
                const canSelect = rs.slotId !== null && rs.available > 0 && !rs.alreadyBooked;
                const isSelected = rs.slotId !== null && selectedRecurringSlots.has(rs.slotId);
                return (
                  <button
                    key={rs.weekOffset}
                    disabled={!canSelect}
                    onClick={() => {
                      if (!rs.slotId) return;
                      setSelectedRecurringSlots((prev) => {
                        const next = new Set(prev);
                        if (next.has(rs.slotId!)) next.delete(rs.slotId!);
                        else next.add(rs.slotId!);
                        return next;
                      });
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      !canSelect
                        ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                        : isSelected
                        ? "border-tiffany/40 bg-tiffany/5"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                    data-testid={`recurring-slot-week-${rs.weekOffset}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isSelected ? "bg-tiffany border-tiffany" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          第 {rs.weekOffset} 週 - {rs.date.slice(5)} ({weekday})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bookingSlot?.startTime}-{bookingSlot?.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {rs.alreadyBooked ? (
                        <span className="text-xs text-amber-600">已預約</span>
                      ) : rs.slotId === null ? (
                        <span className="text-xs text-muted-foreground">未開課</span>
                      ) : rs.available <= 0 ? (
                        <span className="text-xs text-red-500">已額滿</span>
                      ) : (
                        <span className="text-xs text-tiffany">餘 {rs.available}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button variant="outline" onClick={handleRecurringSkip} className="flex-1 rounded-full" data-testid="button-skip-recurring">
                不用了
              </Button>
              <Button
                onClick={handleRecurringConfirm}
                disabled={selectedRecurringSlots.size === 0 || recurringMutation.isPending}
                className="flex-1 rounded-full"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                data-testid="button-confirm-recurring"
              >
                {recurringMutation.isPending ? "預約中..." : `預約 ${selectedRecurringSlots.size} 週`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

            {detail.franchise.photos && detail.franchise.photos.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <PhotoCarousel photos={detail.franchise.photos} alt={detail.franchise.name} height="h-52" showControls />
                <div className="px-4 py-2 text-xs text-muted-foreground/60 text-center">
                  教室環境 · {detail.franchise.photos.length} 張照片
                </div>
              </div>
            )}

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
                className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden text-left hover:border-tiffany/30 hover:shadow-sm transition-all group"
                data-testid={`franchise-card-${f.id}`}
              >
                {f.photos && f.photos.length > 0 && (
                  <PhotoCarousel photos={f.photos} alt={f.name} height="h-36" />
                )}
                <div className="p-4">
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

    </div>
  );
}

function CancelBookingDialog({
  cancelTarget,
  onClose,
  onConfirm,
  isPending,
}: {
  cancelTarget: BookingWithDetails | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isPending: boolean;
}) {
  const [sliderValue, setSliderValue] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isUnlocked = sliderValue >= 95;

  useEffect(() => {
    if (!cancelTarget) setSliderValue(0);
  }, [cancelTarget]);

  const sliderEmojis = [
    { min: 0, emoji: "😊", label: "還在想..." },
    { min: 15, emoji: "🤔", label: "認真考慮中..." },
    { min: 35, emoji: "😮", label: "快要確定了..." },
    { min: 55, emoji: "😰", label: "真的要取消嗎..." },
    { min: 75, emoji: "😢", label: "好捨不得..." },
    { min: 95, emoji: "✅", label: "可以取消了！" },
  ];

  const currentEmoji = [...sliderEmojis].reverse().find((e) => sliderValue >= e.min) || sliderEmojis[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (sliderValue < 95) {
      setSliderValue(0);
    }
  };

  const updateSlider = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const thumbWidth = 48;
    const trackWidth = rect.width - thumbWidth;
    const offsetX = clientX - rect.left - thumbWidth / 2;
    const pct = Math.max(0, Math.min(100, (offsetX / trackWidth) * 100));
    setSliderValue(pct);
  };

  return (
    <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) { onClose(); setSliderValue(0); } }}>
      <AlertDialogContent className="max-w-sm">
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

        <div className="py-2 space-y-3">
          <div className="text-center text-3xl transition-all duration-200" style={{ transform: `scale(${1 + sliderValue / 200})` }}>
            {currentEmoji.emoji}
          </div>
          <p className="text-center text-xs text-muted-foreground font-medium">{currentEmoji.label}</p>

          <div
            ref={sliderRef}
            className={`relative h-12 rounded-full border-2 select-none touch-none transition-colors ${
              isUnlocked ? "bg-red-50 border-red-300" : "bg-gray-100 border-gray-200"
            }`}
            data-testid="slider-cancel-track"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
              style={{
                width: `${sliderValue}%`,
                background: isUnlocked
                  ? "linear-gradient(90deg, #fca5a5, #ef4444)"
                  : "linear-gradient(90deg, #e5e7eb, #d1d5db)",
              }}
            />
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground font-medium tracking-wider">
                  👉 滑動以解鎖取消
                </span>
              </div>
            )}
            <div
              className={`absolute top-1 h-10 w-10 rounded-full shadow-md flex items-center justify-center text-lg cursor-grab active:cursor-grabbing transition-colors ${
                isUnlocked ? "bg-red-500" : "bg-white border border-gray-300"
              }`}
              style={{ left: `max(4px, calc(${sliderValue / 100} * (100% - 48px)))` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              data-testid="slider-cancel-thumb"
            >
              {isUnlocked ? "🔓" : "🔒"}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSliderValue(0)}>保留預約</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => cancelTarget && onConfirm(cancelTarget.id)}
            className={`text-white transition-all ${
              isUnlocked
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-300 cursor-not-allowed pointer-events-none"
            }`}
            disabled={!isUnlocked}
            data-testid="button-confirm-cancel"
          >
            {isPending ? "取消中..." : "確認取消"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BookingsTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "completed" | "cancelled">("all");
  const [cancelTarget, setCancelTarget] = useState<BookingWithDetails | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  }, []);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(defaultEnd);

  const quickRanges = [
    { label: "7 天", days: 7 },
    { label: "14 天", days: 14 },
    { label: "30 天", days: 30 },
    { label: "90 天", days: 90 },
  ];

  const setQuickRange = (days: number) => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(to.toISOString().split("T")[0]);
  };

  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
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

  const dateFiltered = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.slotDate) return true;
      return b.slotDate >= dateFrom && b.slotDate <= dateTo;
    });
  }, [bookings, dateFrom, dateTo]);

  const childFiltered = selectedChildId
    ? dateFiltered.filter((b) => b.childId === selectedChildId)
    : dateFiltered;

  const filtered = statusFilter === "all" ? childFiltered : childFiltered.filter((b) => b.status === statusFilter);

  const statusCounts = useMemo(() => ({
    all: childFiltered.length,
    confirmed: childFiltered.filter((b) => b.status === "confirmed").length,
    completed: childFiltered.filter((b) => b.status === "completed").length,
    cancelled: childFiltered.filter((b) => b.status === "cancelled").length,
  }), [childFiltered]);

  const isMultiChild = children.length >= 2;

  const childSummaries = useMemo(() => {
    if (!isMultiChild) return [];
    return children.map((child) => {
      const cb = dateFiltered.filter((b) => b.childId === child.id);
      const upcoming = cb.filter((b) => b.status === "confirmed");
      const completed = cb.filter((b) => b.status === "completed");
      const nextClass = upcoming
        .sort((a, b) => `${a.slotDate} ${a.slotStartTime}`.localeCompare(`${b.slotDate} ${b.slotStartTime}`))[0];
      return { child, upcoming: upcoming.length, completed: completed.length, total: cb.length, nextClass };
    });
  }, [children, dateFiltered, isMultiChild]);

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "confirmed" && b.status !== "confirmed") return -1;
    if (a.status !== "confirmed" && b.status === "confirmed") return 1;
    const dateA = `${a.slotDate} ${a.slotStartTime}`;
    const dateB = `${b.slotDate} ${b.slotStartTime}`;
    if (a.status === "confirmed") return dateA.localeCompare(dateB);
    return dateB.localeCompare(dateA);
  });

  const groupedByDate = useMemo(() => {
    const groups: { date: string; bookings: BookingWithDetails[] }[] = [];
    const map = new Map<string, BookingWithDetails[]>();
    for (const b of sorted) {
      const d = b.slotDate || "unknown";
      if (!map.has(d)) { map.set(d, []); groups.push({ date: d, bookings: map.get(d)! }); }
      map.get(d)!.push(b);
    }
    return groups;
  }, [sorted]);

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

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === "unknown") return "未知日期";
    const d = new Date(dateStr + "T00:00:00");
    const weekday = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    if (dateStr === today) return `今天 ${month}/${day}（${weekday}）`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split("T")[0]) return `明天 ${month}/${day}（${weekday}）`;
    return `${month}/${day}（${weekday}）`;
  };

  const handleCalendarSync = () => {
    const link = document.createElement("a");
    link.href = "/api/bookings/calendar.ics";
    link.download = "prime-math-bookings.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "行事曆檔案已下載",
      description: "請開啟 .ics 檔案加入手機行事曆，每堂課會在開始前 6 小時提醒。若取消課程，需手動刪除行事曆中的排程。",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">預約紀錄</h2>
          <p className="text-sm text-muted-foreground">查看和管理所有預約</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCalendarSync}
          className="flex items-center gap-1.5 text-tiffany border-tiffany/30 hover:bg-tiffany/5 shrink-0"
          data-testid="button-calendar-sync"
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="hidden sm:inline">加入行事曆</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>時間區間</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-xs w-[130px]"
              data-testid="input-date-from"
            />
            <span className="text-xs text-muted-foreground">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-xs w-[130px]"
              data-testid="input-date-to"
            />
          </div>
          <div className="flex gap-1">
            {quickRanges.map((r) => (
              <button
                key={r.days}
                onClick={() => setQuickRange(r.days)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  (() => {
                    const checkTo = new Date();
                    checkTo.setDate(checkTo.getDate() + r.days);
                    return dateFrom === today && dateTo === checkTo.toISOString().split("T")[0];
                  })()
                    ? "bg-tiffany/10 text-tiffany border-tiffany/30"
                    : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/30"
                }`}
                data-testid={`button-range-${r.days}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isMultiChild && (
        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:gap-2.5" data-testid="child-summary-cards">
          {childSummaries.map(({ child, upcoming, completed, nextClass }) => {
            const isSelected = selectedChildId === child.id;
            const avatarSrc = child.gender === "female" ? avatarGirlPath : avatarBoyPath;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(isSelected ? null : child.id)}
                className={`relative text-left rounded-xl border p-3 transition-all sm:flex-1 sm:min-w-[160px] ${
                  isSelected
                    ? "border-tiffany bg-tiffany/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-tiffany/30"
                }`}
                data-testid={`button-child-filter-${child.id}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-tiffany" />
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-2">
                  <img src={avatarSrc} alt={child.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-child-summary-name-${child.id}`}>{child.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">待上課</span>
                    <span className={`font-semibold ${upcoming > 0 ? "text-tiffany" : "text-muted-foreground"}`} data-testid={`text-child-upcoming-${child.id}`}>{upcoming}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">已完成</span>
                    <span className="font-semibold text-green-600" data-testid={`text-child-completed-${child.id}`}>{completed}</span>
                  </div>
                </div>
                {nextClass && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-muted-foreground">下一堂</p>
                    <p className="text-xs font-medium text-foreground">
                      {nextClass.slotDate?.split("-").slice(1).join("/")} {nextClass.slotStartTime?.slice(0, 5)}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {isMultiChild && selectedChildId && (
          <button
            onClick={() => setSelectedChildId(null)}
            className="px-3 py-2 text-xs rounded-full border border-coral/30 text-coral bg-coral/5 hover:bg-coral/10 whitespace-nowrap transition-all flex items-center gap-1"
            data-testid="button-clear-child-filter"
          >
            <XCircle className="w-3 h-3" />
            全部孩子
          </button>
        )}
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
            {statusFilter === "all" ? "此區間內尚無預約" : "沒有符合條件的預約"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {statusFilter === "all" ? "調整時間區間或搜尋教室開始預約課程" : "切換篩選條件或調整時間區間"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(({ date, bookings: dayBookings }) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-foreground">{formatDateLabel(date)}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-muted-foreground">{dayBookings.length} 堂</span>
              </div>
              <div className="space-y-1.5">
                {dayBookings.map((booking) => {
                  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.confirmed;
                  const avatarSrc = booking.childGender === "female" ? avatarGirlPath : avatarBoyPath;
                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-xl border p-3.5 transition-colors ${
                        booking.status === "confirmed" ? "border-gray-100 hover:border-tiffany/30" : "border-gray-50 opacity-75"
                      }`}
                      data-testid={`card-booking-${booking.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 text-center min-w-[44px]">
                          <div className={`text-base font-bold ${config.textClass}`}>
                            {booking.slotStartTime?.slice(0, 5)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            ~ {booking.slotEndTime?.slice(0, 5)}
                          </div>
                        </div>

                        <div className={`w-px h-10 ${booking.status === "confirmed" ? "bg-tiffany/30" : "bg-gray-100"} flex-shrink-0`} />

                        {isMultiChild && !selectedChildId && (
                          <img src={avatarSrc} alt={booking.childName || ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {booking.franchiseName || "教室"}
                            </p>
                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${config.bgClass} ${config.textClass}`}>
                              <config.icon className="w-2.5 h-2.5" />
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            {booking.coachName && (
                              <span className="flex items-center gap-0.5">
                                <GraduationCap className="w-3 h-3" />
                                {booking.coachName}
                              </span>
                            )}
                            {isMultiChild && !selectedChildId && booking.childName && (
                              <span className="bg-gray-50 px-1.5 py-0.5 rounded text-[11px]">
                                {booking.childName}
                              </span>
                            )}
                          </div>
                        </div>

                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            className="text-xs text-muted-foreground hover:text-red-500 transition-colors p-1.5 flex-shrink-0"
                            data-testid={`button-cancel-booking-${booking.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <CancelBookingDialog
        cancelTarget={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(id) => cancelMutation.mutate(id)}
        isPending={cancelMutation.isPending}
      />

      <div className="bg-amber-50/50 rounded-xl border border-amber-200/50 p-3">
        <p className="text-xs text-amber-700 leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          行事曆同步說明：點擊「加入行事曆」會下載 .ics 檔案，開啟後可匯入手機行事曆。每堂課會在開始前 6 小時發送提醒。若取消課程，手機行事曆中的排程需手動刪除。每次下載會包含所有已確認的課程。
        </p>
      </div>
    </div>
  );
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface OrderWithItems extends Order {
  items?: OrderItem[];
  userName?: string;
}

function formatPrice(cents: number) {
  return `NT$ ${Math.round(cents).toLocaleString()}`;
}

function ShopTab() {
  const { toast } = useToast();
  const [category, setCategory] = useState<"all" | "教材" | "教具">("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [viewMode, setViewMode] = useState<"products" | "orders">("products");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const filteredProducts = category === "all"
    ? products
    : products.filter((p) => p.category === category);

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "已加入購物車" });
    },
    onError: (error: Error) => {
      toast({ title: "加入失敗", description: error.message, variant: "destructive" });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({ title: "更新失敗", description: error.message, variant: "destructive" });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "已移除商品" });
    },
    onError: (error: Error) => {
      toast({ title: "移除失敗", description: error.message, variant: "destructive" });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { items: { productId: number; quantity: number }[]; note?: string }) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrderNote("");
      toast({ title: "下單成功", description: "您的訂單已建立" });
    },
    onError: (error: Error) => {
      toast({ title: "下單失敗", description: error.message, variant: "destructive" });
    },
  });

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    createOrderMutation.mutate({
      items,
      note: orderNote || undefined,
    });
  };

  const fetchOrderItems = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        queryClient.setQueryData<OrderWithItems[]>(["/api/orders"], (old) =>
          old?.map((o) => (o.id === orderId ? { ...o, items: data.items } : o)) ?? []
        );
      }
    } catch {}
  };

  const orderStatusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "待處理", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    paid: { label: "已付款", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    shipped: { label: "已出貨", className: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    completed: { label: "已完成", className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    cancelled: { label: "已取消", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  };

  const categoryTabs = [
    { id: "all" as const, label: "全部" },
    { id: "教材" as const, label: "教材" },
    { id: "教具" as const, label: "教具" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-foreground">商城</h2>
          <p className="text-sm text-muted-foreground">瀏覽教材與教具</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "products" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("products")}
            className={viewMode === "products" ? "rounded-full" : "rounded-full"}
            style={viewMode === "products" ? { backgroundColor: "#81D8D0", color: "white" } : undefined}
            data-testid="button-view-products"
          >
            <Package className="w-4 h-4 mr-1" />
            商品
          </Button>
          <Button
            variant={viewMode === "orders" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("orders")}
            className="rounded-full"
            style={viewMode === "orders" ? { backgroundColor: "#81D8D0", color: "white" } : undefined}
            data-testid="button-view-orders"
          >
            <FileText className="w-4 h-4 mr-1" />
            訂單
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCartOpen(true)}
            className="rounded-full relative"
            data-testid="button-open-cart"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            購物車
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-coral text-white text-[10px] flex items-center justify-center font-medium" data-testid="text-cart-count">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {viewMode === "products" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all ${
                  category === tab.id
                    ? "bg-tiffany text-white border-tiffany"
                    : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                }`}
                data-testid={`filter-category-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {category === "all" ? "尚無商品" : `沒有${category}類商品`}
              </h3>
              <p className="text-xs text-muted-foreground">敬請期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-tiffany/30 hover:shadow-sm transition-all"
                  data-testid={`card-product-${product.id}`}
                >
                  {product.imageUrl ? (
                    <div className="w-full h-36 bg-gray-50">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-tiffany/5 to-tiffany/10 flex items-center justify-center">
                      <Package className="w-10 h-10 text-tiffany/30" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-muted-foreground flex-shrink-0">
                        {product.category}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        {product.discountPrice ? (
                          <>
                            <span className="text-sm font-bold text-coral" data-testid={`text-product-price-${product.id}`}>
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-[10px] text-muted-foreground line-through ml-1">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-foreground" data-testid={`text-product-price-${product.id}`}>
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full text-xs"
                        style={{ backgroundColor: "#81D8D0", color: "white" }}
                        disabled={product.stock <= 0 || addToCartMutation.isPending}
                        onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        {product.stock <= 0 ? (
                          "缺貨"
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-0.5" />
                            加入
                          </>
                        )}
                      </Button>
                    </div>
                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        僅剩 {product.stock} 件
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === "orders" && (
        <div className="space-y-3">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">尚無訂單</h3>
              <p className="text-xs text-muted-foreground mb-4">瀏覽商品並下單</p>
              <Button
                size="sm"
                onClick={() => setViewMode("products")}
                className="rounded-full"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                data-testid="button-browse-products"
              >
                瀏覽商品
              </Button>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = orderStatusConfig[order.status] || orderStatusConfig.pending;
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  data-testid={`card-order-${order.id}`}
                >
                  <button
                    onClick={() => fetchOrderItems(order.id)}
                    className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors"
                    data-testid={`button-expand-order-${order.id}`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-5 h-5 text-tiffany" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground" data-testid={`text-order-id-${order.id}`}>
                            訂單 #{order.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("zh-TW", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground" data-testid={`text-order-total-${order.id}`}>
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.className}`} data-testid={`text-order-status-${order.id}`}>
                          {statusInfo.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 text-sm"
                              data-testid={`order-item-${item.id}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-foreground truncate">{item.productName}</span>
                                <span className="text-muted-foreground flex-shrink-0">x{item.quantity}</span>
                              </div>
                              <span className="text-foreground font-medium flex-shrink-0">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center py-2">
                          <Skeleton className="h-4 w-32" />
                        </div>
                      )}
                      {order.note && (
                        <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-gray-50">
                          備註：{order.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex flex-col" side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              購物車
              {cartCount > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({cartCount} 件)</span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {cartLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">購物車是空的</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-14 h-14 rounded-md bg-white dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.product.discountPrice ?? item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-6 h-6"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeFromCartMutation.mutate(item.id);
                            } else {
                              updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity - 1 });
                            }
                          }}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center" data-testid={`text-cart-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-6 h-6"
                          onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <button
                          onClick={() => removeFromCartMutation.mutate(item.id)}
                          className="ml-auto p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          data-testid={`button-remove-cart-item-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">小計</span>
                <span className="text-lg font-bold text-foreground" data-testid="text-cart-total">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Button
                className="w-full rounded-full"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                onClick={() => setCheckoutOpen(true)}
                data-testid="button-checkout"
              >
                結帳
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認訂單</DialogTitle>
            <DialogDescription>請確認您的訂單內容</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-foreground truncate">{item.product.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">x{item.quantity}</span>
                  </div>
                  <span className="text-foreground font-medium flex-shrink-0">
                    {formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium text-foreground">總計</span>
              <span className="text-lg font-bold text-foreground" data-testid="text-checkout-total">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">備註（選填）</Label>
              <Textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="如有特殊需求請在此說明"
                className="resize-none text-sm"
                rows={3}
                data-testid="input-order-note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} data-testid="button-cancel-checkout">
              取消
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={createOrderMutation.isPending}
              style={{ backgroundColor: "#81D8D0", color: "white" }}
              data-testid="button-confirm-order"
            >
              {createOrderMutation.isPending ? "下單中..." : "確認下單"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
