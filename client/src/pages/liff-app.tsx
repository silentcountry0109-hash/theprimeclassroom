import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/hooks/use-liff";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewTab } from "@/components/parent/tabs/OverviewTab";
import { ContactBookTab } from "@/components/parent/tabs/ContactBookTab";
import {
  Home,
  CalendarPlus,
  CalendarDays,
  BookOpen,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Child { id: number; name: string; gender: string; grade: number; school?: string | null; }
interface BookingItem {
  id: number;
  childId: number;
  childName?: string;
  status: string;
  slotDate?: string | null;
  slotStartTime?: string | null;
  slotEndTime?: string | null;
  franchiseName?: string | null;
  coachName?: string | null;
}
interface WalletData {
  balance: number;
  balances: Array<{ remainingCredits: number; expiresAt: string | null }>;
  expiringBalances: Array<{ credits: number; expiresAt: string; daysLeft: number }>;
}
interface FranchiseLite { id: number; name: string; city?: string; district?: string; address?: string; }
interface SlotInfo {
  id: number;
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  coachName?: string;
  classroomName?: string;
}
interface FranchiseDetail {
  franchise: FranchiseLite;
  slots: SlotInfo[];
  coaches?: Array<{ id: number; name: string }>;
}
interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  expiryDays: number;
  description?: string | null;
  isActive: boolean;
}
interface PromotionItem { id: number; title: string; description?: string; }

