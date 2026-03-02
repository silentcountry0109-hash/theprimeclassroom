import { useState } from "react";
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
} from "lucide-react";
import type { Franchise, Coach, TimeSlot } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { DAY_LABELS } from "@shared/constants";

interface FranchiseStats {
  totalCoaches: number;
  totalSlots: number;
  totalBookings: number;
  confirmedBookings: number;
}

interface FranchiseBooking {
  id: number;
  status: string;
  createdAt: string;
  childName: string;
  childGrade: number;
  childSchool: string | null;
  date: string;
  startTime: string;
  endTime: string;
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

  const statCards = [
    { label: "老師人數", value: stats?.totalCoaches ?? 0, icon: GraduationCap, color: "bg-tiffany/10 text-tiffany" },
    { label: "可用時段", value: stats?.totalSlots ?? 0, icon: Clock, color: "bg-coral/10 text-coral" },
    { label: "總預約數", value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: "bg-amber-warm text-amber-700" },
    { label: "已確認", value: stats?.confirmedBookings ?? 0, icon: Users, color: "bg-tiffany/10 text-tiffany" },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-md border border-gray-100 p-5" data-testid={`franchise-stat-${card.label}`}>
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
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
              { label: "預約數", value: rangeStats.totalBookings, icon: CalendarCheck, color: "bg-coral/10 text-coral", sub: `已確認 ${rangeStats.confirmedBookings}` },
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
        <h2 className="text-lg font-semibold text-foreground mb-1">教室照片管理</h2>
        <p className="text-sm text-muted-foreground mb-4">上傳教室環境照片，將顯示在分校頁面的照片輪播中</p>
        <PhotoManager franchiseId={franchise.id} photos={franchise.photos || []} coverPhoto={franchise.coverPhoto || null} />
      </div>
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
  const [accountMode, setAccountMode] = useState<"create" | "reset">("create");
  const [accountUsername, setAccountUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");

  const { data: coaches = [], isLoading } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });

  const resetForm = () => {
    setFormData({ name: "", phone: "", bio: "", specialties: [], isCertified: true, rating: 0, reviewCount: 0 });
    setSpecialtyInput("");
    setEditingCoach(null);
  };

  const resetAccountForm = () => {
    setAccountDialogCoach(null);
    setAccountUsername("");
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
    setAccountMode("create");
    setAccountDialogCoach(c);
    setAccountUsername("");
    setAccountPassword("");
  };

