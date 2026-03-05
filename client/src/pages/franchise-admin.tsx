import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  Building2,
  GraduationCap,
  Clock,
  CalendarCheck,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Star,
  Phone,
  School,
  Tag,
  MapPin,
  FileText,
  Users,
  Image as ImageIcon,
  TrendingUp,
  Calendar,
  Percent,
  ChevronRight,
  KeyRound,
  UserPlus,
  ShieldCheck,
  CalendarDays,
  AlertTriangle,
  List,
  ChevronLeft,
  DoorOpen,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import type { Franchise, Coach, TimeSlot, Classroom } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { DAY_LABELS } from "@shared/constants";

interface FranchiseStats {
  totalCoaches: number;
  totalSlots: number;
  totalBookings: number;
  confirmedBookings: number;
  attendedBookings: number;
}

interface TodayStats {
  date: string;
  todayCoaches: number;
  coachList: string[];
  todaySlots: number;
  slotList: { id: number; startTime: string; endTime: string; coachName: string; classroomName: string | null; bookedSeats: number; maxSeats: number }[];
  todayBookings: number;
  bookingList: { id: number; childName: string; childGrade: number; status: string; startTime: string; endTime: string }[];
  todayAttended: number;
  attendedList: { id: number; childName: string; childGrade: number; status: string; startTime: string; endTime: string }[];
}

interface FranchiseBooking {
  id: number;
  slotId: number;
  childId: number;
  status: string;
  createdAt: string;
  childName: string;
  childGrade: number;
  childSchool: string | null;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingConflictInfo {
  childName: string;
  childGrade: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface SliderConfirmState {
  open: boolean;
  bookingCount: number;
  bookings: BookingConflictInfo[];
  slotIds: number[];
}

function SliderConfirmDialog({
  state,
  onClose,
  onConfirm,
  isPending,
}: {
  state: SliderConfirmState;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const [sliderValue, setSliderValue] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const targetValue = Math.max(state.bookingCount, 1);
  const isUnlocked = sliderValue >= targetValue;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const val = Math.round(pct * targetValue);
    setSliderValue(val);
  }, [targetValue]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    if (sliderValue < targetValue) {
      setSliderValue(0);
    }
  }, [sliderValue, targetValue]);

