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
import { Switch } from "@/components/ui/switch";
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
  Sparkles,
  TrendingUp,
  Bell,
  Pencil,
  Phone,
  Award,
  UserCircle,
  Heart,
  Building2,
  Hash,
} from "lucide-react";
import type { Child, Booking, Franchise, Coach, Product, CartItem, Order, OrderItem } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";
import { TAIWAN_CITIES, getDistricts, getSchools } from "@shared/taiwan-schools";
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
  { id: "contact-book", label: "聯絡簿", icon: BookOpen },
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
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-1 sm:flex-none min-w-0 ${
                  activeTab === item.id
                    ? "border-tiffany text-tiffany"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-200"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="truncate">{item.label}</span>
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
        {activeTab === "contact-book" && <ContactBookTab />}
        {activeTab === "shop" && <ShopTab />}
      </main>
    </div>
  );
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "夜深了";
  if (hour < 12) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

function getCountdownText(dateStr: string, timeStr: string): string {
  const now = new Date();
  const target = new Date(`${dateStr}T${timeStr}`);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "即將開始";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days} 天 ${hours} 小時後`;
  if (hours > 0) return `${hours} 小時 ${mins} 分鐘後`;
  return `${mins} 分鐘後`;
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

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => {
      const dateA = `${a.slotDate} ${a.slotStartTime}`;
      const dateB = `${b.slotDate} ${b.slotStartTime}`;
      return dateA.localeCompare(dateB);
    });

  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const nextClass = upcomingBookings[0];

  const gradeLabel = (g: number) => {
    const labels = ["一", "二", "三", "四", "五", "六"];
    return labels[g - 1] ? `${labels[g - 1]}年級` : `${g}年級`;
  };

  return (
    <div className="space-y-5">
      {(childrenError || bookingsError) && (
        <div className="bg-white rounded-xl border border-red-200 p-4 flex items-center gap-3" data-testid="error-loading">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">部分資料載入失敗，請重新整理頁面再試</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" data-testid="text-welcome">
            {user.firstName ? `${user.firstName}，${getTimeGreeting()}` : getTimeGreeting()}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-today-date">
            {new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
        {upcomingBookings.length > 0 && (
          <button
            onClick={() => onNavigate("bookings")}
            className="flex items-center gap-1.5 text-xs text-tiffany bg-tiffany/5 px-3 py-1.5 rounded-full hover:bg-tiffany/10 transition-colors"
            data-testid="link-all-bookings-count"
          >
            <Bell className="w-3.5 h-3.5" />
            {upcomingBookings.length} 堂待上課
          </button>
        )}
      </div>

      {nextClass && (
        <button
          onClick={() => onNavigate("bookings")}
          className="w-full bg-gradient-to-r from-tiffany/8 via-white to-coral/5 rounded-2xl border border-tiffany/20 p-4 sm:p-5 text-left hover:shadow-md transition-all group"
          data-testid="card-next-class"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-tiffany" />
            <span className="text-xs font-medium text-tiffany tracking-wider">下一堂課</span>
            <span className="text-[10px] text-muted-foreground ml-auto" data-testid="text-next-class-countdown">
              {nextClass.slotDate && nextClass.slotStartTime && getCountdownText(nextClass.slotDate, nextClass.slotStartTime)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
              <div className="text-xs text-muted-foreground text-center">
                {(() => {
                  if (!nextClass.slotDate) return "";
                  const d = new Date(nextClass.slotDate + "T00:00:00");
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const tmrw = new Date(today); tmrw.setDate(tmrw.getDate()+1);
                  if (d.getTime() === today.getTime()) return "今天";
                  if (d.getTime() === tmrw.getTime()) return "明天";
                  return `${d.getMonth()+1}/${d.getDate()}`;
                })()}
              </div>
              <div className="text-xl font-bold text-tiffany text-center">
                {nextClass.slotStartTime?.slice(0, 5)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground truncate group-hover:text-tiffany transition-colors">
                {nextClass.franchiseName || "教室"}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                {nextClass.coachName && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-tiffany" />
                    {nextClass.coachName} 老師
                  </span>
                )}
                <span className="text-muted-foreground/60">
                  {nextClass.slotStartTime?.slice(0,5)} - {nextClass.slotEndTime?.slice(0,5)}
                </span>
              </div>
              {nextClass.childName && (
                <div className="flex items-center gap-1.5 mt-1.5" data-testid="text-next-class-child">
                  <img
                    src={nextClass.childGender === "female" ? avatarGirlPath : avatarBoyPath}
                    alt={nextClass.childName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-foreground">{nextClass.childName}</span>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-tiffany transition-colors flex-shrink-0" />
          </div>
        </button>
      )}

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              開始使用質數教室
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              先登記孩子的資料，就可以搜尋教室、預約課程
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
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-tiffany" />
              孩子概況
            </h2>
            <button
              onClick={() => onNavigate("children")}
              className="text-xs text-muted-foreground hover:text-tiffany flex items-center gap-0.5 transition-colors"
              data-testid="link-manage-children"
            >
              管理
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className={`grid gap-3 ${children.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {children.map((child) => {
              const childUpcoming = upcomingBookings.filter((b) => b.childId === child.id).length;
              const childCompleted = bookings.filter((b) => b.childId === child.id && b.status === "completed").length;
              const avatarSrc = child.gender === "female" ? avatarGirlPath : avatarBoyPath;
              return (
                <div
                  key={child.id}
                  className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-tiffany/20 transition-colors"
                  data-testid={`overview-child-${child.id}`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img src={avatarSrc} alt={child.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-50" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-overview-child-name-${child.id}`}>{child.name}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-overview-child-grade-${child.id}`}>{gradeLabel(child.grade)}{child.school ? ` · ${child.school}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-tiffany" />
                      <span className="text-muted-foreground">待上課</span>
                      <span className="font-semibold text-foreground" data-testid={`text-overview-child-upcoming-${child.id}`}>{childUpcoming}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">已完成</span>
                      <span className="font-semibold text-foreground" data-testid={`text-overview-child-completed-${child.id}`}>{childCompleted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigate("book")}
          className="bg-gradient-to-br from-tiffany/8 to-tiffany/3 rounded-xl border border-tiffany/15 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
          data-testid="card-quick-book"
        >
          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <CalendarPlus className="w-5 h-5 text-tiffany" />
          </div>
          <p className="text-xs font-semibold text-foreground">預約課程</p>
        </button>
        <button
          onClick={() => onNavigate("bookings")}
          className="bg-white rounded-xl border border-gray-100 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
          data-testid="card-stat-upcoming"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-xs font-semibold text-foreground">{completedCount} 堂完成</p>
        </button>
        <button
          onClick={() => onNavigate("shop")}
          className="bg-white rounded-xl border border-gray-100 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
          data-testid="card-quick-shop"
        >
          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5 text-coral" />
          </div>
          <p className="text-xs font-semibold text-foreground">教材商城</p>
        </button>
      </div>

      {upcomingBookings.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-tiffany" />
              即將到來
            </h2>
            <button
              onClick={() => onNavigate("bookings")}
              className="text-xs text-muted-foreground hover:text-tiffany flex items-center gap-0.5 transition-colors"
              data-testid="link-view-all-bookings"
            >
              查看全部
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingBookings.slice(1, 4).map((booking) => {
              const avatarSrc = booking.childGender === "female" ? avatarGirlPath : avatarBoyPath;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-100 p-3.5 flex items-center gap-3 hover:border-tiffany/20 transition-colors"
                  data-testid={`booking-upcoming-${booking.id}`}
                >
                  <div className="flex-shrink-0 text-center min-w-[44px]">
                    <div className="text-[10px] text-muted-foreground">
                      {(() => {
                        if (!booking.slotDate) return "";
                        const d = new Date(booking.slotDate + "T00:00:00");
                        const today = new Date(); today.setHours(0,0,0,0);
                        const tmrw = new Date(today); tmrw.setDate(tmrw.getDate()+1);
                        if (d.getTime() === today.getTime()) return "今天";
                        if (d.getTime() === tmrw.getTime()) return "明天";
                        return `${d.getMonth()+1}/${d.getDate()}`;
                      })()}
                    </div>
                    <div className="text-base font-bold text-tiffany">
                      {booking.slotStartTime?.slice(0, 5)}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
                  <img src={avatarSrc} alt={booking.childName || ""} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.franchiseName || "教室"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {booking.coachName && (
                        <span>{booking.coachName} 老師</span>
                      )}
                      {booking.childName && (
                        <span className="text-tiffany">{booking.childName}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcomingBookings.length === 0 && children.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/15 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            目前沒有預約的課程
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

function StepIndicator({ current, steps }: { current: number; steps: { label: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-5" data-testid="step-indicator">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
            i < current ? "bg-tiffany/10 text-tiffany" :
            i === current ? "bg-tiffany text-white shadow-sm" :
            "bg-gray-100 text-muted-foreground"
          }`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
              i < current ? "bg-tiffany text-white" :
              i === current ? "bg-white/30 text-white" :
              "bg-gray-200 text-muted-foreground"
            }`}>
              {i < current ? "✓" : i + 1}
            </span>
            <span className="hidden xs:inline sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-4 sm:w-6 h-px ${i < current ? "bg-tiffany/40" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function triggerCalendarDownload() {
  const link = document.createElement("a");
  link.href = "/api/bookings/calendar.ics";
  link.download = "prime-math-bookings.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlotInfo[]>([]);
  const [selectedRecurringSlots, setSelectedRecurringSlots] = useState<Set<number>>(new Set());
  const [recurringLoading, setRecurringLoading] = useState(false);

  const districts = city ? TAIWAN_DISTRICTS[city] || [] : [];

  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: ["/api/favorite-franchises"],
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ franchiseId, isFavorite }: { franchiseId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorite-franchises/${franchiseId}`);
      } else {
        await apiRequest("POST", `/api/favorite-franchises/${franchiseId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorite-franchises"] });
    },
    onError: () => {
      toast({ title: "操作失敗", variant: "destructive" });
    },
  });

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

      if (localStorage.getItem("autoCalendarSync") === "true") {
        setTimeout(() => {
          triggerCalendarDownload();
          toast({ title: "行事曆已自動更新", description: "請開啟下載的檔案加入手機行事曆" });
        }, 1000);
      }

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

      if (successCount > 0 && localStorage.getItem("autoCalendarSync") === "true") {
        setTimeout(() => {
          triggerCalendarDownload();
          toast({ title: "行事曆已自動更新", description: "請開啟下載的檔案加入手機行事曆" });
        }, 1000);
      }

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
    setWeekOffset(0);
    setAutoAdvanced(false);
    setSelectedCoachFilter("all");
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

  const getTaiwanToday = () => {
    const now = new Date();
    const taiwanStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
    return new Date(taiwanStr + "T00:00:00+08:00");
  };
  const isSlotTooSoon = (dateStr: string) => {
    const taiwanToday = getTaiwanToday();
    const slotDate = new Date(dateStr + "T00:00:00+08:00");
    const diffDays = Math.floor((slotDate.getTime() - taiwanToday.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 3;
  };

  const slots = detail?.timeSlots || [];
  const allDates = [...new Set(slots.map((s) => s.date))].sort();

  useEffect(() => {
    if (allDates.length > 0 && !autoAdvanced) {
      const firstBookable = allDates.find((d) => !isSlotTooSoon(d));
      if (firstBookable) {
        const now = new Date();
        const taiwanStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
        const today = new Date(taiwanStr + "T00:00:00+08:00");
        const dayOfWeek = today.getDay();
        const mondayOff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() + mondayOff);
        const bookableDate = new Date(firstBookable + "T00:00:00+08:00");
        const diffMs = bookableDate.getTime() - thisMonday.getTime();
        const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks > 0) {
          setWeekOffset(diffWeeks);
        }
      }
      setAutoAdvanced(true);
    }
  }, [allDates.join(","), selectedFranchiseId]);

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const taiwanStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
    const today = new Date(taiwanStr + "T00:00:00+08:00");
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset + offset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekRange(weekOffset);
  const weekStartStr = weekStart.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  const weekEndStr = weekEnd.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

  const datesInWeek = allDates.filter((d) => d >= weekStartStr && d <= weekEndStr);
  const activeDate = selectedDate && datesInWeek.includes(selectedDate) ? selectedDate : datesInWeek[0] || null;

  const hasNextWeek = allDates.some((d) => d > weekEndStr);
  const hasPrevWeek = weekOffset > 0;

  const formatWeekLabel = () => {
    const DAY_SHORT = ["日", "一", "二", "三", "四", "五", "六"];
    const s = weekStart;
    const e = weekEnd;
    return `${s.getMonth() + 1}/${s.getDate()}(${DAY_SHORT[s.getDay()]}) ~ ${e.getMonth() + 1}/${e.getDate()}(${DAY_SHORT[e.getDay()]})`;
  };

  const filteredSlots = (activeDate ? slots.filter((s) => s.date === activeDate) : [])
    .filter((s) => selectedCoachFilter === "all" || s.coachId?.toString() === selectedCoachFilter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const dow = d.getDay();
    const dayLabel = DAY_LABELS[dow.toString()] || "";
    return `${d.getMonth() + 1}/${d.getDate()} ${dayLabel}`;
  };

  const bookingSteps = [
    { label: "搜尋教室" },
    { label: "選擇時段" },
    { label: "確認預約" },
  ];
  const currentStepIndex = step === "search" ? 0 : step === "detail" ? 1 : 2;

  if (step === "confirm" && bookingSlot && detail) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <StepIndicator current={currentStepIndex} steps={bookingSteps} />
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
          <div className="pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-tiffany" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid="text-confirm-franchise">{detail.franchise.name}</p>
                <p className="text-xs text-muted-foreground">{detail.franchise.address || `${detail.franchise.city} ${detail.franchise.district}`}</p>
                {detail.franchise.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {detail.franchise.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">日期</p>
              <p className="text-sm font-medium text-foreground" data-testid="text-confirm-date">{formatDate(bookingSlot.date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">時間</p>
              <p className="text-sm font-medium text-foreground" data-testid="text-confirm-time">{bookingSlot.startTime} - {bookingSlot.endTime}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">剩餘名額</p>
              <p className="text-sm font-medium text-tiffany">
                {bookingSlot.maxSeats - bookingSlot.bookedSeats} 位
              </p>
            </div>
          </div>

          {(() => {
            const confirmCoach = detail.coaches.find((c) => c.id === bookingSlot.coachId);
            if (!confirmCoach) return null;
            return (
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-muted-foreground mb-2">授課老師</p>
                <div className="flex items-start gap-2.5 p-2.5 bg-gray-50/80 rounded-lg" data-testid="text-confirm-coach">
                  <div className="w-9 h-9 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-4.5 h-4.5 text-tiffany" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{confirmCoach.name}</span>
                      {confirmCoach.isCertified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-tiffany bg-tiffany/10 px-1.5 py-0.5 rounded-full">
                          <Award className="w-2.5 h-2.5" />
                          認證
                        </span>
                      )}
                      {(confirmCoach.rating ?? 0) > 0 && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-0.5 ml-auto">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {confirmCoach.rating?.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {confirmCoach.specialties && confirmCoach.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {confirmCoach.specialties.map((s, i) => (
                          <span key={i} className="text-[10px] text-muted-foreground bg-white px-1.5 py-0.5 rounded border border-gray-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <Label className="text-sm font-medium mb-3 block">選擇上課的孩子</Label>
          {children.length === 1 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-tiffany/5 border border-tiffany/20">
              <img
                src={children[0].gender === "female" ? avatarGirlPath : avatarBoyPath}
                alt={children[0].name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{children[0].name}</p>
                <p className="text-xs text-muted-foreground">{children[0].grade} 年級</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-tiffany ml-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => {
                const avatarSrc = child.gender === "female" ? avatarGirlPath : avatarBoyPath;
                return (
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
                  <img src={avatarSrc} alt={child.name} className="w-9 h-9 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.grade} 年級</p>
                  </div>
                  {selectedChild === child.id.toString() && (
                    <CheckCircle2 className="w-4 h-4 text-tiffany ml-auto" />
                  )}
                </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-amber-50/60 rounded-lg border border-amber-200/50 px-3 py-2">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
            提醒：預約後若需取消，請於課程開始前 4 小時操作。逾時取消系統仍會扣除點數計費。
          </p>
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
        <StepIndicator current={currentStepIndex} steps={bookingSteps} />
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
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5" data-testid="text-franchise-address">
                  <MapPin className="w-3.5 h-3.5 text-tiffany flex-shrink-0" />
                  {detail.franchise.address || `${detail.franchise.city} ${detail.franchise.district}`}
                </span>
                {detail.franchise.phone && (
                  <span className="flex items-center gap-1.5" data-testid="text-franchise-phone">
                    <Phone className="w-3.5 h-3.5 text-tiffany flex-shrink-0" />
                    <a href={`tel:${detail.franchise.phone}`} className="hover:text-tiffany transition-colors">
                      {detail.franchise.phone}
                    </a>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-tiffany flex-shrink-0" />
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

            {detail.coaches.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">師資介紹</h3>
                <div className="space-y-3">
                  {detail.coaches.map((coach) => (
                    <div key={coach.id} className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`coach-card-${coach.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-5 h-5 text-tiffany" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground" data-testid={`text-coach-name-${coach.id}`}>{coach.name}</span>
                            {coach.isCertified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-tiffany bg-tiffany/10 px-1.5 py-0.5 rounded-full">
                                <Award className="w-2.5 h-2.5" />
                                認證
                              </span>
                            )}
                            {(coach.rating ?? 0) > 0 && (
                              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {coach.rating?.toFixed(1)}
                              </span>
                            )}
                          </div>
                          {coach.bio && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-1.5" data-testid={`text-coach-bio-${coach.id}`}>{coach.bio}</p>
                          )}
                          {coach.specialties && coach.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {coach.specialties.map((s, i) => (
                                <span key={i} className="text-[10px] bg-gray-50 text-muted-foreground px-2 py-0.5 rounded-full border border-gray-100">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">可預約時段</h3>

              {detail.coaches.length > 1 && (
                <div className="mb-4">
                  <Select value={selectedCoachFilter} onValueChange={setSelectedCoachFilter}>
                    <SelectTrigger className="w-full sm:w-48 rounded-lg" data-testid="select-coach-filter">
                      <SelectValue placeholder="篩選老師" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部老師</SelectItem>
                      {detail.coaches.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between mb-3 bg-white rounded-xl border border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => { setWeekOffset((w) => w - 1); setSelectedDate(null); }}
                  disabled={!hasPrevWeek}
                  className={`p-1.5 rounded-lg transition-colors ${hasPrevWeek ? "hover:bg-tiffany/10 text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
                  data-testid="button-prev-week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-foreground" data-testid="text-week-range">
                  {formatWeekLabel()}
                </span>
                <button
                  onClick={() => { setWeekOffset((w) => w + 1); setSelectedDate(null); }}
                  disabled={!hasNextWeek}
                  className={`p-1.5 rounded-lg transition-colors ${hasNextWeek ? "hover:bg-tiffany/10 text-foreground" : "text-muted-foreground/30 cursor-not-allowed"}`}
                  data-testid="button-next-week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {datesInWeek.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {datesInWeek.map((date) => {
                    const tooSoon = isSlotTooSoon(date);
                    return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${
                        activeDate === date
                          ? "bg-tiffany text-white border-tiffany"
                          : tooSoon
                          ? "bg-gray-50 text-muted-foreground/50 border-gray-100 cursor-default"
                          : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                      }`}
                      data-testid={`date-tab-${date}`}
                    >
                      {formatDate(date)}{tooSoon ? " (不可預約)" : ""}
                    </button>
                    );
                  })}
                </div>
              )}

              {datesInWeek.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">本週沒有可預約的時段</p>
                  {hasNextWeek && (
                    <button
                      onClick={() => { setWeekOffset((w) => w + 1); setSelectedDate(null); }}
                      className="text-xs text-tiffany hover:underline mt-2"
                    >
                      查看下一週 →
                    </button>
                  )}
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">此日期沒有可預約的時段</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSlots.map((slot) => {
                    const available = slot.maxSeats - slot.bookedSeats;
                    const coach = detail.coaches.find((c) => c.id === slot.coachId);
                    const tooSoon = isSlotTooSoon(slot.date);
                    const canBook = available > 0 && !tooSoon;
                    return (
                      <div
                        key={slot.id}
                        className={`bg-white rounded-xl border p-4 transition-all ${
                          canBook ? "border-gray-100 hover:border-tiffany/30 hover:shadow-sm" : "border-gray-100 opacity-60"
                        }`}
                        data-testid={`slot-card-${slot.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-tiffany" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: slot.maxSeats }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < slot.bookedSeats ? "bg-tiffany" : "border border-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-0.5">
                              餘 {available}
                            </span>
                          </div>
                        </div>
                        {coach && (
                          <div className="flex items-start gap-2.5 mb-3 p-2.5 bg-gray-50/80 rounded-lg" data-testid={`slot-coach-info-${slot.id}`}>
                            <div className="w-8 h-8 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                              <UserCircle className="w-4 h-4 text-tiffany" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-sm font-medium text-foreground">{coach.name}</span>
                                {coach.isCertified && (
                                  <Award className="w-3 h-3 text-tiffany" />
                                )}
                                {(coach.rating ?? 0) > 0 && (
                                  <span className="text-[10px] text-amber-600 flex items-center gap-0.5 ml-auto">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    {coach.rating?.toFixed(1)}
                                  </span>
                                )}
                              </div>
                              {coach.specialties && coach.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {coach.specialties.map((s, i) => (
                                    <span key={i} className="text-[10px] text-muted-foreground bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleBook(slot)}
                            disabled={!canBook}
                            className="rounded-full px-4 text-xs"
                            style={canBook ? { backgroundColor: "#81D8D0", color: "white" } : {}}
                            data-testid={`button-book-${slot.id}`}
                          >
                            {tooSoon ? "需提前 3 天" : available > 0 ? "預約" : "已滿"}
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
      <StepIndicator current={currentStepIndex} steps={bookingSteps} />
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">預約課程</h2>
        <p className="text-sm text-muted-foreground">選擇地區，找到離你最近的教室</p>
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
          {[...results]
            .sort((a, b) => {
              const aFav = favoriteIds.includes(a.franchise.id) ? 1 : 0;
              const bFav = favoriteIds.includes(b.franchise.id) ? 1 : 0;
              return bFav - aFav;
            })
            .map((result) => {
            const f = result.franchise;
            const isFav = favoriteIds.includes(f.id);
            const coverImg = f.coverPhoto || (f.photos && f.photos.length > 0 ? f.photos[0] : null);
            return (
              <div
                key={f.id}
                className={`w-full bg-white rounded-xl border overflow-hidden text-left hover:border-tiffany/30 hover:shadow-sm transition-all group flex ${isFav ? "border-coral/30 ring-1 ring-coral/10" : "border-gray-100"}`}
                data-testid={`franchise-card-${f.id}`}
              >
                <div className="relative flex-shrink-0 w-28 sm:w-36 cursor-pointer" onClick={() => selectFranchise(f.id)}>
                  {coverImg ? (
                    <img src={coverImg} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-tiffany/5 to-tiffany/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-tiffany/30" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); favoriteMutation.mutate({ franchiseId: f.id, isFavorite: isFav }); }}
                    className={`absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFav ? "bg-coral/90 text-white" : "bg-black/30 text-white/80 hover:bg-coral/70 hover:text-white"}`}
                    data-testid={`button-favorite-${f.id}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-white" : ""}`} />
                  </button>
                </div>
                <button
                  onClick={() => selectFranchise(f.id)}
                  className="flex-1 min-w-0 text-left"
                  data-testid={`button-select-franchise-${f.id}`}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isFav && <Heart className="w-3 h-3 fill-coral text-coral flex-shrink-0" />}
                        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-tiffany transition-colors truncate">
                          {f.name}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-tiffany transition-colors flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground mb-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {f.address || `${f.city} ${f.district}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground mb-1.5">
                      {f.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {f.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {result.coachCount} 位老師
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-tiffany flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3" />
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
              </div>
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
  const [schoolCity, setSchoolCity] = useState("");
  const [schoolDistrict, setSchoolDistrict] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const getChildBookings = (childId: number) =>
    bookings.filter((b) => b.childId === childId);

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; grade: number; school: string; gender?: string }) => {
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

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; grade?: number; school?: string; gender?: string } }) => {
      const res = await apiRequest("PATCH", `/api/children/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "更新失敗", description: error.message, variant: "destructive" });
    },
  });

  const composedSchool = useMemo(() => {
    if (schoolCity && schoolDistrict && schoolName) {
      return `${schoolCity}${schoolDistrict}${schoolName}`;
    }
    return "";
  }, [schoolCity, schoolDistrict, schoolName]);

  const parseSchoolString = (schoolStr: string) => {
    if (!schoolStr) return { city: "", district: "", name: "" };
    for (const city of TAIWAN_CITIES) {
      if (schoolStr.startsWith(city)) {
        const rest = schoolStr.slice(city.length);
        const districts = getDistricts(city);
        for (const dist of districts) {
          if (rest.startsWith(dist)) {
            const sName = rest.slice(dist.length);
            return { city, district: dist, name: sName };
          }
        }
      }
    }
    return { city: "", district: "", name: "" };
  };

  const availableDistricts = useMemo(() => schoolCity ? getDistricts(schoolCity) : [], [schoolCity]);
  const availableSchools = useMemo(() => (schoolCity && schoolDistrict) ? getSchools(schoolCity, schoolDistrict) : [], [schoolCity, schoolDistrict]);

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingChild(null);
    setName("");
    setGrade("");
    setSchool("");
    setSchoolCity("");
    setSchoolDistrict("");
    setSchoolName("");
    setGender("male");
  };

  const openAdd = () => {
    setName("");
    setGrade("");
    setSchool("");
    setSchoolCity("");
    setSchoolDistrict("");
    setSchoolName("");
    setGender("male");
    setShowAddDialog(true);
  };

  const openEdit = (child: Child) => {
    setEditingChild(child);
    setName(child.name);
    setGrade(child.grade.toString());
    const schoolStr = child.school || "";
    setSchool(schoolStr);
    const parsed = parseSchoolString(schoolStr);
    if (parsed.city && parsed.district && parsed.name) {
      setSchoolCity(parsed.city);
      setSchoolDistrict(parsed.district);
      setSchoolName(parsed.name);
    } else {
      setSchoolCity("");
      setSchoolDistrict("");
      setSchoolName("");
    }
    setGender((child.gender as "male" | "female") || "male");
  };

  const handleSubmit = () => {
    const finalSchool = composedSchool;
    if (!name || !grade || !finalSchool) return;
    if (editingChild) {
      editMutation.mutate({
        id: editingChild.id,
        data: { name, grade: parseInt(grade), school: finalSchool, gender },
      });
    } else {
      addMutation.mutate({
        name,
        grade: parseInt(grade),
        school: finalSchool,
        gender,
      });
    }
  };

  const gradeLabel = (g: number) => {
    const labels = ["一", "二", "三", "四", "五", "六"];
    return labels[g - 1] ? `${labels[g - 1]}年級` : `${g} 年級`;
  };

  const isDialogOpen = showAddDialog || !!editingChild;
  const isMutating = addMutation.isPending || editMutation.isPending;

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
            const totalCount = upcomingCount + completedCount;
            const avatarSrc = child.gender === "female" ? avatarGirlPath : avatarBoyPath;
            const nextBooking = childBookings
              .filter((b) => b.status === "confirmed")
              .sort((a, b) => `${a.slotDate} ${a.slotStartTime}`.localeCompare(`${b.slotDate} ${b.slotStartTime}`))[0];

            return (
              <div
                key={child.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-tiffany/20 transition-colors"
                data-testid={`card-child-${child.id}`}
              >
                <div className="flex items-start gap-4">
                  <img src={avatarSrc} alt={child.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-50" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{child.name}</h3>
                      <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">
                        {gradeLabel(child.grade)}
                      </span>
                    </div>
                    {child.studentCode && (
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1" data-testid={`text-student-code-${child.id}`}>
                        <Hash className="w-3 h-3" />
                        學號：{child.studentCode}
                      </p>
                    )}
                    {child.school && (
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {child.school}
                      </p>
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
                    {totalCount > 0 && (
                      <div className="mt-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-tiffany to-green-400 rounded-full transition-all"
                              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
                        </div>
                      </div>
                    )}
                    {nextBooking && (
                      <div className="mt-2.5 bg-tiffany/5 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-tiffany flex-shrink-0" />
                        <span className="text-xs text-foreground truncate">
                          下一堂：{nextBooking.slotDate?.split("-").slice(1).join("/")} {nextBooking.slotStartTime?.slice(0, 5)}
                          {nextBooking.franchiseName && ` · ${nextBooking.franchiseName}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openEdit(child)}
                    className="p-2 text-muted-foreground hover:text-tiffany hover:bg-tiffany/5 rounded-lg transition-colors flex-shrink-0"
                    data-testid={`button-edit-child-${child.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChild ? "編輯孩子" : "新增孩子"}</DialogTitle>
            <DialogDescription>{editingChild ? "更新孩子的基本資料" : "填寫孩子的基本資料"}</DialogDescription>
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
              <Label className="mb-2 block">性別</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    gender === "male" ? "border-tiffany bg-tiffany/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid="button-gender-male"
                >
                  <img src={avatarBoyPath} alt="男生" className="w-10 h-10 rounded-full object-cover" />
                  <span className={`text-sm font-medium ${gender === "male" ? "text-tiffany" : "text-muted-foreground"}`}>男生</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    gender === "female" ? "border-coral bg-coral/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid="button-gender-female"
                >
                  <img src={avatarGirlPath} alt="女生" className="w-10 h-10 rounded-full object-cover" />
                  <span className={`text-sm font-medium ${gender === "female" ? "text-coral" : "text-muted-foreground"}`}>女生</span>
                </button>
              </div>
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
              <Label className="mb-1.5 block">就讀學校 <span className="text-red-400 text-xs">*必填</span></Label>
              {editingChild && school && !composedSchool && (
                <p className="text-xs text-amber-600 mb-1.5" data-testid="text-legacy-school-hint">
                  目前學校：{school}，請重新選擇學校
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Select value={schoolCity} onValueChange={(val) => { setSchoolCity(val); setSchoolDistrict(""); setSchoolName(""); }}>
                  <SelectTrigger data-testid="select-school-city">
                    <SelectValue placeholder="縣市" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAIWAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={schoolDistrict} onValueChange={(val) => { setSchoolDistrict(val); setSchoolName(""); }} disabled={!schoolCity}>
                  <SelectTrigger data-testid="select-school-district">
                    <SelectValue placeholder="鄉鎮區" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist) => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={schoolName} onValueChange={setSchoolName} disabled={!schoolDistrict}>
                  <SelectTrigger data-testid="select-school-name">
                    <SelectValue placeholder="學校" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchools.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !grade || !composedSchool || isMutating}
              style={{ backgroundColor: "#81D8D0", color: "white" }}
              data-testid="button-submit-child"
            >
              {isMutating ? (editingChild ? "更新中..." : "新增中...") : (editingChild ? "儲存變更" : "確認新增")}
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
            <span className="block mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200/50">
              提醒：課程開始前 4 小時內取消，系統仍會扣除點數計費。
            </span>
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

  const [autoCalendarSync, setAutoCalendarSync] = useState(() => {
    return localStorage.getItem("autoCalendarSync") === "true";
  });

  const handleAutoCalendarToggle = (checked: boolean) => {
    setAutoCalendarSync(checked);
    localStorage.setItem("autoCalendarSync", checked ? "true" : "false");
    if (checked) {
      toast({
        title: "已開啟自動加入行事曆",
        description: "預約成功後會自動下載行事曆檔案，請開啟檔案加入手機行事曆。",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">預約紀錄</h2>
          <p className="text-sm text-muted-foreground">
            {statusCounts.confirmed > 0
              ? `${statusCounts.confirmed} 堂即將上課，${statusCounts.completed} 堂已完成`
              : "查看和管理所有預約"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0" data-testid="toggle-calendar-sync">
          <CalendarPlus className="w-4 h-4 text-tiffany" />
          <label htmlFor="auto-calendar" className="text-xs text-muted-foreground whitespace-nowrap cursor-pointer">
            自動加入行事曆
          </label>
          <Switch
            id="auto-calendar"
            checked={autoCalendarSync}
            onCheckedChange={handleAutoCalendarToggle}
            data-testid="switch-auto-calendar"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>時間區間</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 text-xs flex-1 min-w-0"
            data-testid="input-date-from"
          />
          <span className="text-xs text-muted-foreground flex-shrink-0">~</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 text-xs flex-1 min-w-0"
            data-testid="input-date-to"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {quickRanges.map((r) => (
            <button
              key={r.days}
              onClick={() => setQuickRange(r.days)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors flex-shrink-0 ${
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

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {isMultiChild && selectedChildId && (
          <button
            onClick={() => setSelectedChildId(null)}
            className="px-2.5 py-1.5 text-[11px] sm:text-xs rounded-full border border-coral/30 text-coral bg-coral/5 hover:bg-coral/10 whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0"
            data-testid="button-clear-child-filter"
          >
            <XCircle className="w-3 h-3" />
            全部
          </button>
        )}
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm rounded-full border whitespace-nowrap transition-all flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
              statusFilter === tab.id
                ? "bg-tiffany text-white border-tiffany"
                : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
            }`}
            data-testid={`filter-status-${tab.id}`}
          >
            {tab.label}
            <span className={`text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
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
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-[13px] sm:text-sm font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
                              {booking.franchiseName || "教室"}
                            </p>
                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${config.bgClass} ${config.textClass}`}>
                              <config.icon className="w-2.5 h-2.5" />
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground mt-0.5 flex-wrap">
                            {booking.coachName && (
                              <span className="flex items-center gap-0.5">
                                <GraduationCap className="w-3 h-3" />
                                {booking.coachName}
                              </span>
                            )}
                            {isMultiChild && !selectedChildId && booking.childName && (
                              <span className="bg-gray-50 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
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

      <div className="space-y-2">
        <div className="bg-red-50/60 rounded-xl border border-red-200/50 p-3">
          <p className="text-xs text-red-700 leading-relaxed font-medium">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            取消課程注意事項：已預約的課程若要取消，必須在課程開始前 4 小時透過系統操作取消。若超過此期限，系統仍會扣除點數計費，敬請留意。
          </p>
        </div>
        <div className="bg-amber-50/50 rounded-xl border border-amber-200/50 p-3">
          <p className="text-xs text-amber-700 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            行事曆同步說明：開啟「自動加入行事曆」後，每次預約成功會自動下載 .ics 檔案。手機開啟檔案後即可匯入行事曆，每堂課會在開始前 6 小時提醒。若取消課程，手機行事曆中的排程需手動刪除。
          </p>
        </div>
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

interface ContactBookWithDetails {
  id: number;
  bookingId: number | null;
  coachId: number;
  childId: number;
  lessonDate: string;
  lessonUnit: string;
  lessonProgress: string | null;
  performance: string | null;
  classNotes: string | null;
  quizScore: number | null;
  quizTotal: number | null;
  homework: string | null;
  nextExam: string | null;
  teacherRemarks: string | null;
  createdAt: string | null;
  coachName: string;
  childName?: string;
  childGrade?: number;
  childGender?: string;
}

function ContactBookTab() {
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: childrenList = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: contactBooksRaw = [], isLoading } = useQuery<ContactBookWithDetails[]>({
    queryKey: ["/api/parent/contact-books"],
  });

  const contactBooks = useMemo(() => {
    if (selectedChildId === "all") return contactBooksRaw;
    return contactBooksRaw.filter((cb) => cb.childId === parseInt(selectedChildId));
  }, [contactBooksRaw, selectedChildId]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2" data-testid="text-contact-book-title">
          <BookOpen className="w-5 h-5 text-tiffany" />
          聯絡簿
        </h2>
        {childrenList.length > 1 && (
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-36" data-testid="select-contact-book-child">
              <SelectValue placeholder="所有孩子" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有孩子</SelectItem>
              {childrenList.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {contactBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" data-testid="contact-book-empty">
          <BookOpen className="w-12 h-12 text-muted-foreground/15 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            目前還沒有聯絡簿
          </h3>
          <p className="text-xs text-muted-foreground">
            老師在上課後會為孩子填寫聯絡簿，屆時會顯示在這裡
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contactBooks.map((cb) => {
            const isExpanded = expandedId === cb.id;
            const avatarSrc = cb.childGender === "female" ? avatarGirlPath : avatarBoyPath;
            const dateObj = new Date(cb.lessonDate + "T00:00:00");
            const dateLabel = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

            return (
              <button
                key={cb.id}
                onClick={() => toggleExpand(cb.id)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-tiffany/20 transition-colors"
                data-testid={`contact-book-card-${cb.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {cb.childName && (
                      <img
                        src={avatarSrc}
                        alt={cb.childName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          {cb.childName && (
                            <span className="text-sm font-semibold text-foreground truncate" data-testid={`text-cb-child-${cb.id}`}>
                              {cb.childName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                          <CalendarDays className="w-3 h-3" />
                          <span data-testid={`text-cb-date-${cb.id}`}>{dateLabel}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">單元：</span>
                          <span className="text-foreground font-medium truncate" data-testid={`text-cb-unit-${cb.id}`}>{cb.lessonUnit}</span>
                        </div>
                        {cb.lessonProgress && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">進度：</span>
                            <span className="text-foreground truncate" data-testid={`text-cb-progress-${cb.id}`}>{cb.lessonProgress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <GraduationCap className="w-3 h-3 text-tiffany" />
                            {cb.coachName} 老師
                          </span>
                          {cb.quizScore !== null && cb.quizScore !== undefined && (
                            <span className="flex items-center gap-1 text-muted-foreground" data-testid={`text-cb-score-${cb.id}`}>
                              <FileText className="w-3 h-3" />
                              小考 {cb.quizScore}/{cb.quizTotal || 100}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-gray-50 space-y-3" data-testid={`contact-book-detail-${cb.id}`}>
                      {cb.homework && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            回家作業
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-gray-50/80 rounded-lg p-3" data-testid={`text-cb-homework-${cb.id}`}>
                            {cb.homework}
                          </p>
                        </div>
                      )}
                      {cb.nextExam && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Pencil className="w-3 h-3" />
                            下次考試
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-gray-50/80 rounded-lg p-3" data-testid={`text-cb-next-exam-${cb.id}`}>
                            {cb.nextExam}
                          </p>
                        </div>
                      )}
                      {cb.quizScore !== null && cb.quizScore !== undefined && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-tiffany" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">小考成績</p>
                            <p className="text-lg font-bold text-foreground" data-testid={`text-cb-score-detail-${cb.id}`}>
                              {cb.quizScore} <span className="text-sm font-normal text-muted-foreground">/ {cb.quizTotal || 100}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      {cb.teacherRemarks && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            老師備註
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-tiffany/5 rounded-lg p-3 border border-tiffany/10" data-testid={`text-cb-remarks-${cb.id}`}>
                            {cb.teacherRemarks}
                          </p>
                        </div>
                      )}
                    </div>
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
          <p className="text-sm text-muted-foreground">
            {viewMode === "orders" ? `${orders.length} 筆訂單紀錄` : "為孩子挑選合適的教材與教具"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 rounded-full p-0.5 flex">
            <button
              onClick={() => setViewMode("products")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                viewMode === "products" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-view-products"
            >
              商品
            </button>
            <button
              onClick={() => setViewMode("orders")}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                viewMode === "orders" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-view-orders"
            >
              訂單
            </button>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-muted-foreground hover:text-tiffany transition-colors"
            data-testid="button-open-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-coral text-white text-[10px] flex items-center justify-center font-bold" data-testid="text-cart-count">
                {cartCount}
              </span>
            )}
          </button>
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
