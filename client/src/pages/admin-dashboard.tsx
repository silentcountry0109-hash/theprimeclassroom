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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Faq, SuccessStory, Franchise, Coach, Announcement, TimeSlot, Product, Order, OrderItem } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS } from "@shared/constants";

interface AdminStats {
  totalStudents: number;
  totalCoaches: number;
  totalFranchises: number;
  totalBookings: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, logout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      label: "學生人數",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "bg-tiffany/10 text-tiffany",
    },
    {
      label: "認證老師",
      value: stats?.totalCoaches ?? 0,
      icon: GraduationCap,
      color: "bg-coral/10 text-coral",
    },
    {
      label: "加盟分校",
      value: stats?.totalFranchises ?? 0,
      icon: Building2,
      color: "bg-amber-warm text-amber-700",
    },
    {
      label: "總預約數",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "bg-tiffany/10 text-tiffany",
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-foreground mb-1">
        營運總覽
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        全國營運數據一覽
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-md border border-gray-100 p-5"
            data-testid={`stat-${card.label}`}
          >
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
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
  const [dirUsername, setDirUsername] = useState("");
  const [dirPassword, setDirPassword] = useState("");
  const [dirFirstName, setDirFirstName] = useState("");
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [formData, setFormData] = useState({
    name: "", city: "", district: "", address: "", phone: "", description: "",
    tags: [] as string[], nearbySchools: [] as string[], rating: 0, reviewCount: 0, isActive: true, maxSeats: 5,
  });
  const [tagInput, setTagInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");

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
    mutationFn: async (data: { franchiseId: number; username: string; password: string; firstName: string }) => {
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

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-md" />)}</div>
      ) : franchises.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無分校資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {franchises.map((f) => (
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
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例：大安旗艦校" data-testid="input-franchise-name" />
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
              disabled={!formData.name || !formData.city || !formData.district || !formData.address || saveMutation.isPending}
              data-testid="button-submit-franchise"
            >
              {saveMutation.isPending ? "儲存中..." : editingFranchise ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDirectorDialog} onOpenChange={(open) => { if (!open) { setDirectorFranchise(null); setDirUsername(""); setDirPassword(""); } setShowDirectorDialog(open); }}>
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
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4" data-testid={`admin-coach-${coach.id}`}>
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-lg font-serif text-tiffany">{coach.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{coach.name}</p>
                  {coach.isCertified && <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">已認證</span>}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getFranchiseName(coach.franchiseId)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{coach.specialties?.join(" · ") || "一般數學教學"}</p>
                {coach.bio && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{coach.bio}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {coach.rating != null && coach.rating > 0 && (
                  <div className="text-right mr-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{Number(coach.rating).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{coach.reviewCount} 則</p>
                  </div>
                )}
                <Button variant="outline" size="icon" onClick={() => openEdit(coach)} data-testid={`button-edit-coach-${coach.id}`}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => { if (confirm("確定要刪除此老師？")) deleteMutation.mutate(coach.id); }} data-testid={`button-delete-coach-${coach.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
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
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => { if (confirm("確定刪除此時段？")) deleteSlotMutation.mutate(slot.id); }} data-testid={`button-delete-slot-${slot.id}`}>
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
    },
    onError: (err: any) => {
      toast({ title: err.message || "建立帳號失敗", variant: "destructive" });
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
    setShowCredentialDialog(true);
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: "總部管理員", color: "bg-coral/10 text-coral" },
    franchise_admin: { label: "分校主任", color: "bg-tiffany/10 text-tiffany" },
    parent: { label: "家長", color: "bg-gray-100 text-gray-600" },
  };

  const getFranchiseName = (fId: number | null) => {
    if (!fId) return "";
    return franchiseList.find((f) => f.id === fId)?.name || "";
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">帳號管理</h1>
        <p className="text-sm text-muted-foreground">管理使用者角色，指派分校主任帳號</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
      ) : userList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無使用者</p>
        </div>
      ) : (
        <div className="space-y-2">
          {userList.map((u) => {
            const role = roleLabels[u.role || "parent"] || roleLabels.parent;
            return (
              <div key={u.id} className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4" data-testid={`admin-user-${u.id}`}>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
                    {u.role === "franchise_admin" && u.franchiseId && (
                      <span className="text-xs bg-amber-warm text-amber-700 px-2 py-0.5 rounded-full">
                        {getFranchiseName(u.franchiseId)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {u.email || "無 Email"}
                    {u.username && <span className="ml-2 text-tiffany">帳號: {u.username}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(u.role === "admin" || u.role === "franchise_admin") && (
                    <Button variant="outline" size="sm" onClick={() => openCredentialDialog(u)} data-testid={`button-set-credential-${u.id}`}>
                      <Lock className="w-3.5 h-3.5 mr-1" />{u.username ? "改密碼" : "設帳號"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openRoleDialog(u)} data-testid={`button-edit-user-role-${u.id}`}>
                    <Shield className="w-3.5 h-3.5 mr-1" />權限
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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

      <Dialog open={showCredentialDialog} onOpenChange={(open) => { if (!open) { setSelectedUser(null); setCredUsername(""); setCredPassword(""); } setShowCredentialDialog(open); }}>
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialDialog(false)}>取消</Button>
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
