import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Faq, SuccessStory, Franchise, Coach, Announcement, TimeSlot } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS } from "@shared/constants";

interface AdminStats {
  totalStudents: number;
  totalCoaches: number;
  totalFranchises: number;
  totalBookings: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
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
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-washi">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <p className="font-serif text-lg tracking-[0.1em] text-foreground">
                質數數學
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
                onClick={() => logout()}
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
  const [showAdd, setShowAdd] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/admin/faqs"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: {
      question: string;
      answer: string;
      category: string;
    }) => {
      const res = await apiRequest("POST", "/api/admin/faqs", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "FAQ 已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setShowAdd(false);
      setQuestion("");
      setAnswer("");
      setCategory("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/faqs/${id}`);
    },
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
          <p className="text-sm text-muted-foreground">管理官網 FAQ 內容</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-faq">
          <Plus className="w-4 h-4 mr-1.5" />
          新增 FAQ
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-md border border-gray-100 p-4"
              data-testid={`admin-faq-${faq.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-tiffany font-medium">
                    {faq.category}
                  </span>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {faq.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate(faq.id)}
                  data-testid={`button-delete-faq-${faq.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增常見問題</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>分類</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-faq-category">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {["關於課程", "關於費用", "關於老師", "關於預約"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>問題</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="輸入問題"
                data-testid="input-faq-question"
              />
            </div>
            <div>
              <Label>答案</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="輸入答案"
                data-testid="input-faq-answer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              取消
            </Button>
            <Button
              onClick={() =>
                addMutation.mutate({ question, answer, category })
              }
              disabled={!question || !answer || !category || addMutation.isPending}
              data-testid="button-submit-faq"
            >
              {addMutation.isPending ? "新增中..." : "確認新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoriesTab() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [grade, setGrade] = useState("");

  const { data: stories = [], isLoading } = useQuery<SuccessStory[]>({
    queryKey: ["/api/admin/success-stories"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: {
      studentName: string;
      testimonial: string;
      grade?: number;
    }) => {
      const res = await apiRequest("POST", "/api/admin/success-stories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "案例已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/success-stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      setShowAdd(false);
      setStudentName("");
      setTestimonial("");
      setGrade("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/success-stories/${id}`);
    },
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
          <p className="text-sm text-muted-foreground">管理家長好評與推薦</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-story">
          <Plus className="w-4 h-4 mr-1.5" />
          新增案例
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-md border border-gray-100 p-4"
              data-testid={`admin-story-${story.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-foreground">
                      {story.studentName}
                    </p>
                    {story.grade && (
                      <span className="text-xs bg-amber-warm text-foreground/70 px-2 py-0.5 rounded-full">
                        {story.grade}年級
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {story.testimonial}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate(story.id)}
                  data-testid={`button-delete-story-${story.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增成功案例</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>學生姓名</Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="學生姓名"
                data-testid="input-story-name"
              />
            </div>
            <div>
              <Label>年級</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger data-testid="select-story-grade">
                  <SelectValue placeholder="選擇年級" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      {g}年級
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>感言</Label>
              <Textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="家長或學生的推薦感言"
                data-testid="input-story-testimonial"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              取消
            </Button>
            <Button
              onClick={() =>
                addMutation.mutate({
                  studentName,
                  testimonial,
                  grade: grade ? parseInt(grade) : undefined,
                })
              }
              disabled={!studentName || !testimonial || addMutation.isPending}
              data-testid="button-submit-story"
            >
              {addMutation.isPending ? "新增中..." : "確認新增"}
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {f.rating != null && f.rating > 0 && (
                    <div className="text-right mr-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{Number(f.rating).toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.reviewCount} 則</p>
                    </div>
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("parent");
  const [newFranchiseId, setNewFranchiseId] = useState<number>(0);

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

  const openRoleDialog = (u: User) => {
    setSelectedUser(u);
    setNewRole(u.role || "parent");
    setNewFranchiseId(u.franchiseId || 0);
    setShowRoleDialog(true);
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
                  <p className="text-xs text-muted-foreground mt-0.5">{u.email || "無 Email"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openRoleDialog(u)} data-testid={`button-edit-user-role-${u.id}`}>
                  <Shield className="w-3.5 h-3.5 mr-1" />權限
                </Button>
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
    </div>
  );
}

function AnnouncementsTab() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      type: string;
    }) => {
      const res = await apiRequest("POST", "/api/admin/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "公告已發布" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setShowAdd(false);
      setTitle("");
      setContent("");
      setType("info");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/announcements/${id}`);
    },
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
        <Button onClick={() => setShowAdd(true)} className="rounded-full" data-testid="button-add-announcement">
          <Plus className="w-4 h-4 mr-1.5" />
          發布公告
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">尚無公告</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-md border border-gray-100 p-4"
              data-testid={`admin-announcement-${ann.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-medium text-foreground">
                      {ann.title}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ann.type === "important"
                          ? "bg-coral/10 text-coral"
                          : ann.type === "promotion"
                          ? "bg-amber-warm text-amber-700"
                          : "bg-tiffany/10 text-tiffany"
                      }`}
                    >
                      {ann.type === "important"
                        ? "重要"
                        : ann.type === "promotion"
                        ? "優惠"
                        : "一般"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ann.content}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {ann.createdAt
                      ? new Date(ann.createdAt).toLocaleDateString("zh-TW")
                      : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteMutation.mutate(ann.id)}
                  data-testid={`button-delete-announcement-${ann.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>發布公告</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>標題</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="公告標題"
                data-testid="input-announcement-title"
              />
            </div>
            <div>
              <Label>類型</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-announcement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">一般</SelectItem>
                  <SelectItem value="important">重要</SelectItem>
                  <SelectItem value="promotion">優惠</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>內容</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="公告內容"
                data-testid="input-announcement-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              取消
            </Button>
            <Button
              onClick={() => addMutation.mutate({ title, content, type })}
              disabled={!title || !content || addMutation.isPending}
              data-testid="button-submit-announcement"
            >
              {addMutation.isPending ? "發布中..." : "發布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
