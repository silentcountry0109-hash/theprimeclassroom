import { useState, useRef, useEffect, useMemo } from "react";
import { TAIWAN_CITIES, getMergedDistricts, getMergedSchools } from "@shared/taiwan-schools";
import { useCustomSchools } from "@/hooks/use-custom-schools";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { apiRequest, getActiveFranchiseId } from "@/lib/queryClient";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
  Unlink,
  CalendarDays,
  AlertTriangle,
  List,
  Camera,
  ChevronLeft,
  DoorOpen,
  Check,
  X,
  ChevronDown,
  Search,
  BookOpen,
  ClipboardList,
  ChevronsUpDown,
  Bell,
  Pencil,
  MessageSquare,
  UserCheck,
  UserX,
  Coins,
  Wallet,
} from "lucide-react";
import type { Franchise, Coach, TimeSlot, Classroom } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { setActiveFranchiseId, queryClient } from "@/lib/queryClient";
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
  return (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) onClose(); }}>
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
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-force-delete">
            取消
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
            data-testid="button-confirm-force-delete"
          >
            {isPending ? "刪除中..." : "確認刪除並取消預約"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TimeSelect({ value, onChange, disabled, "data-testid": testId }: { value: string; onChange: (v: string) => void; disabled?: boolean; "data-testid"?: string }) {
  const parts = value ? value.split(":") : ["", ""];
  const hh = parts[0] ?? "";
  const mm = parts[1] ?? "";
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  return (
    <div className="flex items-center gap-1" data-testid={testId}>
      <Select value={hh} onValueChange={(h) => onChange(`${h}:${mm || "00"}`)} disabled={disabled}>
        <SelectTrigger className="w-[72px]" data-testid="select-hour">
          <SelectValue placeholder="時" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={mm} onValueChange={(m) => onChange(`${hh || "00"}:${m}`)} disabled={disabled}>
        <SelectTrigger className="w-[72px]" data-testid="select-minute">
          <SelectValue placeholder="分" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

class ConflictError extends Error {
  conflictType: "room_conflict" | "coach_conflict";
  constructor(message: string, conflictType: "room_conflict" | "coach_conflict") {
    super(message);
    this.conflictType = conflictType;
  }
}

export default function FranchiseAdminDashboard({ initialTab }: { initialTab?: string } = {}) {
  const { user, isLoading: authLoading, logout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [showFranchiseSwitcher, setShowFranchiseSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifList = [] } = useQuery<{ id: number; type: string; title: string; message: string; isRead: boolean; createdAt: string }[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user && user.role === "franchise_admin",
    refetchInterval: 30000,
  });
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user && user.role === "franchise_admin",
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("PATCH", `/api/notifications/${id}/read`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }); queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] }); },
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => { await apiRequest("PATCH", "/api/notifications/read-all"); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }); queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] }); },
  });

  const { data: managedFranchises } = useQuery<{ id: number; name: string; city: string; district: string }[]>({
    queryKey: ["/api/franchise-admin/managed-franchises"],
    enabled: !!user && user.role === "franchise_admin",
  });

  const { data: myFranchise } = useQuery<Franchise>({
    queryKey: ["/api/franchise-admin/my-franchise"],
    enabled: !!user && user.role === "franchise_admin",
  });

  const handleSwitchFranchise = (franchiseId: number) => {
    setActiveFranchiseId(franchiseId);
    setShowFranchiseSwitcher(false);
    queryClient.invalidateQueries();
  };

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

  const canSwitch = managedFranchises && managedFranchises.length > 1;

  const menuItems = [
    { id: "overview", label: "分校總覽", icon: BarChart3 },
    { id: "info", label: "分校資訊", icon: Building2 },
    { id: "coaches", label: "師資管理", icon: GraduationCap },
    { id: "timeslots", label: "時段管理", icon: Clock },
    { id: "bookings", label: "預約管理", icon: CalendarCheck },
    { id: "students", label: "學生管理", icon: Users },
    { id: "credits", label: "家長點數", icon: Coins },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-washi">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <p className="font-serif text-lg tracking-[0.1em] text-foreground">質數教室</p>
              {myFranchise ? (
                <div className="mt-1">
                  {canSwitch ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowFranchiseSwitcher(!showFranchiseSwitcher)}
                        className="flex items-center gap-1 text-xs text-tiffany font-medium hover:bg-tiffany/5 rounded-md px-1.5 py-1 -ml-1.5 transition-colors w-full"
                        data-testid="button-switch-franchise"
                      >
                        <span>{myFranchise.name.replace("質數教室 ", "")}</span>
                        <ChevronsUpDown className="w-3 h-3 ml-auto text-tiffany/60" />
                      </button>
                      {showFranchiseSwitcher && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1" data-testid="franchise-switcher-dropdown">
                          {managedFranchises.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => handleSwitchFranchise(f.id)}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-tiffany/5 transition-colors flex items-center gap-2 ${f.id === myFranchise.id ? "text-tiffany font-medium bg-tiffany/5" : "text-foreground"}`}
                              data-testid={`button-franchise-option-${f.id}`}
                            >
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span>{f.name.replace("質數教室 ", "")}</span>
                              {f.id === myFranchise.id && <Check className="w-3 h-3 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-tiffany font-medium" data-testid="sidebar-franchise-name">
                      {myFranchise.name.replace("質數教室 ", "")}
                    </p>
                  )}
                </div>
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
            <h2 className="text-sm font-medium text-foreground flex-1">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 relative"
                data-testid="franchise-button-notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1" data-testid="franchise-badge-unread">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto" data-testid="franchise-notifications-panel">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-foreground">通知</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-tiffany hover:underline" data-testid="franchise-button-mark-all-read">
                            全部標為已讀
                          </button>
                        )}
                        <button onClick={() => setShowNotifications(false)} className="text-xs text-muted-foreground hover:text-foreground">關閉</button>
                      </div>
                    </div>
                  {notifList.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">目前沒有通知</div>
                  ) : (
                    notifList.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.isRead && n.type === "new_booking" ? "bg-blue-50/40" : !n.isRead ? "bg-tiffany/5" : ""}`}
                        onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                        data-testid={`franchise-notification-${n.id}`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === "new_booking" ? (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-semibold text-foreground">{n.title}</p>
                              {n.type === "new_booking" && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 flex-shrink-0">新預約</span>
                              )}
                              {!n.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "info" && <FranchiseInfoTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "timeslots" && <TimeSlotsTab />}
            {activeTab === "bookings" && <BookingsTab />}
            {activeTab === "students" && <StudentsTab />}
            {activeTab === "credits" && <ParentCreditsTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery<FranchiseStats>({
    queryKey: ["/api/franchise-admin/stats"],
    refetchInterval: 30000,
  });

  const { data: todayStats, isLoading: todayLoading } = useQuery<TodayStats>({
    queryKey: ["/api/franchise-admin/stats/today"],
    refetchInterval: 30000,
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
    const now = new Date();
    let s = new Date(now);
    if (key === "this_week") {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      setStartDate(formatDate(monday));
      setEndDate(formatDate(friday));
      setPreset(key);
      return;
    }
    setPreset(key);
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
    { key: "this_week", label: "本週一到五" },
    { key: "week", label: "近 7 天" },
    { key: "2weeks", label: "近 14 天" },
    { key: "month", label: "近 1 個月" },
    { key: "3months", label: "近 3 個月" },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          {franchise ? franchise.name.replace("質數教室 ", "") : "分校總覽"}
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
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${b.status === "checked_in" || b.status === "completed" ? "bg-green-50 text-green-600" : b.status === "absent" ? "bg-red-50 text-red-600" : "bg-tiffany/10 text-tiffany"}`}>
                          {b.status === "checked_in" ? "上課中" : b.status === "completed" ? "已完成" : b.status === "absent" ? "未到" : "已確認"}
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

  type DayHours = { isOpen: boolean; openTime: string; closeTime: string };
  type SpecialDayEntry = { date: string; isOpen: boolean; openTime?: string; closeTime?: string; note?: string };
  type BusinessHours = Record<string, DayHours>;
  type BusinessHoursPayload = BusinessHours & { special?: SpecialDayEntry[] };

  const defaultBusinessHours: BusinessHours = {
    "0": { isOpen: false, openTime: "09:00", closeTime: "21:00" },
    "1": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    "2": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    "3": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    "4": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    "5": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
    "6": { isOpen: true, openTime: "09:00", closeTime: "21:00" },
  };
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [specialHours, setSpecialHours] = useState<SpecialDayEntry[]>([]);
  const [newSpecialDate, setNewSpecialDate] = useState("");
  const [newSpecialEndDate, setNewSpecialEndDate] = useState("");
  const [newSpecialIsOpen, setNewSpecialIsOpen] = useState(false);
  const [newSpecialOpenTime, setNewSpecialOpenTime] = useState("09:00");
  const [newSpecialCloseTime, setNewSpecialCloseTime] = useState("21:00");
  const [newSpecialNote, setNewSpecialNote] = useState("");
  const [highlightedSpecialDates, setHighlightedSpecialDates] = useState<Set<string>>(new Set());
  const specialSectionRef = useRef<HTMLDivElement>(null);
  const specialListRef = useRef<HTMLDivElement>(null);
  const dayOrder = ["1", "2", "3", "4", "5", "6", "0"];

  const startEdit = () => {
    if (franchise) {
      setDescription(franchise.description || "");
      setPhone(franchise.phone || "");
      setTags(franchise.tags || []);
      setNearbySchools(franchise.nearbySchools || []);
      const bh = (franchise.businessHours as BusinessHoursPayload) || {};
      const { special, ...weeklyHours } = bh;
      setBusinessHours({ ...defaultBusinessHours, ...weeklyHours });
      setSpecialHours(special ?? []);
    }
    setNewSpecialDate("");
    setNewSpecialEndDate("");
    setNewSpecialIsOpen(false);
    setNewSpecialOpenTime("09:00");
    setNewSpecialCloseTime("21:00");
    setNewSpecialNote("");
    setEditing(true);
  };

  const enumerateDates = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${day}`);
    }
    return dates;
  };

  const addSpecialDay = () => {
    if (!newSpecialDate) return;
    const endDate = newSpecialEndDate || newSpecialDate;
    if (endDate < newSpecialDate) {
      toast({ title: "結束日不可早於開始日", variant: "destructive" });
      return;
    }
    const allDates = enumerateDates(newSpecialDate, endDate);
    const note = newSpecialNote.trim();
    const added: SpecialDayEntry[] = [];
    const skipped: string[] = [];
    const existingDates = new Set(specialHours.map((s) => s.date));
    for (const date of allDates) {
      if (existingDates.has(date)) {
        skipped.push(date);
        continue;
      }
      existingDates.add(date);
      const entry: SpecialDayEntry = { date, isOpen: newSpecialIsOpen };
      if (newSpecialIsOpen) { entry.openTime = newSpecialOpenTime; entry.closeTime = newSpecialCloseTime; }
      if (note) entry.note = note;
      added.push(entry);
    }
    if (added.length === 0) {
      toast({ title: "這些日期都已設定過，請先刪除再重新加入", variant: "destructive" });
      return;
    }
    setSpecialHours([...specialHours, ...added].sort((a, b) => a.date.localeCompare(b.date)));
    const addedDates = new Set(added.map((a) => a.date));
    setHighlightedSpecialDates(addedDates);
    setTimeout(() => setHighlightedSpecialDates(new Set()), 2000);
    setTimeout(() => specialListRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    const description = added.length === 1
      ? `已加入 ${added[0].date}`
      : `已加入 ${added.length} 天（${added[0].date} ～ ${added[added.length - 1].date}）`;
    toast({
      title: "新增成功",
      description: skipped.length > 0 ? `${description}，已略過 ${skipped.length} 天重複日期` : description,
    });
    setNewSpecialDate("");
    setNewSpecialEndDate("");
    setNewSpecialIsOpen(false);
    setNewSpecialOpenTime("09:00");
    setNewSpecialCloseTime("21:00");
    setNewSpecialNote("");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...businessHours, special: specialHours };
      const res = await apiRequest("PATCH", "/api/franchise-admin/my-franchise", {
        description, phone, tags, nearbySchools, businessHours: payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "分校資訊已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/my-franchise"] });
      setEditing(false);
      setTimeout(() => specialSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
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
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />營業時間</p>
            <div className="space-y-1">
              {dayOrder.map((d) => {
                const bh = (franchise.businessHours as BusinessHours)?.[d] || defaultBusinessHours[d];
                return (
                  <div key={d} className="flex items-center gap-3 text-sm" data-testid={`display-business-hours-${d}`}>
                    <span className="w-8 font-medium text-foreground">{DAY_LABELS[d]}</span>
                    {bh.isOpen ? (
                      <span className="text-muted-foreground">{bh.openTime} - {bh.closeTime}</span>
                    ) : (
                      <span className="text-coral text-xs">休息</span>
                    )}
                  </div>
                );
              })}
            </div>
            {(() => {
              const special = (franchise.businessHours as BusinessHoursPayload)?.special;
              return (
                <div ref={specialSectionRef} className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />特殊節日</p>
                  {(!special || special.length === 0) ? (
                    <p className="text-xs text-muted-foreground italic">尚無特殊節日設定</p>
                  ) : (
                    <div className="space-y-1">
                      {special.map((s: SpecialDayEntry, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm" data-testid={`display-special-hours-${s.date}`}>
                          <span className="font-medium text-foreground w-24">{s.date}</span>
                          {s.isOpen ? (
                            <span className="text-muted-foreground">{s.openTime} - {s.closeTime}</span>
                          ) : (
                            <span className="text-coral text-xs">休息</span>
                          )}
                          {s.note && <span className="text-xs text-muted-foreground">（{s.note}）</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-gray-100 p-6 space-y-4">
          <div>
            <Label>電話</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="02-xxxx-xxxx" data-testid="input-franchise-info-phone" />
          </div>
          <div>
            <Label className="mb-1.5 block">分校介紹</Label>
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
          <div>
            <Label className="flex items-center gap-1 mb-2"><Clock className="w-3.5 h-3.5" />營業時間</Label>
            <div className="space-y-2">
              {dayOrder.map((d) => {
                const dh = businessHours[d];
                return (
                  <div key={d} className="flex items-center gap-3" data-testid={`edit-business-hours-${d}`}>
                    <span className="w-8 text-sm font-medium">{DAY_LABELS[d]}</span>
                    <Switch
                      checked={dh.isOpen}
                      onCheckedChange={(checked) => setBusinessHours({ ...businessHours, [d]: { ...dh, isOpen: checked } })}
                      data-testid={`switch-business-hours-${d}`}
                    />
                    {dh.isOpen ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="time"
                          value={dh.openTime}
                          onChange={(e) => setBusinessHours({ ...businessHours, [d]: { ...dh, openTime: e.target.value } })}
                          className="w-28 h-8 text-sm"
                          data-testid={`input-open-time-${d}`}
                        />
                        <span className="text-muted-foreground text-sm">~</span>
                        <Input
                          type="time"
                          value={dh.closeTime}
                          onChange={(e) => setBusinessHours({ ...businessHours, [d]: { ...dh, closeTime: e.target.value } })}
                          className="w-28 h-8 text-sm"
                          data-testid={`input-close-time-${d}`}
                        />
                      </div>
                    ) : (
                      <span className="text-coral text-xs">休息</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <Label className="flex items-center gap-1 mb-3"><CalendarDays className="w-3.5 h-3.5" />特殊節日設定</Label>
            <div ref={specialListRef} className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">
                已排定 <span className="font-semibold text-foreground">{specialHours.length}</span> 筆特殊節日
              </p>
              {specialHours.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">尚無特殊節日，請由下方表單新增</p>
              ) : (
                <div className="space-y-2">
                  {specialHours.map((s, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-1000 ${highlightedSpecialDates.has(s.date) ? "bg-tiffany/20" : "bg-gray-50"}`}
                      data-testid={`special-hours-entry-${s.date}`}
                    >
                      <span className="font-medium w-24 shrink-0">{s.date}</span>
                      {s.isOpen ? (
                        <span className="text-muted-foreground">{s.openTime} - {s.closeTime}</span>
                      ) : (
                        <span className="text-coral text-xs">休息</span>
                      )}
                      {s.note && <span className="text-xs text-muted-foreground flex-1">（{s.note}）</span>}
                      <button
                        type="button"
                        onClick={() => setSpecialHours(specialHours.filter((_, idx) => idx !== i))}
                        className="ml-auto text-gray-400 hover:text-red-500"
                        data-testid={`button-remove-special-${s.date}`}
                      >&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-50/70 rounded-md p-3 space-y-2">
              <p className="text-xs text-muted-foreground mb-1">新增特殊日期</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    value={newSpecialDate}
                    onChange={(e) => setNewSpecialDate(e.target.value)}
                    className="w-36 h-8 text-sm"
                    data-testid="input-special-date"
                  />
                  <span className="text-muted-foreground text-sm">～</span>
                  <Input
                    type="date"
                    value={newSpecialEndDate}
                    min={newSpecialDate || undefined}
                    onChange={(e) => setNewSpecialEndDate(e.target.value)}
                    className="w-36 h-8 text-sm"
                    placeholder="結束日（可留空）"
                    data-testid="input-special-end-date"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={newSpecialIsOpen}
                    onCheckedChange={setNewSpecialIsOpen}
                    data-testid="switch-special-isopen"
                  />
                  <span className="text-xs text-muted-foreground">{newSpecialIsOpen ? "自訂時間" : "休息"}</span>
                </div>
                {newSpecialIsOpen && (
                  <>
                    <Input type="time" value={newSpecialOpenTime} onChange={(e) => setNewSpecialOpenTime(e.target.value)} className="w-28 h-8 text-sm" data-testid="input-special-open-time" />
                    <span className="text-muted-foreground text-sm">~</span>
                    <Input type="time" value={newSpecialCloseTime} onChange={(e) => setNewSpecialCloseTime(e.target.value)} className="w-28 h-8 text-sm" data-testid="input-special-close-time" />
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newSpecialNote}
                  onChange={(e) => setNewSpecialNote(e.target.value)}
                  placeholder="備註（如：元旦、春節）"
                  className="h-8 text-sm flex-1"
                  data-testid="input-special-note"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialDay(); } }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={!newSpecialDate ? 0 : -1} className="inline-flex">
                      <Button type="button" size="sm" variant="outline" onClick={addSpecialDay} disabled={!newSpecialDate} data-testid="button-add-special-day">
                        新增
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!newSpecialDate && (
                    <TooltipContent side="top">請先填寫開始日期</TooltipContent>
                  )}
                </Tooltip>
              </div>
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

  type PhoneCheckResult = {
    sameFranchise: { coachId: number; coachName: string; franchiseName: string; hasAccount: boolean; accountUsername: string | null }[];
    crossFranchise: { coachId: number; coachName: string; franchiseName: string; hasAccount: boolean; accountUsername: string | null }[];
  };
  const [phoneCheck, setPhoneCheck] = useState<PhoneCheckResult | null>(null);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [uploadingCoachId, setUploadingCoachId] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadCoachId, setPendingUploadCoachId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  type EnrichedCoach = Coach & { accountUsername: string | null; lineUserId: string | null };
  const { data: coaches = [], isLoading } = useQuery<EnrichedCoach[]>({ queryKey: ["/api/franchise-admin/coaches"] });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ coachId, file }: { coachId: number; file: File }) => {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`/api/franchise-admin/coaches/${coachId}/upload-photo`, {
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
    onSuccess: (data: { url: string; aiGenerated?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
      if (data?.aiGenerated) {
        toast({ title: "AI 定裝照已生成", description: "已自動生成符合前台尺寸的專業師資照片" });
      } else {
        toast({ title: "照片已更新" });
      }
      setUploadingCoachId(null);
      setPendingUploadCoachId(null);
    },
    onError: (error: Error) => {
      toast({ title: "上傳失敗", description: error.message, variant: "destructive" });
      setUploadingCoachId(null);
      setPendingUploadCoachId(null);
    },
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", bio: "", specialties: [], isCertified: true, rating: 0, reviewCount: 0 });
    setSpecialtyInput("");
    setEditingCoach(null);
    setPhoneCheck(null);
  };

  const resetAccountForm = () => {
    setAccountDialogCoach(null);
    setAccountPassword("");
  };

  const checkPhoneNumber = async (phone: string, excludeCoachId?: number) => {
    const trimmed = phone.trim();
    if (trimmed.length < 6) { setPhoneCheck(null); return; }
    setPhoneCheckLoading(true);
    try {
      const params = new URLSearchParams({ phone: trimmed });
      if (excludeCoachId) params.set("excludeCoachId", String(excludeCoachId));
      const res = await fetch(`/api/franchise-admin/coaches/check-phone?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPhoneCheck(data);
      } else {
        setPhoneCheck(null);
      }
    } catch {
      setPhoneCheck(null);
    }
    setPhoneCheckLoading(false);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (c: Coach) => {
    setEditingCoach(c);
    setFormData({
      name: c.name, phone: c.phone || "", bio: c.bio || "", specialties: c.specialties || [],
      isCertified: c.isCertified, rating: c.rating || 0, reviewCount: c.reviewCount || 0,
    });
    setPhoneCheck(null);
    setShowDialog(true);
  };

  const openCreateAccount = async (c: Coach) => {
    if (!c.phone || c.phone.length < 6) {
      toast({ title: "無法建立帳號", description: "請先填寫老師手機號碼（至少 6 位）", variant: "destructive" });
      return;
    }
    const phoneLast6 = c.phone.slice(-6);

    let confirmMsg = `將以「${c.name}@prime」建立帳號\n預設密碼為手機末六碼（${phoneLast6}）\n老師首次登入須修改密碼\n\n確定建立？`;
    try {
      const params = new URLSearchParams({ phone: c.phone, excludeCoachId: String(c.id) });
      const res = await fetch(`/api/franchise-admin/coaches/check-phone?${params}`, { credentials: "include" });
      if (res.ok) {
        const data: PhoneCheckResult = await res.json();
        const allMatches = [...data.sameFranchise, ...data.crossFranchise];
        const withAccount = allMatches.find(m => m.hasAccount && m.accountUsername);
        if (withAccount) {
          confirmMsg = `此老師手機號碼已有關聯帳號（${withAccount.accountUsername}）\n所在分校：${withAccount.franchiseName}\n\n點確定後將直接串聯至該帳號，不會另外建立新帳號。`;
        } else if (allMatches.length > 0) {
          const names = allMatches.map(m => `${m.franchiseName} / ${m.coachName}`).join("、");
          confirmMsg = `此手機號碼已由其他老師使用（${names}）\n請確認是否為同一位老師跨分校任教。\n\n確定建立帳號？`;
        }
      }
    } catch { /* ignore, use default confirm */ }

    if (!confirm(confirmMsg)) return;
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
      if (data.linked) {
        toast({ title: "已串聯至既有帳號", description: `此老師已自動串聯至帳號：${data.accountUsername}，登入後即可查看所有分校課表` });
      } else {
        toast({ title: "帳號建立成功", description: `帳號：${data.accountUsername}，密碼為手機末六碼` });
      }
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

  const unlinkAccountMutation = useMutation({
    mutationFn: async (coachId: number) => {
      const res = await apiRequest("DELETE", `/api/franchise-admin/coaches/${coachId}/account`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "解除連結失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "帳號連結已解除", description: "老師已與原帳號解除連結，可重新依手機號碼建立或串聯帳號" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
    },
    onError: (error: Error) => {
      toast({ title: "解除連結失敗", description: error.message, variant: "destructive" });
    },
  });

  const unlinkLineMutation = useMutation({
    mutationFn: async (coachId: number) => {
      const res = await apiRequest("DELETE", `/api/franchise-admin/coaches/${coachId}/line`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "解除 LINE 綁定失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "LINE 綁定已解除", description: "老師需重新在 LINE 官方帳號傳送手機號碼完成綁定" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
    },
    onError: (error: Error) => {
      toast({ title: "解除失敗", description: error.message, variant: "destructive" });
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

      {!isLoading && coaches.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-muted-foreground">狀態篩選：</span>
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              data-testid={`filter-status-${f}`}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${statusFilter === f ? "bg-tiffany text-white border-tiffany" : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany"}`}
            >
              {f === "all" ? "全部" : f === "active" ? "啟用" : "停用"}
              {f !== "all" && (
                <span className="ml-1 opacity-70">
                  ({coaches.filter(c => f === "active" ? c.isActive !== false : c.isActive === false).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : coaches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無老師資料</p>
        </div>
      ) : (
        <>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          data-testid="input-coach-photo-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !pendingUploadCoachId) return;
            if (file.size > 5 * 1024 * 1024) {
              toast({ title: "檔案過大", description: "請選擇 5MB 以下的圖片", variant: "destructive" });
              e.target.value = "";
              setPendingUploadCoachId(null);
              return;
            }
            setUploadingCoachId(pendingUploadCoachId);
            uploadPhotoMutation.mutate({ coachId: pendingUploadCoachId, file });
            e.target.value = "";
          }}
        />
        {(() => {
          const filteredCoaches = statusFilter === "all" ? coaches : coaches.filter(c => statusFilter === "active" ? c.isActive !== false : c.isActive === false);
          return (
            <>
              {filteredCoaches.length === 0 && (
                <div className="text-center py-10 bg-white rounded-md border border-gray-100 mb-3" data-testid="coaches-filter-empty">
                  <p className="text-sm text-muted-foreground">
                    {statusFilter === "active" ? "目前沒有啟用的老師" : "目前沒有停用的老師"}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {filteredCoaches.map((coach) => (
            <div key={coach.id} className={`bg-white rounded-md border p-4 flex items-center gap-4 ${coach.isActive === false ? "border-gray-200 opacity-60" : "border-gray-100"}`} data-testid={`franchise-coach-${coach.id}`}>
              <div className="relative shrink-0 group">
                {coach.photoUrl ? (
                  <img
                    src={coach.photoUrl}
                    alt={coach.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    data-testid={`img-coach-photo-${coach.id}`}
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${coach.isActive === false ? "bg-gray-100" : "bg-tiffany/10"}`}>
                    <span className={`text-lg font-serif ${coach.isActive === false ? "text-gray-400" : "text-tiffany"}`}>{coach.name[0]}</span>
                  </div>
                )}
                <button
                  className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={coach.photoUrl ? "更換照片" : "上傳照片"}
                  data-testid={`button-upload-photo-${coach.id}`}
                  disabled={uploadingCoachId === coach.id}
                  onClick={() => {
                    setPendingUploadCoachId(coach.id);
                    photoInputRef.current?.click();
                  }}
                >
                  {uploadingCoachId === coach.id ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{coach.name}</p>
                  {uploadingCoachId === coach.id && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`ai-generating-badge-${coach.id}`}>
                      <span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
                      AI 生成定裝照中…
                    </span>
                  )}
                  {coach.isCertified && <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">已認證</span>}
                  {coach.isActive === false && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full" data-testid={`coach-inactive-badge-${coach.id}`}>已停用</span>
                  )}
                  {coach.userId ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`coach-account-status-${coach.id}`}>
                      <ShieldCheck className="w-3 h-3" />{coach.accountUsername || "帳號已建立"}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" data-testid={`coach-account-status-${coach.id}`}>
                      未建立帳號
                    </span>
                  )}
                  {coach.lineUserId ? (
                    <span className="text-xs bg-[#06C755]/10 text-[#06C755] px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`coach-line-status-${coach.id}`}>
                      <MessageSquare className="w-3 h-3" />LINE 已綁定
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`coach-line-status-${coach.id}`}>
                      <MessageSquare className="w-3 h-3" />LINE 未綁定
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
                  <>
                    <Button variant="outline" size="sm" onClick={() => openResetPassword(coach)} data-testid={`button-reset-password-coach-${coach.id}`}>
                      <KeyRound className="w-4 h-4 mr-1" />重設密碼
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:border-red-300"
                      title="解除帳號連結"
                      data-testid={`button-unlink-account-coach-${coach.id}`}
                      onClick={() => {
                        const username = coach.accountUsername || "此帳號";
                        if (!confirm(`確定要解除「${coach.name}」與帳號「${username}」的連結嗎？\n\n解除後老師將無法登入，可重新依手機號碼建立或串聯帳號。`)) return;
                        unlinkAccountMutation.mutate(coach.id);
                      }}
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                    {coach.lineUserId && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-[#06C755] hover:text-[#05a847] hover:border-green-300"
                        title="解除 LINE 綁定"
                        data-testid={`button-unlink-line-coach-${coach.id}`}
                        onClick={() => {
                          if (!confirm(`確定要解除「${coach.name}」的 LINE 綁定嗎？\n\n解除後老師將不再收到 LINE 推播通知，需重新綁定。`)) return;
                          unlinkLineMutation.mutate(coach.id);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    )}
                  </>
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
              </div>
            </div>
                ))}
              </div>
            </>
          );
        })()}
        </>
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
              <Label>手機號碼 *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setPhoneCheck(null);
                }}
                onBlur={(e) => checkPhoneNumber(e.target.value, editingCoach?.id)}
                placeholder="例：0912345678"
                data-testid="input-franchise-coach-phone"
              />
              {phoneCheckLoading && (
                <p className="text-xs text-gray-400 mt-1">確認手機號碼中…</p>
              )}
              {!phoneCheckLoading && phoneCheck && phoneCheck.sameFranchise.length > 0 && (
                <div className="mt-2 p-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-700" data-testid="phone-check-same-franchise">
                  <span className="font-semibold">⚠️ 此分校已有其他老師使用此手機號碼：</span>
                  {phoneCheck.sameFranchise.map(m => (
                    <div key={m.coachId} className="mt-0.5">
                      {m.coachName}{m.hasAccount ? `（帳號：${m.accountUsername}）` : "（尚未建立帳號）"}
                    </div>
                  ))}
                  <div className="mt-1 text-red-600">請確認是否為重複登錄。</div>
                </div>
              )}
              {!phoneCheckLoading && phoneCheck && phoneCheck.crossFranchise.length > 0 && (
                <div className="mt-2 p-2 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-700" data-testid="phone-check-cross-franchise">
                  <span className="font-semibold">ℹ️ 此手機號碼已由其他分校老師使用：</span>
                  {phoneCheck.crossFranchise.map(m => (
                    <div key={m.coachId} className="mt-0.5">
                      {m.franchiseName} / {m.coachName}{m.hasAccount ? `（帳號：${m.accountUsername}）` : "（尚未建立帳號）"}
                    </div>
                  ))}
                  <div className="mt-1 text-blue-600">若為同一位老師跨分校任教，建立帳號時將自動串聯至同一個登入帳號。</div>
                </div>
              )}
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
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.name || !formData.phone?.trim() || saveMutation.isPending} data-testid="button-submit-franchise-coach">
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
  const [batchResult, setBatchResult] = useState<{ created: number; skipped: number; conflicts: string[] } | null>(null);

  const { data: slots = [], isLoading } = useQuery<TimeSlot[]>({ queryKey: ["/api/franchise-admin/time-slots"] });
  const { data: coaches = [] } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });
  const { data: classroomsList = [] } = useQuery<Classroom[]>({ queryKey: ["/api/franchise-admin/classrooms"] });
  const { data: franchise } = useQuery<Franchise>({ queryKey: ["/api/franchise-admin/my-franchise"] });

  type DayHoursConfig = { isOpen: boolean; openTime?: string; closeTime?: string };
  type SpecialDayConfig = { date: string; isOpen: boolean; openTime?: string; closeTime?: string; note?: string };
  type SlotHoursPayload = Record<string, DayHoursConfig> & { special?: SpecialDayConfig[] };
  type DayHoursResult = { openTime: string; closeTime: string; isSpecial?: true; note?: string };

  const slotBusinessHours = franchise?.businessHours as SlotHoursPayload | undefined;
  const specialHoursList = slotBusinessHours?.special;

  const isDayClosed = (dateStr: string) => {
    if (!dateStr) return false;
    const special = specialHoursList?.find((s) => s.date === dateStr);
    if (special) return !special.isOpen;
    if (!slotBusinessHours) return false;
    const dow = new Date(dateStr + "T00:00:00").getDay().toString();
    return slotBusinessHours[dow] && !slotBusinessHours[dow].isOpen;
  };

  const getDayBusinessHours = (dateStr: string): DayHoursResult | null => {
    if (!dateStr) return null;
    const special = specialHoursList?.find((s) => s.date === dateStr);
    if (special) {
      if (!special.isOpen) return null;
      return { openTime: special.openTime || "00:00", closeTime: special.closeTime || "23:59", isSpecial: true, note: special.note };
    }
    if (!slotBusinessHours) return null;
    const dow = new Date(dateStr + "T00:00:00").getDay().toString();
    const dh = slotBusinessHours[dow];
    if (!dh || !dh.isOpen) return null;
    return { openTime: dh.openTime || "00:00", closeTime: dh.closeTime || "23:59" };
  };

  const computeEndTime = (start: string) => {
    const [h, m] = start.split(":").map(Number);
    const totalMin = h * 60 + m + 90;
    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
  };

  const isTimeWithinBusinessHours = (dateStr: string, startTime: string, endTime: string): boolean => {
    const hours = getDayBusinessHours(dateStr);
    if (!hours) return false;
    return startTime >= hours.openTime && endTime <= hours.closeTime;
  };

  const handleBatchSubmit = async () => {
    const { startDate, endDate, weekdays, startTimes, coachId, classroomId } = batchForm;
    if (!startDate || !endDate || weekdays.length === 0 || startTimes.length === 0) return;
    setBatchSubmitting(true);
    setBatchResult(null);
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
    let skipped = 0;
    const conflicts: string[] = [];
    for (const date of dates) {
      if (isDayClosed(date)) {
        skipped += startTimes.filter(Boolean).length;
        continue;
      }
      for (const startTime of startTimes) {
        if (!startTime) continue;
        const endTime = computeEndTime(startTime);
        if (slotBusinessHours && !isTimeWithinBusinessHours(date, startTime, endTime)) {
          skipped++;
          continue;
        }
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
    if (conflicts.length === 0 && created > 0) {
      setShowAdd(false);
    } else {
      setBatchResult({ created, skipped, conflicts });
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
      if (res.status === 409) {
        const data = await res.json();
        const conflictType = data.type === "room_conflict" || data.type === "coach_conflict" ? data.type : "room_conflict";
        throw new ConflictError(data.message || "排課衝突", conflictType);
      }
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
      setAddConflictError(null);
      setSlotForm({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });
    },
    onError: (error: Error) => {
      if (error instanceof ConflictError) {
        setAddConflictError({ type: error.conflictType, message: error.message });
      } else {
        toast({ title: "新增失敗", description: error.message, variant: "destructive" });
      }
    },
  });

  const [sliderConfirm, setSliderConfirm] = useState<SliderConfirmState>({ open: false, bookingCount: 0, bookings: [], slotIds: [] });
  const [forceDeleting, setForceDeleting] = useState(false);

  const handleDeleteSlot = async (id: number) => {
    try {
      const res = await fetch(`/api/franchise-admin/time-slots/${id}`, { method: "DELETE", credentials: "include" });
      if (res.status === 403) {
        const data = await res.json();
        toast({ title: data.message || "此時段有學生正在上課，無法刪除", variant: "destructive" });
        return;
      }
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
  const [studentsSlot, setStudentsSlot] = useState<TimeSlot | null>(null);

  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editCoachId, setEditCoachId] = useState<string>("");
  const [editClassroomId, setEditClassroomId] = useState<string>("");
  const [editConflictError, setEditConflictError] = useState<{ type: "room_conflict" | "coach_conflict"; message: string } | null>(null);
  const [addConflictError, setAddConflictError] = useState<{ type: "room_conflict" | "coach_conflict"; message: string } | null>(null);

  const editSlotMutation = useMutation({
    mutationFn: async ({ id, coachId, classroomId }: { id: number; coachId: number; classroomId: number | null }) => {
      const franchiseId = getActiveFranchiseId();
      const res = await fetch(`/api/franchise-admin/time-slots/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(franchiseId ? { "X-Franchise-Id": String(franchiseId) } : {}),
        },
        body: JSON.stringify({ coachId, classroomId }),
        credentials: "include",
      });
      if (res.status === 409) {
        const data = await res.json();
        const conflictType = data.type === "room_conflict" || data.type === "coach_conflict" ? data.type : "room_conflict";
        throw new ConflictError(data.message || "排課衝突", conflictType);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "更新時段失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "時段已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      setEditingSlot(null);
      setEditConflictError(null);
    },
    onError: (error: Error) => {
      if (error instanceof ConflictError) {
        setEditConflictError({ type: error.conflictType, message: error.message });
      } else {
        toast({ title: "更新失敗", description: error.message, variant: "destructive" });
      }
    },
  });

  const { data: slotStudents = [], isLoading: studentsLoading } = useQuery<{
    id: number; childId: number; childName: string; childGrade: string; status: string; childSchool?: string | null;
  }[]>({
    queryKey: ["/api/franchise-admin/time-slots", studentsSlot?.id, "students"],
    enabled: !!studentsSlot,
  });

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

    const inClassIds: number[] = [];
    for (const id of selectedSlotIds) {
      try {
        const res = await fetch(`/api/franchise-admin/time-slots/${id}`, { method: "DELETE", credentials: "include" });
        if (res.status === 403) {
          inClassIds.push(id);
        } else if (res.status === 409) {
          const data = await res.json();
          conflictSlotIds.push(id);
          conflictBookings.push(...data.bookings);
        }
      } catch {}
    }
    if (inClassIds.length > 0) {
      toast({ title: `${inClassIds.length} 個時段有學生正在上課，無法刪除`, variant: "destructive" });
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

  const [mbOpen, setMbOpen] = useState(false);
  const [mbStep, setMbStep] = useState<1 | 2 | 3>(1);
  const [mbSlot, setMbSlot] = useState<TimeSlot | null>(null);
  const [mbSearch, setMbSearch] = useState("");
  const [mbMode, setMbMode] = useState<"search" | "walkin">("search");
  const [mbSelected, setMbSelected] = useState<any | null>(null);
  const [mbWalkInName, setMbWalkInName] = useState("");
  const [mbWalkInGrade, setMbWalkInGrade] = useState("1");
  const [mbWalkInSchoolCity, setMbWalkInSchoolCity] = useState("");
  const [mbWalkInSchoolDistrict, setMbWalkInSchoolDistrict] = useState("");
  const [mbWalkInSchoolName, setMbWalkInSchoolName] = useState("");
  const mbWalkInSchool = useMemo(() => {
    if (mbWalkInSchoolCity && mbWalkInSchoolDistrict && mbWalkInSchoolName) {
      return `${mbWalkInSchoolCity}${mbWalkInSchoolDistrict}${mbWalkInSchoolName}`;
    }
    return "";
  }, [mbWalkInSchoolCity, mbWalkInSchoolDistrict, mbWalkInSchoolName]);
  const customSchools = useCustomSchools();
  const mbWalkInSchoolDistricts = useMemo(() => mbWalkInSchoolCity ? getMergedDistricts(mbWalkInSchoolCity, customSchools) : [], [mbWalkInSchoolCity, customSchools]);
  const mbWalkInSchoolNames = useMemo(() => (mbWalkInSchoolCity && mbWalkInSchoolDistrict) ? getMergedSchools(mbWalkInSchoolCity, mbWalkInSchoolDistrict, customSchools) : [], [mbWalkInSchoolCity, mbWalkInSchoolDistrict, customSchools]);
  const [mbOverride, setMbOverride] = useState(false);

  const closeMb = () => {
    setMbOpen(false); setMbStep(1); setMbSlot(null); setMbSearch("");
    setMbMode("search"); setMbSelected(null); setMbWalkInName(""); setMbWalkInGrade("1"); setMbWalkInSchoolCity(""); setMbWalkInSchoolDistrict(""); setMbWalkInSchoolName(""); setMbOverride(false);
  };
  const openMbFromSlot = (slot: TimeSlot) => {
    setMbSlot(slot); setMbStep(2); setMbSearch(""); setMbMode("search");
    setMbSelected(null); setMbWalkInName(""); setMbWalkInGrade("1"); setMbWalkInSchoolCity(""); setMbWalkInSchoolDistrict(""); setMbWalkInSchoolName(""); setMbOverride(false); setMbOpen(true);
  };
  const openMbGlobal = () => {
    setMbSlot(null); setMbStep(1); setMbSearch(""); setMbMode("search");
    setMbSelected(null); setMbWalkInName(""); setMbWalkInGrade("1"); setMbWalkInSchoolCity(""); setMbWalkInSchoolDistrict(""); setMbWalkInSchoolName(""); setMbOverride(false); setMbOpen(true);
  };

  const { data: availableStudents = [] } = useQuery<{ id: number; name: string; grade: number; school: string | null; parentId: string | null }[]>({
    queryKey: ["/api/franchise-admin/available-students"],
    enabled: mbOpen && mbStep === 2,
  });

  const { data: slotBookings = [] } = useQuery<{ id: number; slotId: number; childId: number; childName: string; status: string }[]>({
    queryKey: ["/api/franchise-admin/bookings"],
  });

  const manualBookMutation = useMutation({
    mutationFn: async (params: { slotId: number; childId?: number; walkInName?: string; walkInGrade?: number; walkInSchool?: string; overrideCapacity?: boolean }) => {
      const res = await apiRequest("POST", "/api/franchise-admin/manual-booking", params);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "加排成功", description: `已成功加排 ${data.childName || "學生"}` });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/available-students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      closeMb();
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

  const getSlotStatus = (slot: TimeSlot): "upcoming" | "in_progress" | "completed" => {
    const now = new Date();
    const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (now < slotStart) return "upcoming";
    if (now <= slotEnd) return "in_progress";
    return "completed";
  };

  const getSlotBookedChildIds = (slotId: number) => {
    return slotBookings
      .filter((b: any) => b.slotId === slotId && (b.status === "confirmed" || b.status === "checked_in" || b.status === "absent"))
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
              <Button variant="outline" size="sm" onClick={openMbGlobal} className="rounded-full border-tiffany/40 text-tiffany hover:bg-tiffany/5" data-testid="button-walk-in-booking">
                <UserPlus className="w-4 h-4 mr-1.5" />臨時加課
              </Button>
              <Button onClick={() => { setShowAdd(true); setBatchResult(null); }} className="rounded-full" data-testid="button-add-franchise-slot">
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
                    {(() => {
                      const st = getSlotStatus(slot);
                      if (st === "upcoming") return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">尚未開始</span>;
                      if (st === "in_progress") return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">進行中</span>;
                      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">已上完課</span>;
                    })()}
                  </div>
                </div>
                {!batchDeleteMode && (
                  <div className="flex items-center gap-1">
                    {slot.bookedSeats > 0 && (
                      <Button variant="outline" size="icon" onClick={() => setStudentsSlot(slot)} data-testid={`button-view-students-${slot.id}`} title="查看已預約學生">
                        <Users className="w-4 h-4 text-tiffany" />
                      </Button>
                    )}
                    {!isSlotExpired(slot) && (
                      <Button variant="outline" size="icon" onClick={() => openMbFromSlot(slot)} data-testid={`button-manual-book-${slot.id}`} title="臨時加課">
                        <UserPlus className="w-4 h-4 text-tiffany" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      title="編輯教室與老師"
                      data-testid={`button-edit-slot-${slot.id}`}
                      onClick={() => {
                        setEditingSlot(slot);
                        setEditCoachId(slot.coachId ? String(slot.coachId) : "");
                        setEditClassroomId(slot.classroomId ? String(slot.classroomId) : "");
                      }}
                    >
                      <Edit className="w-4 h-4 text-tiffany" />
                    </Button>
                    {(() => {
                      const status = getSlotStatus(slot);
                      const cantDelete = status === "in_progress" || status === "completed";
                      const tipMsg = status === "in_progress" ? "課程進行中，無法刪除" : status === "completed" ? "課程已結束，無法刪除" : undefined;
                      return (
                        <span title={tipMsg}>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteSlot(slot.id)} disabled={cantDelete} data-testid={`button-delete-franchise-slot-${slot.id}`} className={cantDelete ? "opacity-40 cursor-not-allowed" : ""}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </span>
                      );
                    })()}
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
                            {(() => {
                              const st = getSlotStatus(slot);
                              if (st === "upcoming") return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">尚未開始</span>;
                              if (st === "in_progress") return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">進行中</span>;
                              return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">已上完課</span>;
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {slot.bookedSeats > 0 && (
                            <Button variant="outline" size="icon" onClick={() => setStudentsSlot(slot)} data-testid={`button-view-students-cal-${slot.id}`} title="查看已預約學生">
                              <Users className="w-4 h-4 text-tiffany" />
                            </Button>
                          )}
                          {!isSlotExpired(slot) && (
                            <Button variant="outline" size="icon" onClick={() => openMbFromSlot(slot)} data-testid={`button-manual-book-cal-${slot.id}`} title="臨時加課">
                              <UserPlus className="w-4 h-4 text-tiffany" />
                            </Button>
                          )}
                          {(() => {
                            const status = getSlotStatus(slot);
                            const cantDelete = status === "in_progress" || status === "completed";
                            const tipMsg = status === "in_progress" ? "課程進行中，無法刪除" : status === "completed" ? "課程已結束，無法刪除" : undefined;
                            return (
                              <span title={tipMsg}>
                                <Button variant="outline" size="icon" onClick={() => handleDeleteSlot(slot.id)} disabled={cantDelete} data-testid={`button-delete-cal-slot-${slot.id}`} className={cantDelete ? "opacity-40 cursor-not-allowed" : ""}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </span>
                            );
                          })()}
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

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) { setBatchMode(false); setAddConflictError(null); } }}>
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
                  {slotForm.date && isDayClosed(slotForm.date) && (() => {
                    const sp = specialHoursList?.find((s) => s.date === slotForm.date);
                    return (
                      <p className="text-xs text-coral mt-1" data-testid="text-day-closed-warning">
                        {sp ? `特殊節日休息${sp.note ? `（${sp.note}）` : ""}，無法排課` : `${DAY_LABELS[new Date(slotForm.date + "T00:00:00").getDay().toString()]}未營業，無法排課`}
                      </p>
                    );
                  })()}
                  {slotForm.date && !isDayClosed(slotForm.date) && getDayBusinessHours(slotForm.date) && (() => {
                    const dh = getDayBusinessHours(slotForm.date)!;
                    return (
                      <p className="text-xs text-muted-foreground mt-1">
                        {dh.isSpecial ? `特殊節日${dh.note ? `（${dh.note}）` : ""}：` : "營業時間："}{dh.openTime} - {dh.closeTime}
                      </p>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>開始時間 *</Label>
                    <TimeSelect
                      value={slotForm.startTime}
                      onChange={(start) => setSlotForm({ ...slotForm, startTime: start, endTime: computeEndTime(start) })}
                    />
                  </div>
                  <div>
                    <Label>結束時間</Label>
                    <div className="flex items-center h-10 px-3 text-sm text-muted-foreground bg-gray-50 border rounded-md" data-testid="text-franchise-slot-end">
                      {slotForm.startTime ? computeEndTime(slotForm.startTime) : "--:--"}
                    </div>
                  </div>
                </div>
                {slotForm.date && slotForm.startTime && !isDayClosed(slotForm.date) && (() => {
                  const dh = getDayBusinessHours(slotForm.date);
                  if (!dh) return null;
                  const end = computeEndTime(slotForm.startTime);
                  if (slotForm.startTime < dh.openTime || end > dh.closeTime) {
                    return <p className="text-xs text-coral" data-testid="text-time-out-of-range">排課時間超出營業時間（{dh.openTime} - {dh.closeTime}）</p>;
                  }
                  return null;
                })()}
                <div>
                  <Label>上課教室 {classroomsList.length > 0 && "*"}</Label>
                  <Select value={slotForm.classroomId ? slotForm.classroomId.toString() : ""} onValueChange={(v) => { setSlotForm({ ...slotForm, classroomId: parseInt(v) || 0 }); setAddConflictError(null); }}>
                    <SelectTrigger data-testid="select-franchise-slot-classroom"><SelectValue placeholder={classroomsList.length > 0 ? "選擇教室" : "尚未建立教室"} /></SelectTrigger>
                    <SelectContent>
                      {classroomsList.map((cr) => <SelectItem key={cr.id} value={cr.id.toString()}>{cr.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>指派老師 *</Label>
                  <Select value={slotForm.coachId ? slotForm.coachId.toString() : ""} onValueChange={(v) => { setSlotForm({ ...slotForm, coachId: parseInt(v) || 0 }); setAddConflictError(null); }}>
                    <SelectTrigger data-testid="select-franchise-slot-coach"><SelectValue placeholder="選擇老師" /></SelectTrigger>
                    <SelectContent>
                      {coaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {addConflictError && (
                  <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" data-testid="alert-add-slot-conflict">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{addConflictError.message}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAdd(false); setAddConflictError(null); }}>取消</Button>
                <Button
                  onClick={() => addSlotMutation.mutate(slotForm)}
                  disabled={!slotForm.date || !slotForm.startTime || !slotForm.coachId || (classroomsList.length > 0 && !slotForm.classroomId) || addSlotMutation.isPending || isDayClosed(slotForm.date) || (() => {
                    const dh = getDayBusinessHours(slotForm.date);
                    if (!dh || !slotForm.startTime) return false;
                    return slotForm.startTime < dh.openTime || computeEndTime(slotForm.startTime) > dh.closeTime;
                  })()}
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
                    ].map(({ day, label }) => {
                      const closed = slotBusinessHours?.[day.toString()] && !slotBusinessHours[day.toString()].isOpen;
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={!!closed}
                          title={closed ? "未營業" : undefined}
                          onClick={() => {
                            const wds = batchForm.weekdays.includes(day)
                              ? batchForm.weekdays.filter((d) => d !== day)
                              : [...batchForm.weekdays, day];
                            setBatchForm({ ...batchForm, weekdays: wds });
                          }}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                            closed ? "bg-gray-50 text-gray-300 line-through cursor-not-allowed" :
                            batchForm.weekdays.includes(day) ? "bg-tiffany text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          data-testid={`batch-weekday-${day}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>時段 *</Label>
                  <div className="space-y-2 mt-1.5">
                    {batchForm.startTimes.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <TimeSelect
                          value={t}
                          onChange={(val) => {
                            const updated = [...batchForm.startTimes];
                            updated[i] = val;
                            setBatchForm({ ...batchForm, startTimes: updated });
                          }}
                          data-testid={`input-batch-time-${i}`}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap w-16 text-center">~ {t ? computeEndTime(t) : "--:--"}</span>
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
              {batchResult && (
                <div className={`mx-1 mb-2 rounded-md border p-3 text-sm ${batchResult.conflicts.length > 0 ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"}`} data-testid="batch-result-summary">
                  <div className="font-medium mb-1">
                    {[
                      batchResult.created > 0 && `成功 ${batchResult.created} 堂`,
                      batchResult.skipped > 0 && `略過 ${batchResult.skipped} 堂（非營業）`,
                      batchResult.conflicts.length > 0 && `失敗 ${batchResult.conflicts.length} 堂（衝堂/其他）`,
                    ].filter(Boolean).join("，")}
                  </div>
                  {batchResult.conflicts.length > 0 && (
                    <ul className="mt-1 space-y-0.5 max-h-32 overflow-y-auto" data-testid="batch-conflict-list">
                      {batchResult.conflicts.map((msg, i) => (
                        <li key={i} className="text-xs opacity-90">{msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
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

      {/* ─── 臨時加課 3-step Dialog ─────────────────────────────────────── */}
      <Dialog open={mbOpen} onOpenChange={(open) => { if (!open) closeMb(); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-tiffany" />
              臨時加課
              <span className="ml-auto text-xs font-normal text-muted-foreground">步驟 {mbStep} / 3</span>
            </DialogTitle>
          </DialogHeader>

          {/* Step 1 — Select a slot */}
          {mbStep === 1 && (() => {
            const today = new Date();
            const limit = new Date(); limit.setDate(today.getDate() + 14);
            const upcoming = [...slots]
              .filter(s => s.isActive && !isSlotExpired(s) && new Date(s.date + "T00:00:00") <= limit)
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
            return (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">選擇要加排學生的課堂（未來 14 天）</p>
                {upcoming.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">目前無可用時段，請先在時段管理建立時段</div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {upcoming.map(slot => {
                      const cn = coaches.find(c => c.id === slot.coachId)?.name || "未指派";
                      const isFull = slot.bookedSeats >= slot.maxSeats;
                      return (
                        <button
                          key={slot.id}
                          className="w-full text-left p-3 rounded-md border border-gray-100 bg-white hover:border-tiffany/40 hover:bg-tiffany/5 transition-colors"
                          onClick={() => { setMbSlot(slot); setMbStep(2); }}
                          data-testid={`mb-slot-option-${slot.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-sm font-medium">{slot.date}</span>
                              <span className="text-xs text-muted-foreground ml-1">({getDayLabel(slot.date)})</span>
                              <span className="text-sm text-tiffany font-medium ml-2">{slot.startTime}–{slot.endTime}</span>
                            </div>
                            {isFull ? (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">已額滿</span>
                            ) : (
                              <span className="text-xs text-tiffany shrink-0">剩 {slot.maxSeats - slot.bookedSeats} 位</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{cn}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Step 2 — Select student or walk-in */}
          {mbStep === 2 && mbSlot && (
            <div className="space-y-4">
              {/* Slot summary */}
              <div className="bg-tiffany/5 border border-tiffany/20 rounded-md p-3 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-tiffany" />
                  <span className="font-medium">{mbSlot.date} ({getDayLabel(mbSlot.date)}) {mbSlot.startTime}–{mbSlot.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>已預約 {mbSlot.bookedSeats}/{mbSlot.maxSeats}</span>
                  {mbSlot.bookedSeats >= mbSlot.maxSeats && (
                    <span className="text-amber-600 font-medium">（已額滿）</span>
                  )}
                </div>
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-md overflow-hidden border border-gray-200">
                <button
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${mbMode === "search" ? "bg-tiffany text-white" : "bg-white text-muted-foreground hover:bg-gray-50"}`}
                  onClick={() => setMbMode("search")}
                  data-testid="mb-mode-search"
                >搜尋本分校學生</button>
                <button
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${mbMode === "walkin" ? "bg-tiffany text-white" : "bg-white text-muted-foreground hover:bg-gray-50"}`}
                  onClick={() => setMbMode("walkin")}
                  data-testid="mb-mode-walkin"
                >臨時加入</button>
              </div>

              {mbMode === "search" ? (
                <>
                  <Input
                    placeholder="輸入學生姓名搜尋..."
                    value={mbSearch}
                    onChange={(e) => setMbSearch(e.target.value)}
                    data-testid="input-mb-search"
                    autoFocus
                  />
                  <div className="border rounded-md max-h-[250px] overflow-y-auto">
                    {(() => {
                      const bookedIds = getSlotBookedChildIds(mbSlot.id);
                      const filtered = availableStudents.filter(s => !mbSearch || s.name.includes(mbSearch));
                      if (availableStudents.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">尚無學生資料</p>;
                      if (filtered.length === 0) return (
                        <div className="text-center py-6 space-y-2">
                          <p className="text-sm text-muted-foreground">找不到「{mbSearch}」</p>
                          <button className="text-xs text-tiffany underline" onClick={() => setMbMode("walkin")} data-testid="mb-switch-to-walkin">改用臨時加入</button>
                        </div>
                      );
                      return filtered.map(student => {
                        const isBooked = bookedIds.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-3 border-b last:border-b-0 ${isBooked ? "opacity-50" : "hover:bg-gray-50 cursor-pointer"}`}
                            onClick={() => { if (!isBooked) { setMbSelected({ ...student, type: "existing" }); setMbStep(3); } }}
                            data-testid={`mb-student-option-${student.id}`}
                          >
                            <div>
                              <span className="text-sm font-medium">{student.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{student.grade}年級{student.school ? ` · ${student.school}` : ""}</span>
                              {!student.parentId && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">臨時</span>}
                            </div>
                            {isBooked
                              ? <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">已預約</span>
                              : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">填寫臨時學生資料，系統將自動建立記錄</p>
                  <div>
                    <Label className="text-xs">姓名 <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="學生姓名"
                      value={mbWalkInName}
                      onChange={(e) => setMbWalkInName(e.target.value)}
                      data-testid="input-mb-walkin-name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label className="text-xs">年級 <span className="text-red-500">*</span></Label>
                    <Select value={mbWalkInGrade} onValueChange={setMbWalkInGrade}>
                      <SelectTrigger data-testid="select-mb-walkin-grade">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(g => <SelectItem key={g} value={g.toString()}>{g}年級</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">就讀學校（選填）</Label>
                    <div className="flex gap-1.5 mt-1">
                      <Select value={mbWalkInSchoolCity} onValueChange={(v) => { setMbWalkInSchoolCity(v); setMbWalkInSchoolDistrict(""); setMbWalkInSchoolName(""); }} data-testid="select-mb-walkin-school-city">
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="縣市" />
                        </SelectTrigger>
                        <SelectContent>
                          {TAIWAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={mbWalkInSchoolDistrict} onValueChange={(v) => { setMbWalkInSchoolDistrict(v); setMbWalkInSchoolName(""); }} disabled={!mbWalkInSchoolCity} data-testid="select-mb-walkin-school-district">
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="行政區" />
                        </SelectTrigger>
                        <SelectContent>
                          {mbWalkInSchoolDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={mbWalkInSchoolName} onValueChange={setMbWalkInSchoolName} disabled={!mbWalkInSchoolDistrict} data-testid="select-mb-walkin-school-name">
                        <SelectTrigger className="flex-1 h-8 text-xs">
                          <SelectValue placeholder="學校" />
                        </SelectTrigger>
                        <SelectContent>
                          {mbWalkInSchoolNames.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!mbWalkInName.trim()}
                    onClick={() => { setMbSelected({ name: mbWalkInName.trim(), grade: parseInt(mbWalkInGrade), school: mbWalkInSchool.trim() || null, type: "walkin" }); setMbStep(3); }}
                    data-testid="button-mb-walkin-next"
                  >
                    <ChevronRight className="w-4 h-4 mr-1" />繼續
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setMbStep(1)} data-testid="button-mb-back-1">
                <ChevronLeft className="w-4 h-4 mr-1" />返回選擇課堂
              </Button>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {mbStep === 3 && mbSlot && mbSelected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">請確認以下加排資訊</p>

              <div className="bg-gray-50 rounded-md p-4 space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">課堂</p>
                  <div className="text-sm font-medium">{mbSlot.date} ({getDayLabel(mbSlot.date)})</div>
                  <div className="text-sm text-tiffany">{mbSlot.startTime}–{mbSlot.endTime}</div>
                  <div className="text-xs text-muted-foreground">
                    已預約 {mbSlot.bookedSeats}/{mbSlot.maxSeats}
                    {mbSlot.bookedSeats >= mbSlot.maxSeats && <span className="text-amber-600 font-medium ml-1">（已額滿）</span>}
                  </div>
                </div>
                <hr />
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">學生</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{mbSelected.name}</span>
                    <span className="text-xs text-muted-foreground">{mbSelected.grade}年級{mbSelected.school ? ` · ${mbSelected.school}` : ""}</span>
                    {mbSelected.type === "walkin" && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">臨時學生</span>
                    )}
                  </div>
                </div>
              </div>

              {mbSlot.bookedSeats >= mbSlot.maxSeats && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />此時段已額滿
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={mbOverride}
                      onChange={(e) => setMbOverride(e.target.checked)}
                      className="w-4 h-4 accent-amber-600"
                      data-testid="checkbox-mb-override"
                    />
                    <span>主任特批，允許超額加入</span>
                  </label>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMbStep(2)} data-testid="button-mb-back-2">
                  <ChevronLeft className="w-4 h-4 mr-1" />返回
                </Button>
                <Button
                  className="flex-1 bg-tiffany hover:bg-tiffany/90 text-white"
                  disabled={manualBookMutation.isPending || (mbSlot.bookedSeats >= mbSlot.maxSeats && !mbOverride)}
                  onClick={() => {
                    const params: any = {
                      slotId: mbSlot.id,
                      overrideCapacity: mbOverride,
                    };
                    if (mbSelected.type === "existing") {
                      params.childId = mbSelected.id;
                    } else {
                      params.walkInName = mbSelected.name;
                      params.walkInGrade = mbSelected.grade;
                      if (mbSelected.school) params.walkInSchool = mbSelected.school;
                    }
                    manualBookMutation.mutate(params);
                  }}
                  data-testid="button-mb-confirm"
                >
                  {manualBookMutation.isPending ? "加排中..." : "確認加排"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Students Dialog */}
      <Dialog open={!!studentsSlot} onOpenChange={(open) => { if (!open) setStudentsSlot(null); }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="dialog-slot-students">
          <DialogHeader>
            <DialogTitle data-testid="text-students-dialog-title">
              {studentsSlot ? `${studentsSlot.date} ${studentsSlot.startTime}-${studentsSlot.endTime} 已預約學生` : "已預約學生"}
            </DialogTitle>
          </DialogHeader>
          {studentsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">載入中...</div>
          ) : slotStudents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">尚無預約學生</div>
          ) : (
            <div className="divide-y">
              {slotStudents.map((s) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  confirmed: { label: "已確認", color: "bg-tiffany/10 text-tiffany" },
                  checked_in: { label: "已簽到", color: "bg-orange-50 text-orange-600" },
                  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
                  completed: { label: "已完成", color: "bg-amber-100 text-amber-700" },
                };
                const st = statusMap[s.status] || { label: s.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={s.id} className="flex items-center justify-between py-3" data-testid={`row-student-${s.id}`}>
                    <div>
                      <span className="text-sm font-medium" data-testid={`text-student-name-${s.id}`}>{s.childName}</span>
                      <span className="text-xs text-muted-foreground ml-2" data-testid={`text-student-grade-${s.id}`}>{s.childGrade}年級</span>
                      {s.childSchool && <span className="text-xs text-muted-foreground ml-1">· {s.childSchool}</span>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`} data-testid={`status-student-${s.id}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSlot} onOpenChange={(open) => { if (!open) { setEditingSlot(null); setEditConflictError(null); } }}>
        <DialogContent className="max-w-sm" data-testid="dialog-edit-slot">
          <DialogHeader>
            <DialogTitle>編輯時段</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{editingSlot.date}</span>
                <span className="mx-1">·</span>
                <span>{editingSlot.startTime} - {editingSlot.endTime}</span>
              </div>
              {editConflictError && (
                <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" data-testid="alert-edit-slot-conflict">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{editConflictError.message}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>負責老師 *</Label>
                <Select value={editCoachId} onValueChange={(v) => { setEditCoachId(v); setEditConflictError(null); }}>
                  <SelectTrigger data-testid="select-edit-slot-coach">
                    <SelectValue placeholder="選擇老師" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>上課教室</Label>
                <Select value={editClassroomId} onValueChange={(v) => { setEditClassroomId(v); setEditConflictError(null); }}>
                  <SelectTrigger data-testid="select-edit-slot-classroom">
                    <SelectValue placeholder="無教室" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">無教室</SelectItem>
                    {classroomsList.map((cr) => (
                      <SelectItem key={cr.id} value={String(cr.id)}>{cr.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditingSlot(null); setEditConflictError(null); }} data-testid="button-cancel-edit-slot">取消</Button>
            <Button
              disabled={!editCoachId || editSlotMutation.isPending}
              onClick={() => {
                if (!editingSlot || !editCoachId) return;
                const classroomIdNum = editClassroomId && editClassroomId !== "0" ? parseInt(editClassroomId) : null;
                editSlotMutation.mutate({ id: editingSlot.id, coachId: parseInt(editCoachId), classroomId: classroomIdNum });
              }}
              data-testid="button-confirm-edit-slot"
            >
              {editSlotMutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingsTab() {
  const { data: bookings = [], isLoading } = useQuery<FranchiseBooking[]>({
    queryKey: ["/api/franchise-admin/bookings"],
    refetchInterval: 30000,
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

  // 依「同一位學生 + 同一個時段」分組，把連排預約折疊成一張卡片
  const groupedBookings = (() => {
    const groups = new Map<string, FranchiseBooking[]>();
    for (const b of filteredBookings) {
      const key = `${b.childId}|${b.startTime}|${b.endTime}`;
      const arr = groups.get(key);
      if (arr) arr.push(b);
      else groups.set(key, [b]);
    }
    const list = Array.from(groups.entries()).map(([key, items]) => {
      const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
      return { key, items: sorted, earliestDate: sorted[0].date };
    });
    list.sort((a, b) => a.earliestDate.localeCompare(b.earliestDate));
    return list;
  })();

  const studentCount = new Set(filteredBookings.map((b) => b.childId)).size;

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
            共 {studentCount} 位學生 / {filteredBookings.length} 堂預約
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
          {groupedBookings.map(({ key, items }) => {
            const first = items[0];
            const count = items.length;
            const dayLabels = items.map((b) => getDayLabel(b.date));
            const allSameDay = dayLabels.every((d) => d === dayLabels[0]);
            const subtitle = count > 1 && allSameDay
              ? `每週${dayLabels[0]} ${first.startTime} - ${first.endTime}`
              : `${first.startTime} - ${first.endTime}`;
            return (
              <div
                key={key}
                className="bg-white rounded-md border border-gray-100 p-4"
                data-testid={`franchise-booking-group-${first.childId}-${first.startTime}-${first.endTime}`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className="text-sm font-medium">{first.childName}</p>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{first.childGrade}年級</span>
                  {first.childSchool && <span className="text-xs text-muted-foreground">{first.childSchool}</span>}
                  {count > 1 && (
                    <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">共 {count} 堂</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{subtitle}</span>
                </div>
                <div className={count > 1 ? "border-t border-gray-100 pt-2 space-y-1" : ""}>
                  {items.map((b) => {
                    const status = statusMap[b.status] || statusMap.confirmed;
                    const mmdd = b.date.length >= 10 ? b.date.slice(5) : b.date;
                    return (
                      <div
                        key={b.id}
                        className="flex items-center gap-2 text-xs"
                        data-testid={`franchise-booking-row-${b.id}`}
                      >
                        <span className="text-muted-foreground tabular-nums">
                          {mmdd}（週{getDayLabel(b.date)}）
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentsTab() {
  const [gradeFilter, setGradeFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("1");
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState("1");
  const [editSchool, setEditSchool] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/franchise-admin/students"],
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: { name: string; grade: number }) => {
      const res = await apiRequest("POST", "/api/franchise-admin/students", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/available-students"] });
      toast({ title: "學生已新增" });
      setShowAddDialog(false);
      setNewStudentName("");
      setNewStudentGrade("1");
    },
    onError: (err: any) => {
      toast({ title: "新增失敗", description: err.message, variant: "destructive" });
    },
  });

  const editStudentMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; grade: number; school: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/franchise-admin/students/${data.id}`, {
        name: data.name,
        grade: data.grade,
        school: data.school,
        notes: data.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/students"] });
      toast({ title: "學生資料已更新" });
      setEditingStudent(null);
    },
    onError: (err: any) => {
      toast({ title: "更新失敗", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (student: any) => {
    setEditingStudent(student);
    setEditName(student.name || "");
    setEditGrade(String(student.grade || "1"));
    setEditSchool(student.school || "");
    setEditNotes(student.notes || "");
  };

  const schools = [...new Set(students.map((s: any) => s.school).filter(Boolean))].sort();

  const filtered = students.filter((s: any) => {
    if (gradeFilter && gradeFilter !== "all" && s.grade !== parseInt(gradeFilter)) return false;
    if (schoolFilter && schoolFilter !== "all" && s.school !== schoolFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name?.toLowerCase().includes(q) ||
        s.studentCode?.toLowerCase().includes(q) ||
        s.parentName?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">學生管理</h1>
          <p className="text-sm text-muted-foreground">查看分校所有學生資料、預約紀錄和聯絡簿</p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)} data-testid="button-add-student">
          <UserPlus className="w-4 h-4 mr-1" />新增學生
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>新增學生</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>姓名</Label>
              <Input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="學生姓名"
                data-testid="input-new-student-name"
              />
            </div>
            <div>
              <Label>年級</Label>
              <Select value={newStudentGrade} onValueChange={setNewStudentGrade}>
                <SelectTrigger data-testid="select-new-student-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={g.toString()}>{g}年級</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
            <Button
              onClick={() => addStudentMutation.mutate({ name: newStudentName, grade: parseInt(newStudentGrade) })}
              disabled={!newStudentName.trim() || addStudentMutation.isPending}
              data-testid="button-submit-new-student"
            >
              {addStudentMutation.isPending ? "新增中..." : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingStudent} onOpenChange={(open) => { if (!open) setEditingStudent(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>編輯學生資料</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>姓名</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="學生姓名"
                data-testid="input-edit-student-name"
              />
            </div>
            <div>
              <Label>年級</Label>
              <Select value={editGrade} onValueChange={setEditGrade}>
                <SelectTrigger data-testid="select-edit-student-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={g.toString()}>{g}年級</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>就讀學校</Label>
              <Input
                value={editSchool}
                onChange={(e) => setEditSchool(e.target.value)}
                placeholder="例：台南市北區文元國小"
                data-testid="input-edit-student-school"
              />
            </div>
            <div>
              <Label>備註</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="其他備註（選填）"
                data-testid="input-edit-student-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStudent(null)}>取消</Button>
            <Button
              onClick={() => editStudentMutation.mutate({
                id: editingStudent.id,
                name: editName,
                grade: parseInt(editGrade),
                school: editSchool,
                notes: editNotes,
              })}
              disabled={!editName.trim() || editStudentMutation.isPending}
              data-testid="button-submit-edit-student"
            >
              {editStudentMutation.isPending ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="搜尋學生姓名、編碼、家長姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-student-search"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-32" data-testid="select-student-grade">
            <SelectValue placeholder="年級" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部年級</SelectItem>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <SelectItem key={g} value={g.toString()}>{g}年級</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger className="w-40" data-testid="select-student-school">
            <SelectValue placeholder="學校" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部學校</SelectItem>
            {schools.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground mb-3" data-testid="text-student-count">
        共 {filtered.length} 位學生
      </p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無學生資料</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((student: any) => (
            <div key={student.id} className="bg-white rounded-md border border-gray-100 overflow-hidden" data-testid={`card-student-${student.id}`}>
              <button
                className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                data-testid={`button-expand-student-${student.id}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-tiffany/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-tiffany">{student.name?.[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium" data-testid={`text-student-name-${student.id}`}>{student.name}</span>
                        <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">{student.grade}年級</span>
                        {!student.parentId && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full" data-testid={`badge-walkin-student-${student.id}`}>臨時</span>}
                        {student.school && <span className="text-xs text-muted-foreground">{student.school}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {student.studentCode && <span>編碼：{student.studentCode}</span>}
                        <span>家長：{student.parentName}</span>
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-3 h-3" />{student.parentPhone || "未填寫"}
                        </span>
                        {student.parentLineUserId && (
                          student.parentLineOaFollowed ? (
                            <span className="inline-flex items-center gap-0.5 text-[#06C755]" data-testid={`parent-line-followed-student-${student.id}`}>
                              <UserCheck className="w-3 h-3" />LINE 已加好友
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-amber-500" data-testid={`parent-line-not-followed-student-${student.id}`}>
                              <UserX className="w-3 h-3" />LINE 尚未加好友
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{student.bookingCount} 次預約</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="p-1.5 rounded hover:bg-tiffany/10 text-muted-foreground hover:text-tiffany transition-colors"
                      onClick={(e) => { e.stopPropagation(); openEdit(student); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); openEdit(student); } }}
                      data-testid={`button-edit-student-${student.id}`}
                      aria-label="編輯學生資料"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === student.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {expandedId === student.id && (
                <StudentDetailPanel childId={student.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDetailPanel({ childId }: { childId: number }) {
  const [activeDetailTab, setActiveDetailTab] = useState<"bookings" | "contactbooks" | "learning">("bookings");

  const { data: studentBookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/franchise-admin/students", childId, "bookings"],
    queryFn: async () => {
      const res = await fetch(`/api/franchise-admin/students/${childId}/bookings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: contactBooksList = [], isLoading: contactBooksLoading } = useQuery<any[]>({
    queryKey: ["/api/franchise-admin/students", childId, "contact-books"],
    queryFn: async () => {
      const res = await fetch(`/api/franchise-admin/students/${childId}/contact-books`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/franchise-admin/students"],
  });

  const student = students.find((s: any) => s.id === childId);
  const studentGrade = student?.grade || 0;

  const { data: textbooksData = [] } = useQuery<any[]>({
    queryKey: ["/api/textbooks"],
    enabled: activeDetailTab === "learning",
  });

  const gradeTextbooks = textbooksData.filter((t: any) => t.grade === studentGrade);
  const textbookMap = new Map(textbooksData.map((t: any) => [t.unitCode, t]));
  const textbookByName = new Map(textbooksData.map((t: any) => [`${t.unitCode} ${t.unitName}`, t]));

  const matchTextbook = (lessonUnit: string) => {
    if (textbookMap.has(lessonUnit)) return textbookMap.get(lessonUnit);
    if (textbookByName.has(lessonUnit)) return textbookByName.get(lessonUnit);
    const entries = Array.from(textbookMap.values());
    for (let i = 0; i < entries.length; i++) {
      const t = entries[i];
      if (lessonUnit.includes(t.unitCode) || lessonUnit.includes(t.unitName)) return t;
    }
    return null;
  };

  const completedUnits = new Set<string>();
  contactBooksList.forEach((cb: any) => {
    const matched = matchTextbook(cb.lessonUnit);
    if (matched && matched.grade === studentGrade) {
      completedUnits.add(matched.unitCode);
    }
  });

  const totalGradeUnits = gradeTextbooks.length;
  const completedCount = completedUnits.size;
  const progressPct = totalGradeUnits > 0 ? Math.round((completedCount / totalGradeUnits) * 100) : 0;

  const quizRecords = contactBooksList
    .filter((cb: any) => cb.quizScore != null)
    .sort((a: any, b: any) => b.lessonDate.localeCompare(a.lessonDate));

  const statusMap: Record<string, { label: string; color: string }> = {
    confirmed: { label: "已確認", color: "bg-tiffany/10 text-tiffany" },
    checked_in: { label: "上課中", color: "bg-amber-100 text-amber-700" },
    completed: { label: "已完成", color: "bg-green-50 text-green-600" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
  };

  const gradeLabels = ["一", "二", "三", "四", "五", "六"];

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-4 pb-4" data-testid={`panel-student-detail-${childId}`}>
      <div className="flex gap-2 py-3 border-b border-gray-100">
        <button
          onClick={() => setActiveDetailTab("bookings")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
            activeDetailTab === "bookings" ? "bg-tiffany/10 text-tiffany font-medium" : "text-muted-foreground hover:bg-gray-100"
          }`}
          data-testid={`tab-student-bookings-${childId}`}
        >
          <ClipboardList className="w-3.5 h-3.5" />預約紀錄
        </button>
        <button
          onClick={() => setActiveDetailTab("contactbooks")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
            activeDetailTab === "contactbooks" ? "bg-tiffany/10 text-tiffany font-medium" : "text-muted-foreground hover:bg-gray-100"
          }`}
          data-testid={`tab-student-contactbooks-${childId}`}
        >
          <BookOpen className="w-3.5 h-3.5" />聯絡簿
        </button>
        <button
          onClick={() => setActiveDetailTab("learning")}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
            activeDetailTab === "learning" ? "bg-tiffany/10 text-tiffany font-medium" : "text-muted-foreground hover:bg-gray-100"
          }`}
          data-testid={`tab-student-learning-${childId}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />學習歷程
        </button>
      </div>

      {activeDetailTab === "bookings" && (
        <div className="pt-3">
          {bookingsLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
          ) : studentBookings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">暫無預約紀錄</p>
          ) : (
            <div className="space-y-1.5">
              {studentBookings.map((b: any) => {
                const s = statusMap[b.status] || { label: b.status, color: "bg-gray-100 text-gray-500" };
                return (
                  <div key={b.id} className="flex items-center justify-between bg-white rounded px-3 py-2 text-xs" data-testid={`booking-row-${b.id}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{b.date}</span>
                      <span className="text-muted-foreground">{b.startTime}-{b.endTime}</span>
                      {b.coachName && <span className="text-muted-foreground">{b.coachName} 老師</span>}
                      {b.classroomName && <span className="text-muted-foreground flex items-center gap-0.5"><DoorOpen className="w-3 h-3" />{b.classroomName}</span>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeDetailTab === "contactbooks" && (
        <div className="pt-3">
          {contactBooksLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
          ) : contactBooksList.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">暫無聯絡簿紀錄</p>
          ) : (
            <div className="space-y-2">
              {contactBooksList.map((cb: any) => (
                <div key={cb.id} className="bg-white rounded px-3 py-2.5 text-xs" data-testid={`contactbook-row-${cb.id}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{cb.lessonDate}</span>
                      {cb.coachName && <span className="text-muted-foreground">{cb.coachName} 老師</span>}
                    </div>
                    {cb.quizScore != null && (
                      <span className="text-tiffany font-medium">小考 {cb.quizScore}/{cb.quizTotal || 100}</span>
                    )}
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <p><span className="text-foreground font-medium">單元：</span>{cb.lessonUnit}</p>
                    {cb.performance && <p><span className="text-foreground font-medium">表現：</span>{cb.performance}</p>}
                    {cb.teacherRemarks && <p><span className="text-foreground font-medium">老師評語：</span>{cb.teacherRemarks}</p>}
                    {cb.homework && <p><span className="text-foreground font-medium">回家作業：</span>{cb.homework}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeDetailTab === "learning" && (
        <div className="pt-3 space-y-4" data-testid={`panel-learning-history-${childId}`}>
          {contactBooksLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
          ) : (
            <>
              {studentGrade > 0 && totalGradeUnits > 0 && (
                <div className="bg-white rounded-md p-4 border border-gray-100" data-testid={`progress-card-${childId}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      {gradeLabels[studentGrade - 1] || studentGrade}年級教材進度
                    </span>
                    <span className="text-xs text-tiffany font-semibold" data-testid={`text-progress-ratio-${childId}`}>
                      {completedCount} / {totalGradeUnits} 單元
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%`, backgroundColor: "#81D8D0" }}
                      data-testid={`progress-bar-${childId}`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5" data-testid={`text-progress-pct-${childId}`}>
                    完成 {progressPct}%
                  </p>
                </div>
              )}

              {quizRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-tiffany" />
                    考卷成績
                  </h4>
                  <div className="space-y-1.5">
                    {quizRecords.map((cb: any) => {
                      const matched = matchTextbook(cb.lessonUnit);
                      const scorePct = cb.quizTotal ? Math.round((cb.quizScore / cb.quizTotal) * 100) : 0;
                      return (
                        <div key={cb.id} className="flex items-center justify-between bg-white rounded px-3 py-2 text-xs" data-testid={`quiz-record-${cb.id}`}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-medium text-foreground shrink-0">{cb.lessonDate}</span>
                            {matched && (
                              <span className="text-[10px] bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full shrink-0">
                                {gradeLabels[matched.grade - 1] || matched.grade}年級
                              </span>
                            )}
                            <span className="text-muted-foreground truncate">{cb.lessonUnit}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${scorePct}%`,
                                  backgroundColor: scorePct >= 80 ? "#81D8D0" : scorePct >= 60 ? "#f59e0b" : "#ef4444",
                                }}
                              />
                            </div>
                            <span className={`font-semibold ${scorePct >= 80 ? "text-tiffany" : scorePct >= 60 ? "text-amber-500" : "text-red-500"}`}>
                              {cb.quizScore}/{cb.quizTotal || 100}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-tiffany" />
                  學習紀錄
                </h4>
                {contactBooksList.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">暫無學習紀錄</p>
                ) : (
                  <div className="space-y-1.5">
                    {[...contactBooksList].sort((a: any, b: any) => b.lessonDate.localeCompare(a.lessonDate)).map((cb: any) => {
                      const matched = matchTextbook(cb.lessonUnit);
                      return (
                        <div key={cb.id} className="bg-white rounded px-3 py-2.5 text-xs" data-testid={`learning-record-${cb.id}`}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-foreground">{cb.lessonDate}</span>
                            {matched && (
                              <span className="text-[10px] bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full">
                                {gradeLabels[matched.grade - 1] || matched.grade}年級
                              </span>
                            )}
                            {cb.coachName && <span className="text-muted-foreground">{cb.coachName} 老師</span>}
                            {cb.quizScore != null && (
                              <span className="text-tiffany font-medium ml-auto">
                                {cb.quizScore}/{cb.quizTotal || 100}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            <span className="text-foreground font-medium">單元：</span>{cb.lessonUnit}
                          </p>
                          {cb.lessonProgress && (
                            <p className="text-muted-foreground">
                              <span className="text-foreground font-medium">進度：</span>{cb.lessonProgress}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ParentWallet {
  parentId: string;
  parentName: string;
  username: string;
  phone: string | null;
  balance: number;
}

interface CreditPackageOption {
  id: number;
  name: string;
  credits: number;
  bonusCredits: number;
  price: number;
  expiryDays: number | null;
  isActive: boolean;
}

interface ParentSearchResult {
  parentId: string;
  parentName: string;
  username: string | null;
  phone: string | null;
  balance: number;
  matchedStudent: { name: string; studentCode: string | null } | null;
}

function ParentCreditsTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWallet | null>(null);
  const [adjustForm, setAdjustForm] = useState<{
    packageId: number | null;
    credits: number;
    description: string;
  }>({ packageId: null, credits: 0, description: "" });

  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<ParentSearchResult | null>(null);

  const lookupMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await apiRequest("GET", `/api/franchise-admin/search-parent?q=${encodeURIComponent(q)}`);
      return res.json() as Promise<ParentSearchResult>;
    },
    onSuccess: (data) => {
      setLookupResult(data);
    },
    onError: (err: any) => {
      setLookupResult(null);
      toast({ title: err.message || "查無此家長", variant: "destructive" });
    },
  });

  const runLookup = () => {
    const q = lookupQuery.trim();
    if (!q) {
      toast({ title: "請輸入手機號碼或學生編號", variant: "destructive" });
      return;
    }
    lookupMutation.mutate(q);
  };

  const { data: wallets = [], isLoading } = useQuery<ParentWallet[]>({
    queryKey: ["/api/franchise-admin/parent-wallets"],
  });

  const { data: packages = [] } = useQuery<CreditPackageOption[]>({
    queryKey: ["/api/franchise-admin/credit-packages"],
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wallets;
    return wallets.filter((w) =>
      (w.parentName || "").toLowerCase().includes(q) ||
      (w.username || "").toLowerCase().includes(q) ||
      (w.phone || "").toLowerCase().includes(q)
    );
  }, [wallets, search]);

  const openAdjust = (wallet: ParentWallet) => {
    setSelectedParent(wallet);
    setAdjustForm({ packageId: null, credits: 0, description: "" });
    setShowDialog(true);
  };

  const adjustMutation = useMutation({
    mutationFn: async (data: { parentId: string; packageId: number | null; credits: number; description: string }) => {
      const res = await apiRequest("POST", "/api/franchise-admin/adjust-credits", data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast({ title: "加點成功", description: `新餘額：${data.newBalance} 堂` });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/parent-wallets"] });
      setLookupResult((prev) =>
        prev && prev.parentId === variables.parentId ? { ...prev, balance: data.newBalance } : prev
      );
      setShowDialog(false);
      setSelectedParent(null);
    },
    onError: (err: any) => {
      toast({ title: err.message || "加點失敗", variant: "destructive" });
    },
  });

  const selectedPkg = packages.find((p) => p.id === adjustForm.packageId);
  const submitDisabled =
    !selectedParent ||
    (!adjustForm.packageId && (!adjustForm.credits || adjustForm.credits <= 0)) ||
    adjustMutation.isPending;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground" data-testid="text-credits-title">家長點數</h2>
        <p className="text-xs text-muted-foreground mt-1">
          可手動加點的家長為本分校相關（孩子曾在此分校預約，或已加入本分校學生名單）
        </p>
      </div>

      <div className="mb-6 bg-white rounded-md border border-tiffany/30 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-tiffany" />
          <h3 className="text-sm font-semibold text-foreground">搜尋家長加點</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          輸入家長手機號碼或學生編號，可直接幫尚未在本分校預約的家長加點
        </p>
        <div className="flex gap-2 max-w-md">
          <Input
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runLookup(); }}
            placeholder="手機號碼或學生編號"
            data-testid="input-lookup-parent"
          />
          <Button
            onClick={runLookup}
            disabled={lookupMutation.isPending}
            data-testid="button-lookup-parent"
          >
            {lookupMutation.isPending ? "搜尋中..." : "搜尋"}
          </Button>
        </div>

        {lookupResult && (
          <div
            className="mt-3 bg-amber-warm/20 rounded-md border border-gray-100 p-4 flex items-center gap-4"
            data-testid={`lookup-card-${lookupResult.parentId}`}
          >
            <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-tiffany" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground" data-testid={`text-lookup-name-${lookupResult.parentId}`}>
                {lookupResult.parentName || lookupResult.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {lookupResult.phone ? lookupResult.phone : (lookupResult.username ? `@${lookupResult.username}` : "—")}
                {lookupResult.matchedStudent && (
                  <span>　學生：{lookupResult.matchedStudent.name}{lookupResult.matchedStudent.studentCode ? `（${lookupResult.matchedStudent.studentCode}）` : ""}</span>
                )}
              </p>
            </div>
            <div className="text-right mr-3">
              <p className="text-lg font-bold text-foreground" data-testid={`text-lookup-balance-${lookupResult.parentId}`}>
                {lookupResult.balance}
              </p>
              <p className="text-[10px] text-muted-foreground">剩餘堂數</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAdjust({
                parentId: lookupResult.parentId,
                parentName: lookupResult.parentName,
                username: lookupResult.username || "",
                phone: lookupResult.phone,
                balance: lookupResult.balance,
              })}
              data-testid={`button-lookup-adjust-${lookupResult.parentId}`}
            >
              <Plus className="w-4 h-4 mr-1" />加點
            </Button>
          </div>
        )}
      </div>

      <div className="mb-3 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋家長姓名／帳號／電話"
          className="pl-9"
          data-testid="input-search-parent-wallets"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground" data-testid="text-no-parent-wallets">
            {wallets.length === 0 ? "本分校目前尚無相關家長" : "查無符合搜尋的家長"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((wallet) => (
            <div
              key={wallet.parentId}
              className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
              data-testid={`wallet-card-${wallet.parentId}`}
            >
              <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-tiffany" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid={`text-wallet-name-${wallet.parentId}`}>
                  {wallet.parentName || wallet.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {wallet.phone ? wallet.phone : `@${wallet.username}`}
                </p>
              </div>
              <div className="text-right mr-3">
                <p className="text-lg font-bold text-foreground" data-testid={`text-wallet-balance-${wallet.parentId}`}>
                  {wallet.balance}
                </p>
                <p className="text-[10px] text-muted-foreground">剩餘堂數</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAdjust(wallet)}
                data-testid={`button-adjust-credits-${wallet.parentId}`}
              >
                <Plus className="w-4 h-4 mr-1" />加點
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setSelectedParent(null); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手動加點 — {selectedParent?.parentName || selectedParent?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>選擇方案（或自訂堂數）</Label>
              <Select
                value={adjustForm.packageId?.toString() || "custom"}
                onValueChange={(v) => {
                  if (v === "custom") {
                    setAdjustForm({ ...adjustForm, packageId: null, credits: 0 });
                  } else {
                    const pkg = packages.find((p) => p.id === parseInt(v));
                    setAdjustForm({
                      ...adjustForm,
                      packageId: parseInt(v),
                      credits: (pkg?.credits || 0) + (pkg?.bonusCredits || 0),
                    });
                  }
                }}
              >
                <SelectTrigger data-testid="select-adjust-package"><SelectValue placeholder="選擇方案" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">自訂堂數</SelectItem>
                  {packages.filter((p) => p.isActive).map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id.toString()}>
                      {pkg.name}（{pkg.credits + (pkg.bonusCredits || 0)} 堂 / NT$ {pkg.price.toLocaleString()}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!adjustForm.packageId && (
              <>
                <div>
                  <Label>自訂堂數 *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={adjustForm.credits || ""}
                    onChange={(e) => setAdjustForm({ ...adjustForm, credits: parseInt(e.target.value) || 0 })}
                    data-testid="input-adjust-credits"
                  />
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  自訂堂數無效期限制（不會自動過期）。若需設定期限，請改選有效期方案。
                </p>
              </>
            )}

            {selectedPkg && (
              <div className="bg-amber-warm/30 rounded-md p-3 text-xs text-muted-foreground space-y-0.5">
                <p>方案：{selectedPkg.name}</p>
                <p>實得堂數：{selectedPkg.credits + (selectedPkg.bonusCredits || 0)} 堂</p>
                <p>定價：NT$ {selectedPkg.price.toLocaleString()}</p>
                {selectedPkg.expiryDays
                  ? <p>有效天數：{selectedPkg.expiryDays} 天（自今日起算）</p>
                  : <p>有效天數：永久</p>}
              </div>
            )}

            <div>
              <Label>備註</Label>
              <Input
                value={adjustForm.description}
                onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                placeholder="例：補償、活動贈點、現金收款等"
                data-testid="input-adjust-description"
              />
              <p className="text-xs text-muted-foreground mt-1">
                系統會自動附上分校名稱與您的姓名於交易紀錄中
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedParent(null); setShowDialog(false); }}>取消</Button>
            <Button
              onClick={() => {
                if (!selectedParent) return;
                adjustMutation.mutate({
                  parentId: selectedParent.parentId,
                  packageId: adjustForm.packageId,
                  credits: adjustForm.packageId ? 0 : adjustForm.credits,
                  description: adjustForm.description,
                });
              }}
              disabled={submitDisabled}
              data-testid="button-submit-adjust"
            >
              {adjustMutation.isPending ? "處理中..." : "確認加點"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