  const openResetPassword = (c: Coach) => {
    setAccountMode("reset");
    setAccountDialogCoach(c);
    setAccountUsername("");
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
    mutationFn: async ({ coachId, username, password }: { coachId: number; username: string; password: string }) => {
      const res = await apiRequest("POST", `/api/franchise-admin/coaches/${coachId}/account`, { username, password });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "建立帳號失敗");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "帳號建立成功", description: "老師現在可以使用帳號密碼登入系統" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/coaches"] });
      resetAccountForm();
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
                      <ShieldCheck className="w-3 h-3" />帳號已建立
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
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="例：0912-345-678" data-testid="input-franchise-coach-phone" />
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
            <DialogTitle>
              {accountMode === "create" ? "建立老師帳號" : "重設老師密碼"}
            </DialogTitle>
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
            {accountMode === "create" && (
              <div>
                <Label>帳號 *</Label>
                <Input
                  value={accountUsername}
                  onChange={(e) => setAccountUsername(e.target.value)}
                  placeholder="設定登入帳號"
                  data-testid="input-coach-account-username"
                />
                <p className="text-xs text-muted-foreground mt-1">帳號建立後無法變更</p>
              </div>
            )}
            <div>
              <Label>{accountMode === "create" ? "密碼 *" : "新密碼 *"}</Label>
              <Input
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder={accountMode === "create" ? "設定登入密碼（至少 6 個字元）" : "輸入新密碼（至少 6 個字元）"}
                data-testid="input-coach-account-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAccountForm} data-testid="button-cancel-coach-account">取消</Button>
            {accountMode === "create" ? (
              <Button
                onClick={() => {
                  if (accountDialogCoach) {
                    createAccountMutation.mutate({ coachId: accountDialogCoach.id, username: accountUsername, password: accountPassword });
                  }
                }}
                disabled={!accountUsername || accountPassword.length < 6 || createAccountMutation.isPending}
                data-testid="button-submit-coach-account"
              >
                {createAccountMutation.isPending ? "建立中..." : "建立帳號"}
              </Button>
            ) : (
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
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!scheduleCoach} onOpenChange={(open) => { if (!open) { setScheduleCoach(null); setScheduleData([]); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{scheduleCoach?.name} 的跨校課表</DialogTitle>
          </DialogHeader>
          {scheduleLoading ? (
            <div className="space-y-3 py-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}</div>
          ) : scheduleData.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">目前沒有排課</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {Object.entries(
                scheduleData.reduce((groups: Record<string, any[]>, slot) => {
                  const key = slot.date;
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(slot);
                  return groups;
                }, {})
              ).map(([date, slots]) => (
                <div key={date} className="border border-gray-100 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2">
                    <span className="text-sm font-medium" data-testid={`schedule-date-${date}`}>{date} ({DAY_LABELS[new Date(date).getDay().toString()] || ""})</span>
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
            <Button variant="outline" onClick={() => { setScheduleCoach(null); setScheduleData([]); }}>關閉</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimeSlotsTab() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });

  const { data: slots = [], isLoading } = useQuery<TimeSlot[]>({ queryKey: ["/api/franchise-admin/time-slots"] });
  const { data: coaches = [] } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });

  const addSlotMutation = useMutation({
    mutationFn: async (data: typeof slotForm) => {
      const payload = { ...data, coachId: data.coachId || null };
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

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/franchise-admin/time-slots/${id}`); },
    onSuccess: () => {
      toast({ title: "時段已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
    },
  });

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return DAY_LABELS[d.getDay().toString()] || "";
  };

  const sortedSlots = [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">時段管理</h1>
          <p className="text-sm text-muted-foreground">管理本分校的可預約時段</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-franchise-slot">
          <Plus className="w-4 h-4 mr-1.5" />新增時段
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : sortedSlots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無時段資料</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSlots.map((slot) => {
            const coachName = coaches.find((c) => c.id === slot.coachId)?.name || "未指派";
            return (
              <div key={slot.id} className="bg-white rounded-md border border-gray-100 p-3 flex items-center gap-4" data-testid={`franchise-slot-${slot.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium">{slot.date} ({getDayLabel(slot.date)})</span>
                    <span className="text-sm text-tiffany font-medium">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{coachName}</span>
                    <span className="text-xs text-muted-foreground">已預約 {slot.bookedSeats}/{slot.maxSeats}</span>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此時段？")) deleteSlotMutation.mutate(slot.id); }} data-testid={`button-delete-franchise-slot-${slot.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>新增時段</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>日期 *</Label>
              <Input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} data-testid="input-franchise-slot-date" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>開始時間 *</Label>
                <Input type="time" value={slotForm.startTime} onChange={(e) => {
                  const start = e.target.value;
                  const [h, m] = start.split(":").map(Number);
                  const totalMin = h * 60 + m + 90;
                  const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
                  const endM = String(totalMin % 60).padStart(2, "0");
                  setSlotForm({ ...slotForm, startTime: start, endTime: `${endH}:${endM}` });
                }} data-testid="input-franchise-slot-start" />
              </div>
              <div>
                <Label>結束時間</Label>
                <Input type="time" value={slotForm.endTime} disabled className="bg-gray-50" data-testid="input-franchise-slot-end" />
                <p className="text-xs text-muted-foreground mt-1">自動設定（開始＋90分鐘）</p>
              </div>
            </div>
            <div>
              <Label>指派老師</Label>
              <Select value={slotForm.coachId ? slotForm.coachId.toString() : ""} onValueChange={(v) => setSlotForm({ ...slotForm, coachId: parseInt(v) || 0 })}>
                <SelectTrigger data-testid="select-franchise-slot-coach"><SelectValue placeholder="選擇老師（可不選）" /></SelectTrigger>
                <SelectContent>
                  {coaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>座位數</Label>
              <p className="text-sm text-foreground mt-1.5 px-3 py-2 bg-gray-50 rounded-md border border-gray-100" data-testid="text-franchise-slot-seats">5 人</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button
              onClick={() => addSlotMutation.mutate(slotForm)}
              disabled={!slotForm.date || !slotForm.startTime || addSlotMutation.isPending}
              data-testid="button-submit-franchise-slot"
            >
              {addSlotMutation.isPending ? "新增中..." : "新增時段"}
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
  });

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return DAY_LABELS[d.getDay().toString()] || "";
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    confirmed: { label: "已確認", color: "bg-tiffany/10 text-tiffany" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-500" },
    completed: { label: "已完成", color: "bg-amber-warm text-amber-700" },
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">預約管理</h1>
        <p className="text-sm text-muted-foreground">查看家長的預約資訊</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無預約資料</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
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