const TABS = [
  { id: "overview", label: "首頁", icon: Home, path: "/liff" },
  { id: "book", label: "預約", icon: CalendarPlus, path: "/liff/book" },
  { id: "schedule", label: "課表", icon: CalendarDays, path: "/liff/schedule" },
  { id: "contact-book", label: "聯絡簿", icon: BookOpen, path: "/liff/contact-book" },
  { id: "credits", label: "點數", icon: Wallet, path: "/liff/credits" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function getTabFromPath(path: string): TabId {
  // 別名(圖文選單/深連結用):bookings→schedule、wallet/shop→credits。
  // bookings 必須先於 book 判斷("/liff/bookings".startsWith("/liff/book") 為真)。
  if (path.startsWith("/liff/bookings")) return "schedule";
  if (path.startsWith("/liff/book")) return "book";
  if (path.startsWith("/liff/schedule")) return "schedule";
  if (path.startsWith("/liff/contact-book")) return "contact-book";
  if (path.startsWith("/liff/credits")) return "credits";
  if (path.startsWith("/liff/wallet")) return "credits";
  if (path.startsWith("/liff/shop")) return "credits";
  return "overview";
}

function LiffShell({
  user,
  lineProfile,
  openExternal,
}: {
  user: any;
  lineProfile: { displayName: string; pictureUrl?: string };
  openExternal: (url: string) => void;
}) {
  const [location, setLocation] = useLocation();
  const activeTab = getTabFromPath(location);

  // 共用元件用正規 tab id 導覽;此處對應回 /liff/* 路徑(LIFF 無 children/shop tab)。
  const liffNavigate = (tab: string) => {
    const map: Record<string, string> = {
      overview: "/liff",
      book: "/liff/book",
      bookings: "/liff/schedule",
      credits: "/liff/credits",
      "contact-book": "/liff/contact-book",
      children: "/liff",
      shop: "/liff/credits",
    };
    setLocation(map[tab] ?? "/liff");
  };

  return (
    <div className="min-h-screen bg-washi flex flex-col" data-testid="liff-shell">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {lineProfile.pictureUrl ? (
            <img src={lineProfile.pictureUrl} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-tiffany/20" />
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground leading-none">質數教室</p>
            <p className="text-sm font-semibold text-foreground truncate" data-testid="text-liff-username">
              {user.firstName || lineProfile.displayName}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto px-4 py-4">
          {activeTab === "overview" && (
            <OverviewTab user={user} navigate={liffNavigate} enableShop={false} enableChildrenTab={false} />
          )}
          {activeTab === "book" && <BookTab />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "contact-book" && <ContactBookTab enableLearningSummary={false} />}
          {activeTab === "credits" && <CreditsTab openExternal={openExternal} />}
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-inset-bottom"
        data-testid="liff-tab-bar"
      >
        <div className="max-w-md mx-auto grid grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setLocation(t.path)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 gap-0.5 transition-colors ${
                  isActive ? "text-tiffany" : "text-muted-foreground"
                }`}
                data-testid={`liff-tab-${t.id}`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


function BookTab() {
  const { toast } = useToast();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const { data: franchises = [], isLoading: franchisesLoading } = useQuery<FranchiseLite[]>({
    queryKey: ["/api/franchises"],
  });
  const { data: favorites = [] } = useQuery<FranchiseLite[]>({
    queryKey: ["/api/favorite-franchises"],
  });
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);
  const sortedFranchises = useMemo(() => {
    return [...franchises].sort((a, b) => {
      const fa = favoriteIds.has(a.id) ? 0 : 1;
      const fb = favoriteIds.has(b.id) ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [franchises, favoriteIds]);
  const { data: children = [] } = useQuery<Child[]>({ queryKey: ["/api/children"] });
  const { data: detail, isLoading: detailLoading } = useQuery<FranchiseDetail>({
    queryKey: ["/api/franchises", selectedFranchiseId, "detail"],
    queryFn: async () => {
      const res = await fetch(`/api/franchises/${selectedFranchiseId}/detail`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!selectedFranchiseId,
  });
  const { data: myBookings = [] } = useQuery<BookingItem[]>({ queryKey: ["/api/bookings"] });

  const bookMutation = useMutation({
    mutationFn: async (data: { slotId: number; childId: number }) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "預約成功" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchises", selectedFranchiseId, "detail"] });
      setSelectedSlotId(null);
      setSelectedChildId("");
    },
    onError: (err: Error) => {
      let msg = err.message;
      try {
        const parsed = JSON.parse(msg.replace(/^\d+:\s*/, ""));
        msg = parsed.message || msg;
      } catch {}
      toast({ title: "預約失敗", description: msg, variant: "destructive" });
    },
  });

  const selectedFranchise = franchises.find((f) => f.id === selectedFranchiseId);
  const availableSlots = useMemo(() => {
    if (!detail?.slots) return [];
    const todayTw = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
    const threeDaysFromNow = new Date(todayTw + "T00:00:00+08:00");
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return detail.slots
      .filter((s) => s.booked < s.capacity)
      .filter((s) => new Date(s.date + "T00:00:00+08:00") >= threeDaysFromNow)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [detail]);

  const selectedSlot = availableSlots.find((s) => s.id === selectedSlotId);

  // 教室選擇
  if (!selectedFranchiseId) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">預約課程</h1>
          <p className="text-sm text-muted-foreground">選擇要上課的教室</p>
        </div>
        {franchisesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : franchises.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-sm text-muted-foreground">目前沒有可預約的教室</div>
        ) : (
          <div className="space-y-2">
            {sortedFranchises.map((f) => {
              const isFav = favoriteIds.has(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFranchiseId(f.id)}
                  className={`w-full text-left bg-white rounded-xl border p-4 transition flex items-center justify-between gap-3 ${
                    isFav ? "border-coral/40 ring-1 ring-coral/20" : "border-gray-100 hover:border-tiffany/30"
                  }`}
                  data-testid={`button-franchise-${f.id}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                      {isFav && (
                        <span className="text-[10px] bg-coral/10 text-coral px-1.5 py-0.5 rounded-full flex-shrink-0" data-testid={`badge-favorite-${f.id}`}>
                          已收藏
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {f.city || ""}{f.district || ""}{f.address ? ` · ${f.address}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 時段選擇
  if (selectedFranchiseId && !selectedSlotId) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setSelectedFranchiseId(null); }}
          className="flex items-center gap-1 text-sm text-muted-foreground"
          data-testid="button-back-to-franchises"
        >
          <ArrowLeft className="w-4 h-4" /> 換教室
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground" data-testid="text-selected-franchise">
            {selectedFranchise?.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {selectedFranchise?.city}{selectedFranchise?.district}
          </p>
        </div>
        {detailLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-center text-sm text-muted-foreground">
            目前沒有可預約的時段（需於 3 天前預約）
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">共 {availableSlots.length} 個可預約時段</p>
            {availableSlots.map((s) => {
              const weekday = ["日", "一", "二", "三", "四", "五", "六"][new Date(s.date + "T00:00:00").getDay()];
              const left = s.capacity - s.booked;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-tiffany/30 p-3 transition"
                  data-testid={`button-slot-${s.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {s.date}（{weekday}）{s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.coachName ? `${s.coachName} 老師` : ""}
                        {s.classroomName ? ` · ${s.classroomName}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full flex-shrink-0">
                      剩 {left} 位
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 選孩子並確認
  return (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedSlotId(null)}
        className="flex items-center gap-1 text-sm text-muted-foreground"
        data-testid="button-back-to-slots"
      >
        <ArrowLeft className="w-4 h-4" /> 換時段
      </button>
      <div className="bg-white rounded-2xl border border-tiffany/20 p-4">
        <p className="text-xs text-muted-foreground mb-1">您選擇的時段</p>
        <p className="text-base font-semibold text-foreground" data-testid="text-confirm-franchise">
          {selectedFranchise?.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedSlot?.date} {selectedSlot?.startTime.slice(0, 5)}–{selectedSlot?.endTime.slice(0, 5)}
          {selectedSlot?.coachName ? ` · ${selectedSlot.coachName} 老師` : ""}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl border p-5 text-sm text-muted-foreground text-center">
          請先在「質數教室」官網新增孩子資料後再預約。
        </div>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">選擇孩子</label>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger data-testid="select-child">
                <SelectValue placeholder="請選擇孩子" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}（{c.grade}年級）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full rounded-full"
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            disabled={!selectedChildId || bookMutation.isPending}
            onClick={() => bookMutation.mutate({ slotId: selectedSlotId!, childId: parseInt(selectedChildId) })}
            data-testid="button-confirm-booking"
          >
            {bookMutation.isPending ? "預約中…" : "確認預約（扣 1 堂）"}
          </Button>
          <p className="text-[11px] text-center text-muted-foreground">需於上課日 3 天前預約</p>
        </>
      )}

      {myBookings.filter((b) => b.status === "confirmed" || b.status === "checked_in").length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">已預約</p>
          <div className="space-y-1.5">
            {myBookings
              .filter((b) => b.status === "confirmed" && b.slotDate)
              .slice(0, 3)
              .map((b) => (
                <div key={b.id} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-foreground" data-testid={`mini-booking-${b.id}`}>
                  {b.slotDate} {b.slotStartTime?.slice(0, 5)} · {b.franchiseName}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekView({ bookings, onCancel, canCancel }: { bookings: BookingItem[]; onCancel: (b: BookingItem) => void; canCancel: (b: BookingItem) => boolean }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekStart, weekDays } = useMemo(() => {
    const todayTw = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    const dow = todayTw.getDay(); // 0=Sun
    const monOffset = dow === 0 ? -6 : 1 - dow;
    const start = new Date(todayTw);
    start.setDate(todayTw.getDate() + monOffset + weekOffset * 7);
    start.setHours(0, 0, 0, 0);
    const days: Array<{ date: string; label: string; dayName: string }> = [];
    const dayNames = ["一", "二", "三", "四", "五", "六", "日"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ date: dateStr, label: `${d.getMonth() + 1}/${d.getDate()}`, dayName: dayNames[i] });
    }
    return { weekStart: start, weekDays: days };
  }, [weekOffset]);

  const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} 起 7 天`;
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, BookingItem[]>();
    for (const b of bookings) {
      if (!b.slotDate) continue;
      if (!map.has(b.slotDate)) map.set(b.slotDate, []);
      map.get(b.slotDate)!.push(b);
    }
    for (const arr of map.values()) arr.sort((a, b) => (a.slotStartTime || "").localeCompare(b.slotStartTime || ""));
    return map;
  }, [bookings]);

  return (
    <div className="space-y-3" data-testid="week-view">
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-3 py-2">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="text-xs text-tiffany px-2" data-testid="button-week-prev">← 上週</button>
        <p className="text-sm font-medium text-foreground" data-testid="text-week-label">{weekLabel}</p>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="text-xs text-tiffany px-2" data-testid="button-week-next">下週 →</button>
      </div>
      <div className="space-y-1.5">
        {weekDays.map((d) => {
          const items = bookingsByDate.get(d.date) || [];
          return (
            <div key={d.date} className="bg-white rounded-xl border border-gray-100 p-2.5" data-testid={`week-day-${d.date}`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-foreground">週{d.dayName} · {d.label}</p>
                {items.length === 0 && <span className="text-[10px] text-muted-foreground">無課程</span>}
              </div>
              {items.length > 0 && (
                <div className="space-y-1">
                  {items.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 text-xs bg-tiffany/5 rounded px-2 py-1.5" data-testid={`week-booking-${b.id}`}>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {b.slotStartTime?.slice(0, 5)}–{b.slotEndTime?.slice(0, 5)} · {b.franchiseName}
                        </p>
                        {(b.childName || b.coachName) && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {b.childName ? `${b.childName}` : ""}
                            {b.childName && b.coachName ? " · " : ""}
                            {b.coachName ? `${b.coachName} 老師` : ""}
                          </p>
                        )}
                      </div>
                      {canCancel(b) && (
                        <button onClick={() => onCancel(b)} className="text-[10px] text-red-500 flex-shrink-0" data-testid={`week-cancel-${b.id}`}>取消</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const { toast } = useToast();
  const { data: bookings = [], isLoading } = useQuery<BookingItem[]>({ queryKey: ["/api/bookings"] });
  const { data: wallet } = useQuery<WalletData>({ queryKey: ["/api/parent/wallet"] });
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "week">("list");

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      toast({ title: "已取消預約" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/wallet"] });
      setCancelTarget(null);
    },
    onError: (err: Error) => {
      let msg = err.message;
      try { msg = JSON.parse(msg.replace(/^\d+:\s*/, "")).message || msg; } catch {}
      toast({ title: "取消失敗", description: msg, variant: "destructive" });
    },
  });

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const ak = `${a.slotDate} ${a.slotStartTime}`;
      const bk = `${b.slotDate} ${b.slotStartTime}`;
      const upA = a.status === "confirmed" || a.status === "checked_in";
      const upB = b.status === "confirmed" || b.status === "checked_in";
      if (upA && !upB) return -1;
      if (!upA && upB) return 1;
      return upA ? ak.localeCompare(bk) : bk.localeCompare(ak);
    });
  }, [bookings]);

  const canCancel = (b: BookingItem) => {
    if (b.status !== "confirmed") return false;
    if (!b.slotDate || !b.slotStartTime) return false;
    const lessonStart = new Date(`${b.slotDate}T${b.slotStartTime}+08:00`);
    return lessonStart.getTime() - Date.now() > 4 * 3600 * 1000;
  };

  const statusLabel: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "已預約", cls: "bg-tiffany/10 text-tiffany" },
    checked_in: { label: "上課中", cls: "bg-orange-50 text-orange-600" },
    completed: { label: "已完成", cls: "bg-green-50 text-green-600" },
    cancelled: { label: "已取消", cls: "bg-gray-100 text-gray-500" },
    absent: { label: "未到", cls: "bg-red-50 text-red-600" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">我的課表</h1>
        <p className="text-sm text-muted-foreground">查看與管理已預約的課程</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between" data-testid="card-schedule-wallet">
        <div>
          <p className="text-[11px] text-muted-foreground">目前剩餘點數</p>
          <p className="text-lg font-bold text-tiffany">{wallet?.balance ?? 0} 堂</p>
        </div>
        <Link href="/liff/credits" className="text-xs text-tiffany flex items-center gap-1" data-testid="link-schedule-to-credits">
          購買點數 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-full p-1" data-testid="schedule-view-toggle">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 text-xs py-1.5 rounded-full transition ${viewMode === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
          data-testid="button-view-list"
        >
          清單
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`flex-1 text-xs py-1.5 rounded-full transition ${viewMode === "week" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
          data-testid="button-view-week"
        >
          週視圖
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-sm text-muted-foreground" data-testid="schedule-empty">
          目前沒有任何預約紀錄
        </div>
      ) : viewMode === "week" ? (
        <WeekView bookings={sorted.filter((b) => b.status === "confirmed" || b.status === "checked_in")} onCancel={(b) => canCancel(b) && setCancelTarget(b)} canCancel={canCancel} />
      ) : (
        <div className="space-y-2">
          {sorted.map((b) => {
            const st = statusLabel[b.status] || { label: b.status, cls: "bg-gray-100 text-gray-500" };
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-3" data-testid={`booking-card-${b.id}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{b.franchiseName || "教室"}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${st.cls}`}>{st.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {b.slotDate} {b.slotStartTime?.slice(0, 5)}–{b.slotEndTime?.slice(0, 5)}
                </p>
                {(b.childName || b.coachName) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.childName ? `學生：${b.childName}` : ""}
                    {b.childName && b.coachName ? " · " : ""}
                    {b.coachName ? `${b.coachName} 老師` : ""}
                  </p>
                )}
                {canCancel(b) && (
                  <button
                    onClick={() => setCancelTarget(b)}
                    className="mt-2 text-xs text-red-500 hover:text-red-600"
                    data-testid={`button-cancel-${b.id}`}
                  >
                    取消預約
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-4" data-testid="dialog-cancel">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-foreground mb-2">確認取消預約？</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {cancelTarget.slotDate} {cancelTarget.slotStartTime?.slice(0, 5)} · {cancelTarget.franchiseName}
              <br />
              <span className="text-xs">取消後將自動退還 1 堂點數。</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)} data-testid="button-cancel-dismiss">
                返回
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: "#ef4444", color: "white" }}
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancelTarget.id)}
                data-testid="button-cancel-confirm"
              >
                {cancelMutation.isPending ? "處理中…" : "確認取消"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function CreditsTab({ openExternal }: { openExternal: (url: string) => void }) {
  const { toast } = useToast();
  const { data: wallet } = useQuery<WalletData>({ queryKey: ["/api/parent/wallet"] });
  const { data: pkgData, isLoading } = useQuery<{ packages: CreditPackage[]; promotions: PromotionItem[] }>({
    queryKey: ["/api/credit-packages"],
  });
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasingId(pkg.id);
    try {
      const res = await apiRequest("POST", "/api/payment/ecpay/create", { packageId: pkg.id });
      const data = await res.json() as { actionUrl: string; params: Record<string, string>; launchUrl?: string };
      // 使用伺服器代管的 launch URL（避免 blob: 在 LINE 外部瀏覽器無法解析的問題）
      if (!data.launchUrl) throw new Error("伺服器未提供結帳連結");
      const absoluteLaunchUrl = `${window.location.origin}${data.launchUrl}`;
      openExternal(absoluteLaunchUrl);
      toast({ title: "已開啟結帳頁面", description: "請於外部瀏覽器完成付款" });
    } catch (err: any) {
      let msg = err?.message || "建立訂單失敗";
      try { msg = JSON.parse(msg.replace(/^\d+:\s*/, "")).message || msg; } catch {}
      toast({ title: "無法建立訂單", description: msg, variant: "destructive" });
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">購買點數</h1>
        <p className="text-sm text-muted-foreground">點數通用於所有分校</p>
      </div>

      <div className="bg-gradient-to-br from-tiffany/10 to-tiffany/5 rounded-2xl border border-tiffany/20 p-4" data-testid="card-current-balance">
        <p className="text-xs text-muted-foreground">目前剩餘</p>
        <p className="text-3xl font-bold text-tiffany">{wallet?.balance ?? 0} 堂</p>
        {wallet?.expiringBalances && wallet.expiringBalances.length > 0 && (
          <div className="mt-2 space-y-1" data-testid="list-expiring-batches">
            <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              即將到期堂數
            </p>
            {wallet.expiringBalances.map((b, i) => (
              <div key={i} className="text-[11px] text-amber-700 flex items-center justify-between bg-amber-50/50 rounded px-2 py-1" data-testid={`expiring-batch-${i}`}>
                <span>{b.credits} 堂</span>
                <span>{b.daysLeft} 天後到期（{b.expiresAt.slice(0, 10)}）</span>
              </div>
            ))}
          </div>
        )}
        {wallet?.balances && wallet.balances.length > 0 && (
          <details className="mt-2">
            <summary className="text-[11px] text-muted-foreground cursor-pointer">查看所有有效批次</summary>
            <div className="mt-1 space-y-0.5" data-testid="list-all-batches">
              {wallet.balances.map((b, i) => (
                <div key={i} className="text-[11px] text-muted-foreground flex justify-between" data-testid={`batch-${i}`}>
                  <span>{b.remainingCredits} 堂</span>
                  <span>{b.expiresAt ? `到期：${b.expiresAt.slice(0, 10)}` : "無到期日"}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : !pkgData?.packages?.length ? (
        <div className="bg-white rounded-xl border p-6 text-center text-sm text-muted-foreground">目前沒有可購買的方案</div>
      ) : (
        <div className="space-y-2">
          {pkgData.packages.filter((p) => p.isActive).map((p) => {
            const perCredit = p.credits > 0 ? Math.round(p.price / p.credits) : 0;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4" data-testid={`package-card-${p.id}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground" data-testid={`text-pkg-name-${p.id}`}>{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.credits} 堂 · {p.expiryDays} 天內有效 · 平均 ${perCredit}/堂
                    </p>
                    {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-tiffany" data-testid={`text-pkg-price-${p.id}`}>${p.price}</p>
                  </div>
                </div>
                {/* 刷卡付費即將上線:質數教室獨立金流尚未開通,暫時停用。
                    恢復:disabled 改回 {purchasingId === p.id}、加回 onClick={() => handlePurchase(p)}、文字改回「立即購買」。 */}
                <Button
                  className="w-full rounded-full"
                  style={{ cursor: "not-allowed" }}
                  disabled
                  data-testid={`button-purchase-${p.id}`}
                >
                  即將上線
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center">
        線上刷卡購買即將上線,敬請期待 🙏
      </p>
    </div>
  );
}

function LiffLoading() {
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-6">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-tiffany animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground" data-testid="text-liff-loading">正在從 LINE 取得身分…</p>
      </div>
    </div>
  );
}

function LiffMessageScreen({
  title,
  message,
  action,
  variant = "info",
}: {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  variant?: "info" | "warn" | "error";
}) {
  const color = variant === "error" ? "text-red-500" : variant === "warn" ? "text-amber-500" : "text-tiffany";
  return (
    <div className="min-h-screen bg-washi flex items-center justify-center px-6" data-testid={`liff-screen-${variant}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm w-full text-center">
        <AlertCircle className={`w-12 h-12 ${color} mx-auto mb-3`} />
        <h2 className="text-base font-semibold text-foreground mb-2" data-testid="text-liff-message-title">{title}</h2>
        <p className="text-sm text-muted-foreground whitespace-pre-line mb-4" data-testid="text-liff-message-body">{message}</p>
        {action && (
          <Button
            onClick={action.onClick}
            className="w-full rounded-full"
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            data-testid="button-liff-action"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LiffApp() {
  const { state, retry, openExternal } = useLiff();

  if (state.status === "loading") return <LiffLoading />;
  if (state.status === "no-liff-id") {
    return <LiffMessageScreen title="尚未設定 LIFF" message={state.message} variant="error" />;
  }
  if (state.status === "not-in-liff") {
    return (
      <LiffMessageScreen
        title="請從 LINE 開啟"
        message={"此頁面為 LINE 內嵌應用，請使用 LINE App 開啟對應的 LIFF 連結。\n（在外部瀏覽器無法取得 LINE 身分）"}
        variant="warn"
      />
    );
  }
  if (state.status === "unbound") {
    return (
      <LiffMessageScreen
        title="尚未綁定家長帳號"
        message={`您的 LINE 帳號（${state.lineProfile.displayName}）尚未綁定質數教室家長帳號。\n請至官網家長登入頁完成 LINE 註冊與手機驗證。`}
        action={{
          label: "前往家長登入",
          onClick: () => openExternal(window.location.origin + "/parent-login"),
        }}
        variant="warn"
      />
    );
  }
  if (state.status === "incomplete") {
    return (
      <LiffMessageScreen
        title="註冊尚未完成"
        message={"請先完成家長註冊流程（手機驗證）才能使用 LIFF 服務。"}
        action={{
          label: "前往完成註冊",
          onClick: () => openExternal(window.location.origin + "/parent-register/verify-phone"),
        }}
        variant="warn"
      />
    );
  }
  if (state.status === "error") {
    return (
      <LiffMessageScreen
        title="無法載入"
        message={state.message}
        action={{ label: "重試", onClick: () => retry() }}
        variant="error"
      />
    );
  }

  return <LiffShell user={state.user} lineProfile={state.lineProfile} openExternal={openExternal} />;
}