  return (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) { setSliderValue(0); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            警告：此操作將取消學生預約
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800 mb-2">
              {state.slotIds.length > 1
                ? `選取的時段中有 ${state.bookingCount} 位學生已預約`
                : `此時段有 ${state.bookingCount} 位學生已預約`
              }
            </p>
            <p className="text-xs text-red-600">刪除後將取消所有預約，並通知家長。</p>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {state.bookings.map((b, i) => (
              <div key={i} className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">{b.childName}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{b.childGrade}年級</span>
                <span className="text-xs text-tiffany ml-auto">{b.date} {b.startTime}-{b.endTime}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              拖曳滑桿至 <span className="font-bold text-red-600">{targetValue}</span> 以確認刪除
            </p>
            <div className="relative select-none" data-testid="slider-confirm-track">
              <div
                ref={trackRef}
                className="h-12 bg-gray-100 rounded-full relative overflow-hidden cursor-pointer border-2 border-gray-200"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-colors ${isUnlocked ? "bg-red-500" : "bg-red-300"}`}
                  style={{ width: `${(sliderValue / targetValue) * 100}%` }}
                />
                <div
                  className={`absolute top-1 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-colors ${isUnlocked ? "bg-red-600" : "bg-red-400"}`}
                  style={{ left: `calc(${(sliderValue / targetValue) * 100}% - ${sliderValue === 0 ? 0 : 20}px)` }}
                >
                  {sliderValue}
                </div>
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-gray-400 ml-12">→ 拖曳至 {targetValue} 確認刪除</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setSliderValue(0); onClose(); }} data-testid="button-cancel-force-delete">
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={!isUnlocked || isPending}
            onClick={onConfirm}
            data-testid="button-confirm-force-delete"
          >
            {isPending ? "刪除中..." : "確認刪除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FranchiseAdminDashboard() {
  const { user, isLoading: authLoading, logout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: myFranchise } = useQuery<Franchise>({
    queryKey: ["/api/franchise-admin/my-franchise"],
    enabled: !!user && user.role === "franchise_admin",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  if (!user || user.role !== "franchise_admin") {
    window.location.href = "/franchise-login";
    return null;
  }

  const menuItems = [
    { id: "overview", label: "分校總覽", icon: BarChart3 },
    { id: "info", label: "分校資訊", icon: Building2 },
    { id: "coaches", label: "師資管理", icon: GraduationCap },
    { id: "timeslots", label: "時段管理", icon: Clock },
    { id: "bookings", label: "預約管理", icon: CalendarCheck },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-washi">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <p className="font-serif text-lg tracking-[0.1em] text-foreground">質數教室</p>
              {myFranchise ? (
                <p className="text-xs text-tiffany font-medium mt-1" data-testid="sidebar-franchise-name">
                  {myFranchise.city} {myFranchise.district.replace("區", "")}教室
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">分校管理系統</p>
              )}
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className={activeTab === item.id ? "bg-sidebar-accent" : ""}
                        data-testid={`franchise-nav-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4">
              <SidebarMenuButton onClick={() => { logout(); window.location.href = "/franchise-login"; }} className="w-full justify-start text-muted-foreground" data-testid="franchise-button-logout">
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white">
            <SidebarTrigger data-testid="franchise-sidebar-toggle" />
            <h2 className="text-sm font-medium text-foreground">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "info" && <FranchiseInfoTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "timeslots" && <TimeSlotsTab />}
            {activeTab === "bookings" && <BookingsTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery<FranchiseStats>({
    queryKey: ["/api/franchise-admin/stats"],
  });

  const { data: todayStats, isLoading: todayLoading } = useQuery<TodayStats>({
    queryKey: ["/api/franchise-admin/stats/today"],
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: franchise } = useQuery<Franchise>({
    queryKey: ["/api/franchise-admin/my-franchise"],
  });

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(weekAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [preset, setPreset] = useState("week");

  const applyPreset = (key: string) => {
    setPreset(key);
    const now = new Date();
    let s = new Date(now);
    if (key === "week") { s.setDate(now.getDate() - 6); }
    else if (key === "2weeks") { s.setDate(now.getDate() - 13); }
    else if (key === "month") { s.setMonth(now.getMonth() - 1); }
    else if (key === "3months") { s.setMonth(now.getMonth() - 3); }
    setStartDate(formatDate(s));
    setEndDate(formatDate(now));
  };

  const { data: rangeStats, isLoading: rangeLoading } = useQuery<DateRangeStats>({
    queryKey: ["/api/franchise-admin/stats/date-range", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/franchise-admin/stats/date-range?startDate=${startDate}&endDate=${endDate}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const maxDailySeats = rangeStats?.dailyStats ? Math.max(...rangeStats.dailyStats.map((d) => d.totalSeats), 1) : 1;

  const todayDateLabel = todayStats?.date
    ? (() => { const d = new Date(todayStats.date + "T00:00:00"); return `${d.getMonth() + 1}/${d.getDate()}`; })()
    : "";

  const todayStatCards = [
    { key: "coaches", label: "上課老師數", value: todayStats?.todayCoaches ?? 0, icon: GraduationCap, color: "bg-tiffany/10 text-tiffany" },
    { key: "slots", label: "上課時段", value: todayStats?.todaySlots ?? 0, icon: Clock, color: "bg-coral/10 text-coral" },
    { key: "bookings", label: "預約人數", value: todayStats?.todayBookings ?? 0, icon: CalendarCheck, color: "bg-amber-warm text-amber-700" },
    { key: "attended", label: "已上課人數", value: todayStats?.todayAttended ?? 0, icon: Users, color: "bg-green-50 text-green-600" },
  ];

  const presets = [
    { key: "week", label: "近 7 天" },
    { key: "2weeks", label: "近 14 天" },
    { key: "month", label: "近 1 個月" },
    { key: "3months", label: "近 3 個月" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          {franchise ? `${franchise.city} ${franchise.district.replace("區", "")}教室` : "分校總覽"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {franchise ? `${franchise.city}${franchise.district}` : "載入中..."}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-tiffany" />
        <span className="text-sm font-medium text-muted-foreground">今日 {todayDateLabel || todayStats?.date || ""}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {todayStatCards.map((card) => (
          <div key={card.key} data-testid={`franchise-stat-${card.key}`}>
            <button
              onClick={() => setExpandedCard(expandedCard === card.key ? null : card.key)}
              className="w-full bg-white rounded-md border border-gray-100 p-5 text-left hover:border-tiffany/40 hover:shadow-sm transition-all cursor-pointer"
            >
              {todayLoading ? (
                <Skeleton className="h-16" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCard === card.key ? "rotate-180" : ""}`} />
                </div>
              )}
            </button>
            {expandedCard === card.key && todayStats && (
              <div className="bg-white border border-gray-100 border-t-0 rounded-b-md px-4 py-3 space-y-1.5 text-sm animate-in slide-in-from-top-1">
                {card.key === "coaches" && (
                  todayStats.coachList.length === 0
                    ? <p className="text-xs text-muted-foreground py-2 text-center">今日無排課老師</p>
                    : todayStats.coachList.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <GraduationCap className="w-3.5 h-3.5 text-tiffany" />
                        <span className="text-sm">{name}</span>
                      </div>
                    ))
                )}
                {card.key === "slots" && (
                  todayStats.slotList.length === 0
                    ? <p className="text-xs text-muted-foreground py-2 text-center">今日無時段</p>
                    : todayStats.slotList.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2 py-1 flex-wrap">
                        <span className="text-tiffany font-medium text-xs">{slot.startTime}-{slot.endTime}</span>
                        {slot.classroomName && (
                          <span className="text-xs bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <DoorOpen className="w-3 h-3" />{slot.classroomName}
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{slot.coachName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{slot.bookedSeats}/{slot.maxSeats}</span>
                      </div>
                    ))
                )}
                {card.key === "bookings" && (
                  todayStats.bookingList.length === 0
                    ? <p className="text-xs text-muted-foreground py-2 text-center">今日無預約</p>
                    : todayStats.bookingList.map((b) => (
                      <div key={b.id} className="flex items-center gap-2 py-1 flex-wrap">
                        <span className="text-sm font-medium">{b.childName}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{b.childGrade}年級</span>
                        <span className="text-xs text-tiffany">{b.startTime}-{b.endTime}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${b.status === "checked_in" || b.status === "completed" ? "bg-green-50 text-green-600" : "bg-tiffany/10 text-tiffany"}`}>
                          {b.status === "checked_in" ? "上課中" : b.status === "completed" ? "已完成" : "已確認"}
                        </span>
                      </div>
                    ))
                )}
                {card.key === "attended" && (
                  todayStats.attendedList.length === 0
                    ? <p className="text-xs text-muted-foreground py-2 text-center">今日尚無學生上課</p>
                    : todayStats.attendedList.map((b) => (
                      <div key={b.id} className="flex items-center gap-2 py-1 flex-wrap">
                        <span className="text-sm font-medium">{b.childName}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{b.childGrade}年級</span>
                        <span className="text-xs text-tiffany">{b.startTime}-{b.endTime}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${b.status === "checked_in" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                          {b.status === "checked_in" ? "上課中" : "已完成"}
                        </span>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-tiffany" />統計分析
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex gap-2">
            {presets.map((p) => (
              <Button
                key={p.key}
                variant={preset === p.key ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset(p.key)}
                data-testid={`stats-preset-${p.key}`}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div>
              <Label className="text-xs text-muted-foreground">開始日期</Label>
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPreset(""); }} className="w-40" data-testid="stats-start-date" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-5" />
            <div>
              <Label className="text-xs text-muted-foreground">結束日期</Label>
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPreset(""); }} className="w-40" data-testid="stats-end-date" />
            </div>
          </div>
        </div>
      </div>

      {rangeLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}
        </div>
      ) : rangeStats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "開課時段", value: rangeStats.totalSlots, icon: Clock, color: "bg-tiffany/10 text-tiffany", sub: `${rangeStats.totalSeats} 個座位` },
              { label: "預約數", value: rangeStats.totalBookings, icon: CalendarCheck, color: "bg-coral/10 text-coral", sub: `已上課 ${rangeStats.completedBookings + (rangeStats.checkedInBookings || 0)}` },
              { label: "取消數", value: rangeStats.cancelledBookings, icon: Users, color: "bg-amber-warm text-amber-700", sub: rangeStats.totalBookings > 0 ? `取消率 ${Math.round((rangeStats.cancelledBookings / rangeStats.totalBookings) * 100)}%` : "無預約" },
              { label: "座位使用率", value: `${rangeStats.occupancyRate}%`, icon: Percent, color: "bg-tiffany/10 text-tiffany", sub: `${rangeStats.bookedSeats} / ${rangeStats.totalSeats} 座位` },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-md border border-gray-100 p-5" data-testid={`stats-card-${card.label}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pl-15">{card.sub}</p>
              </div>
            ))}
          </div>

          {rangeStats.dailyStats.length > 0 && (
            <div className="bg-white rounded-md border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tiffany" />每日座位使用
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {rangeStats.dailyStats.map((day) => {
                  const rate = day.totalSeats > 0 ? Math.round((day.bookedSeats / day.totalSeats) * 100) : 0;
                  const barWidth = day.totalSeats > 0 ? (day.bookedSeats / maxDailySeats) * 100 : 0;
                  const dateObj = new Date(day.date + "T00:00:00");
                  const weekday = ["日", "一", "二", "三", "四", "五", "六"][dateObj.getDay()];
                  return (
                    <div key={day.date} className="flex items-center gap-3" data-testid={`stats-daily-${day.date}`}>
                      <div className="w-28 text-xs text-muted-foreground shrink-0">
                        {day.date.slice(5)} ({weekday})
                      </div>
                      <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: rate >= 80 ? "#81D8D0" : rate >= 50 ? "#FFB7B2" : "#e5e7eb",
                          }}
                        />
                      </div>
                      <div className="w-24 text-right shrink-0">
                        <span className="text-xs font-medium text-foreground">{day.bookedSeats}/{day.totalSeats}</span>
                        <span className="text-xs text-muted-foreground ml-1">({rate}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-tiffany inline-block" />80%↑</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-coral inline-block" />50-79%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />50%↓</span>
              </div>
            </div>
          )}

          {rangeStats.coachStats.length > 0 && (
            <div className="bg-white rounded-md border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-tiffany" />老師授課統計
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground">老師</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">時段數</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">預約數</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">已確認</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">已完成</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">已取消</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">取消率</th>
                      <th className="py-2 pr-4 text-xs font-medium text-muted-foreground text-center">已用座位</th>
                      <th className="py-2 text-xs font-medium text-muted-foreground text-center">使用率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangeStats.coachStats.map((coach) => {
                      const maxSeats = coach.slots * 5;
                      const coachRate = maxSeats > 0 ? Math.round((coach.bookedSeats / maxSeats) * 100) : 0;
                      const cancelRate = coach.bookings > 0 ? Math.round((coach.cancelledBookings / coach.bookings) * 100) : 0;
                      return (
                        <tr key={coach.coachId} className="border-b border-gray-50" data-testid={`stats-coach-${coach.coachId}`}>
                          <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">{coach.coachName}</td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">{coach.slots}</td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">{coach.bookings}</td>
                          <td className="py-3 pr-4 text-center">
                            <span className="text-xs font-medium text-tiffany">{coach.confirmedBookings}</span>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <span className="text-xs font-medium text-green-600">{coach.completedBookings}</span>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <span className={`text-xs font-medium ${coach.cancelledBookings > 0 ? "text-red-500" : "text-muted-foreground"}`}>{coach.cancelledBookings}</span>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cancelRate >= 30 ? "bg-red-50 text-red-500" : cancelRate >= 15 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-muted-foreground"}`}>
                              {cancelRate}%
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">{coach.bookedSeats}</td>
                          <td className="py-3 text-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${coachRate >= 80 ? "bg-tiffany/10 text-tiffany" : coachRate >= 50 ? "bg-coral/10 text-coral" : "bg-gray-100 text-muted-foreground"}`}>
                              {coachRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {rangeStats.totalSlots === 0 && (
            <div className="text-center py-16 bg-white rounded-md border border-gray-100">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">此時間區間尚無開課資料</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

interface DateRangeStats {
  totalSlots: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  checkedInBookings: number;
  cancelledBookings: number;
  totalSeats: number;
  bookedSeats: number;
  occupancyRate: number;
  dailyStats: Array<{ date: string; slots: number; bookings: number; bookedSeats: number; totalSeats: number }>;
  coachStats: Array<{ coachId: number; coachName: string; slots: number; bookings: number; confirmedBookings: number; cancelledBookings: number; completedBookings: number; bookedSeats: number }>;
}

function FranchiseInfoTab() {
  const { toast } = useToast();
  const { data: franchise, isLoading } = useQuery<Franchise>({
    queryKey: ["/api/franchise-admin/my-franchise"],
  });

  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [nearbySchools, setNearbySchools] = useState<string[]>([]);
  const [schoolInput, setSchoolInput] = useState("");

  const startEdit = () => {
    if (franchise) {
      setDescription(franchise.description || "");
      setPhone(franchise.phone || "");
      setTags(franchise.tags || []);
      setNearbySchools(franchise.nearbySchools || []);
    }
    setEditing(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/franchise-admin/my-franchise", {
        description, phone, tags, nearbySchools,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "分校資訊已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/my-franchise"] });
      setEditing(false);
    },
  });

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>;
  if (!franchise) return <p className="text-muted-foreground">無法取得分校資訊</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">分校資訊</h1>
          <p className="text-sm text-muted-foreground">編輯分校特色描述及基本資訊</p>
        </div>
        {!editing && (
          <Button onClick={startEdit} className="rounded-full" data-testid="button-edit-franchise-info">
            <Edit className="w-4 h-4 mr-1.5" />編輯資訊
          </Button>
        )}
      </div>

      {!editing ? (
        <div className="bg-white rounded-md border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">分校名稱</p>
            <p className="text-sm font-medium">{franchise.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">地址</p>
            <p className="text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{franchise.city} {franchise.district} {franchise.address}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">電話</p>
            <p className="text-sm flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{franchise.phone || "未設定"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">分校介紹</p>
            <p className="text-sm text-muted-foreground">{franchise.description || "尚未撰寫介紹"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">標籤</p>
            <div className="flex gap-2 flex-wrap">
              {franchise.tags?.length ? franchise.tags.map((t) => (
                <span key={t} className="text-xs bg-amber-warm text-amber-700 px-2 py-0.5 rounded-full">{t}</span>
              )) : <span className="text-xs text-muted-foreground">尚無標籤</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">鄰近學校</p>
            <div className="flex gap-2 flex-wrap">
              {franchise.nearbySchools?.length ? franchise.nearbySchools.map((s) => (
                <span key={s} className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">{s}</span>
              )) : <span className="text-xs text-muted-foreground">尚無資料</span>}
            </div>
          </div>
          {franchise.rating != null && franchise.rating > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">評分</p>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{Number(franchise.rating).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({franchise.reviewCount} 則評價)</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-100 p-6 space-y-4">
          <div>
            <Label>電話</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-xxxx-xxxx" data-testid="input-franchise-info-phone" />
          </div>
          <div>
            <Label>分校介紹</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="撰寫分校特色..." rows={4} data-testid="input-franchise-info-description" />
          </div>
          <div>
            <Label>標籤</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-amber-warm text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
            <Select value="" onValueChange={(v) => { if (!tags.includes(v)) setTags([...tags, v]); }}>
              <SelectTrigger data-testid="select-franchise-info-tag"><SelectValue placeholder="新增標籤" /></SelectTrigger>
              <SelectContent>
                {["家長好評推薦", "年度績優校區", "成績進步快速", "新開幕", "小班教學"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>鄰近學校</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {nearbySchools.map((s) => (
                <span key={s} className="text-xs bg-tiffany/10 text-tiffany px-2 py-1 rounded-full flex items-center gap-1">
                  {s}
                  <button onClick={() => setNearbySchools(nearbySchools.filter((ns) => ns !== s))} className="hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={schoolInput} onChange={(e) => setSchoolInput(e.target.value)} placeholder="輸入學校名稱"
                onKeyDown={(e) => { if (e.key === "Enter" && schoolInput.trim()) { e.preventDefault(); if (!nearbySchools.includes(schoolInput.trim())) setNearbySchools([...nearbySchools, schoolInput.trim()]); setSchoolInput(""); } }}
                data-testid="input-franchise-info-school"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => { if (schoolInput.trim() && !nearbySchools.includes(schoolInput.trim())) { setNearbySchools([...nearbySchools, schoolInput.trim()]); setSchoolInput(""); } }}>加入</Button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditing(false)}>取消</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-save-franchise-info">
              {saveMutation.isPending ? "儲存中..." : "儲存變更"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">教室管理</h2>
        <p className="text-sm text-muted-foreground mb-4">管理分校的上課教室，排課時需指定教室</p>
        <ClassroomManager />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">教室照片管理</h2>
        <p className="text-sm text-muted-foreground mb-4">上傳教室環境照片，將顯示在分校頁面的照片輪播中</p>
        <PhotoManager franchiseId={franchise.id} photos={franchise.photos || []} coverPhoto={franchise.coverPhoto || null} />
      </div>
    </div>
  );
}

function ClassroomManager() {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: classroomsList = [], isLoading } = useQuery<Classroom[]>({
    queryKey: ["/api/franchise-admin/classrooms"],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/franchise-admin/classrooms", { name });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "教室已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/classrooms"] });
      setNewName("");
    },
    onError: (error: Error) => {
      toast({ title: "新增失敗", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest("PATCH", `/api/franchise-admin/classrooms/${id}`, { name });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "教室已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/classrooms"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/franchise-admin/classrooms/${id}`);
    },
    onSuccess: () => {
      toast({ title: "教室已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/classrooms"] });
    },
    onError: (error: Error) => {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="bg-white rounded-md border border-gray-100 p-6">
      <div className="flex gap-2 mb-4">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="輸入新教室名稱（如：A教室）"
          onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) { e.preventDefault(); createMutation.mutate(newName.trim()); } }}
          data-testid="input-new-classroom"
        />
        <Button
          onClick={() => { if (newName.trim()) createMutation.mutate(newName.trim()); }}
          disabled={!newName.trim() || createMutation.isPending}
          data-testid="button-add-classroom"
        >
          <Plus className="w-4 h-4 mr-1" />{createMutation.isPending ? "新增中..." : "新增"}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-12 rounded-md" />
      ) : classroomsList.length === 0 ? (
        <div className="text-center py-8">
          <DoorOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">尚未新增教室</p>
        </div>
      ) : (
        <div className="space-y-2">
          {classroomsList.map((cr) => (
            <div key={cr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md" data-testid={`classroom-item-${cr.id}`}>
              {editingId === cr.id ? (
                <>
                  <DoorOpen className="w-4 h-4 text-tiffany shrink-0" />
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => { if (e.key === "Enter" && editingName.trim()) { e.preventDefault(); updateMutation.mutate({ id: cr.id, name: editingName.trim() }); } }}
                    autoFocus
                    data-testid={`input-edit-classroom-${cr.id}`}
                  />
                  <button onClick={() => { if (editingName.trim()) updateMutation.mutate({ id: cr.id, name: editingName.trim() }); }} className="p-1 text-tiffany hover:bg-tiffany/10 rounded" data-testid={`button-save-classroom-${cr.id}`}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-gray-200 rounded" data-testid={`button-cancel-edit-classroom-${cr.id}`}>
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4 text-tiffany shrink-0" />
                  <span className="text-sm font-medium flex-1">{cr.name}</span>
                  <button onClick={() => { setEditingId(cr.id); setEditingName(cr.name); }} className="p-1 text-muted-foreground hover:bg-gray-200 rounded" data-testid={`button-edit-classroom-${cr.id}`}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm(`確定刪除「${cr.name}」？`)) deleteMutation.mutate(cr.id); }} className="p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded" data-testid={`button-delete-classroom-${cr.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoManager({ franchiseId, photos, coverPhoto }: { franchiseId: number; photos: string[]; coverPhoto: string | null }) {
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/franchise-admin/upload-photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "上傳失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "照片已上傳" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/my-franchise"] });
    },
    onError: (error: Error) => {
      toast({ title: "上傳失敗", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const res = await apiRequest("DELETE", "/api/franchise-admin/delete-photo", { photoUrl });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "照片已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/my-franchise"] });
    },
    onError: () => {
      toast({ title: "刪除失敗", variant: "destructive" });
    },
  });

  const setCoverMutation = useMutation({
    mutationFn: async (photoUrl: string | null) => {
      const res = await apiRequest("PATCH", "/api/franchise-admin/my-franchise", { coverPhoto: photoUrl });
      return res.json();
    },
    onSuccess: (_, photoUrl) => {
      toast({ title: photoUrl ? "已設為封面照片" : "已取消封面照片" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/my-franchise"] });
    },
    onError: () => {
      toast({ title: "設定失敗", variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-2">
        <label className="cursor-pointer" data-testid="button-upload-photo">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
          <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-tiffany text-white text-sm rounded-full hover:bg-tiffany/90 transition-colors">
            <ImageIcon className="w-4 h-4" />
            {uploadMutation.isPending ? "上傳中..." : "上傳照片"}
          </div>
        </label>
        <span className="text-xs text-muted-foreground">支援 JPG、PNG、GIF、WebP，最大 5MB</span>
      </div>
      <p className="text-xs text-muted-foreground/70 mb-4">點擊照片上的星號可設為封面圖，封面圖會顯示在家長搜尋教室的列表中</p>

      {photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">尚未上傳任何照片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, i) => {
            const isCover = coverPhoto === photo;
            return (
              <div
                key={photo}
                className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
                  isCover ? "border-tiffany ring-1 ring-tiffany/30" : "border-gray-100"
                }`}
                data-testid={`photo-item-${i}`}
              >
                <img src={photo} alt={`教室照片 ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
                {isCover && (
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-tiffany text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    封面
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCoverMutation.mutate(isCover ? null : photo)}
                    disabled={setCoverMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-amber-50"
                    title={isCover ? "取消封面" : "設為封面"}
                    data-testid={`button-set-cover-${i}`}
                  >
                    <Star className={`w-4 h-4 ${isCover ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(photo)}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-red-50"
                    data-testid={`button-delete-photo-${i}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CoachScheduleDialog({ coach, data, loading, onClose }: { coach: Coach | null; data: any[]; loading: boolean; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const dow = now.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now);
    mon.setDate(mon.getDate() + diff);
    return { year: mon.getFullYear(), month: mon.getMonth(), day: mon.getDate() };
  });
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  const prevCoachId = useState<number | null>(null);
  if (coach && coach.id !== prevCoachId[0]) {
    prevCoachId[1](coach.id);
    setViewMode("week");
    setSelectedCalDate(null);
    const now = new Date();
    const dow = now.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(now);
    mon.setDate(mon.getDate() + diff);
    setWeekStart({ year: mon.getFullYear(), month: mon.getMonth(), day: mon.getDate() });
    setCalMonth({ year: now.getFullYear(), month: now.getMonth() });
  }

  const fmtDate = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${dd}`;
  };

  const todayStr = fmtDate(new Date());

  const slotsByDate: Record<string, any[]> = {};
  data.forEach((s) => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push(s);
  });
  Object.values(slotsByDate).forEach((arr) => arr.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)));

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.year, weekStart.month, weekStart.day + i);
    return fmtDate(d);
  });
  const weekLabel = (() => {
    const s = new Date(weekStart.year, weekStart.month, weekStart.day);
    const e = new Date(weekStart.year, weekStart.month, weekStart.day + 6);
    return `${s.getFullYear()}/${s.getMonth() + 1}/${s.getDate()} - ${e.getFullYear()}/${e.getMonth() + 1}/${e.getDate()}`;
  })();

  const calendarDays = (() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1);
    let startDow = firstDay.getDay();
    if (startDow === 0) startDow = 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 1; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const mo = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push(`${year}-${mo}-${dd}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  const dayLabels = ["日", "一", "二", "三", "四", "五", "六"];
  const weekHeaderLabels = ["一", "二", "三", "四", "五", "六", "日"];

  const renderSlotItem = (slot: any) => (
    <div key={slot.slotId} className="flex items-center gap-2 text-xs py-1" data-testid={`schedule-slot-${slot.slotId}`}>
      <span className="text-tiffany font-medium whitespace-nowrap">{slot.startTime}-{slot.endTime}</span>
      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full truncate">{slot.franchiseName}</span>
      <span className="text-muted-foreground ml-auto whitespace-nowrap">{slot.bookedSeats}/{slot.maxSeats}</span>
    </div>
  );

  return (
    <Dialog open={!!coach} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto ${viewMode === "list" ? "max-w-lg" : "max-w-3xl"}`}>
        <DialogHeader>
          <DialogTitle>{coach?.name} 的跨校課表</DialogTitle>
        </DialogHeader>

        <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit" data-testid="schedule-view-toggle">
          {([["week", "週曆"], ["month", "月曆"], ["list", "列表"]] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === mode ? "bg-white shadow-sm text-tiffany font-medium" : "text-muted-foreground hover:text-foreground"}`}
              data-testid={`button-schedule-view-${mode}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3 py-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">目前沒有排課</p>
          </div>
        ) : viewMode === "week" ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setWeekStart((prev) => {
                  const d = new Date(prev.year, prev.month, prev.day - 7);
                  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
                })}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-schedule-prev-week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold" data-testid="text-schedule-week-label">{weekLabel}</span>
              <button
                onClick={() => setWeekStart((prev) => {
                  const d = new Date(prev.year, prev.month, prev.day + 7);
                  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
                })}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-schedule-next-week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
              {weekDates.map((dateStr, i) => {
                const daySlots = slotsByDate[dateStr] || [];
                const dayNum = parseInt(dateStr.split("-")[2]);
                const dow = new Date(dateStr + "T00:00:00").getDay();
                const isToday = dateStr === todayStr;
                return (
                  <div key={dateStr} className="bg-white min-h-[120px] p-1.5" data-testid={`schedule-week-day-${dateStr}`}>
                    <div className="text-center mb-1">
                      <div className="text-[10px] text-muted-foreground">{dayLabels[dow]}</div>
                      <span className={`text-xs inline-flex items-center justify-center w-5 h-5 rounded-full ${isToday ? "bg-tiffany text-white font-bold" : "text-gray-700"}`}>
                        {dayNum}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {daySlots.map((slot: any) => (
                        <div key={slot.slotId} className="text-[10px] leading-tight bg-tiffany/10 text-tiffany rounded px-1 py-0.5 truncate text-center" title={`${slot.startTime}-${slot.endTime} ${slot.franchiseName}`} data-testid={`schedule-week-slot-${slot.slotId}`}>
                          {slot.startTime}-{slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {(() => {
              const allWeekSlots = weekDates.flatMap((d) => (slotsByDate[d] || []).map((s: any) => ({ ...s, date: d })));
              if (allWeekSlots.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">本週無排課</p>;
              const grouped = allWeekSlots.reduce((g: Record<string, any[]>, s) => {
                if (!g[s.date]) g[s.date] = [];
                g[s.date].push(s);
                return g;
              }, {});
              return (
                <div className="mt-3 space-y-2">
                  {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
                    <div key={date} className="border border-gray-100 rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-1.5">
                        <span className="text-xs font-medium" data-testid={`schedule-date-${date}`}>{date} ({dayLabels[new Date(date + "T00:00:00").getDay()]})</span>
                      </div>
                      <div className="px-3 py-1 divide-y divide-gray-50">
                        {(slots as any[]).map((slot: any) => renderSlotItem(slot))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : viewMode === "month" ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => { setSelectedCalDate(null); setCalMonth((prev) => { const d = new Date(prev.year, prev.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); }}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-schedule-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold" data-testid="text-schedule-month-label">{calMonth.year}年{calMonth.month + 1}月</span>
              <button
                onClick={() => { setSelectedCalDate(null); setCalMonth((prev) => { const d = new Date(prev.year, prev.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() }; }); }}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-schedule-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground mb-1">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
              {calendarDays.map((dateStr, i) => {
                if (!dateStr) return <div key={`empty-${i}`} className="bg-gray-50 min-h-[60px]" />;
                const daySlots = slotsByDate[dateStr] || [];
                const dayNum = parseInt(dateStr.split("-")[2]);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedCalDate;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedCalDate(isSelected ? null : dateStr)}
                    className={`bg-white min-h-[60px] p-1 text-left transition-colors hover:bg-tiffany/5 ${isSelected ? "ring-2 ring-tiffany ring-inset" : ""}`}
                    data-testid={`schedule-cal-day-${dateStr}`}
                  >
                    <span className={`text-[10px] inline-flex items-center justify-center w-4 h-4 rounded-full ${isToday ? "bg-tiffany text-white font-bold" : "text-gray-700"}`}>
                      {dayNum}
                    </span>
                    {daySlots.length > 0 && (
                      <div className="mt-0.5">
                        {daySlots.map((s: any) => (
                          <div key={s.slotId} className="text-[9px] leading-tight bg-tiffany/10 text-tiffany rounded px-0.5 py-0.5 truncate mb-0.5 text-center">{s.startTime}-{s.endTime}</div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCalDate && (
              <div className="mt-3" data-testid="schedule-cal-day-detail">
                <h4 className="text-xs font-semibold mb-2">
                  {selectedCalDate} ({dayLabels[new Date(selectedCalDate + "T00:00:00").getDay()]})
                  {(() => {
                    const ds = slotsByDate[selectedCalDate] || [];
                    const franchises = [...new Set(ds.map((s: any) => s.franchiseName))];
                    return <> · {franchises.join("、")} — {ds.length} 堂</>;
                  })()}
                </h4>
                {(slotsByDate[selectedCalDate] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">當日無排課</p>
                ) : (
                  <div className="border border-gray-100 rounded-md px-3 py-1 divide-y divide-gray-50">
                    {(slotsByDate[selectedCalDate] || []).map((slot: any) => renderSlotItem(slot))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {Object.entries(
              data.reduce((groups: Record<string, any[]>, slot) => {
                if (!groups[slot.date]) groups[slot.date] = [];
                groups[slot.date].push(slot);
                return groups;
              }, {})
            ).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
              <div key={date} className="border border-gray-100 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-3 py-2">
                  <span className="text-sm font-medium" data-testid={`schedule-date-${date}`}>{date} ({dayLabels[new Date(date + "T00:00:00").getDay()]})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {(slots as any[]).map((slot: any) => (
                    <div key={slot.slotId} className="px-3 py-2 flex items-center gap-3" data-testid={`schedule-slot-${slot.slotId}`}>
                      <span className="text-sm text-tiffany font-medium">{slot.startTime}-{slot.endTime}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{slot.franchiseName}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{slot.bookedSeats}/{slot.maxSeats} 人</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>關閉</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CoachesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", bio: "", specialties: [] as string[], isCertified: true, rating: 0, reviewCount: 0,
  });
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [scheduleCoach, setScheduleCoach] = useState<Coach | null>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [accountDialogCoach, setAccountDialogCoach] = useState<Coach | null>(null);
  const [accountPassword, setAccountPassword] = useState("");

  const { data: coaches = [], isLoading } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });

  const resetForm = () => {
    setFormData({ name: "", phone: "", bio: "", specialties: [], isCertified: true, rating: 0, reviewCount: 0 });
    setSpecialtyInput("");
    setEditingCoach(null);
  };

  const resetAccountForm = () => {
    setAccountDialogCoach(null);
    setAccountPassword("");
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (c: Coach) => {
    setEditingCoach(c);
    setFormData({
      name: c.name, phone: c.phone || "", bio: c.bio || "", specialties: c.specialties || [],
      isCertified: c.isCertified, rating: c.rating || 0, reviewCount: c.reviewCount || 0,
    });
    setShowDialog(true);
  };

  const openCreateAccount = (c: Coach) => {
    if (!c.phone || c.phone.length < 6) {
      toast({ title: "無法建立帳號", description: "請先填寫老師手機號碼（至少 6 位）", variant: "destructive" });
      return;
    }
    const phoneLast6 = c.phone.slice(-6);
    if (!confirm(`將以「${c.name}@prime」建立帳號\n預設密碼為手機末六碼（${phoneLast6}）\n老師首次登入須修改密碼\n\n確定建立？`)) return;
    createAccountMutation.mutate({ coachId: c.id });
  };

  const openResetPassword = (c: Coach) => {
    setAccountDialogCoach(c);
    setAccountPassword("");
  };

  const openSchedule = async (c: Coach) => {
    setScheduleCoach(c);
    setScheduleLoading(true);
    try {
      const res = await fetch(`/api/franchise-admin/coaches/${c.id}/schedule`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data.schedule || []);
      }
    } catch {
      toast({ title: "載入課表失敗", variant: "destructive" });
    }
    setScheduleLoading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingCoach) {
        const res = await apiRequest("PATCH", `/api/franchise-admin/coaches/${editingCoach.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/franchise-admin/coaches", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingCoach ? "老師已更新" : "老師已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/franchise-admin/coaches/${id}`); },
    onSuccess: () => {
      toast({ title: "老師已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ coachId, isActive }: { coachId: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/franchise-admin/coaches/${coachId}`, { isActive });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      toast({ title: variables.isActive ? "老師已啟用" : "老師已停用" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
    },
    onError: () => {
      toast({ title: "操作失敗", variant: "destructive" });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async ({ coachId }: { coachId: number }) => {
      const res = await apiRequest("POST", `/api/franchise-admin/coaches/${coachId}/account`, {});
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "建立帳號失敗");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "帳號建立成功", description: `帳號：${data.accountUsername}，密碼為手機末六碼` });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
    },
    onError: (error: Error) => {
      toast({ title: "建立帳號失敗", description: error.message, variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ coachId, password }: { coachId: number; password: string }) => {
      const res = await apiRequest("PATCH", `/api/franchise-admin/coaches/${coachId}/account`, { password });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "重設密碼失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "密碼已重設", description: "請通知老師使用新密碼登入" });
      resetAccountForm();
    },
    onError: (error: Error) => {
      toast({ title: "重設密碼失敗", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">師資管理</h1>
          <p className="text-sm text-muted-foreground">管理本分校的老師</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-franchise-coach">
          <Plus className="w-4 h-4 mr-1.5" />新增老師
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無老師資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map((coach) => (
            <div key={coach.id} className={`bg-white rounded-md border p-4 flex items-center gap-4 ${coach.isActive === false ? "border-gray-200 opacity-60" : "border-gray-100"}`} data-testid={`franchise-coach-${coach.id}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${coach.isActive === false ? "bg-gray-100" : "bg-tiffany/10"}`}>
                <span className={`text-lg font-serif ${coach.isActive === false ? "text-gray-400" : "text-tiffany"}`}>{coach.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{coach.name}</p>
                  {coach.isCertified && <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">已認證</span>}
                  {coach.isActive === false && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full" data-testid={`coach-inactive-badge-${coach.id}`}>已停用</span>
                  )}
                  {coach.userId ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`coach-account-status-${coach.id}`}>
                      <ShieldCheck className="w-3 h-3" />{(coach as any).accountUsername || "帳號已建立"}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" data-testid={`coach-account-status-${coach.id}`}>
                      未建立帳號
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{coach.specialties?.join(" · ") || "一般數學教學"}</p>
                {coach.phone && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{coach.phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {coach.rating != null && coach.rating > 0 && (
                  <div className="text-right mr-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{Number(coach.rating).toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mr-1" data-testid={`toggle-coach-active-${coach.id}`}>
                  <Switch
                    checked={coach.isActive !== false}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ coachId: coach.id, isActive: checked })}
                    data-testid={`switch-coach-active-${coach.id}`}
                  />
                  <span className="text-[11px] text-muted-foreground w-6">{coach.isActive !== false ? "啟用" : "停用"}</span>
                </div>
                {coach.userId ? (
                  <Button variant="outline" size="sm" onClick={() => openResetPassword(coach)} data-testid={`button-reset-password-coach-${coach.id}`}>
                    <KeyRound className="w-4 h-4 mr-1" />重設密碼
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => openCreateAccount(coach)} data-testid={`button-create-account-coach-${coach.id}`}>
                    <UserPlus className="w-4 h-4 mr-1" />建立帳號
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => openSchedule(coach)} title="查看課表" data-testid={`button-schedule-coach-${coach.id}`}>
                  <CalendarDays className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => openEdit(coach)} data-testid={`button-edit-franchise-coach-${coach.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => { if (confirm("確定要刪除此老師？")) deleteMutation.mutate(coach.id); }} data-testid={`button-delete-franchise-coach-${coach.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCoach ? "編輯老師" : "新增老師"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>姓名 *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="老師姓名" data-testid="input-franchise-coach-name" />
            </div>
            <div>
              <Label>手機號碼</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="例：0912345678" data-testid="input-franchise-coach-phone" />
            </div>
            <div>
              <Label>簡介</Label>
              <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="老師簡介" data-testid="input-franchise-coach-bio" />
            </div>
            <div>
              <Label>專長</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.specialties.map((s) => (
                  <span key={s} className="text-xs bg-tiffany/10 text-tiffany px-2 py-1 rounded-full flex items-center gap-1">
                    {s}
                    <button onClick={() => setFormData({ ...formData, specialties: formData.specialties.filter((sp) => sp !== s) })} className="hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={specialtyInput} onChange={(e) => setSpecialtyInput(e.target.value)} placeholder="例：國小數學"
                  onKeyDown={(e) => { if (e.key === "Enter" && specialtyInput.trim()) { e.preventDefault(); if (!formData.specialties.includes(specialtyInput.trim())) setFormData({ ...formData, specialties: [...formData.specialties, specialtyInput.trim()] }); setSpecialtyInput(""); } }}
                  data-testid="input-franchise-coach-specialty"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => { if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) { setFormData({ ...formData, specialties: [...formData.specialties, specialtyInput.trim()] }); setSpecialtyInput(""); } }}>加入</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>認證狀態</Label>
              <Switch checked={formData.isCertified} onCheckedChange={(checked) => setFormData({ ...formData, isCertified: checked })} data-testid="switch-franchise-coach-certified" />
              <span className="text-sm text-muted-foreground">{formData.isCertified ? "已認證" : "未認證"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.name || saveMutation.isPending} data-testid="button-submit-franchise-coach">
              {saveMutation.isPending ? "儲存中..." : editingCoach ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!accountDialogCoach} onOpenChange={(open) => { if (!open) resetAccountForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>重設老師密碼</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
              <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-base font-serif text-tiffany">{accountDialogCoach?.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground" data-testid="account-dialog-coach-name">{accountDialogCoach?.name}</p>
                <p className="text-xs text-muted-foreground">{accountDialogCoach?.specialties?.join(" · ") || "一般數學教學"}</p>
              </div>
            </div>
            <div>
              <Label>新密碼 *</Label>
              <Input
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="輸入新密碼（至少 6 個字元）"
                data-testid="input-coach-account-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAccountForm} data-testid="button-cancel-coach-account">取消</Button>
            <Button
              onClick={() => {
                if (accountDialogCoach) {
                  resetPasswordMutation.mutate({ coachId: accountDialogCoach.id, password: accountPassword });
                }
              }}
              disabled={accountPassword.length < 6 || resetPasswordMutation.isPending}
              data-testid="button-submit-reset-password"
            >
              {resetPasswordMutation.isPending ? "重設中..." : "重設密碼"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CoachScheduleDialog
        coach={scheduleCoach}
        data={scheduleData}
        loading={scheduleLoading}
        onClose={() => { setScheduleCoach(null); setScheduleData([]); }}
      />
    </div>
  );
}

function TimeSlotsTab() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", startTime: "", endTime: "", coachId: 0, classroomId: 0, maxSeats: 5 });
  const [batchForm, setBatchForm] = useState({
    startDate: "", endDate: "", weekdays: [1, 2, 3, 4, 5] as number[],
    startTimes: ["09:00"] as string[], coachId: 0, classroomId: 0,
  });
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const { data: slots = [], isLoading } = useQuery<TimeSlot[]>({ queryKey: ["/api/franchise-admin/time-slots"] });
  const { data: coaches = [] } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });
  const { data: classroomsList = [] } = useQuery<Classroom[]>({ queryKey: ["/api/franchise-admin/classrooms"] });

  const computeEndTime = (start: string) => {
    const [h, m] = start.split(":").map(Number);
    const totalMin = h * 60 + m + 90;
    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  const handleBatchSubmit = async () => {
    const { startDate, endDate, weekdays, startTimes, coachId, classroomId } = batchForm;
    if (!startDate || !endDate || weekdays.length === 0 || startTimes.length === 0) return;
    setBatchSubmitting(true);
    const dates: string[] = [];
    const cur = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    while (cur <= end) {
      if (weekdays.includes(cur.getDay())) {
        const y = cur.getFullYear();
        const mo = String(cur.getMonth() + 1).padStart(2, "0");
        const d = String(cur.getDate()).padStart(2, "0");
        dates.push(`${y}-${mo}-${d}`);
      }
      cur.setDate(cur.getDate() + 1);
    }
    let created = 0;
    const conflicts: string[] = [];
    for (const date of dates) {
      for (const startTime of startTimes) {
        const endTime = computeEndTime(startTime);
        try {
          const res = await fetch("/api/franchise-admin/time-slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, startTime, endTime, coachId: coachId || null, classroomId: classroomId || null, maxSeats: 5 }),
            credentials: "include",
          });
          if (res.ok) { created++; }
          else {
            const err = await res.json();
            conflicts.push(`${date} ${startTime}: ${err.message}`);
          }
        } catch { conflicts.push(`${date} ${startTime}: 網路錯誤`); }
      }
    }
    setBatchSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
    if (created > 0) {
      toast({ title: `成功新增 ${created} 個時段` });
    }
    if (conflicts.length > 0) {
      toast({ title: `${conflicts.length} 個時段衝突`, description: conflicts.slice(0, 3).join("\n"), variant: "destructive" });
    }
    if (conflicts.length === 0) {
      setShowAdd(false);
    }
  };

  const addSlotMutation = useMutation({
    mutationFn: async (data: typeof slotForm) => {
      const payload = { ...data, coachId: data.coachId || null, classroomId: data.classroomId || null };
      const res = await fetch("/api/franchise-admin/time-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "新增時段失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "時段已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      setShowAdd(false);
      setSlotForm({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });
    },
    onError: (error: Error) => {
      toast({ title: "排課衝突", description: error.message, variant: "destructive" });
    },
  });

  const [sliderConfirm, setSliderConfirm] = useState<SliderConfirmState>({ open: false, bookingCount: 0, bookings: [], slotIds: [] });
  const [forceDeleting, setForceDeleting] = useState(false);

  const handleDeleteSlot = async (id: number) => {
    try {
      const res = await fetch(`/api/franchise-admin/time-slots/${id}`, { method: "DELETE", credentials: "include" });
      if (res.status === 409) {
        const data = await res.json();
        setSliderConfirm({ open: true, bookingCount: data.bookingCount, bookings: data.bookings, slotIds: [id] });
        return;
      }
      if (!res.ok) throw new Error("Failed");
      toast({ title: "時段已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats/today"] });
    } catch {
      toast({ title: "刪除失敗", variant: "destructive" });
    }
  };

  const handleForceDelete = async () => {
    setForceDeleting(true);
    let deleted = 0;
    let failed = 0;
    for (const id of sliderConfirm.slotIds) {
      try {
        await apiRequest("DELETE", `/api/franchise-admin/time-slots/${id}?force=true`);
        deleted++;
      } catch {
        failed++;
      }
    }
    setForceDeleting(false);
    setSliderConfirm({ open: false, bookingCount: 0, bookings: [], slotIds: [] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats/today"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/bookings"] });
    if (failed > 0) {
      toast({ title: `已刪除 ${deleted} 個時段，${failed} 個失敗`, variant: "destructive" });
    } else {
      toast({ title: `已刪除 ${deleted} 個時段，預約已取消並通知家長` });
    }
  };

  const [batchDeleteMode, setBatchDeleteMode] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const toggleSlotSelection = (id: number) => {
    setSelectedSlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedSlotIds.size === 0) return;
    setBatchDeleting(true);
    const conflictBookings: BookingConflictInfo[] = [];
    const conflictSlotIds: number[] = [];
    const noConflictIds: number[] = [];

    for (const id of selectedSlotIds) {
      try {
        const res = await fetch(`/api/franchise-admin/time-slots/${id}`, { method: "DELETE", credentials: "include" });
        if (res.status === 409) {
          const data = await res.json();
          conflictSlotIds.push(id);
          conflictBookings.push(...data.bookings);
        } else if (res.ok) {
          // deleted successfully (no bookings)
        }
      } catch {}
    }

    setBatchDeleting(false);

    if (conflictSlotIds.length > 0) {
      setSliderConfirm({
        open: true,
        bookingCount: conflictBookings.length,
        bookings: conflictBookings,
        slotIds: conflictSlotIds,
      });
    }

    setSelectedSlotIds(new Set());
    setBatchDeleteMode(false);
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats/today"] });
    const deletedCount = selectedSlotIds.size - conflictSlotIds.length;
    if (deletedCount > 0 && conflictSlotIds.length > 0) {
      toast({ title: `已刪除 ${deletedCount} 個無預約時段，另有 ${conflictSlotIds.length} 個時段需確認` });
    } else if (deletedCount > 0) {
      toast({ title: `已刪除 ${deletedCount} 個時段` });
    }
  };

  const [manualBookSlot, setManualBookSlot] = useState<TimeSlot | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const { data: availableStudents = [] } = useQuery<{ id: number; name: string; grade: number; school: string | null; parentId: string }[]>({
    queryKey: ["/api/franchise-admin/available-students"],
    enabled: !!manualBookSlot,
  });

  const { data: slotBookings = [] } = useQuery<{ id: number; slotId: number; childId: number; childName: string; status: string }[]>({
    queryKey: ["/api/franchise-admin/bookings"],
  });

  const manualBookMutation = useMutation({
    mutationFn: async ({ slotId, childId }: { slotId: number; childId: number }) => {
      const res = await apiRequest("POST", "/api/franchise-admin/manual-booking", { slotId, childId });
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "加排成功", description: `已成功加排 ${data.childName || "學生"}` });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      setManualBookSlot(null);
      setStudentSearch("");
    },
    onError: (error: Error) => {
      toast({ title: "加排失敗", description: error.message, variant: "destructive" });
    },
  });

  const isSlotExpired = (slot: TimeSlot) => {
    const now = new Date();
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    return now > slotEnd;
  };

  const getSlotBookedChildIds = (slotId: number) => {
    return slotBookings
      .filter((b: any) => b.slotId === slotId && (b.status === "confirmed" || b.status === "checked_in"))
      .map((b: any) => b.childId);
  };

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return DAY_LABELS[d.getDay().toString()] || "";
  };

  const [filterCoachId, setFilterCoachId] = useState<number | null>(null);

  const filteredSlots = filterCoachId ? slots.filter((s) => s.coachId === filterCoachId) : slots;

  const sortedSlots = [...filteredSlots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  const calendarDays = (() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    let startDow = firstDay.getDay();
    if (startDow === 0) startDow = 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 1; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const mo = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push(`${year}-${mo}-${dd}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  const slotsByDate: Record<string, typeof slots> = {};
  filteredSlots.forEach((s) => {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push(s);
  });
  Object.values(slotsByDate).forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const selectedDaySlots = selectedCalDate ? (slotsByDate[selectedCalDate] || []) : [];

  const calMonthLabel = `${calendarMonth.year}年${calendarMonth.month + 1}月`;

  const today = (() => {
    const n = new Date();
    const y = n.getFullYear();
    const mo = String(n.getMonth() + 1).padStart(2, "0");
    const dd = String(n.getDate()).padStart(2, "0");
    return `${y}-${mo}-${dd}`;
  })();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">時段管理</h1>
          <p className="text-sm text-muted-foreground">管理本分校的可預約時段</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterCoachId ? String(filterCoachId) : "all"} onValueChange={(v) => setFilterCoachId(v === "all" ? null : Number(v))}>
            <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-filter-coach">
              <SelectValue placeholder="全部老師" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部老師</SelectItem>
              {coaches.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex bg-gray-100 rounded-lg p-0.5" data-testid="view-mode-toggle">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-tiffany" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="button-view-list"
              title="列表檢視"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "calendar" ? "bg-white shadow-sm text-tiffany" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="button-view-calendar"
              title="日曆檢視"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          {batchDeleteMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allIds = sortedSlots.map((s) => s.id);
                  if (selectedSlotIds.size === allIds.length) setSelectedSlotIds(new Set());
                  else setSelectedSlotIds(new Set(allIds));
                }}
                data-testid="button-select-all-slots"
              >
                {selectedSlotIds.size === sortedSlots.length ? "取消全選" : "全選"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={selectedSlotIds.size === 0 || batchDeleting}
                data-testid="button-batch-delete"
              >
                <Trash2 className="w-4 h-4 mr-1" />{batchDeleting ? "刪除中..." : `刪除 (${selectedSlotIds.size})`}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setBatchDeleteMode(false); setSelectedSlotIds(new Set()); }} data-testid="button-cancel-batch-delete">
                取消
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setBatchDeleteMode(true)} data-testid="button-enter-batch-delete">
                <Trash2 className="w-4 h-4 mr-1" />批量刪除
              </Button>
              <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-franchise-slot">
                <Plus className="w-4 h-4 mr-1.5" />新增時段
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無時段資料</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {sortedSlots.map((slot) => {
            const coachName = coaches.find((c) => c.id === slot.coachId)?.name || "未指派";
            const classroomName = classroomsList.find((c) => c.id === slot.classroomId)?.name;
            return (
              <div key={slot.id} className={`bg-white rounded-md border p-3 flex items-center gap-4 ${batchDeleteMode && selectedSlotIds.has(slot.id) ? "border-red-300 bg-red-50/30" : "border-gray-100"}`} data-testid={`franchise-slot-${slot.id}`}>
                {batchDeleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedSlotIds.has(slot.id)}
                    onChange={() => toggleSlotSelection(slot.id)}
                    className="w-4 h-4 rounded border-gray-300 text-tiffany accent-tiffany shrink-0 cursor-pointer"
                    data-testid={`checkbox-slot-${slot.id}`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium">{slot.date} ({getDayLabel(slot.date)})</span>
                    <span className="text-sm text-tiffany font-medium">{slot.startTime} - {slot.endTime}</span>
                    {classroomName && (
                      <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" />{classroomName}
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{coachName}</span>
                    <span className="text-xs text-muted-foreground">已預約 {slot.bookedSeats}/{slot.maxSeats}</span>
                    {slot.bookedSeats < slot.maxSeats && !isSlotExpired(slot) && (
                      <span className="text-xs text-tiffany">剩 {slot.maxSeats - slot.bookedSeats} 位</span>
                    )}
                  </div>
                </div>
                {!batchDeleteMode && (
                  <div className="flex items-center gap-1">
                    {slot.bookedSeats < slot.maxSeats && !isSlotExpired(slot) && (
                      <Button variant="outline" size="icon" onClick={() => { setManualBookSlot(slot); setStudentSearch(""); }} data-testid={`button-manual-book-${slot.id}`} title="加排學生">
                        <UserPlus className="w-4 h-4 text-tiffany" />
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => handleDeleteSlot(slot.id)} data-testid={`button-delete-franchise-slot-${slot.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { setSelectedCalDate(null); setCalendarMonth((prev) => {
                const d = new Date(prev.year, prev.month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              }); }}
              className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-cal-prev-month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold" data-testid="text-cal-month-label">{calMonthLabel}</span>
            <button
              onClick={() => { setSelectedCalDate(null); setCalendarMonth((prev) => {
                const d = new Date(prev.year, prev.month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              }); }}
              className="p-1.5 rounded-md hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-cal-next-month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
            {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
              <div key={d} className="py-1.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {calendarDays.map((dateStr, i) => {
              if (!dateStr) {
                return <div key={`empty-${i}`} className="bg-gray-50 min-h-[72px]" />;
              }
              const daySlots = slotsByDate[dateStr] || [];
              const dayNum = parseInt(dateStr.split("-")[2]);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedCalDate;
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedCalDate(isSelected ? null : dateStr)}
                  className={`bg-white min-h-[72px] p-1 text-left transition-colors relative hover:bg-tiffany/5 ${isSelected ? "ring-2 ring-tiffany ring-inset" : ""}`}
                  data-testid={`cal-day-${dateStr}`}
                >
                  <span className={`text-xs inline-flex items-center justify-center w-5 h-5 rounded-full ${isToday ? "bg-tiffany text-white font-bold" : "text-gray-700"}`}>
                    {dayNum}
                  </span>
                  {daySlots.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {daySlots.map((s) => (
                        <div key={s.id} className="text-[10px] leading-tight bg-tiffany/10 text-tiffany rounded px-1 py-0.5 truncate text-center">
                          {s.startTime}-{s.endTime}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedCalDate && (
            <div className="mt-4" data-testid="cal-day-detail">
              <h3 className="text-sm font-semibold mb-2">
                {selectedCalDate} ({getDayLabel(selectedCalDate)}) — {selectedDaySlots.length} 個時段
              </h3>
              {selectedDaySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">當日無時段</p>
              ) : (
                <div className="space-y-2">
                  {selectedDaySlots.map((slot) => {
                    const coachName = coaches.find((c) => c.id === slot.coachId)?.name || "未指派";
                    const classroomName = classroomsList.find((c) => c.id === slot.classroomId)?.name;
                    return (
                      <div key={slot.id} className="bg-white rounded-md border border-gray-100 p-3 flex items-center gap-4" data-testid={`cal-slot-${slot.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-tiffany font-medium">{slot.startTime} - {slot.endTime}</span>
                            {classroomName && (
                              <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full flex items-center gap-1">
                                <DoorOpen className="w-3 h-3" />{classroomName}
                              </span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{coachName}</span>
                            <span className="text-xs text-muted-foreground">已預約 {slot.bookedSeats}/{slot.maxSeats}</span>
                            {slot.bookedSeats < slot.maxSeats && !isSlotExpired(slot) && (
                              <span className="text-xs text-tiffany">剩 {slot.maxSeats - slot.bookedSeats} 位</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {slot.bookedSeats < slot.maxSeats && !isSlotExpired(slot) && (
                            <Button variant="outline" size="icon" onClick={() => { setManualBookSlot(slot); setStudentSearch(""); }} data-testid={`button-manual-book-cal-${slot.id}`} title="加排學生">
                              <UserPlus className="w-4 h-4 text-tiffany" />
                            </Button>
                          )}
                          <Button variant="outline" size="icon" onClick={() => handleDeleteSlot(slot.id)} data-testid={`button-delete-cal-slot-${slot.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) setBatchMode(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增時段</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <button
              onClick={() => setBatchMode(false)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${!batchMode ? "bg-tiffany/10 text-tiffany font-medium" : "text-muted-foreground hover:bg-gray-50"}`}
              data-testid="tab-single-slot"
            >
              單一時段
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${batchMode ? "bg-tiffany/10 text-tiffany font-medium" : "text-muted-foreground hover:bg-gray-50"}`}
              data-testid="tab-batch-slot"
            >
              批次排課
            </button>
          </div>

          {!batchMode ? (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label>上課日期 *</Label>
                  <Input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} data-testid="input-franchise-slot-date" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>開始時間 *</Label>
                    <Input type="time" value={slotForm.startTime} onChange={(e) => {
                      const start = e.target.value;
                      setSlotForm({ ...slotForm, startTime: start, endTime: computeEndTime(start) });
                    }} data-testid="input-franchise-slot-start" />
                  </div>
                  <div>
                    <Label>結束時間</Label>
                    <Input type="time" value={slotForm.endTime} disabled className="bg-gray-50" data-testid="input-franchise-slot-end" />
                  </div>
                </div>
                <div>
                  <Label>上課教室 {classroomsList.length > 0 && "*"}</Label>
                  <Select value={slotForm.classroomId ? slotForm.classroomId.toString() : ""} onValueChange={(v) => setSlotForm({ ...slotForm, classroomId: parseInt(v) || 0 })}>
                    <SelectTrigger data-testid="select-franchise-slot-classroom"><SelectValue placeholder={classroomsList.length > 0 ? "選擇教室" : "尚未建立教室"} /></SelectTrigger>
                    <SelectContent>
                      {classroomsList.map((cr) => <SelectItem key={cr.id} value={cr.id.toString()}>{cr.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>指派老師 *</Label>
                  <Select value={slotForm.coachId ? slotForm.coachId.toString() : ""} onValueChange={(v) => setSlotForm({ ...slotForm, coachId: parseInt(v) || 0 })}>
                    <SelectTrigger data-testid="select-franchise-slot-coach"><SelectValue placeholder="選擇老師" /></SelectTrigger>
                    <SelectContent>
                      {coaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
                <Button
                  onClick={() => addSlotMutation.mutate(slotForm)}
                  disabled={!slotForm.date || !slotForm.startTime || !slotForm.coachId || (classroomsList.length > 0 && !slotForm.classroomId) || addSlotMutation.isPending}
                  data-testid="button-submit-franchise-slot"
                >
                  {addSlotMutation.isPending ? "新增中..." : "新增時段"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>起始日期 *</Label>
                    <Input type="date" value={batchForm.startDate} onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })} data-testid="input-batch-start-date" />
                  </div>
                  <div>
                    <Label>結束日期 *</Label>
                    <Input type="date" value={batchForm.endDate} onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })} data-testid="input-batch-end-date" />
                  </div>
                </div>
                <div>
                  <Label>星期 *</Label>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {[
                      { day: 1, label: "一" }, { day: 2, label: "二" }, { day: 3, label: "三" },
                      { day: 4, label: "四" }, { day: 5, label: "五" }, { day: 6, label: "六" }, { day: 0, label: "日" },
                    ].map(({ day, label }) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const wds = batchForm.weekdays.includes(day)
                            ? batchForm.weekdays.filter((d) => d !== day)
                            : [...batchForm.weekdays, day];
                          setBatchForm({ ...batchForm, weekdays: wds });
                        }}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                          batchForm.weekdays.includes(day) ? "bg-tiffany text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        data-testid={`batch-weekday-${day}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>時段 *</Label>
                  <div className="space-y-2 mt-1.5">
                    {batchForm.startTimes.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={t}
                          onChange={(e) => {
                            const updated = [...batchForm.startTimes];
                            updated[i] = e.target.value;
                            setBatchForm({ ...batchForm, startTimes: updated });
                          }}
                          className="flex-1"
                          data-testid={`input-batch-time-${i}`}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">~ {t ? computeEndTime(t) : "--:--"}</span>
                        {batchForm.startTimes.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => setBatchForm({ ...batchForm, startTimes: batchForm.startTimes.filter((_, j) => j !== i) })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBatchForm({ ...batchForm, startTimes: [...batchForm.startTimes, ""] })}
                      data-testid="button-add-batch-time"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />新增時段
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>上課教室 {classroomsList.length > 0 && "*"}</Label>
                  <Select value={batchForm.classroomId ? batchForm.classroomId.toString() : ""} onValueChange={(v) => setBatchForm({ ...batchForm, classroomId: parseInt(v) || 0 })}>
                    <SelectTrigger data-testid="select-batch-classroom"><SelectValue placeholder={classroomsList.length > 0 ? "選擇教室" : "尚未建立教室"} /></SelectTrigger>
                    <SelectContent>
                      {classroomsList.map((cr) => <SelectItem key={cr.id} value={cr.id.toString()}>{cr.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>指派老師 *</Label>
                  <Select value={batchForm.coachId ? batchForm.coachId.toString() : ""} onValueChange={(v) => setBatchForm({ ...batchForm, coachId: parseInt(v) || 0 })}>
                    <SelectTrigger data-testid="select-batch-coach"><SelectValue placeholder="選擇老師" /></SelectTrigger>
                    <SelectContent>
                      {coaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {batchForm.startDate && batchForm.endDate && batchForm.weekdays.length > 0 && batchForm.startTimes.filter(Boolean).length > 0 && (
                  <div className="bg-gray-50 rounded-md px-3 py-2 text-xs text-muted-foreground" data-testid="batch-preview">
                    {(() => {
                      let count = 0;
                      const cur = new Date(batchForm.startDate + "T00:00:00");
                      const end = new Date(batchForm.endDate + "T00:00:00");
                      while (cur <= end) {
                        if (batchForm.weekdays.includes(cur.getDay())) count++;
                        cur.setDate(cur.getDate() + 1);
                      }
                      const timesCount = batchForm.startTimes.filter(Boolean).length;
                      const total = count * timesCount;
                      return `將建立 ${count} 天 × ${timesCount} 個時段 = 共 ${total} 個時段`;
                    })()}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
                <Button
                  onClick={handleBatchSubmit}
                  disabled={!batchForm.startDate || !batchForm.endDate || batchForm.weekdays.length === 0 || batchForm.startTimes.filter(Boolean).length === 0 || !batchForm.coachId || (classroomsList.length > 0 && !batchForm.classroomId) || batchSubmitting}
                  data-testid="button-submit-batch-slot"
                >
                  {batchSubmitting ? "排課中..." : "批次建立"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SliderConfirmDialog
        state={sliderConfirm}
        onClose={() => setSliderConfirm({ open: false, bookingCount: 0, bookings: [], slotIds: [] })}
        onConfirm={handleForceDelete}
        isPending={forceDeleting}
      />

      <Dialog open={!!manualBookSlot} onOpenChange={(open) => { if (!open) { setManualBookSlot(null); setStudentSearch(""); } }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>手動加排學生</DialogTitle>
          </DialogHeader>
          {manualBookSlot && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{manualBookSlot.date} ({getDayLabel(manualBookSlot.date)})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-tiffany font-medium">{manualBookSlot.startTime} - {manualBookSlot.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>已預約 {manualBookSlot.bookedSeats}/{manualBookSlot.maxSeats}（剩 {manualBookSlot.maxSeats - manualBookSlot.bookedSeats} 位）</span>
                </div>
              </div>

              <div>
                <Label>搜尋學生</Label>
                <Input
                  placeholder="輸入學生姓名搜尋..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  data-testid="input-student-search"
                />
              </div>

              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">尚無學生資料</p>
                ) : (
                  (() => {
                    const bookedChildIds = getSlotBookedChildIds(manualBookSlot.id);
                    const filtered = availableStudents.filter((s) =>
                      !studentSearch || s.name.includes(studentSearch)
                    );
                    if (filtered.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-6">找不到符合的學生</p>;
                    }
                    return filtered.map((student) => {
                      const isBooked = bookedChildIds.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isBooked ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}
                          data-testid={`student-option-${student.id}`}
                        >
                          <div>
                            <span className="text-sm font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {student.grade}年級{student.school ? ` · ${student.school}` : ""}
                            </span>
                          </div>
                          {isBooked ? (
                            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full" data-testid={`badge-already-booked-${student.id}`}>已預約</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-tiffany border-tiffany/30 hover:bg-tiffany/5"
                              onClick={() => manualBookMutation.mutate({ slotId: manualBookSlot.id, childId: student.id })}
                              disabled={manualBookMutation.isPending}
                              data-testid={`button-book-student-${student.id}`}
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              {manualBookMutation.isPending ? "加排中..." : "加排"}
                            </Button>
                          )}
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingsTab() {
  const { data: bookings = [], isLoading } = useQuery<FranchiseBooking[]>({
    queryKey: ["/api/franchise-admin/bookings"],
  });
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return DAY_LABELS[d.getDay().toString()] || "";
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    confirmed: { label: "已確認", color: "bg-tiffany/10 text-tiffany" },
    checked_in: { label: "上課中", color: "bg-orange-50 text-orange-600" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
    completed: { label: "已完成", color: "bg-amber-warm text-amber-700" },
  };

  const filteredBookings = bookings.filter((b) => {
    if (searchName && !b.childName.includes(searchName)) return false;
    if (searchDate && b.date !== searchDate) return false;
    return true;
  });

  const hasFilter = searchName || searchDate;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">預約管理</h1>
        <p className="text-sm text-muted-foreground">查看家長的預約資訊</p>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="搜尋學生姓名"
            className="pl-9"
            data-testid="input-booking-search-name"
          />
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-[180px]"
            data-testid="input-booking-search-date"
          />
        </div>
        {hasFilter && (
          <Button variant="outline" size="sm" onClick={() => { setSearchName(""); setSearchDate(""); }} data-testid="button-clear-booking-filter">
            清除篩選
          </Button>
        )}
        {hasFilter && (
          <span className="text-xs text-muted-foreground" data-testid="text-booking-filter-count">
            共 {filteredBookings.length} 筆結果
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無預約資料</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md border border-gray-100">
          <p className="text-sm text-muted-foreground">無符合條件的預約</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBookings.map((booking) => {
            const status = statusMap[booking.status] || statusMap.confirmed;
            return (
              <div key={booking.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`franchise-booking-${booking.id}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-medium">{booking.childName}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{booking.childGrade}年級</span>
                      {booking.childSchool && <span className="text-xs text-muted-foreground">{booking.childSchool}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.date} ({getDayLabel(booking.date)}) {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("zh-TW") : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
