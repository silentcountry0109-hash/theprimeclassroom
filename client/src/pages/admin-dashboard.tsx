import { useState, useRef, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  BarChart3,
  HelpCircle,
  Star,
  Building2,
  GraduationCap,
  Megaphone,
  LogOut,
  Plus,
  Trash2,
  Users,
  CalendarCheck,
  Edit,
  Clock,
  MapPin,
  Phone,
  Tag,
  School,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  UserCog,
  Shield,
  Lock,
  UserPlus,
  KeyRound,
  ShoppingBag,
  Package,
  Eye,
  EyeOff,
  Globe,
  Save,
  FileText,
  Coins,
  Ticket,
  Wallet,
  Gift,
  DollarSign,
  TrendingUp,
  Upload,
  X,
  ImageIcon,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  RotateCcw,
  MessageCircle,
  Link2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Faq, SuccessStory, Franchise, Coach, Announcement, TimeSlot, Product, Order, OrderItem, CreditPackage, Promotion, CouponCode } from "@shared/schema";
import { Search as SearchIcon } from "lucide-react";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS } from "@shared/constants";

interface AdminStats {
  totalStudents: number;
  totalCoaches: number;
  totalFranchises: number;
  totalBookings: number;
}

export default function AdminDashboard({ initialTab }: { initialTab?: string } = {}) {
  const { user, isLoading: authLoading, logout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    window.location.href = "/hq-login";
    return null;
  }

  const typedUser = user as User;

  const menuItems = [
    { id: "overview", label: "總覽", icon: BarChart3 },
    { id: "faqs", label: "常見問題", icon: HelpCircle },
    { id: "stories", label: "成功案例", icon: Star },
    { id: "franchises", label: "加盟分校", icon: Building2 },
    { id: "coaches", label: "老師管理", icon: GraduationCap },
    { id: "timeslots", label: "時段管理", icon: Clock },
    { id: "users", label: "帳號管理", icon: UserCog },
    { id: "announcements", label: "公告管理", icon: Megaphone },
    { id: "shop", label: "商城管理", icon: ShoppingBag },
    { id: "credits", label: "點數管理", icon: Coins },
    { id: "site-editor", label: "官網編輯", icon: Globe },
    { id: "tools", label: "系統工具", icon: RotateCcw },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-washi">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <p className="font-serif text-lg tracking-[0.1em] text-foreground">
                質數教室
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                總部管理系統
              </p>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>管理</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className={
                          activeTab === item.id ? "bg-sidebar-accent" : ""
                        }
                        data-testid={`admin-nav-${item.id}`}
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
              <SidebarMenuButton
                onClick={() => { logout(); window.location.href = "/hq-login"; }}
                className="w-full justify-start text-muted-foreground"
                data-testid="admin-button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white">
            <SidebarTrigger data-testid="admin-sidebar-toggle" />
            <h2 className="text-sm font-medium text-foreground">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "faqs" && <FaqsTab />}
            {activeTab === "stories" && <StoriesTab />}
            {activeTab === "franchises" && <FranchisesTab />}
            {activeTab === "coaches" && <CoachesTab />}
            {activeTab === "timeslots" && <TimeSlotsTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "announcements" && <AnnouncementsTab />}
            {activeTab === "shop" && <ShopManagementTab />}
            {activeTab === "credits" && <CreditsManagementTab />}
            {activeTab === "site-editor" && <SiteEditorTab />}
            {activeTab === "tools" && <SystemToolsTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

interface FranchiseAnalytics {
  franchiseId: number;
  franchiseName: string;
  city: string;
  district: string;
  isActive: boolean;
  totalCoaches: number;
  certifiedCoaches: number;
  totalSlots: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  thisMonthBookings: number;
  newStudents: number;
  totalSeats: number;
  bookedSeats: number;
  occupancyRate: number;
  uniqueStudents: number;
  uniqueParents: number;
  rating: number | null;
  reviewCount: number | null;
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery<FranchiseAnalytics[]>({
    queryKey: ["/api/admin/franchise-analytics"],
  });

  const [sortBy, setSortBy] = useState<string>("bookings");
  const [filterCity, setFilterCity] = useState<string>("all");

  const cities = [...new Set(analytics.map(a => a.city))].sort();

  const filtered = filterCity === "all" ? analytics : analytics.filter(a => a.city === filterCity);

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "bookings": return b.totalBookings - a.totalBookings;
      case "occupancy": return b.occupancyRate - a.occupancyRate;
      case "students": return b.uniqueStudents - a.uniqueStudents;
      case "coaches": return b.totalCoaches - a.totalCoaches;
      case "month": return b.thisMonthBookings - a.thisMonthBookings;
      case "newStudents": return b.newStudents - a.newStudents;
      default: return 0;
    }
  });

  const totalOccupancy = analytics.length > 0
    ? Math.round(analytics.reduce((s, a) => s + a.occupancyRate, 0) / analytics.length)
    : 0;
  const totalUniqueStudents = analytics.reduce((s, a) => s + a.uniqueStudents, 0);
  const totalThisMonth = analytics.reduce((s, a) => s + a.thisMonthBookings, 0);

  const statCards = [
    { label: "學生人數", value: stats?.totalStudents ?? 0, icon: Users, color: "bg-tiffany/10 text-tiffany" },
    { label: "認證老師", value: stats?.totalCoaches ?? 0, icon: GraduationCap, color: "bg-coral/10 text-coral" },
    { label: "加盟分校", value: stats?.totalFranchises ?? 0, icon: Building2, color: "bg-amber-warm text-amber-700" },
    { label: "總預約數", value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: "bg-tiffany/10 text-tiffany" },
    { label: "平均滿班率", value: `${totalOccupancy}%`, icon: BarChart3, color: "bg-green-50 text-green-600" },
    { label: "本月預約", value: totalThisMonth, icon: Clock, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-overview-title">
        營運總覽
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        全國營運數據一覽
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-md border border-gray-100 p-4"
            data-testid={`stat-${card.label}`}
          >
            {isLoading ? (
              <Skeleton className="h-14" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-foreground truncate">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground" data-testid="text-franchise-analytics-title">
            分校營運分析
          </h2>
          <div className="flex items-center gap-2">
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="h-8 text-xs w-28" data-testid="select-filter-city">
                <SelectValue placeholder="全部縣市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部縣市</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-xs w-28" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">總預約排序</SelectItem>
                <SelectItem value="occupancy">滿班率排序</SelectItem>
                <SelectItem value="students">學生數排序</SelectItem>
                <SelectItem value="coaches">師資數排序</SelectItem>
                <SelectItem value="month">本月預約排序</SelectItem>
                <SelectItem value="newStudents">本月新生排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-md" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">尚無分校資料</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((f) => {
              const occupancyColor = f.occupancyRate >= 70 ? "text-green-600 bg-green-50" : f.occupancyRate >= 40 ? "text-amber-600 bg-amber-50" : "text-gray-500 bg-gray-50";
              return (
                <div
                  key={f.franchiseId}
                  className="bg-white rounded-md border border-gray-100 p-4"
                  data-testid={`analytics-card-${f.franchiseId}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground" data-testid={`text-franchise-name-${f.franchiseId}`}>
                          {f.franchiseName}
                        </h3>
                        {!f.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted-foreground">停用</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {f.city} {f.district}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-shadow ${occupancyColor} ${sortBy === "occupancy" ? "ring-2 ring-blue-400" : ""}`} data-testid={`text-occupancy-${f.franchiseId}`}>
                      滿班率 {f.occupancyRate}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className={`text-center p-2 rounded transition-colors ${sortBy === "coaches" ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <p className={`text-lg font-bold ${sortBy === "coaches" ? "text-blue-700" : "text-foreground"}`} data-testid={`text-coaches-${f.franchiseId}`}>{f.totalCoaches}</p>
                      <p className={`text-[10px] ${sortBy === "coaches" ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>老師 ({f.certifiedCoaches} 認證)</p>
                    </div>
                    <div className={`text-center p-2 rounded transition-colors ${sortBy === "students" ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <p className={`text-lg font-bold ${sortBy === "students" ? "text-blue-700" : "text-foreground"}`} data-testid={`text-students-${f.franchiseId}`}>{f.uniqueStudents}</p>
                      <p className={`text-[10px] ${sortBy === "students" ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>學生數</p>
                    </div>
                    <div className={`text-center p-2 rounded transition-colors ${sortBy === "bookings" ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <p className={`text-lg font-bold ${sortBy === "bookings" ? "text-blue-700" : "text-foreground"}`} data-testid={`text-bookings-${f.franchiseId}`}>{f.totalBookings}</p>
                      <p className={`text-[10px] ${sortBy === "bookings" ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>總預約</p>
                    </div>
                    <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-lg font-bold text-tiffany" data-testid={`text-confirmed-${f.franchiseId}`}>{f.confirmedBookings}</p>
                      <p className="text-[10px] text-muted-foreground">已確認</p>
                    </div>
                    <div className={`text-center p-2 rounded transition-colors ${sortBy === "month" ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <p className={`text-lg font-bold ${sortBy === "month" ? "text-blue-700" : "text-foreground"}`} data-testid={`text-this-month-${f.franchiseId}`}>{f.thisMonthBookings}</p>
                      <p className={`text-[10px] ${sortBy === "month" ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>本月預約</p>
                    </div>
                    <div className={`text-center p-2 rounded transition-colors ${sortBy === "newStudents" ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <p className={`text-lg font-bold ${sortBy === "newStudents" ? "text-blue-700" : "text-green-600"}`} data-testid={`text-new-students-${f.franchiseId}`}>{f.newStudents}</p>
                      <p className={`text-[10px] ${sortBy === "newStudents" ? "text-blue-500 font-semibold" : "text-muted-foreground"}`}>本月新生</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>座位：{f.bookedSeats}/{f.totalSeats}</span>
                    <span>取消：{f.cancelledBookings}</span>
                    <span>家長：{f.uniqueParents} 位</span>
                    {f.rating && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {f.rating.toFixed(1)} ({f.reviewCount ?? 0})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FaqsTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/admin/faqs"],
  });

  const openAdd = () => { setEditingFaq(null); setQuestion(""); setAnswer(""); setCategory(""); setShowDialog(true); };
  const openEdit = (faq: Faq) => { setEditingFaq(faq); setQuestion(faq.question); setAnswer(faq.answer); setCategory(faq.category || ""); setShowDialog(true); };

  const saveMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; category: string }) => {
      if (editingFaq) {
        const res = await apiRequest("PATCH", `/api/admin/faqs/${editingFaq.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/faqs", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingFaq ? "FAQ 已更新" : "FAQ 已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/faqs/${id}`); },
    onSuccess: () => {
      toast({ title: "已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">常見問題管理</h1>
          <p className="text-sm text-muted-foreground">管理官網 FAQ 內容，編輯後前台即時更新</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-faq">
          <Plus className="w-4 h-4 mr-1.5" />新增 FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`admin-faq-${faq.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-tiffany font-medium">{faq.category}</span>
                  <p className="text-sm font-medium text-foreground mt-1">{faq.question}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => openEdit(faq)} data-testid={`button-edit-faq-${faq.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此 FAQ？")) deleteMutation.mutate(faq.id); }} data-testid={`button-delete-faq-${faq.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setEditingFaq(null); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? "編輯常見問題" : "新增常見問題"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>分類</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-faq-category"><SelectValue placeholder="選擇分類" /></SelectTrigger>
                <SelectContent>
                  {["關於課程", "關於費用", "關於老師", "關於預約"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>問題</Label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="輸入問題" data-testid="input-faq-question" />
            </div>
            <div>
              <Label>答案</Label>
              <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="輸入答案" rows={4} data-testid="input-faq-answer" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={() => saveMutation.mutate({ question, answer, category })} disabled={!question || !answer || !category || saveMutation.isPending} data-testid="button-submit-faq">
              {saveMutation.isPending ? "儲存中..." : editingFaq ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoriesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [studentName, setStudentName] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");

  const { data: stories = [], isLoading } = useQuery<SuccessStory[]>({
    queryKey: ["/api/admin/success-stories"],
  });

  const openAdd = () => { setEditingStory(null); setStudentName(""); setTestimonial(""); setGrade(""); setParentName(""); setShowDialog(true); };
  const openEdit = (s: SuccessStory) => {
    setEditingStory(s); setStudentName(s.studentName); setTestimonial(s.testimonial);
    setGrade(s.grade?.toString() || ""); setParentName(s.parentName || ""); setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { studentName: string; testimonial: string; grade?: number; parentName?: string }) => {
      if (editingStory) {
        const res = await apiRequest("PATCH", `/api/admin/success-stories/${editingStory.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/success-stories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingStory ? "案例已更新" : "案例已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/success-stories/${id}`); },
    onSuccess: () => {
      toast({ title: "已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
    },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">成功案例</h1>
          <p className="text-sm text-muted-foreground">管理家長好評與推薦，編輯後前台即時更新</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-story">
          <Plus className="w-4 h-4 mr-1.5" />新增案例
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}</div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`admin-story-${story.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{story.studentName}</p>
                    {story.parentName && <span className="text-xs text-muted-foreground">({story.parentName})</span>}
                    {story.grade && <span className="text-xs bg-amber-warm text-foreground/70 px-2 py-0.5 rounded-full">{story.grade}年級</span>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{story.testimonial}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => openEdit(story)} data-testid={`button-edit-story-${story.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此案例？")) deleteMutation.mutate(story.id); }} data-testid={`button-delete-story-${story.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setEditingStory(null); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStory ? "編輯成功案例" : "新增成功案例"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>學生姓名</Label>
                <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="學生姓名" data-testid="input-story-name" />
              </div>
              <div>
                <Label>家長稱呼</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="如：王媽媽" data-testid="input-story-parent" />
              </div>
            </div>
            <div>
              <Label>年級</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger data-testid="select-story-grade"><SelectValue placeholder="選擇年級" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => <SelectItem key={g} value={g.toString()}>{g}年級</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>感言</Label>
              <Textarea value={testimonial} onChange={(e) => setTestimonial(e.target.value)} placeholder="家長或學生的推薦感言" rows={4} data-testid="input-story-testimonial" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button
              onClick={() => saveMutation.mutate({ studentName, testimonial, grade: grade ? parseInt(grade) : undefined, parentName: parentName || undefined })}
              disabled={!studentName || !testimonial || saveMutation.isPending}
              data-testid="button-submit-story"
            >
              {saveMutation.isPending ? "儲存中..." : editingStory ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FranchisesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [showDirectorDialog, setShowDirectorDialog] = useState(false);
  const [directorFranchise, setDirectorFranchise] = useState<Franchise | null>(null);
  const [dirPhone, setDirPhone] = useState("");
  const [dirUsername, setDirUsername] = useState("");
  const [dirPassword, setDirPassword] = useState("");
  const [dirFirstName, setDirFirstName] = useState("");
  const [showResetPwDialog, setShowResetPwDialog] = useState(false);
  const [resetPwFranchise, setResetPwFranchise] = useState<Franchise | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [showResetPwText, setShowResetPwText] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [formData, setFormData] = useState({
    name: "", city: "", district: "", address: "", phone: "", description: "",
    tags: [] as string[], nearbySchools: [] as string[], rating: 0, reviewCount: 0, isActive: true, maxSeats: 5,
  });
  const [tagInput, setTagInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data: franchises = [], isLoading } = useQuery<Franchise[]>({
    queryKey: ["/api/admin/franchises"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const getDirector = (franchiseId: number) => {
    return allUsers.find((u) => u.role === "franchise_admin" && u.franchiseId === franchiseId);
  };

  const openDirectorDialog = (f: Franchise) => {
    setDirectorFranchise(f);
    setDirUsername("");
    setDirPassword("");
    setDirFirstName(f.name.replace("質數數學 ", "").replace("質數教室 ", "").replace("教室", ""));
    setShowDirectorDialog(true);
  };

  const createDirectorMutation = useMutation({
    mutationFn: async (data: { franchiseId: number; username: string; password: string; firstName: string; phone?: string }) => {
      const res = await apiRequest("POST", "/api/admin/create-franchise-director", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "主任帳號已建立" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDirectorDialog(false);
      setDirectorFranchise(null);
    },
    onError: (err: any) => {
      toast({ title: err.message || "建立帳號失敗", variant: "destructive" });
    },
  });

  const resetPwMutation = useMutation({
    mutationFn: async ({ franchiseId, password }: { franchiseId: number; password: string }) => {
      const res = await apiRequest("POST", `/api/admin/franchises/${franchiseId}/reset-director-password`, { password });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `密碼已重置`, description: `帳號 ${data.username} 的密碼已更新，下次登入時須重新設定密碼。` });
      setShowResetPwDialog(false);
      setResetPwFranchise(null);
      setResetPwValue("");
    },
    onError: (err: any) => {
      toast({ title: err.message || "重置密碼失敗", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", city: "", district: "", address: "", phone: "", description: "", tags: [], nearbySchools: [], rating: 0, reviewCount: 0, isActive: true, maxSeats: 5 });
    setTagInput("");
    setSchoolInput("");
    setEditingFranchise(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (f: Franchise) => {
    setEditingFranchise(f);
    setFormData({
      name: f.name, city: f.city, district: f.district, address: f.address,
      phone: f.phone || "", description: f.description || "",
      tags: f.tags || [], nearbySchools: f.nearbySchools || [],
      rating: f.rating || 0, reviewCount: f.reviewCount || 0,
      isActive: f.isActive, maxSeats: f.maxSeats,
    });
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingFranchise) {
        const res = await apiRequest("PATCH", `/api/admin/franchises/${editingFranchise.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/franchises", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingFranchise ? "分校已更新" : "分校已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/franchises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowDialog(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: err.message || "儲存失敗", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/franchises/${id}`);
    },
    onSuccess: () => {
      toast({ title: "分校已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/franchises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/franchises/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/franchises"] });
    },
  });

  const districts = formData.city ? (TAIWAN_DISTRICTS[formData.city] || []) : [];
  const franchiseCities = [...new Set(franchises.map((f) => f.city).filter(Boolean))].sort();
  const filteredFranchises = franchises.filter((f) => {
    if (filterCity !== "all" && f.city !== filterCity) return false;
    if (filterStatus === "active" && !f.isActive) return false;
    if (filterStatus === "inactive" && f.isActive) return false;
    if (searchKeyword.trim() && !f.name.toLowerCase().includes(searchKeyword.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">加盟分校管理</h1>
          <p className="text-sm text-muted-foreground">新增、編輯、刪除分校資料，資料與前台搜尋同步</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-franchise">
          <Plus className="w-4 h-4 mr-1.5" />新增分校
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜尋分校名稱…"
            className="h-8 text-xs pl-7 w-44"
            data-testid="input-franchise-search"
          />
        </div>
        <Select value={filterCity} onValueChange={setFilterCity}>
          <SelectTrigger className="h-8 text-xs w-32" data-testid="select-franchise-filter-city">
            <SelectValue placeholder="全部縣市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部縣市</SelectItem>
            {franchiseCities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-xs w-28" data-testid="select-franchise-filter-status">
            <SelectValue placeholder="全部狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="active">已啟用</SelectItem>
            <SelectItem value="inactive">已停用</SelectItem>
          </SelectContent>
        </Select>
        {(filterCity !== "all" || filterStatus !== "all" || searchKeyword.trim()) && (
          <span className="text-xs text-muted-foreground">
            共 {filteredFranchises.length} 間
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}</div>
      ) : filteredFranchises.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{franchises.length === 0 ? "尚無分校資料" : "沒有符合條件的分校"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFranchises.map((f) => (
            <div key={f.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`admin-franchise-${f.id}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-tiffany" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{f.name}</p>
                    {f.tags?.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-amber-warm text-amber-700">{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{f.city} {f.district} · {f.address}
                  </p>
                  {f.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{f.phone}
                    </p>
                  )}
                  {f.nearbySchools && f.nearbySchools.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <School className="w-3 h-3" />鄰近：{f.nearbySchools.join("、")}
                    </p>
                  )}
                  {(() => {
                    const director = getDirector(f.id);
                    return director ? (
                      <p className="text-xs text-tiffany mt-1 flex items-center gap-1">
                        <KeyRound className="w-3 h-3" />
                        主任：{director.firstName} {director.lastName}（帳號：{director.username}）
                      </p>
                    ) : (
                      <p className="text-xs text-coral mt-1 flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />尚未開設主任帳號
                      </p>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {f.rating != null && f.rating > 0 && (
                    <div className="text-right mr-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{Number(f.rating).toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.reviewCount} 則</p>
                    </div>
                  )}
                  {!getDirector(f.id) && (
                    <Button variant="outline" size="sm" onClick={() => openDirectorDialog(f)} data-testid={`button-create-director-${f.id}`}>
                      <UserPlus className="w-3.5 h-3.5 mr-1" />開設主任帳號
                    </Button>
                  )}
                  <Switch
                    checked={f.isActive}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: f.id, isActive: checked })}
                    data-testid={`switch-franchise-active-${f.id}`}
                  />
                  {getDirector(f.id) && (
                    <Button variant="outline" size="icon" title="重置主任密碼" onClick={() => { setResetPwFranchise(f); setResetPwValue(""); setShowResetPwDialog(true); }} data-testid={`button-reset-password-${f.id}`}>
                      <KeyRound className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="icon" onClick={() => openEdit(f)} data-testid={`button-edit-franchise-${f.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { if (confirm("確定要刪除此分校？所有相關老師和時段將一併刪除。")) deleteMutation.mutate(f.id); }} data-testid={`button-delete-franchise-${f.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFranchise ? "編輯分校" : "新增分校"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>分校名稱 *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例：質數教室 大安教室" data-testid="input-franchise-name" />
              {formData.name && !/^質數教室\s\S+教室$/.test(formData.name) && (
                <p className="text-xs text-red-500 mt-1">格式需為：質數教室 XX教室（例：質數教室 大安教室）</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>縣市 *</Label>
                <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v, district: "" })}>
                  <SelectTrigger data-testid="select-franchise-city"><SelectValue placeholder="選擇縣市" /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>區域 *</Label>
                <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })} disabled={!formData.city}>
                  <SelectTrigger data-testid="select-franchise-district"><SelectValue placeholder="選擇區域" /></SelectTrigger>
                  <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>地址 *</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="詳細地址" data-testid="input-franchise-address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>電話</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="02-xxxx-xxxx" data-testid="input-franchise-phone" />
              </div>
              <div>
                <Label>座位數</Label>
                <Input type="number" value={formData.maxSeats} onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 5 })} data-testid="input-franchise-seats" />
              </div>
            </div>
            <div>
              <Label>描述</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="分校介紹" data-testid="input-franchise-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>評分</Label>
                <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} data-testid="input-franchise-rating" />
              </div>
              <div>
                <Label>評價數</Label>
                <Input type="number" min="0" value={formData.reviewCount} onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })} data-testid="input-franchise-reviews" />
              </div>
            </div>
            <div>
              <Label>標籤</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-amber-warm text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                    {tag}
                    <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })} className="hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={tagInput} onValueChange={(v) => { if (!formData.tags.includes(v)) setFormData({ ...formData, tags: [...formData.tags, v] }); setTagInput(""); }}>
                  <SelectTrigger data-testid="select-franchise-tag"><SelectValue placeholder="選擇標籤" /></SelectTrigger>
                  <SelectContent>
                    {["家長好評推薦", "年度績優校區", "成績進步快速", "新開幕", "小班教學"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>鄰近學校</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.nearbySchools.map((s) => (
                  <span key={s} className="text-xs bg-tiffany/10 text-tiffany px-2 py-1 rounded-full flex items-center gap-1">
                    {s}
                    <button onClick={() => setFormData({ ...formData, nearbySchools: formData.nearbySchools.filter((ns) => ns !== s) })} className="hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={schoolInput} onChange={(e) => setSchoolInput(e.target.value)} placeholder="輸入學校名稱" data-testid="input-franchise-school"
                  onKeyDown={(e) => { if (e.key === "Enter" && schoolInput.trim()) { e.preventDefault(); if (!formData.nearbySchools.includes(schoolInput.trim())) setFormData({ ...formData, nearbySchools: [...formData.nearbySchools, schoolInput.trim()] }); setSchoolInput(""); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => { if (schoolInput.trim() && !formData.nearbySchools.includes(schoolInput.trim())) { setFormData({ ...formData, nearbySchools: [...formData.nearbySchools, schoolInput.trim()] }); setSchoolInput(""); } }}>加入</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>營業狀態</Label>
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} data-testid="switch-franchise-form-active" />
              <span className="text-sm text-muted-foreground">{formData.isActive ? "營業中" : "暫停營業"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.name || !formData.city || !formData.district || !formData.address || saveMutation.isPending || !/^質數教室\s\S+教室$/.test(formData.name)}
              data-testid="button-submit-franchise"
            >
              {saveMutation.isPending ? "儲存中..." : editingFranchise ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDirectorDialog} onOpenChange={(open) => { if (!open) { setDirectorFranchise(null); setDirUsername(""); setDirPassword(""); setDirPhone(""); } setShowDirectorDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>開設分校主任帳號</DialogTitle>
          </DialogHeader>
          {directorFranchise && (
            <div className="space-y-4 py-4">
              <div className="bg-tiffany/5 rounded-md p-3 border border-tiffany/20">
                <p className="text-sm font-medium text-foreground">{directorFranchise.name}</p>
                <p className="text-xs text-muted-foreground">{directorFranchise.city} {directorFranchise.district} · {directorFranchise.address}</p>
              </div>
              <div>
                <Label>主任姓名</Label>
                <Input value={dirFirstName} onChange={(e) => setDirFirstName(e.target.value)} placeholder="姓名" className="mt-1.5" data-testid="input-director-name" />
              </div>
              <div>
                <Label>登入帳號 *</Label>
                <Input value={dirUsername} onChange={(e) => setDirUsername(e.target.value)} placeholder="設定帳號（英文）" className="mt-1.5" data-testid="input-director-username" />
              </div>
              <div>
                <Label>登入密碼 *</Label>
                <Input type="password" value={dirPassword} onChange={(e) => setDirPassword(e.target.value)} placeholder="設定密碼（至少 6 個字元）" className="mt-1.5" data-testid="input-director-password" />
              </div>
              <div>
                <Label>手機號碼</Label>
                <Input value={dirPhone} onChange={(e) => setDirPhone(e.target.value)} placeholder="09xx-xxx-xxx（選填）" className="mt-1.5" data-testid="input-director-phone" />
              </div>
              <p className="text-xs text-muted-foreground">主任帳號建立後，可從網站首頁底部的「分校管理」進入分校管理後台</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDirectorDialog(false)}>取消</Button>
            <Button
              onClick={() => {
                if (directorFranchise && dirUsername && dirPassword) {
                  createDirectorMutation.mutate({
                    franchiseId: directorFranchise.id,
                    username: dirUsername,
                    password: dirPassword,
                    firstName: dirFirstName,
                    phone: dirPhone,
                  });
                }
              }}
              disabled={createDirectorMutation.isPending || !dirUsername || dirPassword.length < 6}
              data-testid="button-submit-director"
            >
              {createDirectorMutation.isPending ? "建立中..." : "建立帳號"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetPwDialog} onOpenChange={(open) => { if (!open) { setResetPwFranchise(null); setResetPwValue(""); setShowResetPwText(false); } setShowResetPwDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置主任登入密碼</DialogTitle>
          </DialogHeader>
          {resetPwFranchise && (() => {
            const director = getDirector(resetPwFranchise.id);
            return (
              <div className="space-y-4 py-4">
                <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                  <p className="text-sm font-medium text-foreground">{resetPwFranchise.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">主任帳號：<span className="font-mono font-medium">{director?.username}</span></p>
                </div>
                <div>
                  <Label>新密碼 *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showResetPwText ? "text" : "password"}
                      value={resetPwValue}
                      onChange={(e) => setResetPwValue(e.target.value)}
                      placeholder="設定新密碼（至少 6 個字元）"
                      className="pr-10"
                      data-testid="input-reset-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPwText(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="button-toggle-reset-pw-visibility"
                    >
                      {showResetPwText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">密碼重置後，主任下次登入時將被要求重新設定密碼。</p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPwDialog(false)}>取消</Button>
            <Button
              onClick={() => {
                if (resetPwFranchise && resetPwValue.length >= 6) {
                  resetPwMutation.mutate({ franchiseId: resetPwFranchise.id, password: resetPwValue });
                }
              }}
              disabled={resetPwMutation.isPending || resetPwValue.length < 6}
              data-testid="button-submit-reset-password"
            >
              {resetPwMutation.isPending ? "重置中..." : "確認重置"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoachesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    name: "", bio: "", franchiseId: 0, specialties: [] as string[],
    isCertified: true, rating: 0, reviewCount: 0,
  });
  const [specialtyInput, setSpecialtyInput] = useState("");

  const { data: coaches = [], isLoading } = useQuery<Coach[]>({ queryKey: ["/api/admin/coaches"] });
  const { data: franchiseList = [] } = useQuery<Franchise[]>({ queryKey: ["/api/admin/franchises"] });

  const resetForm = () => {
    setFormData({ name: "", bio: "", franchiseId: 0, specialties: [], isCertified: true, rating: 0, reviewCount: 0 });
    setSpecialtyInput("");
    setEditingCoach(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (c: Coach) => {
    setEditingCoach(c);
    setFormData({
      name: c.name, bio: c.bio || "", franchiseId: c.franchiseId || 0,
      specialties: c.specialties || [], isCertified: c.isCertified,
      rating: c.rating || 0, reviewCount: c.reviewCount || 0,
    });
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, franchiseId: data.franchiseId || null };
      if (editingCoach) {
        const res = await apiRequest("PATCH", `/api/admin/coaches/${editingCoach.id}`, payload);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/coaches", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingCoach ? "老師已更新" : "老師已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/coaches/${id}`); },
    onSuccess: () => {
      toast({ title: "老師已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const getFranchiseName = (fId: number | null) => {
    if (!fId) return "未指派";
    return franchiseList.find((f) => f.id === fId)?.name || "未知分校";
  };

  type CoachGroup = {
    key: string;
    coaches: Coach[];
    name: string;
    isCertified: boolean;
    rating: number | null;
    reviewCount: number;
    specialties: string[];
    bio: string;
  };

  const groupedCoaches: CoachGroup[] = (() => {
    const groups: Map<string, Coach[]> = new Map();
    coaches.forEach((coach) => {
      const key = coach.userId ? `user:${coach.userId}` : `id:${coach.id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(coach);
    });
    return Array.from(groups.entries()).map(([key, group]) => {
      const first = group[0];
      const ratedCoach = group.find((c) => c.rating != null && c.rating > 0) ?? null;
      return {
        key,
        coaches: group,
        name: first.name,
        isCertified: group.some((c) => c.isCertified),
        rating: ratedCoach ? ratedCoach.rating : null,
        reviewCount: ratedCoach ? (ratedCoach.reviewCount ?? 0) : 0,
        specialties: first.specialties || [],
        bio: first.bio || "",
      };
    });
  })();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">老師管理</h1>
          <p className="text-sm text-muted-foreground">新增、編輯、刪除老師，指派所屬分校</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-coach">
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
          {groupedCoaches.map((group) => (
            <div key={group.key} className="bg-white rounded-md border border-gray-100 p-4 flex items-start gap-4" data-testid={group.coaches.length === 1 ? `admin-coach-${group.coaches[0].id}` : `admin-coach-group-${group.key}`}>
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-serif text-tiffany">{group.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{group.name}</p>
                  {group.isCertified && <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">已認證</span>}
                  {group.coaches.map((c) => (
                    <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getFranchiseName(c.franchiseId)}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{group.specialties.join(" · ") || "一般數學教學"}</p>
                {group.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{group.bio}</p>}
                {group.coaches.length > 1 && (
                  <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                    {group.coaches.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2" data-testid={`admin-coach-${c.id}`}>
                        <span className="text-xs text-muted-foreground">{getFranchiseName(c.franchiseId)}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(c)} data-testid={`button-edit-coach-${c.id}`}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { if (confirm("確定要刪除此老師？")) deleteMutation.mutate(c.id); }} data-testid={`button-delete-coach-${c.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {group.rating != null && group.rating > 0 && (
                  <div className="text-right mr-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{Number(group.rating).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{group.reviewCount} 則</p>
                  </div>
                )}
                {group.coaches.length === 1 && (
                  <>
                    <Button variant="outline" size="icon" onClick={() => openEdit(group.coaches[0])} data-testid={`button-edit-coach-${group.coaches[0].id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => { if (confirm("確定要刪除此老師？")) deleteMutation.mutate(group.coaches[0].id); }} data-testid={`button-delete-coach-${group.coaches[0].id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoach ? "編輯老師" : "新增老師"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>姓名 *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="老師姓名" data-testid="input-coach-name" />
            </div>
            <div>
              <Label>所屬分校</Label>
              <Select value={formData.franchiseId ? formData.franchiseId.toString() : ""} onValueChange={(v) => setFormData({ ...formData, franchiseId: parseInt(v) || 0 })}>
                <SelectTrigger data-testid="select-coach-franchise"><SelectValue placeholder="選擇分校" /></SelectTrigger>
                <SelectContent>
                  {franchiseList.map((f) => <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>簡介</Label>
              <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="老師簡介" data-testid="input-coach-bio" />
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
                  data-testid="input-coach-specialty"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => { if (specialtyInput.trim() && !formData.specialties.includes(specialtyInput.trim())) { setFormData({ ...formData, specialties: [...formData.specialties, specialtyInput.trim()] }); setSpecialtyInput(""); } }}>加入</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>評分</Label>
                <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} data-testid="input-coach-rating" />
              </div>
              <div>
                <Label>評價數</Label>
                <Input type="number" min="0" value={formData.reviewCount} onChange={(e) => setFormData({ ...formData, reviewCount: parseInt(e.target.value) || 0 })} data-testid="input-coach-reviews" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>認證狀態</Label>
              <Switch checked={formData.isCertified} onCheckedChange={(checked) => setFormData({ ...formData, isCertified: checked })} data-testid="switch-coach-certified" />
              <span className="text-sm text-muted-foreground">{formData.isCertified ? "已認證" : "未認證"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={!formData.name || saveMutation.isPending} data-testid="button-submit-coach">
              {saveMutation.isPending ? "儲存中..." : editingCoach ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimeSlotsTab() {
  const { toast } = useToast();
  const [selectedFranchise, setSelectedFranchise] = useState<number>(0);
  const [showAdd, setShowAdd] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });

  const { data: franchiseList = [] } = useQuery<Franchise[]>({ queryKey: ["/api/admin/franchises"] });

  const { data: slots = [], isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ["/api/admin/franchises", selectedFranchise, "slots"],
    queryFn: async () => {
      if (!selectedFranchise) return [];
      const res = await fetch(`/api/admin/franchises/${selectedFranchise}/slots`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedFranchise,
  });

  const { data: franchiseCoaches = [] } = useQuery<Coach[]>({
    queryKey: ["/api/admin/franchises", selectedFranchise, "coaches"],
    queryFn: async () => {
      if (!selectedFranchise) return [];
      const res = await fetch(`/api/admin/franchises/${selectedFranchise}/coaches`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedFranchise,
  });

  const addSlotMutation = useMutation({
    mutationFn: async (data: typeof slotForm) => {
      const payload = { ...data, franchiseId: selectedFranchise, coachId: data.coachId || null };
      const res = await apiRequest("POST", "/api/admin/time-slots", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "時段已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/franchises", selectedFranchise, "slots"] });
      setShowAdd(false);
      setSlotForm({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/time-slots/${id}`); },
    onSuccess: () => {
      toast({ title: "時段已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/franchises", selectedFranchise, "slots"] });
    },
  });

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return DAY_LABELS[d.getDay().toString()] || "";
  };

  const getSlotStatus = (slot: { date: string; startTime: string; endTime: string }): "upcoming" | "in_progress" | "completed" => {
    const now = new Date();
    const slotStart = new Date(`${slot.date}T${slot.startTime}:00+08:00`);
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00+08:00`);
    if (now < slotStart) return "upcoming";
    if (now <= slotEnd) return "in_progress";
    return "completed";
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
          <p className="text-sm text-muted-foreground">管理各分校的可預約時段</p>
        </div>
        {selectedFranchise > 0 && (
          <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-slot">
            <Plus className="w-4 h-4 mr-1.5" />新增時段
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Label>選擇分校</Label>
        <Select value={selectedFranchise ? selectedFranchise.toString() : ""} onValueChange={(v) => setSelectedFranchise(parseInt(v) || 0)}>
          <SelectTrigger className="max-w-sm" data-testid="select-slot-franchise"><SelectValue placeholder="選擇分校查看時段" /></SelectTrigger>
          <SelectContent>
            {franchiseList.map((f) => <SelectItem key={f.id} value={f.id.toString()}>{f.name} ({f.city} {f.district})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!selectedFranchise ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">請先選擇一間分校</p>
        </div>
      ) : slotsLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : sortedSlots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">此分校尚無時段</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSlots.map((slot) => {
            const coachName = franchiseCoaches.find((c) => c.id === slot.coachId)?.name || "未指派";
            return (
              <div key={slot.id} className="bg-white rounded-md border border-gray-100 p-3 flex items-center gap-4" data-testid={`admin-slot-${slot.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium">{slot.date} ({getDayLabel(slot.date)})</span>
                    <span className="text-sm text-tiffany font-medium">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{coachName}</span>
                    <span className="text-xs text-muted-foreground">已預約 {slot.bookedSeats}/{slot.maxSeats}</span>
                    {(() => {
                      const st = getSlotStatus(slot);
                      if (st === "upcoming") return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">尚未開始</span>;
                      if (st === "in_progress") return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">進行中</span>;
                      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">已上完課</span>;
                    })()}
                  </div>
                </div>
                {(() => {
                  const status = getSlotStatus(slot);
                  const cantDelete = status === "in_progress" || status === "completed";
                  const tipMsg = status === "in_progress" ? "課程進行中，無法刪除" : status === "completed" ? "課程已結束，無法刪除" : undefined;
                  return (
                    <span title={tipMsg}>
                      <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此時段？")) deleteSlotMutation.mutate(slot.id); }} disabled={cantDelete} data-testid={`button-delete-slot-${slot.id}`} className={cantDelete ? "opacity-40 cursor-not-allowed" : ""}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  );
                })()}
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
              <Input type="date" value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} data-testid="input-slot-date" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>開始時間 *</Label>
                <Input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} data-testid="input-slot-start" />
              </div>
              <div>
                <Label>結束時間 *</Label>
                <Input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} data-testid="input-slot-end" />
              </div>
            </div>
            <div>
              <Label>指派老師</Label>
              <Select value={slotForm.coachId ? slotForm.coachId.toString() : ""} onValueChange={(v) => setSlotForm({ ...slotForm, coachId: parseInt(v) || 0 })}>
                <SelectTrigger data-testid="select-slot-coach"><SelectValue placeholder="選擇老師（可不選）" /></SelectTrigger>
                <SelectContent>
                  {franchiseCoaches.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>座位數</Label>
              <Input type="number" min="1" value={slotForm.maxSeats} onChange={(e) => setSlotForm({ ...slotForm, maxSeats: parseInt(e.target.value) || 5 })} data-testid="input-slot-seats" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button
              onClick={() => addSlotMutation.mutate(slotForm)}
              disabled={!slotForm.date || !slotForm.startTime || !slotForm.endTime || addSlotMutation.isPending}
              data-testid="button-submit-slot"
            >
              {addSlotMutation.isPending ? "新增中..." : "新增時段"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("parent");
  const [newFranchiseId, setNewFranchiseId] = useState<number>(0);
  const [credUsername, setCredUsername] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credPhone, setCredPhone] = useState("");
  const [parentExpanded, setParentExpanded] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [parentLineFilter, setParentLineFilter] = useState<"all" | "followed" | "not_followed">("all");
  const parentSectionRef = useRef<HTMLDivElement>(null);
  const [inlinePhoneUserId, setInlinePhoneUserId] = useState<string | null>(null);
  const [inlinePhoneValue, setInlinePhoneValue] = useState("");

  const { data: userList = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: franchiseList = [] } = useQuery<Franchise[]>({
    queryKey: ["/api/admin/franchises"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, franchiseId }: { userId: string; role: string; franchiseId: number | null }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role, franchiseId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "帳號權限已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowRoleDialog(false);
      setSelectedUser(null);
    },
  });

  const createCredentialMutation = useMutation({
    mutationFn: async ({ userId, username, password }: { userId: string; username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/admin/create-credential-account", { userId, username, password });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "登入帳號已建立" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCredentialDialog(false);
      setSelectedUser(null);
      setCredUsername("");
      setCredPassword("");
      setCredPhone("");
    },
    onError: (err: any) => {
      toast({ title: err.message || "建立帳號失敗", variant: "destructive" });
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async ({ userId, phone }: { userId: string; phone: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/phone`, { phone });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "手機號碼已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (err: any) => {
      toast({ title: err.message || "更新失敗", variant: "destructive" });
    },
  });

  const openRoleDialog = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role || "parent");
    setNewFranchiseId(u.franchiseId || 0);
    setShowRoleDialog(true);
  };

  const openCredentialDialog = (u: User) => {
    setSelectedUser(u);
    setCredUsername(u.username || "");
    setCredPassword("");
    setCredPhone(u.phone || "");
    setShowCredentialDialog(true);
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: "總部管理員", color: "bg-coral/10 text-coral" },
    franchise_admin: { label: "分校主任", color: "bg-tiffany/10 text-tiffany" },
    coach: { label: "教練", color: "bg-blue-50 text-blue-600" },
    parent: { label: "家長", color: "bg-gray-100 text-gray-600" },
  };

  const getFranchiseName = (fId: number | null) => {
    if (!fId) return "";
    return franchiseList.find((f) => f.id === fId)?.name || "";
  };

  const operationalUsers = userList.filter((u) => ["admin", "franchise_admin"].includes(u.role || ""));
  const coachUsers = userList.filter((u) => u.role === "coach");
  const parentUsers = userList.filter((u) => u.role === "parent");
  const coachFilledPhoneCount = coachUsers.filter((u) => u.phone?.trim()).length;
  const coachMissingPhoneCount = coachUsers.length - coachFilledPhoneCount;
  const parentLineFollowed = parentUsers.filter((u) => u.lineUserId && u.lineOaFollowed);
  const parentLineNotFollowed = parentUsers.filter((u) => u.lineUserId && !u.lineOaFollowed);
  const filteredParents = parentUsers.filter((u) => {
    if (parentLineFilter === "followed" && !u.lineOaFollowed) return false;
    if (parentLineFilter === "not_followed" && (u.lineOaFollowed || !u.lineUserId)) return false;
    if (!parentSearch.trim()) return true;
    const q = parentSearch.toLowerCase();
    return (
      (u.firstName || "").toLowerCase().includes(q) ||
      (u.lastName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  const renderUserRow = (u: User, opts: { showButtons?: boolean; showPhone?: boolean } = {}) => {
    const { showButtons = true, showPhone = false } = opts;
    const role = roleLabels[u.role || "parent"] || roleLabels.parent;
    return (
      <div key={u.id} className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4" data-testid={`admin-user-${u.id}`}>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {u.profileImageUrl ? (
            <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Users className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">
              {u.firstName || ""} {u.lastName || ""}
              {!u.firstName && !u.lastName && <span className="text-muted-foreground">未命名</span>}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
            {(u.role === "franchise_admin" || u.role === "coach") && u.franchiseId && (
              <span className="text-xs bg-amber-warm text-amber-700 px-2 py-0.5 rounded-full">
                {getFranchiseName(u.franchiseId)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {u.email || "無 Email"}
            {u.username && <span className="ml-2 text-tiffany">帳號: {u.username}</span>}
          </p>
          {showPhone && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {u.phone?.trim() ? (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full" data-testid={`phone-status-filled-${u.id}`}>
                  <Phone className="w-3 h-3" />{u.phone.trim()}
                </span>
              ) : inlinePhoneUserId === u.id ? (
                <div className="flex items-center gap-1" data-testid={`inline-phone-form-${u.id}`}>
                  <input
                    type="tel"
                    value={inlinePhoneValue}
                    onChange={(e) => setInlinePhoneValue(e.target.value)}
                    placeholder="09xx-xxx-xxx"
                    className="text-xs border border-tiffany/50 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-tiffany w-36"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !updatePhoneMutation.isPending && inlinePhoneValue.trim()) {
                        updatePhoneMutation.mutate({ userId: u.id, phone: inlinePhoneValue.trim() }, {
                          onSuccess: () => setInlinePhoneUserId(null),
                        });
                      } else if (e.key === "Escape") {
                        setInlinePhoneUserId(null);
                      }
                    }}
                    data-testid={`input-inline-phone-${u.id}`}
                  />
                  <button
                    className="text-xs text-white bg-tiffany hover:bg-tiffany/80 px-2 py-0.5 rounded disabled:opacity-50"
                    onClick={() => {
                      if (!inlinePhoneValue.trim()) return;
                      updatePhoneMutation.mutate({ userId: u.id, phone: inlinePhoneValue.trim() }, {
                        onSuccess: () => setInlinePhoneUserId(null),
                      });
                    }}
                    disabled={updatePhoneMutation.isPending || !inlinePhoneValue.trim()}
                    data-testid={`button-inline-phone-save-${u.id}`}
                  >
                    儲存
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700 px-1 py-0.5"
                    onClick={() => setInlinePhoneUserId(null)}
                    data-testid={`button-inline-phone-cancel-${u.id}`}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full" data-testid={`phone-status-missing-${u.id}`}>
                    <Phone className="w-3 h-3" />未填手機
                  </span>
                  {u.role === "coach" && (
                    <button
                      className="text-xs text-tiffany hover:text-tiffany/70 border border-tiffany/40 hover:border-tiffany/70 px-2 py-0.5 rounded-full transition-colors"
                      onClick={() => { setInlinePhoneUserId(u.id); setInlinePhoneValue(""); }}
                      data-testid={`button-fill-phone-${u.id}`}
                    >
                      補填
                    </button>
                  )}
                </div>
              )}
              {u.role === "parent" && u.lineUserId && (
                u.lineOaFollowed ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#06C755]/10 text-[#06C755] border border-[#06C755]/20 px-2 py-0.5 rounded-full" data-testid={`parent-line-followed-${u.id}`}>
                    <UserCheck className="w-3 h-3" />LINE 已加好友
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full" data-testid={`parent-line-not-followed-${u.id}`}>
                    <UserX className="w-3 h-3" />LINE 尚未加好友
                  </span>
                )
              )}
            </div>
          )}
        </div>
        {showButtons && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {(u.role === "admin" || u.role === "franchise_admin") && (
              <Button variant="outline" size="sm" onClick={() => openCredentialDialog(u)} data-testid={`button-set-credential-${u.id}`}>
                <Lock className="w-3.5 h-3.5 mr-1" />{u.username ? "改密碼" : "設帳號"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => openRoleDialog(u)} data-testid={`button-edit-user-role-${u.id}`}>
              <Shield className="w-3.5 h-3.5 mr-1" />權限
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">帳號管理</h1>
        <p className="text-sm text-muted-foreground">管理使用者角色，指派分校主任帳號</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-tiffany">{operationalUsers.filter((u) => u.role === "franchise_admin").length}</p>
          <p className="text-xs text-muted-foreground mt-1">🏫 分校主任</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-coral">{operationalUsers.filter((u) => u.role === "admin").length}</p>
          <p className="text-xs text-muted-foreground mt-1">🛡️ 總部管理員</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{coachUsers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">👨‍🏫 教練</p>
        </div>
        <button
          className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-tiffany/40 transition-colors cursor-pointer"
          onClick={() => {
            setParentExpanded(true);
            setTimeout(() => parentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
          }}
          data-testid="stat-card-parents"
        >
          <p className="text-2xl font-bold text-gray-600">{parentUsers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">👨‍👩‍👧 家長帳號</p>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : (
        <>
          {/* Section 1: Operational accounts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">營運帳號</h2>
              <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">{operationalUsers.length} 人</span>
            </div>
            {operationalUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">尚無營運帳號</p>
            ) : (
              <div className="space-y-2">
                {operationalUsers.map((u) => renderUserRow(u, { showButtons: true }))}
              </div>
            )}
          </div>

          {/* Section 2: Coach accounts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-foreground">教練帳號</h2>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{coachUsers.length} 人</span>
              <span className="text-xs text-muted-foreground">（由各分校主任管理）</span>
              {coachUsers.length > 0 && (
                <>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full" data-testid="coach-phone-filled-count">
                    已填手機 {coachFilledPhoneCount} 人
                  </span>
                  {coachMissingPhoneCount > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full" data-testid="coach-phone-missing-count">
                      未填 {coachMissingPhoneCount} 人
                    </span>
                  )}
                </>
              )}
            </div>
            {coachUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">尚無教練帳號</p>
            ) : (
              <div className="space-y-2">
                {coachUsers.map((u) => renderUserRow(u, { showButtons: false, showPhone: true }))}
              </div>
            )}
          </div>

          {/* Section 3: Parent accounts - collapsible */}
          <div className="space-y-2" ref={parentSectionRef}>
            <button
              className="w-full flex items-center gap-2 text-left group"
              onClick={() => setParentExpanded((v) => !v)}
              data-testid="toggle-parent-section"
            >
              <h2 className="text-sm font-semibold text-foreground">家長帳號</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{parentUsers.length} 人</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${parentExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {parentExpanded && (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                  共 {parentUsers.length} 位家長，HQ 通常不需要修改家長帳號。家長可自行在個人資料頁更新資訊。
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "followed", "not_followed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setParentLineFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${parentLineFilter === f ? "bg-[#06C755] text-white border-[#06C755]" : "bg-white text-gray-600 border-gray-200 hover:border-[#06C755]/50"}`}
                      data-testid={`parent-line-filter-${f}`}
                    >
                      {f === "all" ? `全部（${parentUsers.length}）` : f === "followed" ? `已加好友（${parentLineFollowed.length}）` : `尚未加好友（${parentLineNotFollowed.length}）`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">LINE 好友狀態由 Webhook 即時更新；既有帳號在下次互動前可能顯示「尚未加好友」。</p>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="搜尋姓名、Email、帳號、手機..."
                    className="pl-9 text-sm h-9"
                    data-testid="input-parent-search"
                  />
                </div>
                {filteredParents.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">找不到符合條件的家長帳號</p>
                ) : (
                  <div className="space-y-2">
                    {filteredParents.map((u) => renderUserRow(u, { showButtons: false, showPhone: true }))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={showRoleDialog} onOpenChange={(open) => { if (!open) setSelectedUser(null); setShowRoleDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>設定帳號權限</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm font-medium">{selectedUser.firstName || ""} {selectedUser.lastName || ""}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div>
                <Label>角色</Label>
                <Select value={newRole} onValueChange={(v) => { setNewRole(v); if (v !== "franchise_admin") setNewFranchiseId(0); }}>
                  <SelectTrigger data-testid="select-user-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">家長</SelectItem>
                    <SelectItem value="franchise_admin">分校主任</SelectItem>
                    <SelectItem value="admin">總部管理員</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRole === "franchise_admin" && (
                <div>
                  <Label>指派分校 *</Label>
                  <Select value={newFranchiseId ? newFranchiseId.toString() : ""} onValueChange={(v) => setNewFranchiseId(parseInt(v) || 0)}>
                    <SelectTrigger data-testid="select-user-franchise"><SelectValue placeholder="選擇分校" /></SelectTrigger>
                    <SelectContent>
                      {franchiseList.map((f) => <SelectItem key={f.id} value={f.id.toString()}>{f.name} ({f.city} {f.district})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>取消</Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  updateRoleMutation.mutate({
                    userId: selectedUser.id,
                    role: newRole,
                    franchiseId: newRole === "franchise_admin" ? newFranchiseId : null,
                  });
                }
              }}
              disabled={updateRoleMutation.isPending || (newRole === "franchise_admin" && !newFranchiseId)}
              data-testid="button-submit-user-role"
            >
              {updateRoleMutation.isPending ? "更新中..." : "確認更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCredentialDialog} onOpenChange={(open) => { if (!open) { setSelectedUser(null); setCredUsername(""); setCredPassword(""); setCredPhone(""); } setShowCredentialDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>設定登入帳號密碼</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm font-medium">{selectedUser.firstName || ""} {selectedUser.lastName || ""}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  角色: {roleLabels[selectedUser.role || "parent"]?.label}
                  {selectedUser.role === "franchise_admin" && selectedUser.franchiseId && ` - ${getFranchiseName(selectedUser.franchiseId)}`}
                </p>
              </div>
              <div>
                <Label>登入帳號</Label>
                <Input
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="設定登入帳號"
                  className="mt-1.5"
                  data-testid="input-credential-username"
                />
              </div>
              <div>
                <Label>{selectedUser.username ? "新密碼" : "密碼"}</Label>
                <Input
                  type="password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  placeholder="設定密碼（至少 6 個字元）"
                  className="mt-1.5"
                  data-testid="input-credential-password"
                />
              </div>
              {selectedUser.role === "franchise_admin" && (
                <div>
                  <Label>手機號碼</Label>
                  <Input
                    value={credPhone}
                    onChange={(e) => setCredPhone(e.target.value)}
                    placeholder="09xx-xxx-xxx（選填）"
                    className="mt-1.5"
                    data-testid="input-credential-phone"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialDialog(false)}>取消</Button>
            {selectedUser?.role === "franchise_admin" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedUser) {
                    updatePhoneMutation.mutate({ userId: selectedUser.id, phone: credPhone });
                  }
                }}
                disabled={updatePhoneMutation.isPending}
                data-testid="button-update-phone"
              >
                {updatePhoneMutation.isPending ? "更新中..." : "僅更新手機"}
              </Button>
            )}
            <Button
              onClick={() => {
                if (selectedUser && credUsername && credPassword) {
                  createCredentialMutation.mutate({
                    userId: selectedUser.id,
                    username: credUsername,
                    password: credPassword,
                  });
                }
              }}
              disabled={createCredentialMutation.isPending || !credUsername || credPassword.length < 6}
              data-testid="button-submit-credential"
            >
              {createCredentialMutation.isPending ? "建立中..." : "確認設定"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementsTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const openAdd = () => { setEditingAnn(null); setTitle(""); setContent(""); setType("info"); setShowDialog(true); };
  const openEdit = (ann: Announcement) => { setEditingAnn(ann); setTitle(ann.title); setContent(ann.content || ""); setType(ann.type || "info"); setShowDialog(true); };

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; type: string }) => {
      if (editingAnn) {
        const res = await apiRequest("PATCH", `/api/admin/announcements/${editingAnn.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingAnn ? "公告已更新" : "公告已發布" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setShowDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/announcements/${id}`); },
    onSuccess: () => {
      toast({ title: "已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
    },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">公告管理</h1>
          <p className="text-sm text-muted-foreground">發布全系統通知</p>
        </div>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-announcement">
          <Plus className="w-4 h-4 mr-1.5" />發布公告
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無公告</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`admin-announcement-${ann.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{ann.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ann.type === "important" ? "bg-coral/10 text-coral" : ann.type === "promotion" ? "bg-amber-warm text-amber-700" : "bg-tiffany/10 text-tiffany"}`}>
                      {ann.type === "important" ? "重要" : ann.type === "promotion" ? "優惠" : "一般"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("zh-TW") : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => openEdit(ann)} data-testid={`button-edit-announcement-${ann.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此公告？")) deleteMutation.mutate(ann.id); }} data-testid={`button-delete-announcement-${ann.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setEditingAnn(null); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnn ? "編輯公告" : "發布公告"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>標題</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="公告標題" data-testid="input-announcement-title" />
            </div>
            <div>
              <Label>類型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-announcement-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">一般</SelectItem>
                  <SelectItem value="important">重要</SelectItem>
                  <SelectItem value="promotion">優惠</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>內容</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="公告內容" rows={4} data-testid="input-announcement-content" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={() => saveMutation.mutate({ title, content, type })} disabled={!title || !content || saveMutation.isPending} data-testid="button-submit-announcement">
              {saveMutation.isPending ? "儲存中..." : editingAnn ? "更新" : "發布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OrderWithUser extends Order {
  userName?: string;
}

function ShopManagementTab() {
  const { toast } = useToast();
  const [section, setSection] = useState<"products" | "orders">("products");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", category: "教材", price: 0, discountPrice: null as number | null,
    stock: 0, isActive: true, imageUrl: "",
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery<OrderWithUser[]>({
    queryKey: ["/api/admin/orders"],
  });

  const resetProductForm = () => {
    setProductForm({ name: "", description: "", category: "教材", price: 0, discountPrice: null, stock: 0, isActive: true, imageUrl: "" });
    setEditingProduct(null);
  };

  const openAddProduct = () => { resetProductForm(); setShowProductDialog(true); };
  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, description: p.description || "", category: p.category,
      price: p.price, discountPrice: p.discountPrice, stock: p.stock,
      isActive: p.isActive, imageUrl: p.imageUrl || "",
    });
    setShowProductDialog(true);
  };

  const saveProductMutation = useMutation({
    mutationFn: async (data: typeof productForm) => {
      const payload = { ...data, discountPrice: data.discountPrice || null };
      if (editingProduct) {
        const res = await apiRequest("PATCH", `/api/admin/products/${editingProduct.id}`, payload);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/products", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editingProduct ? "商品已更新" : "商品已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowProductDialog(false);
      resetProductForm();
    },
    onError: (err: any) => {
      toast({ title: err.message || "儲存失敗", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/products/${id}`); },
    onSuccess: () => {
      toast({ title: "商品已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const toggleProductActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "訂單狀態已更新" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
  });

  const formatPrice = (price: number) => `NT$ ${price.toLocaleString()}`;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "待處理", color: "bg-amber-warm text-amber-700" },
    paid: { label: "已付款", color: "bg-tiffany/10 text-tiffany" },
    shipped: { label: "已出貨", color: "bg-blue-100 text-blue-700" },
    completed: { label: "已完成", color: "bg-green-100 text-green-700" },
    cancelled: { label: "已取消", color: "bg-coral/10 text-coral" },
  };

  const statusOptions = ["pending", "paid", "shipped", "completed", "cancelled"];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground" data-testid="text-shop-management-title">商城管理</h1>
          <p className="text-sm text-muted-foreground">管理教材教具商品與訂單</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={section === "products" ? "default" : "outline"}
            onClick={() => setSection("products")}
            data-testid="button-section-products"
          >
            <Package className="w-4 h-4 mr-1.5" />商品管理
          </Button>
          <Button
            variant={section === "orders" ? "default" : "outline"}
            onClick={() => setSection("orders")}
            data-testid="button-section-orders"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />訂單管理
          </Button>
        </div>
      </div>

      {section === "products" && (
        <div>
          <div className="flex items-center justify-end mb-4">
            <Button onClick={openAddProduct} className="rounded-full" data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-1.5" />新增商品
            </Button>
          </div>

          {productsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-md border border-gray-100">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">尚無商品</p>
            </div>
          ) : (
            <div className="bg-white rounded-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">商品名稱</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">分類</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">售價</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">折扣價</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">庫存</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">狀態</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-50 last:border-0" data-testid={`admin-product-row-${product.id}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate" data-testid={`text-product-name-${product.id}`}>{product.name}</p>
                              {product.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.category === "教材" ? "bg-tiffany/10 text-tiffany" : "bg-amber-warm text-amber-700"}`} data-testid={`text-product-category-${product.id}`}>
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3 text-right" data-testid={`text-product-price-${product.id}`}>{formatPrice(product.price)}</td>
                        <td className="p-3 text-right text-coral" data-testid={`text-product-discount-${product.id}`}>
                          {product.discountPrice ? formatPrice(product.discountPrice) : "-"}
                        </td>
                        <td className="p-3 text-right" data-testid={`text-product-stock-${product.id}`}>{product.stock}</td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(checked) => toggleProductActiveMutation.mutate({ id: product.id, isActive: checked })}
                            data-testid={`switch-product-active-${product.id}`}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="outline" size="icon" onClick={() => openEditProduct(product)} data-testid={`button-edit-product-${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此商品？")) deleteProductMutation.mutate(product.id); }} data-testid={`button-delete-product-${product.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {section === "orders" && (
        <div>
          {ordersLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
          ) : allOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-md border border-gray-100">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">尚無訂單</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((order) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                return (
                  <div key={order.id} className="bg-white rounded-md border border-gray-100" data-testid={`admin-order-${order.id}`}>
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      data-testid={`button-toggle-order-${order.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-medium text-foreground" data-testid={`text-order-id-${order.id}`}>訂單 #{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`} data-testid={`text-order-status-${order.id}`}>{st.label}</span>
                          {order.userName && <span className="text-xs text-muted-foreground" data-testid={`text-order-user-${order.id}`}>{order.userName}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-sm font-semibold text-foreground" data-testid={`text-order-total-${order.id}`}>{formatPrice(order.totalAmount)}</span>
                          <span className="text-xs text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("zh-TW") : ""}
                          </span>
                          {order.note && <span className="text-xs text-muted-foreground">備註：{order.note}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateOrderStatusMutation.mutate({ id: order.id, status: v })}
                        >
                          <SelectTrigger className="w-[120px]" data-testid={`select-order-status-${order.id}`} onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>{statusLabels[s]?.label || s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <OrderItemsDetail orderId={order.id} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={showProductDialog} onOpenChange={(open) => { if (!open) resetProductForm(); setShowProductDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "編輯商品" : "新增商品"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>商品名稱 *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="輸入商品名稱" data-testid="input-product-name" />
            </div>
            <div>
              <Label>商品描述</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="商品描述" rows={3} data-testid="input-product-description" />
            </div>
            <div>
              <Label>分類 *</Label>
              <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                <SelectTrigger data-testid="select-product-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="教材">教材</SelectItem>
                  <SelectItem value="教具">教具</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>售價 (TWD) *</Label>
                <Input type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })} data-testid="input-product-price" />
              </div>
              <div>
                <Label>折扣價 (TWD)</Label>
                <Input type="number" min="0" value={productForm.discountPrice ?? ""} onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value ? parseInt(e.target.value) : null })} placeholder="選填" data-testid="input-product-discount-price" />
              </div>
            </div>
            <div>
              <Label>庫存數量</Label>
              <Input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} data-testid="input-product-stock" />
            </div>
            <div>
              <Label>商品圖片 URL</Label>
              <Input value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} placeholder="https://..." data-testid="input-product-image" />
            </div>
            <div className="flex items-center gap-3">
              <Label>上架狀態</Label>
              <Switch checked={productForm.isActive} onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked })} data-testid="switch-product-dialog-active" />
              <span className="text-sm text-muted-foreground">{productForm.isActive ? "上架中" : "已下架"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetProductForm(); setShowProductDialog(false); }}>取消</Button>
            <Button
              onClick={() => saveProductMutation.mutate(productForm)}
              disabled={!productForm.name || !productForm.price || saveProductMutation.isPending}
              data-testid="button-submit-product"
            >
              {saveProductMutation.isPending ? "儲存中..." : editingProduct ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderItemsDetail({ orderId }: { orderId: number }) {
  const { data: orderDetail } = useQuery<{ order: Order; items: OrderItem[] }>({
    queryKey: ["/api/admin/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
  });

  if (!orderDetail?.items) {
    return (
      <div className="px-4 pb-4">
        <Skeleton className="h-12 rounded-md" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 border-t border-gray-100">
      <table className="w-full text-sm mt-3">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-left pb-2">商品</th>
            <th className="text-right pb-2">單價</th>
            <th className="text-right pb-2">數量</th>
            <th className="text-right pb-2">小計</th>
          </tr>
        </thead>
        <tbody>
          {orderDetail.items.map((item) => (
            <tr key={item.id} className="border-t border-gray-50" data-testid={`order-item-row-${item.id}`}>
              <td className="py-2 text-foreground" data-testid={`text-order-item-name-${item.id}`}>{item.productName}</td>
              <td className="py-2 text-right text-muted-foreground">NT$ {item.unitPrice.toLocaleString()}</td>
              <td className="py-2 text-right text-muted-foreground">{item.quantity}</td>
              <td className="py-2 text-right font-medium">NT$ {(item.unitPrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ParentWallet {
  parentId: string;
  parentName: string;
  username: string;
  balance: number;
}

interface CreditSalesStats {
  totalRevenue: number;
  totalCredits: number;
  totalPurchases: number;
  packageStats: { name: string; count: number; credits: number; revenue: number }[];
  couponStats: { code: string; uses: number; maxUses: number | null }[];
}

function CreditsManagementTab() {
  const [subTab, setSubTab] = useState<"packages" | "promotions" | "coupons" | "wallets" | "ecpay">("packages");

  const subTabs = [
    { id: "packages" as const, label: "堂數方案", icon: Package },
    { id: "promotions" as const, label: "優惠活動", icon: Gift },
    { id: "coupons" as const, label: "優惠碼", icon: Ticket },
    { id: "wallets" as const, label: "家長點數", icon: Wallet },
    { id: "ecpay" as const, label: "線上付款", icon: CreditCard },
  ];

  const { data: salesStats, isLoading: statsLoading } = useQuery<CreditSalesStats>({
    queryKey: ["/api/admin/credit-sales-stats"],
  });

  const statCards = [
    { label: "總收入", value: salesStats ? `NT$ ${salesStats.totalRevenue.toLocaleString()}` : "-", icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "已售堂數", value: salesStats?.totalCredits ?? "-", icon: TrendingUp, color: "bg-tiffany/10 text-tiffany" },
    { label: "購買筆數", value: salesStats?.totalPurchases ?? "-", icon: Coins, color: "bg-coral/10 text-coral" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-credits-title">
        點數管理
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        管理堂數方案、優惠活動、優惠碼，以及為家長手動加點
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`stat-credit-${card.label}`}>
            {statsLoading ? (
              <Skeleton className="h-14" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-foreground truncate">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {subTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={subTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSubTab(tab.id)}
            data-testid={`button-credits-tab-${tab.id}`}
          >
            <tab.icon className="w-4 h-4 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      {subTab === "packages" && <CreditPackagesSection />}
      {subTab === "promotions" && <PromotionsSection />}
      {subTab === "coupons" && <CouponsSection />}
      {subTab === "wallets" && <ParentWalletsSection />}
      {subTab === "ecpay" && <EcpayPurchasesSection />}
    </div>
  );
}

type EcpayPurchase = {
  id: number;
  parentId: string;
  packageId: number | null;
  credits: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promotionId: number | null;
  couponId: number | null;
  paymentMethod: string;
  paymentStatus: string;
  ecpayTradeNo: string | null;
  ecpayInternalTradeNo: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  parentName: string | null;
  parentUsername: string | null;
  packageName: string | null;
};

function EcpayPurchasesSection() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmRefundId, setConfirmRefundId] = useState<number | null>(null);

  const { data: allPurchases = [], isLoading } = useQuery<EcpayPurchase[]>({
    queryKey: ["/api/admin/ecpay-purchases"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ecpay-purchases", { credentials: "include" });
      if (!res.ok) throw new Error("取得失敗");
      return res.json();
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (purchaseId: number) => {
      const res = await apiRequest("POST", `/api/admin/ecpay-refund/${purchaseId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "退款失敗");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "退款成功", description: `已退 NT$${(data.refundAmount ?? 0).toLocaleString()}（付費 ${data.paidCredits ?? 0} 堂 − 已用 ${data.usedCredits ?? 0} 堂）` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ecpay-purchases"] });
      setConfirmRefundId(null);
    },
    onError: (err: Error) => {
      toast({ title: "退款失敗", description: err.message, variant: "destructive" });
      setConfirmRefundId(null);
    },
  });

  const purchases = statusFilter === "all"
    ? allPurchases
    : allPurchases.filter(p => p.paymentStatus === statusFilter);

  const statusBadge = (status: string) => {
    if (status === "paid") return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full" data-testid={`badge-status-paid`}>
        <CheckCircle className="w-3 h-3" />已付款
      </span>
    );
    if (status === "refunded") return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full" data-testid={`badge-status-refunded`}>
        <RotateCcw className="w-3 h-3" />已退款
      </span>
    );
    if (status === "failed") return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full" data-testid={`badge-status-failed`}>
        <AlertCircle className="w-3 h-3" />付款失敗
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full" data-testid={`badge-status-pending`}>
        <ClockIcon className="w-3 h-3" />待付款
      </span>
    );
  };

  const totalAmount = allPurchases.filter(p => p.paymentStatus === "paid").reduce((s, p) => s + p.finalAmount, 0);
  const paidCount = allPurchases.filter(p => p.paymentStatus === "paid").length;
  const pendingCount = allPurchases.filter(p => p.paymentStatus === "pending").length;
  const failedCount = allPurchases.filter(p => p.paymentStatus === "failed").length;
  const refundedCount = allPurchases.filter(p => p.paymentStatus === "refunded").length;

  const confirmPurchase = confirmRefundId != null ? allPurchases.find(p => p.id === confirmRefundId) : null;
  const { data: refundPreview } = useQuery<{ paidCredits: number; usedCredits: number; refundableCredits: number; refundAmount: number; unitPrice: number }>({
    queryKey: ["/api/admin/ecpay-refund-preview", confirmRefundId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/ecpay-refund-preview/${confirmRefundId}`, { credentials: "include" });
      if (!res.ok) throw new Error("無法載入退款預覽");
      return res.json();
    },
    enabled: confirmRefundId != null,
  });

  return (
    <div>
      <div className="grid grid-cols-5 gap-3 mb-5">
        <div className="bg-white rounded-md border border-gray-100 p-4" data-testid="stat-ecpay-total">
          <p className="text-xs text-muted-foreground mb-1">總收款金額</p>
          <p className="text-lg font-bold text-foreground">NT$ {totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-4" data-testid="stat-ecpay-paid">
          <p className="text-xs text-muted-foreground mb-1">已付款筆數</p>
          <p className="text-lg font-bold text-green-600">{paidCount} 筆</p>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-4" data-testid="stat-ecpay-pending">
          <p className="text-xs text-muted-foreground mb-1">待付款筆數</p>
          <p className="text-lg font-bold text-yellow-600">{pendingCount} 筆</p>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-4" data-testid="stat-ecpay-failed">
          <p className="text-xs text-muted-foreground mb-1">付款失敗筆數</p>
          <p className="text-lg font-bold text-red-600">{failedCount} 筆</p>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-4" data-testid="stat-ecpay-refunded">
          <p className="text-xs text-muted-foreground mb-1">已退款筆數</p>
          <p className="text-lg font-bold text-blue-600">{refundedCount} 筆</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: "all", label: "全部" },
          { value: "paid", label: "已付款" },
          { value: "pending", label: "待付款" },
          { value: "failed", label: "付款失敗" },
          { value: "refunded", label: "已退款" },
        ].map(opt => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(opt.value)}
            data-testid={`button-ecpay-filter-${opt.value}`}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm" data-testid="text-ecpay-empty">
          目前沒有線上付款紀錄
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" data-testid="table-ecpay-purchases">
            <thead>
              <tr className="border-b border-gray-100 text-muted-foreground text-xs">
                <th className="text-left py-2 px-3 font-medium">建立時間</th>
                <th className="text-left py-2 px-3 font-medium">家長</th>
                <th className="text-left py-2 px-3 font-medium">方案</th>
                <th className="text-right py-2 px-3 font-medium">金額</th>
                <th className="text-center py-2 px-3 font-medium">狀態</th>
                <th className="text-left py-2 px-3 font-medium">綠界訂單號</th>
                <th className="text-center py-2 px-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50" data-testid={`row-ecpay-${p.id}`}>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground" data-testid={`text-ecpay-parent-${p.id}`}>
                      {p.parentName || p.parentUsername || p.parentId}
                    </div>
                    {p.parentUsername && p.parentName && (
                      <div className="text-xs text-muted-foreground">{p.parentUsername}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-foreground" data-testid={`text-ecpay-package-${p.id}`}>
                    {p.packageName ?? `${p.credits} 堂`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium" data-testid={`text-ecpay-amount-${p.id}`}>
                    NT$ {p.finalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {statusBadge(p.paymentStatus)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground" data-testid={`text-ecpay-tradeno-${p.id}`}>
                    {p.ecpayTradeNo ?? "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.paymentStatus === "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setConfirmRefundId(p.id)}
                        data-testid={`button-refund-${p.id}`}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />退款
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={confirmRefundId != null} onOpenChange={(open) => { if (!open) setConfirmRefundId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認退款</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {confirmPurchase ? (
                <div className="space-y-2 text-sm">
                  <div>
                    家長：<strong>{confirmPurchase.parentName || confirmPurchase.parentUsername}</strong><br />
                    原始實收：<strong>NT$ {confirmPurchase.finalAmount.toLocaleString()}</strong>
                  </div>
                  {refundPreview ? (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs space-y-1" data-testid="refund-preview-box">
                      <div>付費堂數：<strong>{refundPreview.paidCredits}</strong> 堂</div>
                      <div>已使用總堂數（付費+贈送）：<strong>{refundPreview.usedCredits}</strong> 堂</div>
                      <div>可退堂數：<strong>{refundPreview.refundableCredits}</strong> 堂 × NT${refundPreview.unitPrice}</div>
                      <div className="pt-1 border-t border-amber-200">
                        實際退款金額：<strong className="text-red-600 text-base">NT$ {refundPreview.refundAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">載入退款預覽中…</div>
                  )}
                  <div className="text-xs text-muted-foreground">退款後該訂單剩餘堂數將全數歸零，此操作無法還原。</div>
                </div>
              ) : <span />}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-refund-cancel">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRefundId != null && refundMutation.mutate(confirmRefundId)}
              disabled={refundMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-refund-confirm"
            >
              {refundMutation.isPending ? "退款中..." : "確認退款"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreditPackagesSection() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<CreditPackage | null>(null);
  const [form, setForm] = useState({ name: "", credits: 0, bonusCredits: 0, bonusExpiryDays: null as number | null, price: 0, expiryDays: null as number | null, description: "", isActive: true, sortOrder: 0 });
  const [priceTouched, setPriceTouched] = useState(false);

  const { data: packages = [], isLoading } = useQuery<CreditPackage[]>({
    queryKey: ["/api/admin/credit-packages"],
  });

  const resetForm = () => {
    setForm({ name: "", credits: 0, bonusCredits: 0, bonusExpiryDays: null, price: 0, expiryDays: null, description: "", isActive: true, sortOrder: 0 });
    setPriceTouched(false);
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (pkg: CreditPackage) => {
    setEditing(pkg);
    setForm({ name: pkg.name, credits: pkg.credits, bonusCredits: pkg.bonusCredits || 0, bonusExpiryDays: (pkg as any).bonusExpiryDays ?? null, price: pkg.price, expiryDays: pkg.expiryDays, description: pkg.description || "", isActive: pkg.isActive, sortOrder: pkg.sortOrder });
    setPriceTouched(true);
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editing) {
        const res = await apiRequest("PATCH", `/api/admin/credit-packages/${editing.id}`, data);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/credit-packages", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "方案已更新" : "方案已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-sales-stats"] });
      setShowDialog(false);
      resetForm();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground" data-testid="text-packages-title">堂數方案</h2>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-package">
          <Plus className="w-4 h-4 mr-1.5" />新增方案
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無堂數方案</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`package-card-${pkg.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground" data-testid={`text-package-name-${pkg.id}`}>{pkg.name}</p>
                    {!pkg.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted-foreground">停用</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span data-testid={`text-package-credits-${pkg.id}`}>{pkg.credits} 堂{pkg.bonusCredits > 0 ? ` + 贈 ${pkg.bonusCredits} 堂` : ""}</span>
                    <span data-testid={`text-package-price-${pkg.id}`}>NT$ {pkg.price.toLocaleString()}</span>
                    <span>每堂 NT$ {Math.round(pkg.price / (pkg.credits + (pkg.bonusCredits || 0)))}</span>
                    <span>{pkg.expiryDays ? `${pkg.expiryDays} 天有效` : "永不過期"}</span>
                  </div>
                  {pkg.description && <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>}
                </div>
                <Button variant="outline" size="icon" onClick={() => openEdit(pkg)} data-testid={`button-edit-package-${pkg.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "編輯堂數方案" : "新增堂數方案"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>方案名稱 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：基礎方案" data-testid="input-package-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>付費堂數 *</Label>
                <Input type="number" min="1" value={form.credits || ""} onChange={(e) => {
                  const c = parseInt(e.target.value) || 0;
                  setForm(prev => ({ ...prev, credits: c, price: priceTouched ? prev.price : c * 750 }));
                }} data-testid="input-package-credits" />
                <p className="text-[10px] text-muted-foreground mt-1">每堂預設 NT$ 750</p>
              </div>
              <div>
                <Label>贈送堂數（買X送Y）</Label>
                <Input type="number" min="0" value={form.bonusCredits || ""} onChange={(e) => setForm({ ...form, bonusCredits: parseInt(e.target.value) || 0 })} placeholder="0" data-testid="input-package-bonus-credits" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>定價 (TWD) *</Label>
                <Input type="number" min="0" value={form.price || ""} onChange={(e) => { setPriceTouched(true); setForm({ ...form, price: parseInt(e.target.value) || 0 }); }} data-testid="input-package-price" />
                <p className="text-[10px] text-muted-foreground mt-1">預設 = 付費堂數 × 750；可自行覆寫</p>
              </div>
              <div>
                <Label>付費堂有效天數（空白=永不過期）</Label>
                <Input type="number" min="1" value={form.expiryDays ?? ""} onChange={(e) => setForm({ ...form, expiryDays: e.target.value ? parseInt(e.target.value) : null })} placeholder="例：180" data-testid="input-package-expiry" />
              </div>
            </div>
            <div>
              <Label>贈送堂有效天數（空白=與付費堂相同）</Label>
              <Input type="number" min="1" value={form.bonusExpiryDays ?? ""} onChange={(e) => setForm({ ...form, bonusExpiryDays: e.target.value ? parseInt(e.target.value) : null })} placeholder="例：60" data-testid="input-package-bonus-expiry" disabled={!form.bonusCredits} />
              <p className="text-[10px] text-muted-foreground mt-1">贈送堂可設較短到期日；過期後自動失效且不影響退款計算</p>
            </div>
            <div>
              <Label>說明</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="方案說明" data-testid="input-package-description" />
            </div>
            <div className="flex items-center gap-3">
              <Label>啟用狀態</Label>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} data-testid="switch-package-active" />
              <span className="text-sm text-muted-foreground">{form.isActive ? "啟用中" : "已停用"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.credits || !form.price || saveMutation.isPending} data-testid="button-submit-package">
              {saveMutation.isPending ? "儲存中..." : editing ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PromotionsSection() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", discountType: "percentage", discountValue: 0,
    startDate: "", endDate: "", applicablePackageIds: [] as number[], isActive: true,
  });

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/admin/promotions"],
  });

  const { data: packages = [] } = useQuery<CreditPackage[]>({
    queryKey: ["/api/admin/credit-packages"],
  });

  const resetForm = () => {
    setForm({ name: "", description: "", discountType: "percentage", discountValue: 0, startDate: "", endDate: "", applicablePackageIds: [], isActive: true });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setForm({
      name: promo.name, description: promo.description || "", discountType: promo.discountType,
      discountValue: promo.discountValue, startDate: promo.startDate, endDate: promo.endDate,
      applicablePackageIds: promo.applicablePackageIds || [], isActive: promo.isActive,
    });
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, applicablePackageIds: data.applicablePackageIds.length > 0 ? data.applicablePackageIds : null };
      if (editing) {
        const res = await apiRequest("PATCH", `/api/admin/promotions/${editing.id}`, payload);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/promotions", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "優惠活動已更新" : "優惠活動已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const togglePkg = (pkgId: number) => {
    setForm(prev => ({
      ...prev,
      applicablePackageIds: prev.applicablePackageIds.includes(pkgId)
        ? prev.applicablePackageIds.filter(id => id !== pkgId)
        : [...prev.applicablePackageIds, pkgId],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground" data-testid="text-promotions-title">優惠活動</h2>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-promotion">
          <Plus className="w-4 h-4 mr-1.5" />新增活動
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無優惠活動</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`promotion-card-${promo.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground" data-testid={`text-promotion-name-${promo.id}`}>{promo.name}</p>
                    {!promo.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted-foreground">停用</span>}
                    <span className="text-xs bg-coral/10 text-coral px-2 py-0.5 rounded-full">
                      {promo.discountType === "percentage" ? `${promo.discountValue}% 折扣` : `減 NT$ ${promo.discountValue}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{promo.startDate} ~ {promo.endDate}</span>
                    {promo.applicablePackageIds && promo.applicablePackageIds.length > 0 && (
                      <span>適用 {promo.applicablePackageIds.length} 個方案</span>
                    )}
                  </div>
                  {promo.description && <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>}
                </div>
                <Button variant="outline" size="icon" onClick={() => openEdit(promo)} data-testid={`button-edit-promotion-${promo.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "編輯優惠活動" : "新增優惠活動"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>活動名稱 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：春季優惠" data-testid="input-promotion-name" />
            </div>
            <div>
              <Label>說明</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="活動說明" data-testid="input-promotion-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>折扣類型 *</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                  <SelectTrigger data-testid="select-promotion-discount-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">百分比折扣</SelectItem>
                    <SelectItem value="fixed">固定金額折扣</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>折扣值 *</Label>
                <Input type="number" min="1" value={form.discountValue || ""} onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })} placeholder={form.discountType === "percentage" ? "例：15" : "例：500"} data-testid="input-promotion-discount-value" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>開始日期 *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} data-testid="input-promotion-start" />
              </div>
              <div>
                <Label>結束日期 *</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} data-testid="input-promotion-end" />
              </div>
            </div>
            <div>
              <Label>適用方案（可多選，不選=全部適用）</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {packages.map((pkg) => (
                  <Button
                    key={pkg.id}
                    type="button"
                    variant={form.applicablePackageIds.includes(pkg.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePkg(pkg.id)}
                    data-testid={`button-toggle-pkg-${pkg.id}`}
                  >
                    {pkg.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>啟用狀態</Label>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} data-testid="switch-promotion-active" />
              <span className="text-sm text-muted-foreground">{form.isActive ? "啟用中" : "已停用"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || !form.discountValue || !form.startDate || !form.endDate || saveMutation.isPending} data-testid="button-submit-promotion">
              {saveMutation.isPending ? "儲存中..." : editing ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CouponsSection() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<CouponCode | null>(null);
  const [form, setForm] = useState({
    code: "", discountType: "fixed", discountValue: 0,
    maxUses: null as number | null, minPurchaseAmount: null as number | null,
    validFrom: "", validUntil: "", isActive: true,
  });

  const { data: coupons = [], isLoading } = useQuery<CouponCode[]>({
    queryKey: ["/api/admin/coupon-codes"],
  });

  const resetForm = () => {
    setForm({ code: "", discountType: "fixed", discountValue: 0, maxUses: null, minPurchaseAmount: null, validFrom: "", validUntil: "", isActive: true });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (coupon: CouponCode) => {
    setEditing(coupon);
    setForm({
      code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue,
      maxUses: coupon.maxUses, minPurchaseAmount: coupon.minPurchaseAmount,
      validFrom: coupon.validFrom || "", validUntil: coupon.validUntil || "", isActive: coupon.isActive,
    });
    setShowDialog(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, validFrom: data.validFrom || null, validUntil: data.validUntil || null };
      if (editing) {
        const res = await apiRequest("PATCH", `/api/admin/coupon-codes/${editing.id}`, payload);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/admin/coupon-codes", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: editing ? "優惠碼已更新" : "優惠碼已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupon-codes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-sales-stats"] });
      setShowDialog(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: err.message || "操作失敗", variant: "destructive" });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground" data-testid="text-coupons-title">優惠碼</h2>
        <Button onClick={openAdd} className="rounded-full" data-testid="button-add-coupon">
          <Plus className="w-4 h-4 mr-1.5" />新增優惠碼
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無優惠碼</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-md border border-gray-100 p-4" data-testid={`coupon-card-${coupon.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-mono font-medium text-foreground" data-testid={`text-coupon-code-${coupon.id}`}>{coupon.code}</p>
                    {!coupon.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-muted-foreground">停用</span>}
                    <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% 折扣` : `減 NT$ ${coupon.discountValue}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span data-testid={`text-coupon-usage-${coupon.id}`}>已使用 {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ""} 次</span>
                    {coupon.minPurchaseAmount && <span>最低消費 NT$ {coupon.minPurchaseAmount}</span>}
                    {coupon.validFrom && coupon.validUntil && <span>{coupon.validFrom} ~ {coupon.validUntil}</span>}
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => openEdit(coupon)} data-testid={`button-edit-coupon-${coupon.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "編輯優惠碼" : "新增優惠碼"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>優惠碼 *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="例：WELCOME100" disabled={!!editing} data-testid="input-coupon-code" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>折扣類型 *</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                  <SelectTrigger data-testid="select-coupon-discount-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">百分比折扣</SelectItem>
                    <SelectItem value="fixed">固定金額折扣</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>折扣值 *</Label>
                <Input type="number" min="1" value={form.discountValue || ""} onChange={(e) => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })} data-testid="input-coupon-discount-value" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>使用上限（空白=不限）</Label>
                <Input type="number" min="1" value={form.maxUses ?? ""} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? parseInt(e.target.value) : null })} data-testid="input-coupon-max-uses" />
              </div>
              <div>
                <Label>最低消費金額</Label>
                <Input type="number" min="0" value={form.minPurchaseAmount ?? ""} onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value ? parseInt(e.target.value) : null })} data-testid="input-coupon-min-purchase" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>有效起始日</Label>
                <Input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} data-testid="input-coupon-valid-from" />
              </div>
              <div>
                <Label>有效結束日</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} data-testid="input-coupon-valid-until" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>啟用狀態</Label>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} data-testid="switch-coupon-active" />
              <span className="text-sm text-muted-foreground">{form.isActive ? "啟用中" : "已停用"}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>取消</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={!form.code || !form.discountValue || saveMutation.isPending} data-testid="button-submit-coupon">
              {saveMutation.isPending ? "儲存中..." : editing ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParentWalletsSection() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentWallet | null>(null);
  const [adjustForm, setAdjustForm] = useState({ packageId: null as number | null, credits: 0, description: "" });

  const { data: wallets = [], isLoading } = useQuery<ParentWallet[]>({
    queryKey: ["/api/admin/parent-wallets"],
  });

  const { data: packages = [] } = useQuery<CreditPackage[]>({
    queryKey: ["/api/admin/credit-packages"],
  });

  const openAdjust = (wallet: ParentWallet) => {
    setSelectedParent(wallet);
    setAdjustForm({ packageId: null, credits: 0, description: "" });
    setShowDialog(true);
  };

  const adjustMutation = useMutation({
    mutationFn: async (data: { parentId: string; packageId: number | null; credits: number; description: string }) => {
      const res = await apiRequest("POST", "/api/admin/adjust-credits", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "加點成功", description: `新餘額：${data.newBalance} 堂` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/parent-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-sales-stats"] });
      setShowDialog(false);
      setSelectedParent(null);
    },
    onError: (err: any) => {
      toast({ title: err.message || "加點失敗", variant: "destructive" });
    },
  });

  const selectedPkg = packages.find(p => p.id === adjustForm.packageId);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-base font-semibold text-foreground" data-testid="text-wallets-title">家長點數</h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : wallets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無家長帳號</p>
        </div>
      ) : (
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <div key={wallet.parentId} className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4" data-testid={`wallet-card-${wallet.parentId}`}>
              <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-tiffany" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid={`text-wallet-name-${wallet.parentId}`}>{wallet.parentName || wallet.username}</p>
                <p className="text-xs text-muted-foreground">@{wallet.username}</p>
              </div>
              <div className="text-right mr-3">
                <p className="text-lg font-bold text-foreground" data-testid={`text-wallet-balance-${wallet.parentId}`}>{wallet.balance}</p>
                <p className="text-[10px] text-muted-foreground">剩餘堂數</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openAdjust(wallet)} data-testid={`button-adjust-credits-${wallet.parentId}`}>
                <Plus className="w-4 h-4 mr-1" />加點
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setSelectedParent(null); } setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手動加點 — {selectedParent?.parentName || selectedParent?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>選擇方案（或自訂堂數）</Label>
              <Select value={adjustForm.packageId?.toString() || "custom"} onValueChange={(v) => {
                if (v === "custom") {
                  setAdjustForm({ ...adjustForm, packageId: null, credits: 0 });
                } else {
                  const pkg = packages.find(p => p.id === parseInt(v));
                  setAdjustForm({ ...adjustForm, packageId: parseInt(v), credits: pkg?.credits || 0 });
                }
              }}>
                <SelectTrigger data-testid="select-adjust-package"><SelectValue placeholder="選擇方案" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">自訂堂數</SelectItem>
                  {packages.filter(p => p.isActive).map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id.toString()}>{pkg.name} ({pkg.credits} 堂 / NT$ {pkg.price.toLocaleString()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!adjustForm.packageId && (
              <div>
                <Label>自訂堂數 *</Label>
                <Input type="number" min="1" value={adjustForm.credits || ""} onChange={(e) => setAdjustForm({ ...adjustForm, credits: parseInt(e.target.value) || 0 })} data-testid="input-adjust-credits" />
              </div>
            )}
            {selectedPkg && (
              <div className="bg-gray-50 rounded-md p-3 text-sm text-muted-foreground">
                <p>方案：{selectedPkg.name}</p>
                <p>堂數：{selectedPkg.credits} 堂</p>
                <p>定價：NT$ {selectedPkg.price.toLocaleString()}</p>
                {selectedPkg.expiryDays && <p>有效天數：{selectedPkg.expiryDays} 天</p>}
              </div>
            )}
            <div>
              <Label>備註</Label>
              <Input value={adjustForm.description} onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })} placeholder="例：手動購買加點" data-testid="input-adjust-description" />
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
                  description: adjustForm.description || "總部手動加點",
                });
              }}
              disabled={(!adjustForm.packageId && !adjustForm.credits) || adjustMutation.isPending}
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

interface SiteContentImageSpec {
  width: number;
  height: number;
  formats: string[];
  maxMB: number;
}

interface SiteContentField {
  key: string;
  label: string;
  multiline?: boolean;
  type?: "text" | "image";
  imageSpec?: SiteContentImageSpec;
}

interface SiteContentSection {
  id: string;
  label: string;
  fields: SiteContentField[];
}

const SITE_CONTENT_SECTIONS: SiteContentSection[] = [
  {
    id: "hero",
    label: "首頁 Hero 區塊",
    fields: [
      { key: "hero.subtitle", label: "副標題" },
      { key: "hero.tagline", label: "標語", multiline: true },
      { key: "hero.searchHint", label: "搜尋提示文字" },
      { key: "hero.socialProof", label: "社群證明文字" },
      { key: "hero.backgroundImage", label: "Hero 背景圖", type: "image", imageSpec: { width: 1920, height: 600, formats: ["JPG", "PNG", "WebP"], maxMB: 5 } },
    ],
  },
  {
    id: "brand",
    label: "品牌理念區塊",
    fields: [
      { key: "brand.title", label: "區塊標題" },
      { key: "brand.description", label: "區塊描述", multiline: true },
      { key: "brand.quote", label: "品牌金句", multiline: true },
      { key: "brand.phil1.title", label: "理念1 標題" },
      { key: "brand.phil1.desc", label: "理念1 描述", multiline: true },
      { key: "brand.phil2.title", label: "理念2 標題" },
      { key: "brand.phil2.desc", label: "理念2 描述", multiline: true },
      { key: "brand.phil3.title", label: "理念3 標題" },
      { key: "brand.phil3.desc", label: "理念3 描述", multiline: true },
      { key: "brand.phil4.title", label: "理念4 標題" },
      { key: "brand.phil4.desc", label: "理念4 描述", multiline: true },
      { key: "brand.heroImage", label: "品牌理念配圖", type: "image", imageSpec: { width: 800, height: 600, formats: ["JPG", "PNG", "WebP"], maxMB: 5 } },
    ],
  },
  {
    id: "teaching",
    label: "教學特色區塊",
    fields: [
      { key: "teaching.title", label: "區塊標題" },
      { key: "teaching.description", label: "區塊描述", multiline: true },
      { key: "teaching.method1.title", label: "特色1 標題" },
      { key: "teaching.method1.desc", label: "特色1 描述", multiline: true },
      { key: "teaching.method2.title", label: "特色2 標題" },
      { key: "teaching.method2.desc", label: "特色2 描述", multiline: true },
      { key: "teaching.method3.title", label: "特色3 標題" },
      { key: "teaching.method3.desc", label: "特色3 描述", multiline: true },
      { key: "teaching.method4.title", label: "特色4 標題" },
      { key: "teaching.method4.desc", label: "特色4 描述", multiline: true },
    ],
  },
  {
    id: "features",
    label: "優勢特色區塊",
    fields: [
      { key: "features.title", label: "區塊標題" },
      { key: "features.description", label: "區塊描述", multiline: true },
      { key: "features.feat1.title", label: "優勢1 標題" },
      { key: "features.feat1.desc", label: "優勢1 描述", multiline: true },
      { key: "features.feat2.title", label: "優勢2 標題" },
      { key: "features.feat2.desc", label: "優勢2 描述", multiline: true },
      { key: "features.feat3.title", label: "優勢3 標題" },
      { key: "features.feat3.desc", label: "優勢3 描述", multiline: true },
    ],
  },
  {
    id: "process",
    label: "如何開始區塊",
    fields: [
      { key: "process.title", label: "區塊標題" },
      { key: "process.description", label: "區塊描述", multiline: true },
      { key: "process.step1.title", label: "步驟1 標題" },
      { key: "process.step1.desc", label: "步驟1 描述" },
      { key: "process.step2.title", label: "步驟2 標題" },
      { key: "process.step2.desc", label: "步驟2 描述" },
      { key: "process.step3.title", label: "步驟3 標題" },
      { key: "process.step3.desc", label: "步驟3 描述" },
      { key: "process.step4.title", label: "步驟4 標題" },
      { key: "process.step4.desc", label: "步驟4 描述" },
    ],
  },
  {
    id: "cta",
    label: "行動呼籲區塊",
    fields: [
      { key: "cta.title", label: "標題" },
      { key: "cta.description", label: "描述", multiline: true },
      { key: "cta.backgroundImage", label: "行動呼籲配圖", type: "image", imageSpec: { width: 1920, height: 400, formats: ["JPG", "PNG", "WebP"], maxMB: 5 } },
    ],
  },
  {
    id: "footer",
    label: "頁尾資訊",
    fields: [
      { key: "footer.description", label: "品牌描述", multiline: true },
      { key: "footer.phone", label: "聯絡電話" },
      { key: "footer.email", label: "電子信箱" },
      { key: "footer.address", label: "地址" },
    ],
  },
  {
    id: "line-parent-welcome",
    label: "LINE 家長歡迎訊息",
    fields: [
      { key: "line.parent_welcome.altText", label: "替代文字（未支援 Flex 時顯示）" },
      { key: "line.parent_welcome.headerTitle", label: "標題文字" },
      { key: "line.parent_welcome.bodyIntro", label: "開場白（可換行）", multiline: true },
      { key: "line.parent_welcome.bullet1", label: "重點 1" },
      { key: "line.parent_welcome.bullet2", label: "重點 2" },
      { key: "line.parent_welcome.bullet3", label: "重點 3" },
      { key: "line.parent_welcome.bullet4", label: "重點 4" },
      { key: "line.parent_welcome.footerNote", label: "底部說明文字" },
      { key: "line.parent_welcome.ctaLabel", label: "CTA 按鈕文字" },
      { key: "line.parent_welcome.ctaUrl", label: "CTA 按鈕連結 URL" },
    ],
  },
  {
    id: "line-coach-welcome",
    label: "LINE 老師綁定訊息",
    fields: [
      { key: "line.coach_welcome.altText", label: "替代文字（未支援 Flex 時顯示）" },
      { key: "line.coach_welcome.headerTitle", label: "標題文字" },
      { key: "line.coach_welcome.bodySubtitle", label: "副標題（粗體說明）" },
      { key: "line.coach_welcome.step1", label: "步驟 ①" },
      { key: "line.coach_welcome.step2", label: "步驟 ②" },
      { key: "line.coach_welcome.step3", label: "步驟 ③" },
      { key: "line.coach_welcome.footerHint", label: "底部提示文字" },
    ],
  },
  {
    id: "legal-policies",
    label: "法律政策",
    fields: [
      { key: "privacy_policy", label: "隱私權政策（純文字或 Markdown）", multiline: true },
      { key: "refund_policy", label: "退費規則（純文字或 Markdown）", multiline: true },
    ],
  },
];

const DEFAULT_VALUES: Record<string, string> = {
  "hero.subtitle": "國小數學個別指導",
  "hero.tagline": "讓教學回歸「1 位老師」對「1 位學生」的學習體驗",
  "hero.searchHint": "找到最適合孩子的數學老師，立即預約免費診斷",
  "hero.socialProof": "200+ 位家長推薦",
  "brand.title": "品牌與教學理念",
  "brand.description": "The Prime 質數教室，專注國小數學個別指導。我們相信每個孩子都有獨特的學習節奏，不該被統一的進度框架限制。透過一對一的個別指導，讓每位孩子都能按照自己的步調，扎實地建立數學基礎。",
  "brand.quote": "不是補習，是真正理解數學。當孩子真正理解了，分數自然會來。",
  "brand.phil1.title": "個別指導・個別進度",
  "brand.phil1.desc": "每位孩子都有專屬的學習計畫，老師一對一關注，不是大班齊頭式教學",
  "brand.phil2.title": "理解優先・不靠死背",
  "brand.phil2.desc": "引導孩子真正理解觀念，而非填鴨式記憶，讓數學成為思考的工具",
  "brand.phil3.title": "學習地圖・透明可見",
  "brand.phil3.desc": "家長清楚掌握孩子的學習階段、單元進度與重點，學習不再是黑箱",
  "brand.phil4.title": "溫暖空間・安心成長",
  "brand.phil4.desc": "明亮舒適的教室環境，讓孩子在輕鬆愉快的氛圍中專注學習",
  "teaching.title": "教學特色",
  "teaching.description": "螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，為每個孩子量身打造吸收效率最好的學習規劃",
  "teaching.method1.title": "螺旋式課程",
  "teaching.method1.desc": "同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。",
  "teaching.method2.title": "階梯式教學",
  "teaching.method2.desc": "由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。",
  "teaching.method3.title": "單元評測",
  "teaching.method3.desc": "每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。",
  "teaching.method4.title": "個別指導・個別進度",
  "teaching.method4.desc": "每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。",
  "features.title": "為什麼選擇質數教室",
  "features.description": "我們相信，每個孩子都值得一場不被干擾的學習對話",
  "features.feat1.title": "個別指導",
  "features.feat1.desc": "每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。",
  "features.feat2.title": "專業認證師資",
  "features.feat2.desc": "所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。",
  "features.feat3.title": "彈性預約制度",
  "features.feat3.desc": "如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。",
  "process.title": "如何開始",
  "process.description": "只需簡單四步驟，即可開始孩子的學習旅程",
  "process.step1.title": "搜尋教室",
  "process.step1.desc": "選擇地區與年級，找到離您最近的教室",
  "process.step2.title": "選擇老師",
  "process.step2.desc": "瀏覽老師資歷與評價，選擇最適合的老師",
  "process.step3.title": "預約時段",
  "process.step3.desc": "選擇方便的時段，輕鬆完成線上預約",
  "process.step4.title": "開始學習",
  "process.step4.desc": "孩子享受專業的數學個別指導",
  "line.parent_welcome.altText": "歡迎加入質數教室 LINE！立即預約免費診斷課程",
  "line.parent_welcome.headerTitle": "🎉  歡迎加入質數教室！",
  "line.parent_welcome.bodyIntro": "感謝您關注質數教室！\n我們提供專業的小學數學補教服務，讓孩子愛上數學 🧮",
  "line.parent_welcome.bullet1": "• 免費診斷課程，了解孩子學習狀況",
  "line.parent_welcome.bullet2": "• 彈性預約，選擇最適合的上課時段",
  "line.parent_welcome.bullet3": "• 即時堂數管理，掌握剩餘課程",
  "line.parent_welcome.bullet4": "• 課後聯絡簿，掌握孩子學習進度",
  "line.parent_welcome.footerNote": "💬 有任何問題，歡迎直接在這裡留言，我們會盡快回覆您！",
  "line.parent_welcome.ctaLabel": "立即預約免費診斷 →",
  "line.parent_welcome.ctaUrl": "",
  "line.coach_welcome.altText": "歡迎加入質數教室！請依步驟完成帳號綁定",
  "line.coach_welcome.headerTitle": "👋  歡迎加入質數教室！",
  "line.coach_welcome.bodySubtitle": "完成帳號綁定，即可收到課程通知！",
  "line.coach_welcome.step1": "① 直接在這個聊天室輸入您在質數教室登記的手機號碼",
  "line.coach_welcome.step2": "② 系統自動驗證並完成綁定",
  "line.coach_welcome.step3": "③ 之後即可收到課程提醒、聯絡簿等通知",
  "line.coach_welcome.footerHint": "請直接在下方輸入您的手機號碼 ↓",
  "cta.title": "立即預約免費診斷",
  "cta.description": "讓我們的認證老師為您的孩子進行一次免費的數學能力適性診斷，了解孩子的學習狀態，制定最適合的學習計畫。",
  "footer.description": "讓教學回歸「1 位老師」對「1 位學生」的學習體驗。我們致力於為每一位國小學生提供最專業的數學個別指導。",
  "footer.phone": "02-1234-5678",
  "footer.email": "hello@primemath.tw",
  "footer.address": "台北市大安區",
  "privacy_policy": "# 隱私權政策\n\n本平台（質數教室）重視您的隱私權，並致力於保護您的個人資料。\n\n## 資料蒐集\n我們蒐集您在使用本平台時所提供的個人資料，包括姓名、電話、電子信箱等，僅用於提供教育服務及相關通知。\n\n## 資料使用\n您的個人資料將用於：\n- 提供課程預約及管理服務\n- 傳送課程提醒及相關通知\n- 改善本平台之服務品質\n\n## 資料保護\n我們採用業界標準的安全措施保護您的個人資料，未經您的同意，我們不會將您的個人資料提供給第三方。\n\n## 聯絡我們\n如有任何關於隱私權的問題，請聯絡 hello@primemath.tw。",
  "refund_policy": "# 退費規則\n\n## 堂數退費\n1. 購買後尚未使用之堂數，可於購買日起 7 日內申請全額退費。\n2. 超過 7 日後，每堂按原始購買單價退還剩餘堂數金額，並扣除行政手續費 NT$100。\n3. 透過促銷活動或優惠碼購得之加贈堂數，不適用退費。\n\n## 退費申請流程\n1. 請透過 LINE 官方帳號或 Email 提出退費申請。\n2. 我們將於 3 個工作日內完成審核。\n3. 退款將原路退回，處理時間依各銀行規定（約 7-14 個工作日）。\n\n## 注意事項\n- 已使用之堂數恕不退費。\n- 如因平台系統因素導致課程無法進行，將全額退還該堂費用。\n\n如有疑問，請聯絡 hello@primemath.tw。",
};

function SiteEditorTab() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("hero");
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageKey, setPendingImageKey] = useState<string | null>(null);

  const { data: siteContent = [], isLoading } = useQuery<{ id: number; sectionKey: string; value: string; updatedAt: string }[]>({
    queryKey: ["/api/admin/site-content"],
  });

  const contentMap: Record<string, string> = {};
  siteContent.forEach((item) => { contentMap[item.sectionKey] = item.value; });

  const getFieldValue = (key: string): string => {
    if (editValues[key] !== undefined) return editValues[key];
    return contentMap[key] ?? DEFAULT_VALUES[key] ?? "";
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const items = Object.entries(editValues).map(([sectionKey, value]) => ({ sectionKey, value }));
      if (items.length === 0) return;
      const legalKeys = ["privacy_policy", "refund_policy"];
      const hasLegalChanges = items.some((i) => legalKeys.includes(i.sectionKey));
      if (hasLegalChanges) {
        items.push({ sectionKey: "policies_updated_at", value: new Date().toISOString() });
      }
      await apiRequest("PUT", "/api/admin/site-content/batch", { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      setEditValues({});
      setHasChanges(false);
      toast({ title: "儲存成功", description: "官網內容已更新，前台將即時反映變更" });
    },
    onError: () => {
      toast({ title: "儲存失敗", description: "請稍後再試", variant: "destructive" });
    },
  });

  const saveSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const section = SITE_CONTENT_SECTIONS.find((s) => s.id === sectionId);
      if (!section) return;
      const items = section.fields
        .filter((f) => editValues[f.key] !== undefined)
        .map((f) => ({ sectionKey: f.key, value: editValues[f.key] }));
      if (items.length === 0) return;
      if (sectionId === "legal-policies") {
        items.push({ sectionKey: "policies_updated_at", value: new Date().toISOString() });
      }
      await apiRequest("PUT", "/api/admin/site-content/batch", { items });
    },
    onSuccess: (_, sectionId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      const section = SITE_CONTENT_SECTIONS.find((s) => s.id === sectionId);
      if (section) {
        const newEditValues = { ...editValues };
        section.fields.forEach((f) => { delete newEditValues[f.key]; });
        setEditValues(newEditValues);
        if (Object.keys(newEditValues).length === 0) setHasChanges(false);
      }
      toast({ title: "儲存成功", description: "該區塊已更新" });
    },
    onError: () => {
      toast({ title: "儲存失敗", description: "請稍後再試", variant: "destructive" });
    },
  });

  const resetSection = (sectionId: string) => {
    const section = SITE_CONTENT_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    const newEditValues = { ...editValues };
    section.fields.forEach((f) => { delete newEditValues[f.key]; });
    setEditValues(newEditValues);
    if (Object.keys(newEditValues).length === 0) setHasChanges(false);
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingImageKey(key);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/site-content/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "上傳失敗");
      }
      const { url } = await res.json();
      const newEditValues = { ...editValues, [key]: url };
      setEditValues(newEditValues);
      setHasChanges(true);
      const items = [{ sectionKey: key, value: url }];
      await apiRequest("PUT", "/api/admin/site-content/batch", { items });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      const newValues = { ...newEditValues };
      delete newValues[key];
      setEditValues(newValues);
      if (Object.keys(newValues).length === 0) setHasChanges(false);
      toast({ title: "圖片已上傳", description: "圖片已成功上傳並儲存" });
    } catch (err: any) {
      toast({ title: "上傳失敗", description: err.message || "請稍後再試", variant: "destructive" });
    } finally {
      setUploadingImageKey(null);
      setPendingImageKey(null);
    }
  };

  const triggerImageUpload = (key: string) => {
    setPendingImageKey(key);
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = "";
      imageFileInputRef.current.click();
    }
  };

  const currentSection = SITE_CONTENT_SECTIONS.find((s) => s.id === activeSection);
  const sectionHasChanges = currentSection?.fields.some((f) => editValues[f.key] !== undefined) ?? false;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground" data-testid="text-site-editor-title">官網內容編輯</h3>
          <p className="text-sm text-muted-foreground mt-1">編輯前台各區塊的文字內容，儲存後即時更新官網</p>
        </div>
        {hasChanges && (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-tiffany text-white hover:bg-tiffany/90"
            data-testid="button-save-all-content"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "儲存中..." : "全部儲存"}
          </Button>
        )}
      </div>

      <input
        ref={imageFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        data-testid="input-site-image-upload"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pendingImageKey) {
            handleImageUpload(pendingImageKey, file);
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-muted-foreground">頁面區塊</p>
            </div>
            <div className="p-1">
              {SITE_CONTENT_SECTIONS.map((section) => {
                const sectionChanged = section.fields.some((f) => editValues[f.key] !== undefined);
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      activeSection === section.id
                        ? "bg-tiffany/10 text-tiffany font-medium"
                        : "text-foreground hover:bg-gray-50"
                    }`}
                    data-testid={`button-section-${section.id}`}
                  >
                    <span>{section.label}</span>
                    {sectionChanged && (
                      <span className="w-2 h-2 rounded-full bg-coral" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {currentSection && (
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-tiffany" />
                  <h4 className="font-medium text-foreground">{currentSection.label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {sectionHasChanges && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetSection(currentSection.id)}
                        className="text-xs"
                        data-testid={`button-reset-${currentSection.id}`}
                      >
                        取消變更
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveSectionMutation.mutate(currentSection.id)}
                        disabled={saveSectionMutation.isPending}
                        className="bg-tiffany text-white hover:bg-tiffany/90 text-xs"
                        data-testid={`button-save-${currentSection.id}`}
                      >
                        <Save className="w-3 h-3 mr-1" />
                        {saveSectionMutation.isPending ? "儲存中..." : "儲存此區塊"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-5">
                {currentSection.fields.map((field) => {
                  const currentValue = getFieldValue(field.key);
                  const isEdited = editValues[field.key] !== undefined;
                  const isUploadingThis = uploadingImageKey === field.key;

                  if (field.type === "image") {
                    const spec = field.imageSpec;
                    const imageUrl = getFieldValue(field.key);
                    return (
                      <div key={field.key} className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-tiffany" />
                          <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                        </div>
                        {spec && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[11px] bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full font-medium">
                              建議 {spec.width}×{spec.height} px
                            </span>
                            <span className="text-[11px] bg-gray-100 text-muted-foreground px-2 py-0.5 rounded-full">
                              {spec.formats.join(" / ")}
                            </span>
                            <span className="text-[11px] bg-gray-100 text-muted-foreground px-2 py-0.5 rounded-full">
                              上限 {spec.maxMB} MB
                            </span>
                          </div>
                        )}
                        {imageUrl ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-100">
                            <img
                              src={imageUrl}
                              alt={field.label}
                              className="w-full h-36 object-cover"
                              data-testid={`img-preview-${field.key}`}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5">
                              <p className="text-[11px] text-white/80 truncate font-mono">{imageUrl}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-28 rounded-lg border-2 border-dashed border-gray-200 bg-white" data-testid={`img-placeholder-${field.key}`}>
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground">尚未上傳圖片</p>
                            </div>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerImageUpload(field.key)}
                          disabled={isUploadingThis}
                          className="text-xs"
                          data-testid={`button-upload-${field.key}`}
                        >
                          <Upload className="w-3 h-3 mr-1.5" />
                          {isUploadingThis ? "上傳中..." : imageUrl ? "更換圖片" : "上傳圖片"}
                        </Button>
                        <p className="text-[11px] text-muted-foreground font-mono">{field.key}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                        {isEdited && (
                          <span className="text-xs text-coral">已修改</span>
                        )}
                      </div>
                      {field.multiline ? (
                        <Textarea
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className={`min-h-[80px] text-sm ${isEdited ? "border-coral/40 bg-coral/5" : ""}`}
                          data-testid={`textarea-${field.key}`}
                        />
                      ) : (
                        <Input
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className={`text-sm ${isEdited ? "border-coral/40 bg-coral/5" : ""}`}
                          data-testid={`input-${field.key}`}
                        />
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1 font-mono">{field.key}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LineDiagResult {
  found: boolean;
  layer?: number;
  userId?: string;
  role?: string;
  name?: string;
  alreadyBound?: boolean;
  lineUserId?: string | null;
  tokenOk: boolean;
  reason?: string;
}

function SystemToolsTab() {
  const { toast } = useToast();
  const [backfillResult, setBackfillResult] = useState<{ message: string; updated: number } | null>(null);
  const [diagPhone, setDiagPhone] = useState("");
  const [diagResult, setDiagResult] = useState<LineDiagResult | null>(null);
  const [lineUnbindSearch, setLineUnbindSearch] = useState("");
  const [lineUnbindTarget, setLineUnbindTarget] = useState<User | null>(null);
  const [showLineUnbindDialog, setShowLineUnbindDialog] = useState(false);

  const backfillMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/backfill-coach-phones"),
    onSuccess: async (res) => {
      const data = await res.json();
      setBackfillResult(data);
      toast({ title: "補丁完成", description: data.message });
    },
    onError: () => {
      toast({ title: "補丁失敗", description: "請稍後再試", variant: "destructive" });
    },
  });

  const diagMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("GET", `/api/admin/line-diagnostics?phone=${encodeURIComponent(phone)}`);
      return res.json() as Promise<LineDiagResult>;
    },
    onSuccess: (data) => {
      setDiagResult(data);
    },
    onError: () => {
      toast({ title: "診斷失敗", description: "請稍後再試", variant: "destructive" });
    },
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const lineUnbindMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}/line`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "LINE 綁定已解除", description: `已成功解除 ${lineUnbindTarget?.firstName || ""} ${lineUnbindTarget?.lastName || ""} 的 LINE 綁定` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowLineUnbindDialog(false);
      setLineUnbindTarget(null);
    },
    onError: (err: any) => {
      toast({ title: "解除失敗", description: err.message || "請稍後再試", variant: "destructive" });
      setShowLineUnbindDialog(false);
    },
  });

  const roleLabelsTools: Record<string, string> = {
    admin: "總部管理員",
    franchise_admin: "分校主任",
    coach: "老師",
    parent: "家長",
  };

  const lineBindableUsers = allUsers.filter((u) =>
    ["coach", "franchise_admin", "parent"].includes(u.role || "")
  );

  const filteredLineUsers = lineUnbindSearch.trim()
    ? lineBindableUsers.filter((u) => {
        const q = lineUnbindSearch.toLowerCase();
        return (
          (u.firstName || "").toLowerCase().includes(q) ||
          (u.lastName || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q) ||
          (u.phone || "").includes(q) ||
          (u.email || "").toLowerCase().includes(q)
        );
      })
    : lineBindableUsers;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-tools-title">
        系統工具
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        一次性資料補丁與系統維護工具
      </p>

      <div className="bg-white rounded-md border border-gray-100 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-tiffany" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">老師手機號碼補丁</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              將老師資料中的手機號碼同步至對應的系統帳號。僅會補丁尚未設定手機號碼的帳號，不會覆蓋已有資料。伺服器啟動時也會自動執行一次。
            </p>
          </div>
        </div>

        {backfillResult && (
          <div className="flex items-center gap-2 mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2" data-testid="text-backfill-result">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{backfillResult.message}</span>
          </div>
        )}

        <Button
          onClick={() => backfillMutation.mutate()}
          disabled={backfillMutation.isPending}
          data-testid="button-backfill-coach-phones"
        >
          <RotateCcw className={`w-4 h-4 mr-1.5 ${backfillMutation.isPending ? "animate-spin" : ""}`} />
          {backfillMutation.isPending ? "補丁中..." : "立即執行補丁"}
        </Button>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-5 mt-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">LINE 綁定診斷</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              輸入手機號碼，確認 LINE Webhook 能否找到對應的老師或主任帳號，以及目前 LINE Access Token 狀態。
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="09XXXXXXXX"
            value={diagPhone}
            onChange={(e) => { setDiagPhone(e.target.value); setDiagResult(null); }}
            className="max-w-48"
            data-testid="input-line-diag-phone"
          />
          <Button
            onClick={() => diagMutation.mutate(diagPhone)}
            disabled={diagMutation.isPending || !/^09\d{8}$/.test(diagPhone)}
            data-testid="button-line-diag-query"
          >
            <Link2 className={`w-4 h-4 mr-1.5 ${diagMutation.isPending ? "animate-spin" : ""}`} />
            {diagMutation.isPending ? "查詢中…" : "查詢"}
          </Button>
        </div>

        {diagResult && (
          <div
            className={`rounded-md border px-4 py-3 text-sm space-y-1 ${diagResult.found ? "bg-green-50 border-green-100 text-green-900" : "bg-red-50 border-red-100 text-red-900"}`}
            data-testid="text-line-diag-result"
          >
            {diagResult.found ? (
              <>
                <p className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  查到帳號（第 {diagResult.layer} 層查詢）
                </p>
                <p>姓名：{diagResult.name}　角色：{diagResult.role === "coach" ? "老師" : "分校主任"}</p>
                <p>
                  LINE 綁定狀態：
                  {diagResult.alreadyBound
                    ? <span className="text-blue-700 font-medium">已綁定（{diagResult.lineUserId}）</span>
                    : <span className="text-amber-700 font-medium">尚未綁定</span>}
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  查無帳號
                </p>
                <p className="text-red-800">{diagResult.reason}</p>
              </>
            )}
            <p className={diagResult.tokenOk ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
              LINE Access Token：{diagResult.tokenOk ? "✅ 正常" : "❌ 無法取得（請確認 LINE 金鑰設定）"}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-5 mt-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">手動解除 LINE 綁定</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              搜尋老師、分校主任或家長帳號，並解除其 LINE 綁定。操作後對方需重新完成綁定流程才能收到 LINE 通知。
            </p>
          </div>
        </div>

        <div className="mb-3">
          <Input
            placeholder="搜尋姓名、帳號、手機或 Email…"
            value={lineUnbindSearch}
            onChange={(e) => setLineUnbindSearch(e.target.value)}
            data-testid="input-line-unbind-search"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredLineUsers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-line-unbind-empty">
              {lineUnbindSearch.trim() ? "查無符合帳號" : "目前無可解除綁定的帳號"}
            </p>
          )}
          {filteredLineUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border border-gray-100 bg-gray-50" data-testid={`row-line-unbind-${u.id}`}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {u.firstName || ""} {u.lastName || ""}
                  {!u.firstName && !u.lastName && <span className="text-muted-foreground">未命名</span>}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {roleLabelsTools[u.role || ""] || u.role}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {u.username ? `帳號: ${u.username}` : u.email || ""}
                  {u.phone ? ` · ${u.phone}` : ""}
                </p>
              </div>
              {u.lineUserId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => { setLineUnbindTarget(u); setShowLineUnbindDialog(true); }}
                  data-testid={`button-line-unbind-${u.id}`}
                >
                  <X className="w-3.5 h-3.5 mr-1" />解除綁定
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground flex-shrink-0 px-2" data-testid={`text-line-unbound-${u.id}`}>尚未綁定</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={showLineUnbindDialog} onOpenChange={setShowLineUnbindDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認解除 LINE 綁定</AlertDialogTitle>
            <AlertDialogDescription>
              確定要解除
              <span className="font-semibold text-foreground mx-1">
                {lineUnbindTarget?.firstName || ""} {lineUnbindTarget?.lastName || ""}
                {!lineUnbindTarget?.firstName && !lineUnbindTarget?.lastName ? "此帳號" : ""}
              </span>
              的 LINE 綁定嗎？解除後對方將無法收到 LINE 通知，需重新完成綁定流程。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-line-unbind-cancel">取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => lineUnbindTarget && lineUnbindMutation.mutate(lineUnbindTarget.id)}
              disabled={lineUnbindMutation.isPending}
              data-testid="button-line-unbind-confirm"
            >
              {lineUnbindMutation.isPending ? "解除中…" : "確認解除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

