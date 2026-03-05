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
} from "lucide-react";
import type { Notification } from "@shared/schema";

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CoachDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"calendar" | "students" | "salary" | "profile">("calendar");
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
    { id: "salary" as const, label: "工作記錄", icon: ClipboardCheck },
    { id: "profile" as const, label: "個人資料", icon: User },
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
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Bell className="w-3.5 h-3.5 text-tiffany" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
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

        {activeTab === "calendar" && <CalendarTab coachId={userData.coach?.id} />}
        {activeTab === "students" && <StudentsTab coachId={userData.coach?.id} />}
        {activeTab === "salary" && <SalaryTab coachId={userData.coach?.id} />}
        {activeTab === "profile" && <ProfileTab />}
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
    </div>
  );
}

function CalendarTab({ coachId }: { coachId: number }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [contactBookSlot, setContactBookSlot] = useState<any>(null);

  const { data: slots = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/calendar", year, month],
    enabled: !!coachId,
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
      setCanCheckIn(now >= earliest && now <= slotEnd);
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
                    {!isSlotEnded && (
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
                    )}
                  </>
                ) : s.status === "absent" ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full" data-testid={`badge-absent-${s.bookingId}`}>
                      <UserX className="w-3 h-3" />
                      未到
                    </span>
                    {!isSlotEnded && (
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
                    )}
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
        <p className="text-[10px] text-amber-600/80 mt-2">完成所有點名與聯絡簿填寫後，此日才計入薪資計算</p>
      )}
    </div>
  );
}

function ContactBookDialog({ slot, coachId, onClose }: { slot: any; coachId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/slots", slot.id, "students"],
  });

  const { data: existingBooks = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/contact-books/slot", slot.id],
  });

  const [activeStudentIdx, setActiveStudentIdx] = useState(0);
  const [studentData, setStudentData] = useState<Record<number, {
    lessonUnit: string;
    lessonProgress: string;
    homework: string;
    nextExam: string;
    quizScore: string;
    quizTotal: string;
    teacherRemarks: string;
    internalNotes: string;
  }>>({});

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
    };
  };

  const getStudentFormData = (childId: number) => {
    return studentData[childId] || initStudentData(childId);
  };

  const updateStudentField = (childId: number, field: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [childId]: {
        ...initStudentData(childId),
        ...prev[childId],
        [field]: value,
      },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = students.map((s: any) => {
        const data = getStudentFormData(s.childId);
        return {
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
      });
      await apiRequest("POST", "/api/coach/contact-books", { entries });
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

  const currentStudent = students[activeStudentIdx];
  const currentData = currentStudent ? getStudentFormData(currentStudent.childId) : null;
  const hasExisting = existingBooks.length > 0;

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
          {students.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {students.map((s: any, idx: number) => (
                <button
                  key={s.childId}
                  onClick={() => setActiveStudentIdx(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    idx === activeStudentIdx
                      ? "bg-tiffany text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`student-tab-${s.childId}`}
                >
                  {s.childName}
                </button>
              ))}
            </div>
          )}

          {currentStudent && currentData && (
            <div className="space-y-3 border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-tiffany/10 flex items-center justify-center">
                  <span className="text-xs text-tiffany font-bold">{currentStudent.childName[0]}</span>
                </div>
                <span className="font-semibold text-sm">{currentStudent.childName}</span>
                <span className="text-xs text-muted-foreground">{currentStudent.childGrade}年級</span>
              </div>

              <div>
                <Label className="text-xs">今日上課單元 *</Label>
                <Input
                  value={currentData.lessonUnit}
                  onChange={e => updateStudentField(currentStudent.childId, "lessonUnit", e.target.value)}
                  placeholder="例：三位數加減法"
                  className="mt-1"
                  data-testid="input-lesson-unit"
                />
              </div>

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
            </div>
          )}

          <Button
            className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
            disabled={students.some((s: any) => !getStudentFormData(s.childId).lessonUnit) || saveMutation.isPending}
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
            <p className="text-xs text-muted-foreground">{s.grade}年級 · {s.bookingCount} 堂課</p>
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

function SalaryTab({ coachId }: { coachId: number }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: records = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/monthly-records", year, month],
    enabled: !!coachId,
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const allDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    allDates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const recordMap = new Map(records.map(r => [r.date, r]));
  const completedDays = records.filter(r => r.isComplete).length;
  const workDays = records.filter(r => r.totalSlots > 0).length;
  const completionRate = workDays > 0 ? Math.round((completedDays / workDays) * 100) : 0;

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-salary-prev">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-base font-semibold" data-testid="text-salary-month">{year} 年 {month} 月 工作記錄</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-salary-next">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-2xl font-bold text-foreground" data-testid="text-work-days">{workDays}</p>
            <p className="text-xs text-muted-foreground">排課天數</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <p className="text-2xl font-bold text-green-600" data-testid="text-completed-days">{completedDays}</p>
            <p className="text-xs text-muted-foreground">完成天數</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-tiffany/10">
            <p className="text-2xl font-bold text-tiffany" data-testid="text-completion-rate">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">完成率</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground bg-amber-50 p-2 rounded-lg mb-4">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
          只有完成所有當日工作（點名 + 聯絡簿）的日期才計入薪資計算
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
          本月尚無工作記錄
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {records
              .filter(r => r.totalSlots > 0)
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((r: any) => {
                const d = new Date(r.date + "T00:00:00");
                const dayLabel = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
                return (
                  <div key={r.date} className="flex items-center px-4 py-3 gap-3" data-testid={`salary-row-${r.date}`}>
                    <div className="w-16 text-center">
                      <p className="text-sm font-semibold">{r.date.slice(5)}</p>
                      <p className="text-[10px] text-muted-foreground">週{dayLabel}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle className={`w-3.5 h-3.5 ${r.checkedInSlots === r.totalSlots ? "text-green-500" : "text-gray-300"}`} />
                        <span className="text-muted-foreground">點名 {r.checkedInSlots}/{r.totalSlots}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <FileText className={`w-3.5 h-3.5 ${r.contactBookSlots === r.totalSlots ? "text-green-500" : "text-gray-300"}`} />
                        <span className="text-muted-foreground">聯絡簿 {r.contactBookSlots}/{r.totalSlots}</span>
                      </div>
                    </div>
                    <div>
                      {r.isComplete ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full" data-testid={`badge-complete-${r.date}`}>
                          <CheckCircle className="w-3 h-3" />
                          完成
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" data-testid={`badge-incomplete-${r.date}`}>
                          <AlertTriangle className="w-3 h-3" />
                          未完成
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
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
