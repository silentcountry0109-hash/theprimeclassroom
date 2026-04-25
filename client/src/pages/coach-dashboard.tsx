import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  BookOpen,
  User,
  FileText,
  LogOut,
  GraduationCap,
  Save,
  Edit,
  CheckCircle,
  Star,
  XCircle,
  ClipboardCheck,
  AlertTriangle,
  Bell,
  CalendarPlus,
  CalendarMinus,
  UserX,
  Search,
  ChevronDown,
  HelpCircle,
  Settings,
  Library,
} from "lucide-react";
import type { Notification } from "@shared/schema";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CoachDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"calendar" | "students" | "profile" | "manual" | "materials">("calendar");
  const [showBindingSuccess, setShowBindingSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("firstLogin") === "1") {
      setShowBindingSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: userData, isLoading } = useQuery<any>({
    queryKey: ["/api/coach-user"],
    retry: false,
  });

  const handleLogout = async () => {
    await fetch("/api/credential-logout", { method: "POST", credentials: "include" });
    navigate("/franchise-login");
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showOverdueAlert, setShowOverdueAlert] = useState(false);
  const [calendarNavDate, setCalendarNavDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: notifList = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!userData,
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!userData,
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.count || 0;

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("PATCH", `/api/notifications/${id}/read`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => { await apiRequest("PATCH", "/api/notifications/read-all"); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const { data: overdueTasks = [] } = useQuery<{ date: string; totalSlots: number; checkedInSlots: number; contactBookSlots: number }[]>({
    queryKey: ["/api/coach/overdue-tasks"],
    enabled: !!userData,
    staleTime: 5 * 60 * 1000,
  });

  const localDateStr = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (overdueTasks.length === 0) return;
    const seenKey = `overdue-alert-seen-${localDateStr()}`;
    if (sessionStorage.getItem(seenKey)) return;
    setShowOverdueAlert(true);
  }, [overdueTasks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-4">質數教室</h1>
          <div className="flex gap-2 justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2.5 h-2.5 rounded-full bg-tiffany animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    navigate("/franchise-login");
    return null;
  }

  const TABS = [
    { id: "calendar" as const, label: "行事曆", icon: Calendar },
    { id: "students" as const, label: "我的學生", icon: Users },
    { id: "materials" as const, label: "教材庫", icon: Library },
    { id: "profile" as const, label: "個人資料", icon: User },
    { id: "manual" as const, label: "使用手冊", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-washi">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-tiffany" />
            <div>
              <h1 className="font-serif text-sm tracking-[0.1em] text-foreground" data-testid="text-coach-name">
                {userData.coach?.name || userData.firstName} 老師
              </h1>
              <p className="text-[10px] text-muted-foreground">質數教室 老師系統</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 relative"
                data-testid="button-coach-notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1" data-testid="badge-coach-unread-count">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] flex flex-col" data-testid="panel-coach-notifications">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold">通知</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          className="text-xs text-tiffany hover:underline"
                          data-testid="button-coach-mark-all-read"
                        >
                          全部標為已讀
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifList.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">暫無通知</div>
                      ) : (
                        notifList.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-tiffany/5" : ""}`}
                            data-testid={`coach-notification-item-${n.id}`}
                          >
                            <div className="flex items-start gap-2">
                              {n.type === "slot_removed" ? (
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CalendarMinus className="w-3.5 h-3.5 text-red-500" />
                                </div>
                              ) : n.type === "slot_assigned" ? (
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CalendarPlus className="w-3.5 h-3.5 text-green-600" />
                                </div>
                              ) : n.type === "new_booking" ? (
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Users className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Bell className="w-3.5 h-3.5 text-tiffany" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
                                  {n.type === "new_booking" && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 flex-shrink-0">新預約</span>
                                  )}
                                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-coach-logout">
              <LogOut className="w-4 h-4 mr-1" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-tiffany/10 text-tiffany"
                  : "text-muted-foreground hover:bg-gray-50"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calendar" && <CalendarTab coachId={userData.coach?.id} initialDate={calendarNavDate} onInitialDateConsumed={() => setCalendarNavDate(null)} />}
        {activeTab === "students" && <StudentsTab coachId={userData.coach?.id} />}
        {activeTab === "materials" && <MaterialsTab />}
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "manual" && <ManualTab />}
      </div>

      <Dialog open={showBindingSuccess} onOpenChange={setShowBindingSuccess}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3 pt-2">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              綁定成功
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" data-testid="text-binding-success">
            歡迎加入質數教室！您的帳號已成功綁定，密碼已更新完成。
          </p>
          <Button onClick={() => setShowBindingSuccess(false)} className="w-full mt-2" data-testid="button-close-binding-success">
            開始使用
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showOverdueAlert} onOpenChange={(open) => {
        if (!open) {
          sessionStorage.setItem(`overdue-alert-seen-${localDateStr()}`, "1");
          setShowOverdueAlert(false);
        }
      }}>
        <DialogContent className="max-w-sm" data-testid="dialog-overdue-alert">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              有過去未完成的課堂紀錄
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-1">以下日期的點名或聯絡簿尚未完成，請點擊日期補填：</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {overdueTasks.map((t) => {
              const needsCheckIn = t.checkedInSlots < t.totalSlots;
              const needsContactBook = t.contactBookSlots < t.totalSlots;
              const [, mo, d] = t.date.split("-").map(Number);
              const label = `${mo} 月 ${d} 日`;
              return (
                <button
                  key={t.date}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors text-left"
                  data-testid={`button-overdue-date-${t.date}`}
                  onClick={() => {
                    sessionStorage.setItem(`overdue-alert-seen-${localDateStr()}`, "1");
                    setShowOverdueAlert(false);
                    setCalendarNavDate(t.date);
                    setActiveTab("calendar");
                  }}
                >
                  <span className="text-sm font-medium text-amber-900">{label}</span>
                  <div className="flex gap-1.5">
                    {needsCheckIn && <span className="text-[11px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">點名未完成</span>}
                    {needsContactBook && <span className="text-[11px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">聯絡簿未完成</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              sessionStorage.setItem(`overdue-alert-seen-${localDateStr()}`, "1");
              setShowOverdueAlert(false);
            }}
            data-testid="button-overdue-alert-dismiss"
          >
            我知道了
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CalendarTab({ coachId, initialDate, onInitialDateConsumed }: { coachId: number; initialDate?: string | null; onInitialDateConsumed?: () => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [contactBookSlot, setContactBookSlot] = useState<any>(null);

  useEffect(() => {
    if (!initialDate) return;
    const [y, m] = initialDate.split("-").map(Number);
    setYear(y);
    setMonth(m);
    setSelectedDate(initialDate);
    onInitialDateConsumed?.();
  }, [initialDate]);

  const { data: slots = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/calendar", year, month],
    enabled: !!coachId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const slotsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const slot of slots) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    return map;
  }, [slots]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const selectedSlots = selectedDate ? (slotsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-prev-month">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-base font-semibold text-foreground" data-testid="text-calendar-month">
            {year} 年 {month} 月
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground border-b border-gray-50">
          {WEEKDAY_LABELS.map(d => (
            <div key={d} className="py-2 font-medium">{d}</div>
          ))}
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center"><Skeleton className="h-48 w-full" /></div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-16 border-b border-r border-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasSlots = !!slotsByDate[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`h-12 sm:h-16 border-b border-r border-gray-50 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                    isSelected ? "bg-tiffany/10" : hasSlots ? "hover:bg-gray-50" : ""
                  }`}
                  data-testid={`calendar-day-${dateStr}`}
                >
                  <span className={`text-sm ${isToday ? "w-6 h-6 rounded-full bg-tiffany text-white flex items-center justify-center text-xs font-bold" : isSelected ? "text-tiffany font-semibold" : "text-foreground"}`}>
                    {day}
                  </span>
                  {hasSlots && (
                    <div className="flex gap-0.5">
                      {slotsByDate[dateStr].slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-tiffany" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <DailyProgressCard coachId={coachId} date={selectedDate} />
          <h3 className="text-sm font-semibold text-foreground px-1" data-testid="text-selected-date">
            {selectedDate} 的排課
          </h3>
          {selectedSlots.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
              這天沒有排課
            </div>
          ) : (
            selectedSlots.map(slot => (
              <SlotCard key={slot.id} slot={slot} selectedDate={selectedDate} onOpenContactBook={() => setContactBookSlot(slot)} />
            ))
          )}
        </div>
      )}

      {contactBookSlot && (
        <ContactBookDialog
          slot={contactBookSlot}
          coachId={coachId}
          onClose={() => setContactBookSlot(null)}
        />
      )}
    </div>
  );
}

function useCheckInAvailability(slotDate: string, slotStartTime: string, slotEndTime: string) {
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [isSlotEnded, setIsSlotEnded] = useState(false);
  const [minutesUntilCheckIn, setMinutesUntilCheckIn] = useState(0);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const slotStart = new Date(`${slotDate}T${slotStartTime}:00+08:00`);
      const slotEnd = new Date(`${slotDate}T${slotEndTime}:00+08:00`);
      const earliest = new Date(slotStart.getTime() - 15 * 60 * 1000);

      setIsSlotEnded(now > slotEnd);
      setCanCheckIn(now >= earliest);
      if (now < earliest) {
        setMinutesUntilCheckIn(Math.ceil((earliest.getTime() - now.getTime()) / 60000));
      } else {
        setMinutesUntilCheckIn(0);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [slotDate, slotStartTime, slotEndTime]);

  return { canCheckIn, isSlotEnded, minutesUntilCheckIn };
}

function SlotCard({ slot, selectedDate, onOpenContactBook }: { slot: any; selectedDate: string; onOpenContactBook: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/slots", slot.id, "students"],
    staleTime: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { canCheckIn, isSlotEnded, minutesUntilCheckIn } = useCheckInAvailability(
    slot.date || selectedDate, slot.startTime, slot.endTime
  );

  const checkInMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("PATCH", `/api/coach/bookings/${bookingId}/check-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/slots", slot.id, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/daily-record"] });
      toast({ title: "點名成功", description: "學生已標記為出席" });
    },
    onError: (error: any) => {
      toast({ title: "點名失敗", description: error.message, variant: "destructive" });
    },
  });

  const uncheckInMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("PATCH", `/api/coach/bookings/${bookingId}/uncheck-in`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/slots", slot.id, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/daily-record"] });
      toast({ title: "已取消", description: "學生狀態已恢復為待點名" });
    },
    onError: (error: any) => {
      toast({ title: "操作失敗", description: error.message, variant: "destructive" });
    },
  });

  const absentMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("PATCH", `/api/coach/bookings/${bookingId}/absent`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/slots", slot.id, "students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/daily-record"] });
      toast({ title: "已標記未到", description: "學生已標記為缺席" });
    },
    onError: (error: any) => {
      toast({ title: "標記未到失敗", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`slot-card-${slot.id}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-tiffany" />
          <span className="font-semibold text-sm">{slot.startTime} - {slot.endTime}</span>
          {slot.franchiseName && (
            <Badge variant="outline" className="text-xs">{slot.franchiseName}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {slot.bookedSeats}/{slot.maxSeats}
        </div>
      </div>

      {!canCheckIn && !isSlotEnded && minutesUntilCheckIn > 0 && students.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3" data-testid={`notice-checkin-wait-${slot.id}`}>
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {minutesUntilCheckIn > 60
              ? `尚需 ${Math.floor(minutesUntilCheckIn / 60)} 小時 ${minutesUntilCheckIn % 60} 分鐘才可點名`
              : `尚需 ${minutesUntilCheckIn} 分鐘才可點名（上課前 15 分鐘開放）`
            }
          </span>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-8 w-full" />
      ) : students.length === 0 ? (
        <p className="text-xs text-muted-foreground">沒有學生預約</p>
      ) : (
        <div className="space-y-1.5 mb-3">
          {students.map((s: any) => (
            <div key={s.childId} className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-xs text-tiffany font-medium">{s.childName[0]}</span>
              </div>
              <span className="text-foreground">{s.childName}</span>
              <span className="text-xs text-muted-foreground">{s.childGrade}年級</span>
              {s.childSchool && <span className="text-xs text-muted-foreground">· {s.childSchool}</span>}
              {s.childStudentCode && (
                <span className="text-[10px] text-muted-foreground/70 font-mono">{s.childStudentCode}</span>
              )}
              <span className="ml-auto flex items-center gap-1">
                {s.status === "checked_in" ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full" data-testid={`badge-checked-in-${s.bookingId}`}>
                      <CheckCircle className="w-3 h-3" />
                      已到
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-muted-foreground/50 hover:text-red-400 transition-colors p-0.5"
                          data-testid={`button-uncheck-${s.bookingId}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>確定要取消點名嗎？</AlertDialogTitle>
                          <AlertDialogDescription>
                            {s.childName} 的出席狀態將恢復為「待點名」，請確認是否為誤點。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>返回</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => uncheckInMutation.mutate(s.bookingId)}
                            className="bg-red-500 hover:bg-red-600"
                            data-testid={`button-confirm-uncheck-${s.bookingId}`}
                          >
                            確認取消點名
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : s.status === "absent" ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full" data-testid={`badge-absent-${s.bookingId}`}>
                      <UserX className="w-3 h-3" />
                      未到
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="text-muted-foreground/50 hover:text-red-400 transition-colors p-0.5"
                          data-testid={`button-unmark-absent-${s.bookingId}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>確定要取消未到標記嗎？</AlertDialogTitle>
                          <AlertDialogDescription>
                            {s.childName} 的狀態將恢復為「待點名」，請確認是否為誤標。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>返回</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => uncheckInMutation.mutate(s.bookingId)}
                            className="bg-red-500 hover:bg-red-600"
                            data-testid={`button-confirm-unmark-absent-${s.bookingId}`}
                          >
                            確認取消
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-tiffany/30 text-tiffany hover:bg-tiffany/5"
                      onClick={() => checkInMutation.mutate(s.bookingId)}
                      disabled={checkInMutation.isPending || absentMutation.isPending || !canCheckIn}
                      data-testid={`button-check-in-${s.bookingId}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已到
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-red-300 text-red-500 hover:bg-red-50"
                      onClick={() => absentMutation.mutate(s.bookingId)}
                      disabled={checkInMutation.isPending || absentMutation.isPending || !canCheckIn}
                      data-testid={`button-absent-${s.bookingId}`}
                    >
                      <UserX className="w-3 h-3 mr-1" />
                      未到
                    </Button>
                  </div>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full border-tiffany/30 text-tiffany hover:bg-tiffany/5"
        onClick={onOpenContactBook}
        disabled={isLoading || students.length === 0}
        data-testid={`button-contact-book-${slot.id}`}
      >
        <FileText className="w-4 h-4 mr-1.5" />
        填寫聯絡簿
      </Button>
    </div>
  );
}

function DailyProgressCard({ coachId, date }: { coachId: number; date: string }) {
  const { data: record, isLoading } = useQuery<any>({
    queryKey: ["/api/coach/daily-record", date],
    enabled: !!coachId,
  });

  if (isLoading) return <Skeleton className="h-16 w-full rounded-xl" />;
  if (!record || record.totalSlots === 0) return null;

  const checkInPercent = Math.round((record.checkedInSlots / record.totalSlots) * 100);
  const contactBookPercent = Math.round((record.contactBookSlots / record.totalSlots) * 100);

  return (
    <div className={`rounded-xl border p-4 ${record.isComplete ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`} data-testid="card-daily-progress">
      <div className="flex items-center gap-2 mb-3">
        {record.isComplete ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700" data-testid="text-daily-status">今日工作已完成</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700" data-testid="text-daily-status">尚有未完成的工作</span>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">點名進度</span>
            <span className={record.checkedInSlots === record.totalSlots ? "text-green-600 font-medium" : "text-amber-600 font-medium"} data-testid="text-checkin-progress">
              {record.checkedInSlots}/{record.totalSlots}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${record.checkedInSlots === record.totalSlots ? "bg-green-500" : "bg-amber-400"}`} style={{ width: `${checkInPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">聯絡簿進度</span>
            <span className={record.contactBookSlots === record.totalSlots ? "text-green-600 font-medium" : "text-amber-600 font-medium"} data-testid="text-contactbook-progress">
              {record.contactBookSlots}/{record.totalSlots}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${record.contactBookSlots === record.totalSlots ? "bg-green-500" : "bg-amber-400"}`} style={{ width: `${contactBookPercent}%` }} />
          </div>
        </div>
      </div>
      {!record.isComplete && (
        <p className="text-[10px] text-amber-600/80 mt-2">請務必在當天完成所有點名與聯絡簿填寫</p>
      )}
    </div>
  );
}

function TextbookUnitSelector({
  childGrade,
  value,
  onChange,
  onSelectTextbook,
}: {
  childGrade: number;
  value: string;
  onChange: (val: string) => void;
  onSelectTextbook: (textbook: any | null) => void;
}) {
  const { data: allTextbooks = [] } = useQuery<any[]>({
    queryKey: ["/api/textbooks"],
  });

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [freeInput, setFreeInput] = useState(false);

  const gradeTextbooks = useMemo(() => allTextbooks.filter((t: any) => t.grade === childGrade && t.isActive), [allTextbooks, childGrade]);
  const otherTextbooks = useMemo(() => allTextbooks.filter((t: any) => t.grade !== childGrade && t.isActive), [allTextbooks, childGrade]);

  const otherByGrade = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (const t of otherTextbooks) {
      if (!map[t.grade]) map[t.grade] = [];
      map[t.grade].push(t);
    }
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  }, [otherTextbooks]);

  const [expandedOtherGrade, setExpandedOtherGrade] = useState<number | null>(null);

  const filteredGrade = useMemo(() => {
    if (!searchTerm) return gradeTextbooks;
    const term = searchTerm.toLowerCase();
    return gradeTextbooks.filter((t: any) =>
      t.unitCode.toLowerCase().includes(term) || t.unitName.toLowerCase().includes(term)
    );
  }, [gradeTextbooks, searchTerm]);

  const filteredOther = useMemo(() => {
    if (!searchTerm) return otherByGrade;
    const term = searchTerm.toLowerCase();
    return otherByGrade
      .map(([grade, items]) => [grade, items.filter((t: any) =>
        t.unitCode.toLowerCase().includes(term) || t.unitName.toLowerCase().includes(term)
      )] as [string, any[]])
      .filter(([, items]) => items.length > 0);
  }, [otherByGrade, searchTerm]);

  const handleSelect = (textbook: any) => {
    onChange(`${textbook.unitCode} ${textbook.unitName}`);
    onSelectTextbook(textbook);
    setOpen(false);
    setSearchTerm("");
    setFreeInput(false);
  };

  const handleFreeInput = () => {
    setFreeInput(true);
    onSelectTextbook(null);
    setOpen(false);
    setSearchTerm("");
  };

  if (freeInput) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label className="text-xs">今日上課單元 *</Label>
          <button
            onClick={() => { setFreeInput(false); }}
            className="text-[10px] text-tiffany hover:underline"
            data-testid="button-switch-to-dropdown"
          >
            從教材選擇
          </button>
        </div>
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); onSelectTextbook(null); }}
          placeholder="例：三位數加減法"
          className="mt-1"
          data-testid="input-lesson-unit"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-xs">今日上課單元 *</Label>
        <button
          onClick={handleFreeInput}
          className="text-[10px] text-tiffany hover:underline"
          data-testid="button-switch-to-free-input"
        >
          自由輸入
        </button>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full mt-1 flex items-center justify-between rounded-md border border-input bg-background px-3 min-h-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid="button-select-textbook"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || "選擇教材單元..."}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearchTerm(""); }} />
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 flex flex-col" data-testid="panel-textbook-dropdown">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-2 rounded-md border border-gray-200 bg-gray-50">
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="搜尋教材（編號或名稱）..."
                    className="w-full py-1.5 text-sm bg-transparent border-0 outline-none"
                    autoFocus
                    data-testid="input-search-textbook"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredGrade.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50 sticky top-0">
                      {childGrade}年級教材（學生年級）
                    </div>
                    {filteredGrade.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelect(t)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-tiffany/5 transition-colors flex items-center gap-2"
                        data-testid={`textbook-option-${t.id}`}
                      >
                        <span className="font-mono text-xs text-muted-foreground w-10 flex-shrink-0">{t.unitCode}</span>
                        <span className="text-foreground flex-1">{t.unitName}</span>
                        {t.quizzes && t.quizzes.length > 0 && (
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">{t.quizzes.length}考卷</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {filteredOther.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50 sticky top-0">
                      其他年級
                    </div>
                    {filteredOther.map(([grade, items]) => (
                      <div key={grade}>
                        <button
                          onClick={() => setExpandedOtherGrade(expandedOtherGrade === Number(grade) ? null : Number(grade))}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-gray-50 flex items-center justify-between"
                          data-testid={`toggle-grade-${grade}`}
                        >
                          <span>{grade}年級（{items.length} 個單元）</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedOtherGrade === Number(grade) ? "rotate-180" : ""}`} />
                        </button>
                        {(expandedOtherGrade === Number(grade) || searchTerm) && items.map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => handleSelect(t)}
                            className="w-full text-left px-3 py-2 pl-6 text-sm hover:bg-tiffany/5 transition-colors flex items-center gap-2"
                            data-testid={`textbook-option-${t.id}`}
                          >
                            <span className="font-mono text-xs text-muted-foreground w-10 flex-shrink-0">{t.unitCode}</span>
                            <span className="text-foreground flex-1">{t.unitName}</span>
                            {t.quizzes && t.quizzes.length > 0 && (
                              <Badge variant="outline" className="text-[10px] flex-shrink-0">{t.quizzes.length}考卷</Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {filteredGrade.length === 0 && filteredOther.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    找不到符合的教材
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContactBookDialog({ slot, coachId, onClose }: { slot: any; coachId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/slots", slot.id, "students"],
    staleTime: 0,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { data: existingBooks = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/contact-books/slot", slot.id],
  });

  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [studentData, setStudentData] = useState<Record<number, {
    lessonUnit: string;
    lessonProgress: string;
    homework: string;
    nextExam: string;
    quizScore: string;
    quizTotal: string;
    teacherRemarks: string;
    internalNotes: string;
    selectedTextbook: any | null;
    selectedQuizId: number | null;
  }>>({});

  useEffect(() => {
    if (!existingBooks || existingBooks.length === 0) return;
    setStudentData(prev => {
      const next = { ...prev };
      for (const existing of existingBooks) {
        if (!next[existing.childId]) {
          next[existing.childId] = {
            lessonUnit: existing.lessonUnit || "",
            lessonProgress: existing.lessonProgress || "",
            homework: existing.homework || "",
            nextExam: existing.nextExam || "",
            quizScore: existing.quizScore?.toString() || "",
            quizTotal: existing.quizTotal?.toString() || "100",
            teacherRemarks: existing.teacherRemarks || "",
            internalNotes: existing.internalNotes || "",
            selectedTextbook: null,
            selectedQuizId: null,
          };
        }
      }
      return next;
    });
  }, [existingBooks]);

  const initStudentData = (childId: number) => {
    if (studentData[childId]) return studentData[childId];
    const existing = existingBooks.find((b: any) => b.childId === childId);
    if (existing) {
      return {
        lessonUnit: existing.lessonUnit || "",
        lessonProgress: existing.lessonProgress || "",
        homework: existing.homework || "",
        nextExam: existing.nextExam || "",
        quizScore: existing.quizScore?.toString() || "",
        quizTotal: existing.quizTotal?.toString() || "100",
        teacherRemarks: existing.teacherRemarks || "",
        internalNotes: existing.internalNotes || "",
        selectedTextbook: null,
        selectedQuizId: null,
      };
    }
    return {
      lessonUnit: "",
      lessonProgress: "",
      homework: "",
      nextExam: "",
      quizScore: "",
      quizTotal: "100",
      teacherRemarks: "",
      internalNotes: "",
      selectedTextbook: null,
      selectedQuizId: null,
    };
  };

  const getStudentFormData = (childId: number) => {
    return studentData[childId] || initStudentData(childId);
  };

  const updateStudentField = (childId: number, field: string, value: any) => {
    setStudentData(prev => ({
      ...prev,
      [childId]: {
        ...initStudentData(childId),
        ...prev[childId],
        [field]: value,
      },
    }));
  };

  const handleSelectTextbook = (childId: number, textbook: any | null) => {
    updateStudentField(childId, "selectedTextbook", textbook);
    updateStudentField(childId, "selectedQuizId", null);
  };

  const handleSelectQuiz = (childId: number, quizId: number | null, quizzes: any[]) => {
    updateStudentField(childId, "selectedQuizId", quizId);
    if (quizId) {
      const quiz = quizzes.find((q: any) => q.id === quizId);
      if (quiz) {
        updateStudentField(childId, "quizTotal", quiz.totalScore.toString());
      }
    }
  };

  const presentStudents = students.filter((s: any) => s.status !== "absent");

  const sortedStudents = [
    ...students.filter((s: any) => s.status !== "absent"),
    ...students.filter((s: any) => s.status === "absent"),
  ];

  const effectiveActiveId = activeStudentId ?? sortedStudents[0]?.childId ?? null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const newEntries: any[] = [];
      for (const s of presentStudents) {
        const data = getStudentFormData(s.childId);
        const payload = {
          bookingId: s.bookingId,
          childId: s.childId,
          lessonDate: slot.date,
          lessonUnit: data.lessonUnit,
          lessonProgress: data.lessonProgress,
          homework: data.homework || null,
          nextExam: data.nextExam || null,
          quizScore: data.quizScore ? parseInt(data.quizScore) : null,
          quizTotal: data.quizTotal ? parseInt(data.quizTotal) : 100,
          teacherRemarks: data.teacherRemarks || null,
          internalNotes: data.internalNotes || null,
        };
        const existing = existingBooks.find((b: any) => b.childId === s.childId);
        if (existing) {
          await apiRequest("PATCH", `/api/coach/contact-books/${existing.id}`, payload);
        } else {
          newEntries.push(payload);
        }
      }
      if (newEntries.length > 0) {
        await apiRequest("POST", "/api/coach/contact-books", { entries: newEntries });
      }
    },
    onSuccess: () => {
      toast({ title: "聯絡簿已儲存", description: "家長現在可以看到上課紀錄了" });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/contact-books/slot", slot.id] });
      onClose();
    },
    onError: () => {
      toast({ title: "儲存失敗", description: "請稍後再試", variant: "destructive" });
    },
  });

  const currentStudent = sortedStudents.find((s: any) => s.childId === effectiveActiveId) ?? null;
  const currentData = currentStudent ? getStudentFormData(currentStudent.childId) : null;
  const hasExisting = existingBooks.length > 0;

  const currentQuizzes = currentData?.selectedTextbook?.quizzes?.filter((q: any) => q.isActive) || [];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-tiffany" />
            {hasExisting ? "編輯聯絡簿" : "填寫聯絡簿"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" />
          {slot.date} {slot.startTime}-{slot.endTime}
        </div>

        <div className="space-y-4">
          {sortedStudents.length > 1 && (
            <div className="space-y-1">
              <div className="flex gap-1.5 text-[10px] text-muted-foreground px-0.5">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />已填</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-gray-300 inline-block" />未填</span>
                <span className="flex items-center gap-1 ml-2 text-red-400"><span className="w-2 h-2 rounded-full bg-red-200 inline-block" />未到</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {sortedStudents.map((s: any) => {
                  const isActive = s.childId === effectiveActiveId;
                  const isAbsent = s.status === "absent";
                  const isFilled = existingBooks.some((b: any) => b.childId === s.childId);
                  return (
                    <button
                      key={s.childId}
                      onClick={() => setActiveStudentId(s.childId)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? isAbsent
                            ? "bg-red-400 text-white"
                            : "bg-tiffany text-white"
                          : isAbsent
                            ? "bg-red-50 text-red-400 hover:bg-red-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-testid={`student-tab-${s.childId}`}
                    >
                      {!isAbsent && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isFilled
                            ? isActive ? "bg-white" : "bg-green-400"
                            : isActive ? "border border-white/70 bg-transparent" : "border border-gray-400 bg-transparent"
                        }`} data-testid={`dot-filled-${s.childId}`} />
                      )}
                      {s.childName}
                      {isAbsent && (
                        <span className="text-[10px] opacity-80">未到</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStudent && currentData && (
            <div className="space-y-3 border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${currentStudent.status === "absent" ? "bg-red-50" : "bg-tiffany/10"}`}>
                  <span className={`text-xs font-bold ${currentStudent.status === "absent" ? "text-red-400" : "text-tiffany"}`}>{currentStudent.childName[0]}</span>
                </div>
                <span className="font-semibold text-sm">{currentStudent.childName}</span>
                <span className="text-xs text-muted-foreground">{currentStudent.childGrade}年級</span>
                {currentStudent.status === "absent" && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-auto">
                    <UserX className="w-3 h-3" />
                    未到
                  </span>
                )}
              </div>

              {currentStudent.status === "absent" ? (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-3 text-sm text-red-600" data-testid={`absent-notice-${currentStudent.childId}`}>
                  <UserX className="w-4 h-4 flex-shrink-0" />
                  已標記為未到，無需填寫聯絡簿
                </div>
              ) : (<>
              <TextbookUnitSelector
                childGrade={currentStudent.childGrade}
                value={currentData.lessonUnit}
                onChange={val => updateStudentField(currentStudent.childId, "lessonUnit", val)}
                onSelectTextbook={tb => handleSelectTextbook(currentStudent.childId, tb)}
              />

              {currentQuizzes.length > 0 && (
                <div>
                  <Label className="text-xs">配套考卷</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {currentQuizzes.map((q: any) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuiz(
                          currentStudent.childId,
                          currentData.selectedQuizId === q.id ? null : q.id,
                          currentQuizzes
                        )}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                          currentData.selectedQuizId === q.id
                            ? "bg-tiffany/10 border-tiffany/30 text-tiffany"
                            : "bg-gray-50 border-gray-200 text-muted-foreground hover:bg-gray-100"
                        }`}
                        data-testid={`quiz-option-${q.id}`}
                      >
                        {q.quizName}（滿分 {q.totalScore}）
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs">教學進度</Label>
                <Input
                  value={currentData.lessonProgress}
                  onChange={e => updateStudentField(currentStudent.childId, "lessonProgress", e.target.value)}
                  placeholder="例：課本第3章 p.45-52"
                  className="mt-1"
                  data-testid="input-lesson-progress"
                />
              </div>

              <div>
                <Label className="text-xs">回家作業</Label>
                <Input
                  value={currentData.homework}
                  onChange={e => updateStudentField(currentStudent.childId, "homework", e.target.value)}
                  placeholder="選填，例：練習題 p.30 第1-5題"
                  className="mt-1"
                  data-testid="input-homework"
                />
              </div>

              <div>
                <Label className="text-xs">下次考試</Label>
                <Input
                  value={currentData.nextExam}
                  onChange={e => updateStudentField(currentStudent.childId, "nextExam", e.target.value)}
                  placeholder="選填，例：第三單元小考（3/10）"
                  className="mt-1"
                  data-testid="input-next-exam"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">小考成績</Label>
                  <Input
                    type="number"
                    value={currentData.quizScore}
                    onChange={e => updateStudentField(currentStudent.childId, "quizScore", e.target.value)}
                    placeholder="選填"
                    className="mt-1"
                    data-testid="input-quiz-score"
                  />
                </div>
                <div>
                  <Label className="text-xs">滿分</Label>
                  <Input
                    type="number"
                    value={currentData.quizTotal}
                    onChange={e => updateStudentField(currentStudent.childId, "quizTotal", e.target.value)}
                    placeholder="100"
                    className="mt-1"
                    data-testid="input-quiz-total"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">老師備註（給家長端）</Label>
                <Textarea
                  value={currentData.teacherRemarks}
                  onChange={e => updateStudentField(currentStudent.childId, "teacherRemarks", e.target.value)}
                  placeholder="選填，家長可見的備註"
                  className="mt-1 min-h-[60px]"
                  data-testid="textarea-teacher-remarks"
                />
              </div>

              <div>
                <Label className="text-xs">老師備註（內部觀看）</Label>
                <Textarea
                  value={currentData.internalNotes}
                  onChange={e => updateStudentField(currentStudent.childId, "internalNotes", e.target.value)}
                  placeholder="選填，僅內部人員可見"
                  className="mt-1 min-h-[60px]"
                  data-testid="textarea-internal-notes"
                />
              </div>
              </>)}
            </div>
          )}

          <Button
            className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
            disabled={presentStudents.some((s: any) => !getStudentFormData(s.childId).lessonUnit) || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            data-testid="button-save-contact-book"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saveMutation.isPending ? "儲存中..." : hasExisting ? "更新聯絡簿" : "儲存聯絡簿"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentsTab({ coachId }: { coachId: number }) {
  const [selectedChild, setSelectedChild] = useState<number | null>(null);

  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/students"],
    enabled: !!coachId,
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">目前還沒有學生記錄</p>
      </div>
    );
  }

  if (selectedChild) {
    return <StudentHistory coachId={coachId} childId={selectedChild} onBack={() => setSelectedChild(null)} studentName={students.find((s: any) => s.id === selectedChild)?.name || ""} />;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground px-1 mb-2" data-testid="text-students-title">
        我的學生（{students.length} 位）
      </h3>
      {students.map((s: any) => (
        <button
          key={s.id}
          onClick={() => setSelectedChild(s.id)}
          className="w-full bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:border-tiffany/30 transition-colors text-left"
          data-testid={`student-card-${s.id}`}
        >
          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm text-tiffany font-bold">{s.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.grade}年級 · {s.bookingCount} 堂課{s.school ? ` · ${s.school}` : ""}</p>
            {s.franchiseNames && s.franchiseNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {s.franchiseNames.map((fname: string) => (
                  <Badge key={fname} variant="outline" className="text-[10px] px-1.5 py-0" data-testid={`badge-franchise-${s.id}`}>
                    {fname}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </button>
      ))}
    </div>
  );
}

function StudentHistory({ coachId, childId, onBack, studentName }: { coachId: number; childId: number; onBack: () => void; studentName: string }) {
  const { data: history = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/students", childId, "history"],
  });

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-tiffany hover:underline" data-testid="button-back-students">
        <ChevronLeft className="w-4 h-4" />
        返回學生列表
      </button>
      <h3 className="text-sm font-semibold text-foreground" data-testid="text-student-history-title">
        {studentName} 的學習歷程
      </h3>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
          尚無聯絡簿記錄
        </div>
      ) : (
        history.map((entry: any) => (
          <ContactBookCard key={entry.id} entry={entry} showChild={false} />
        ))
      )}
    </div>
  );
}

function ContactBookCard({ entry, showChild = true }: { entry: any; showChild?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" data-testid={`contact-book-${entry.id}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-tiffany/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-tiffany" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{entry.lessonUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{entry.lessonDate}</span>
            {showChild && entry.childName && <span>· {entry.childName}</span>}
            {entry.coachName && <span>· {entry.coachName} 老師</span>}
            {entry.quizScore != null && (
              <span className="text-amber-600">
                <Star className="w-3 h-3 inline mr-0.5" />
                {entry.quizScore}/{entry.quizTotal || 100}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground/50 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
          {entry.lessonProgress && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">教學進度</p>
              <p className="text-sm text-foreground">{entry.lessonProgress}</p>
            </div>
          )}
          {entry.classNotes && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">課堂筆記</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{entry.classNotes}</p>
            </div>
          )}
          {entry.homework && (
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">回家作業</p>
              <p className="text-sm text-foreground">{entry.homework}</p>
            </div>
          )}
          {entry.teacherRemarks && (
            <div className="bg-amber-50 rounded-lg p-2.5">
              <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mb-0.5">老師備註</p>
              <p className="text-sm text-amber-800">{entry.teacherRemarks}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: infoData, isLoading } = useQuery<any>({
    queryKey: ["/api/coach/my-info"],
  });

  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [editing, setEditing] = useState(false);

  useMemo(() => {
    if (infoData?.coach) {
      setBio(infoData.coach.bio || "");
      setSpecialties(infoData.coach.specialties?.join("、") || "");
    }
  }, [infoData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const specialtyArr = specialties.split(/[、,，]/).map((s: string) => s.trim()).filter(Boolean);
      await apiRequest("PATCH", "/api/coach/my-info", { bio, specialties: specialtyArr });
    },
    onSuccess: () => {
      toast({ title: "資料已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/my-info"] });
      setEditing(false);
    },
    onError: () => {
      toast({ title: "更新失敗", variant: "destructive" });
    },
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  const coach = infoData?.coach;
  const franchise = infoData?.franchise;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-tiffany/10 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-tiffany" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground" data-testid="text-profile-name">{coach?.name}</h2>
            {franchise && <p className="text-sm text-muted-foreground">{franchise.name}</p>}
            <div className="flex items-center gap-2 mt-1">
              {coach?.isCertified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  認證老師
                </Badge>
              )}
              {coach?.rating > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {coach.rating} ({coach.reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">自我介紹</Label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="mt-1 min-h-[100px]"
                data-testid="textarea-edit-bio"
              />
            </div>
            <div>
              <Label className="text-xs">教學專長（用頓號或逗號分隔）</Label>
              <Input
                value={specialties}
                onChange={e => setSpecialties(e.target.value)}
                placeholder="例：高年級數學、資優培訓"
                className="mt-1"
                data-testid="input-edit-specialties"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-tiffany hover:bg-tiffany/90 text-white"
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-1" />
                {updateMutation.isPending ? "儲存中..." : "儲存"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} data-testid="button-cancel-edit">
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">自我介紹</p>
              <p className="text-sm text-foreground">{coach?.bio || "尚未填寫"}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">教學專長</p>
              <div className="flex flex-wrap gap-1.5">
                {coach?.specialties?.length > 0 ? coach.specialties.map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                )) : <span className="text-sm text-muted-foreground">尚未填寫</span>}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="button-edit-profile">
              <Edit className="w-4 h-4 mr-1" />
              編輯資料
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ManualTab() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGroup = (id: string) => {
    setExpandedGroup(expandedGroup === id ? null : id);
    setExpandedItem(null);
  };

  const toggleItem = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  type ManualItem = {
    id: string;
    title: string;
    icon: any;
    keywords: string[];
    content: JSX.Element;
  };

  type ManualGroup = {
    id: string;
    title: string;
    icon: any;
    color: string;
    items: ManualItem[];
  };

  const groups: ManualGroup[] = [
    {
      id: "calendar-group",
      title: "行事曆功能介紹",
      icon: Calendar,
      color: "border-l-tiffany",
      items: [
        {
          id: "calendar-overview",
          title: "查看排課與月曆操作",
          icon: Calendar,
          keywords: ["行事曆", "月曆", "排課", "時段", "日期", "卡片"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                登入後，您會看到行事曆頁面。這是老師系統的首頁。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-tiffany font-bold">•</span>上方顯示當月月曆，有排課的日期下方會有小圓點標記</li>
                <li className="flex gap-2"><span className="text-tiffany font-bold">•</span>點擊左右箭頭可切換月份</li>
                <li className="flex gap-2"><span className="text-tiffany font-bold">•</span>點擊日期後，下方會列出該天所有的時段卡片</li>
                <li className="flex gap-2"><span className="text-tiffany font-bold">•</span>每張卡片顯示：上課時間、教室名稱、已預約人數/上限</li>
                <li className="flex gap-2"><span className="text-tiffany font-bold">•</span>展開卡片可查看每位學生的姓名、年級、學號</li>
              </ul>
              <img src="/manual/step2-student-list.png" alt="行事曆與排課總覽" className="rounded-lg border border-gray-200 w-full" />
            </div>
          ),
        },
        {
          id: "checkin",
          title: "學生點名 — 標記已到",
          icon: CheckCircle,
          keywords: ["點名", "已到", "出席", "簽到", "check in"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                上課前 <strong className="text-foreground">15 分鐘</strong>起，點名功能自動開放。每位學生旁會顯示「已到」和「未到」兩個按鈕。
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>當學生到場後，點擊綠色 <strong className="text-foreground">「已到」</strong> 按鈕：</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex gap-2"><span className="text-green-500">✓</span>按鈕變成綠色「已到」標籤</li>
                  <li className="flex gap-2"><span className="text-green-500">✓</span>右下角出現「點名成功」提示</li>
                  <li className="flex gap-2"><span className="text-green-500">✓</span>點名進度自動更新</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">待點名狀態：</p>
                <img src="/manual/step5-restored.png" alt="待點名狀態" className="rounded-lg border border-gray-200 w-full" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">點名成功：</p>
                <img src="/manual/step6-checked-in.png" alt="點名成功" className="rounded-lg border border-gray-200 w-full" />
              </div>
            </div>
          ),
        },
        {
          id: "absent",
          title: "學生點名 — 標記未到",
          icon: UserX,
          keywords: ["未到", "缺席", "absent", "沒來", "取消點名"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                如果學生沒有到場，點擊紅色 <strong className="text-foreground">「未到」</strong> 按鈕：
              </p>
              <ul className="space-y-1 ml-4 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>按鈕變成紅色「未到」標籤</li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>右下角出現「已標記未到」提示</li>
                <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>標記未到的學生 <strong className="text-foreground">不需要填寫聯絡簿</strong></li>
              </ul>
              <img src="/manual/step3-marked-absent.png" alt="標記未到" className="rounded-lg border border-gray-200 w-full" />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                不小心按錯？點擊「未到」標籤旁的 X 按鈕，確認後即可恢復為待點名狀態。
              </div>
              <img src="/manual/step4-unmark-dialog.png" alt="取消未到確認對話框" className="rounded-lg border border-gray-200 w-full" />
            </div>
          ),
        },
        {
          id: "contactbook",
          title: "填寫聯絡簿",
          icon: FileText,
          keywords: ["聯絡簿", "教學紀錄", "作業", "成績", "備註", "上課單元", "儲存"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                完成點名後，請為每位 <strong className="text-foreground">已到</strong> 的學生填寫聯絡簿。
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>在時段卡片中，點擊 <strong className="text-foreground">「填寫聯絡簿」</strong> 按鈕</li>
                <li>系統開啟聯絡簿填寫表單</li>
                <li>依序填寫各項欄位</li>
                <li>點擊 <strong className="text-foreground">「儲存」</strong> 按鈕</li>
                <li>家長即可在家長端即時查看上課紀錄</li>
              </ol>
              <img src="/manual/step7-contact-book-form.png" alt="聯絡簿填寫表單" className="rounded-lg border border-gray-200 w-full" />
              <img src="/manual/step8-contact-book-saved.png" alt="聯絡簿儲存成功" className="rounded-lg border border-gray-200 w-full" />
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">欄位說明：</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">欄位</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">必填</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">家長可見</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-3 py-2">今日上課單元</td><td className="px-3 py-2 text-red-500">必填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr><td className="px-3 py-2">教學進度</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr><td className="px-3 py-2">回家作業</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr><td className="px-3 py-2">下次考試</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr><td className="px-3 py-2">小考成績 / 滿分</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr><td className="px-3 py-2">老師備註</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-green-600">是</td></tr>
                      <tr className="bg-gray-50"><td className="px-3 py-2">內部筆記</td><td className="px-3 py-2 text-muted-foreground">選填</td><td className="px-3 py-2 text-red-500">否</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">「內部筆記」只有老師自己看得到，適合記錄教學觀察或下次上課提醒。</p>
              </div>
            </div>
          ),
        },
        {
          id: "daily-progress",
          title: "每日工作進度",
          icon: ClipboardCheck,
          keywords: ["工作進度", "完成", "進度條", "點名進度", "聯絡簿進度"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                在行事曆下方，有一個每日工作進度卡片，顯示兩個進度條：
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">項目</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">完成條件</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-3 py-2 font-medium">點名進度</td><td className="px-3 py-2 text-muted-foreground">所有學生都已標記「已到」或「未到」</td></tr>
                    <tr><td className="px-3 py-2 font-medium">聯絡簿進度</td><td className="px-3 py-2 text-muted-foreground">所有「已到」的學生都已填寫聯絡簿</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>兩個進度都 100% → 顯示「今日工作已完成」</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>尚未完成 → 顯示「尚有未完成的工作」</span>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "students-group",
      title: "我的學生功能介紹",
      icon: Users,
      color: "border-l-blue-400",
      items: [
        {
          id: "student-list",
          title: "學生列表與搜尋",
          icon: Search,
          keywords: ["學生", "搜尋", "名單", "年級", "學號", "篩選"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                切換到 <strong className="text-foreground">「我的學生」</strong> 分頁，可以查看所有曾經上過您的課的學生。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>頁面列出所有學生卡片，顯示姓名、年級、總上課次數</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>上方有搜尋框，輸入學生姓名即可快速篩選</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>點擊學生卡片可進入該學生的學習歷程</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                搜尋支援部分文字匹配，例如輸入「小」就能找到「小明」「小華」等學生。
              </div>
            </div>
          ),
        },
        {
          id: "student-history",
          title: "學習歷程",
          icon: FileText,
          keywords: ["學習歷程", "歷史紀錄", "過去", "聯絡簿紀錄", "成績變化", "回顧"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                點擊學生卡片後，進入該學生的 <strong className="text-foreground">學習歷程</strong> 頁面。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>依時間倒序列出過去所有的聯絡簿紀錄</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>每筆紀錄顯示：日期、上課單元、成績、作業、老師備註</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>點擊可展開查看完整內容</li>
                <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span>點擊左上角返回箭頭可回到學生列表</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                善用學習歷程回顧學生的學習軌跡，有助於調整教學策略和與家長溝通。
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "materials-group",
      title: "教材庫功能介紹",
      icon: Library,
      color: "border-l-teal-400",
      items: [
        {
          id: "materials-website",
          title: "數學練習網站",
          icon: Library,
          keywords: ["教材庫", "練習", "網站", "數學", "題目", "練習題"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                切換到 <strong className="text-foreground">「教材庫」</strong> 分頁，即可直接瀏覽質數教室的數學練習網站（mathmaster.theprimeclassroom.com）。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-teal-500 font-bold">•</span>網站包含各年級的數學題目與練習資源</li>
                <li className="flex gap-2"><span className="text-teal-500 font-bold">•</span>可直接在頁面內瀏覽，無需另開分頁</li>
                <li className="flex gap-2"><span className="text-teal-500 font-bold">•</span>可配合上課單元，引導學生練習對應題型</li>
              </ul>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
                練習網站的題目內容由總部統一維護更新，老師無法自行新增或刪除題目。
              </div>
            </div>
          ),
        },
        {
          id: "materials-archive",
          title: "期中考歸檔",
          icon: FileText,
          keywords: ["期中考", "歸檔", "PDF", "試卷", "考試", "查閱"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                期中考試卷資源已整合至教材庫網站（<strong className="text-foreground">mathmaster.theprimeclassroom.com</strong>），請直接在教材庫分頁的網站內查閱。
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800">
                教材庫網站的內容由總部統一維護更新。如有疑問，請聯繫分校主任或總部處理。
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "salary-group",
      title: "工作紀錄介紹",
      icon: ClipboardCheck,
      color: "border-l-amber-400",
      items: [
        {
          id: "monthly-summary",
          title: "月度工作總覽",
          icon: Star,
          keywords: ["月度", "排課天數", "完成天數", "完成率", "月報", "統計"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                切換到 <strong className="text-foreground">「工作記錄」</strong> 分頁，上方會顯示當月的工作統計摘要。
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">指標</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">說明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-3 py-2 font-medium">排課天數</td><td className="px-3 py-2 text-muted-foreground">該月有安排課程的總天數</td></tr>
                    <tr><td className="px-3 py-2 font-medium">完成天數</td><td className="px-3 py-2 text-muted-foreground">點名和聯絡簿都已完成的天數</td></tr>
                    <tr><td className="px-3 py-2 font-medium">完成率</td><td className="px-3 py-2 text-muted-foreground">完成天數 / 排課天數 的百分比</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">使用左右箭頭可切換查看不同月份的紀錄。</p>
            </div>
          ),
        },
        {
          id: "daily-status",
          title: "每日完成狀態",
          icon: CheckCircle,
          keywords: ["每日", "完成狀態", "未完成", "點名完成", "聯絡簿完成"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                摘要下方是每日工作明細列表，列出該月每天的完成狀態。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-amber-400 font-bold">•</span>每一天會顯示兩個指標：<strong className="text-foreground">點名</strong> 和 <strong className="text-foreground">聯絡簿</strong></li>
                <li className="flex gap-2"><span className="text-amber-400 font-bold">•</span>兩項都完成：顯示綠色 <Badge className="bg-green-100 text-green-700 text-[10px]">完成</Badge></li>
                <li className="flex gap-2"><span className="text-amber-400 font-bold">•</span>尚未完成：顯示黃色 <Badge className="bg-amber-100 text-amber-700 text-[10px]">未完成</Badge></li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                請務必在當天完成所有點名與聯絡簿。
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "profile-group",
      title: "個人資料介紹",
      icon: User,
      color: "border-l-purple-400",
      items: [
        {
          id: "profile-view",
          title: "查看個人資料",
          icon: User,
          keywords: ["個人資料", "認證", "評分", "評價", "星等", "教室"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                切換到 <strong className="text-foreground">「個人資料」</strong> 分頁，可以查看您的帳號資訊。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span>姓名和所屬教室</li>
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span>認證狀態（通過總部培訓後會顯示認證標章）</li>
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span>評分和評價數（家長給予的評分）</li>
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span>自我介紹和教學專長</li>
              </ul>
            </div>
          ),
        },
        {
          id: "profile-edit",
          title: "編輯自我介紹與專長",
          icon: Edit,
          keywords: ["編輯", "修改", "自我介紹", "教學專長", "bio", "更新資料"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                在個人資料頁面，點擊 <strong className="text-foreground">「編輯資料」</strong> 按鈕可以修改您的資訊。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span><strong className="text-foreground">自我介紹</strong>：描述您的教學理念和風格，家長在搜尋老師時會看到</li>
                <li className="flex gap-2"><span className="text-purple-400 font-bold">•</span><strong className="text-foreground">教學專長</strong>：用逗號分隔多個專長（例如：低年級啟蒙, 數感培養）</li>
              </ul>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
                完整的自我介紹和專長標籤有助於家長選擇適合的老師，建議定期更新。
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>點擊 <strong className="text-foreground">「編輯資料」</strong></li>
                <li>修改自我介紹文字</li>
                <li>修改教學專長（逗號分隔）</li>
                <li>點擊 <strong className="text-foreground">「儲存」</strong></li>
              </ol>
            </div>
          ),
        },
      ],
    },
    {
      id: "other-group",
      title: "其他",
      icon: Settings,
      color: "border-l-gray-400",
      items: [
        {
          id: "login",
          title: "登入系統",
          icon: LogOut,
          keywords: ["登入", "帳號", "密碼", "login", "分校"],
          content: (
            <div className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>開啟瀏覽器，進入質數教室的分校登入頁面</li>
                <li>在上方切換到 <strong className="text-foreground">「老師」</strong> 分頁</li>
                <li>輸入您的帳號（格式：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">姓名@prime</code>）和密碼</li>
                <li>點擊 <strong className="text-foreground">「登入管理系統」</strong></li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                帳號和密碼由分校主任建立並提供給您。如果忘記密碼，請聯繫分校主任重設。
              </div>
              <img src="/manual/step1-dashboard.png" alt="登入頁面" className="rounded-lg border border-gray-200 w-full" />
            </div>
          ),
        },
        {
          id: "notifications",
          title: "通知中心",
          icon: Bell,
          keywords: ["通知", "鈴鐺", "排課異動", "已讀", "新增時段", "移除時段"],
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                頁面右上角的 <strong className="text-foreground">鈴鐺圖示</strong> 是通知中心，點擊可查看最新消息。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-gray-500 font-bold">•</span>紅色數字表示未讀通知數量</li>
                <li className="flex gap-2"><span className="text-gray-500 font-bold">•</span>通知類型包含：
                  <ul className="ml-6 mt-1 space-y-1">
                    <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><CalendarPlus className="w-2.5 h-2.5 text-green-600" /></div>排課新增 — 分校主任將您加入新時段</li>
                    <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center"><CalendarMinus className="w-2.5 h-2.5 text-red-500" /></div>排課移除 — 分校主任將您從某時段移除</li>
                  </ul>
                </li>
                <li className="flex gap-2"><span className="text-gray-500 font-bold">•</span>點擊單則通知可標記為已讀</li>
                <li className="flex gap-2"><span className="text-gray-500 font-bold">•</span>點擊「全部標為已讀」可一次清除所有未讀</li>
              </ul>
            </div>
          ),
        },
        {
          id: "statuses",
          title: "預約狀態對照表",
          icon: FileText,
          keywords: ["狀態", "已確認", "已到", "未到", "已完成", "已取消", "對照"],
          content: (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">狀態</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">老師端顯示</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">家長端顯示</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">已確認</Badge></td><td className="px-3 py-2 text-muted-foreground">顯示「已到」「未到」按鈕</td><td className="px-3 py-2 text-muted-foreground">已確認</td></tr>
                    <tr><td className="px-3 py-2"><Badge className="bg-green-100 text-green-700 text-[10px]">已到</Badge></td><td className="px-3 py-2 text-muted-foreground">綠色「已到」標籤</td><td className="px-3 py-2 text-muted-foreground">上課中</td></tr>
                    <tr><td className="px-3 py-2"><Badge className="bg-red-100 text-red-700 text-[10px]">未到</Badge></td><td className="px-3 py-2 text-muted-foreground">紅色「未到」標籤</td><td className="px-3 py-2 text-muted-foreground">未到</td></tr>
                    <tr><td className="px-3 py-2"><Badge className="bg-blue-100 text-blue-700 text-[10px]">已完成</Badge></td><td className="px-3 py-2 text-muted-foreground">歷史紀錄</td><td className="px-3 py-2 text-muted-foreground">已完成</td></tr>
                    <tr><td className="px-3 py-2"><Badge className="bg-gray-100 text-gray-500 text-[10px]">已取消</Badge></td><td className="px-3 py-2 text-muted-foreground">不顯示</td><td className="px-3 py-2 text-muted-foreground">已取消</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          ),
        },
        {
          id: "faq",
          title: "常見問題",
          icon: HelpCircle,
          keywords: ["常見問題", "FAQ", "按不了", "忘記密碼", "手機", "補填", "按錯"],
          content: (
            <div className="space-y-4">
              {[
                { q: "點名按鈕按不了，顯示灰色？", a: "點名功能會在上課前 15 分鐘自動開放。如果按鈕是灰色的，表示還沒到開放時間，請稍候。" },
                { q: "不小心按錯「已到」或「未到」怎麼辦？", a: "點擊標籤旁邊的 X 按鈕，確認取消後即可恢復為待點名狀態，重新選擇即可。" },
                { q: "學生沒來上課，需要填聯絡簿嗎？", a: "不需要。標記為「未到」的學生不需要填寫聯絡簿，不會影響每日工作完成度。" },
                { q: "下課後忘記填聯絡簿怎麼辦？", a: "聯絡簿可以在課程結束後補填。但建議盡早完成，這樣家長才能即時看到上課紀錄。" },
                { q: "忘記密碼怎麼辦？", a: "請聯繫您的分校主任，主任可以在後台為您重設密碼。" },
                { q: "可以在手機上操作嗎？", a: "可以。老師系統支援手機瀏覽器，操作方式和電腦版相同。" },
                { q: "如何查看過去學生的上課紀錄？", a: "切換到「我的學生」分頁，搜尋學生後點擊卡片，即可查看該學生的完整學習歷程。" },
                { q: "工作記錄的完成率會影響什麼？", a: "完成率反映您每日點名和聯絡簿的完成狀況，建議維持 100% 完成率。" },
              ].map((item, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5">
                    <p className="text-sm font-medium text-foreground">Q: {item.q}</p>
                  </div>
                  <div className="px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ];

  const normalizeSearch = (text: string) => text.toLowerCase().replace(/\s+/g, "");

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = normalizeSearch(searchQuery);
    return groups
      .map((group) => {
        const matchedItems = group.items.filter((item) => {
          const haystack = normalizeSearch(
            [group.title, item.title, ...item.keywords].join(" ")
          );
          return haystack.includes(q);
        });
        if (matchedItems.length > 0) return { ...group, items: matchedItems };
        return null;
      })
      .filter(Boolean) as ManualGroup[];
  }, [searchQuery]);

  return (
    <div className="space-y-3" data-testid="manual-tab">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-5 h-5 text-tiffany" />
          <h2 className="font-serif text-lg tracking-wide text-foreground">老師端使用手冊</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">點擊各章節查看詳細操作說明與畫面截圖</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋功能說明（例如：點名、聯絡簿、密碼...）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tiffany/30 focus:border-tiffany transition-colors"
            data-testid="input-manual-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-manual-search-clear"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center" data-testid="manual-no-results">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">找不到「{searchQuery}」的相關說明</p>
          <button onClick={() => setSearchQuery("")} className="text-sm text-tiffany mt-2 hover:underline">清除搜尋</button>
        </div>
      )}

      {filteredGroups.map((group) => (
        <div key={group.id} className={`bg-white rounded-xl border border-gray-100 overflow-hidden border-l-4 ${group.color}`} data-testid={`manual-group-${group.id}`}>
          <button
            onClick={() => toggleGroup(group.id)}
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            data-testid={`button-group-${group.id}`}
          >
            <group.icon className="w-5 h-5 text-tiffany flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground flex-1">{group.title}</span>
            <span className="text-xs text-muted-foreground mr-1">{group.items.length} 項</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedGroup === group.id ? "rotate-180" : ""}`} />
          </button>

          {(expandedGroup === group.id || searchQuery.trim()) && (
            <div className="border-t border-gray-100">
              {group.items.map((item) => (
                <div key={item.id} data-testid={`manual-item-${item.id}`}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center gap-3 px-5 pl-8 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50"
                    data-testid={`button-item-${item.id}`}
                  >
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1">{item.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expandedItem === item.id ? "rotate-90" : ""}`} />
                  </button>
                  {expandedItem === item.id && (
                    <div className="px-5 pl-8 pb-4 pt-3 bg-gray-50/50">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">最後更新：2026 年 4 月</p>
      </div>
    </div>
  );
}

// ─── Materials Tab ────────────────────────────────────────────────────────────
function MaterialsTab() {
  return (
    <div className="space-y-4" data-testid="materials-tab">
      <iframe
        src="https://mathmaster.theprimeclassroom.com/"
        className="w-full rounded-lg border-0"
        style={{ height: "82vh" }}
        title="教材庫"
        data-testid="iframe-materials-external"
        allow="fullscreen"
      />
    </div>
  );
}
