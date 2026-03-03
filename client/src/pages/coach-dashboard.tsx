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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

const PERFORMANCE_OPTIONS = [
  { value: "excellent", label: "優秀", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "good", label: "良好", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "fair", label: "尚可", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "needs_improvement", label: "需加強", color: "bg-red-100 text-red-700 border-red-200" },
];

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function getPerformanceLabel(value: string) {
  return PERFORMANCE_OPTIONS.find(o => o.value === value)?.label || value;
}

function getPerformanceBadge(value: string) {
  const option = PERFORMANCE_OPTIONS.find(o => o.value === value);
  if (!option) return null;
  return <Badge variant="outline" className={option.color}>{option.label}</Badge>;
}

export default function CoachDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"calendar" | "students" | "profile">("calendar");
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
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-coach-logout">
            <LogOut className="w-4 h-4 mr-1" />
            登出
          </Button>
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
          <h3 className="text-sm font-semibold text-foreground px-1" data-testid="text-selected-date">
            {selectedDate} 的排課
          </h3>
          {selectedSlots.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-muted-foreground">
              這天沒有排課
            </div>
          ) : (
            selectedSlots.map(slot => (
              <SlotCard key={slot.id} slot={slot} onOpenContactBook={() => setContactBookSlot(slot)} />
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

function SlotCard({ slot, onOpenContactBook }: { slot: any; onOpenContactBook: () => void }) {
  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/coach/slots", slot.id, "students"],
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

function ContactBookDialog({ slot, coachId, onClose }: { slot: any; coachId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/slots", slot.id, "students"],
  });

  const { data: existingBooks = [] } = useQuery<any[]>({
    queryKey: ["/api/coach/contact-books/slot", slot.id],
  });

  const [sharedUnit, setSharedUnit] = useState("");
  const [sharedProgress, setSharedProgress] = useState("");
  const [activeStudentIdx, setActiveStudentIdx] = useState(0);
  const [studentData, setStudentData] = useState<Record<number, {
    performance: string;
    classNotes: string;
    quizScore: string;
    quizTotal: string;
    homework: string;
    teacherRemarks: string;
  }>>({});

  const initStudentData = (childId: number) => {
    if (studentData[childId]) return studentData[childId];
    const existing = existingBooks.find((b: any) => b.childId === childId);
    if (existing) {
      return {
        performance: existing.performance || "good",
        classNotes: existing.classNotes || "",
        quizScore: existing.quizScore?.toString() || "",
        quizTotal: existing.quizTotal?.toString() || "100",
        homework: existing.homework || "",
        teacherRemarks: existing.teacherRemarks || "",
      };
    }
    return {
      performance: "good",
      classNotes: "",
      quizScore: "",
      quizTotal: "100",
      homework: "",
      teacherRemarks: "",
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

  useMemo(() => {
    if (existingBooks.length > 0 && !sharedUnit) {
      setSharedUnit(existingBooks[0].lessonUnit || "");
      setSharedProgress(existingBooks[0].lessonProgress || "");
    }
  }, [existingBooks]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = students.map((s: any) => {
        const data = getStudentFormData(s.childId);
        return {
          bookingId: s.bookingId,
          childId: s.childId,
          lessonDate: slot.date,
          lessonUnit: sharedUnit,
          lessonProgress: sharedProgress,
          performance: data.performance,
          classNotes: data.classNotes,
          quizScore: data.quizScore ? parseInt(data.quizScore) : null,
          quizTotal: data.quizTotal ? parseInt(data.quizTotal) : 100,
          homework: data.homework || null,
          teacherRemarks: data.teacherRemarks || null,
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
          <div className="bg-tiffany/5 rounded-lg p-3 space-y-3">
            <p className="text-xs font-semibold text-tiffany uppercase tracking-wider">共用資訊</p>
            <div>
              <Label className="text-xs">今日上課單元 *</Label>
              <Input
                value={sharedUnit}
                onChange={e => setSharedUnit(e.target.value)}
                placeholder="例：三位數加減法"
                className="mt-1"
                data-testid="input-lesson-unit"
              />
            </div>
            <div>
              <Label className="text-xs">教學進度</Label>
              <Input
                value={sharedProgress}
                onChange={e => setSharedProgress(e.target.value)}
                placeholder="例：課本第3章 p.45-52"
                className="mt-1"
                data-testid="input-lesson-progress"
              />
            </div>
          </div>

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
                <Label className="text-xs">學習表現 *</Label>
                <Select
                  value={currentData.performance}
                  onValueChange={v => updateStudentField(currentStudent.childId, "performance", v)}
                >
                  <SelectTrigger className="mt-1" data-testid="select-performance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERFORMANCE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">課堂筆記</Label>
                <Textarea
                  value={currentData.classNotes}
                  onChange={e => updateStudentField(currentStudent.childId, "classNotes", e.target.value)}
                  placeholder="描述學生今日學習狀況、理解程度..."
                  className="mt-1 min-h-[80px]"
                  data-testid="textarea-class-notes"
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
                <Label className="text-xs">老師備註（給家長）</Label>
                <Textarea
                  value={currentData.teacherRemarks}
                  onChange={e => updateStudentField(currentStudent.childId, "teacherRemarks", e.target.value)}
                  placeholder="選填，私人訊息給家長"
                  className="mt-1 min-h-[60px]"
                  data-testid="textarea-teacher-remarks"
                />
              </div>
            </div>
          )}

          <Button
            className="w-full bg-tiffany hover:bg-tiffany/90 text-white"
            disabled={!sharedUnit || saveMutation.isPending}
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
            {getPerformanceBadge(entry.performance)}
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
