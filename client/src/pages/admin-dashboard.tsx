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
} from "lucide-react";
import type { Faq, SuccessStory, Franchise, Coach, Announcement } from "@shared/schema";
import type { User } from "@shared/models/auth";

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
  const { data: franchises = [], isLoading } = useQuery<Franchise[]>({
    queryKey: ["/api/admin/franchises"],
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">加盟分校</h1>
        <p className="text-sm text-muted-foreground">全國分校一覽</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {franchises.map((franchise) => (
            <div
              key={franchise.id}
              className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
              data-testid={`admin-franchise-${franchise.id}`}
            >
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-tiffany" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {franchise.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {franchise.city} {franchise.district} · {franchise.address}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  franchise.isActive
                    ? "bg-tiffany/10 text-tiffany"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {franchise.isActive ? "營業中" : "暫停"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoachesTab() {
  const { data: coaches = [], isLoading } = useQuery<Coach[]>({
    queryKey: ["/api/admin/coaches"],
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">老師管理</h1>
        <p className="text-sm text-muted-foreground">認證老師一覽</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
              data-testid={`admin-coach-${coach.id}`}
            >
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-lg font-serif text-tiffany">
                  {coach.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">
                    {coach.name}
                  </p>
                  {coach.isCertified && (
                    <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">
                      已認證
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {coach.specialties?.join(" · ") || "一般數學教學"}
                </p>
              </div>
              {coach.rating != null && coach.rating > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">
                      {coach.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {coach.reviewCount} 則評價
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
