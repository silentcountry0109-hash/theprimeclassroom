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
              <p className="font-serif text-lg tracking-[0.1em] text-foreground">質數數學</p>
              <p className="text-xs text-muted-foreground mt-0.5">分校管理系統</p>
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
              <SidebarMenuButton onClick={() => logout()} className="w-full justify-start text-muted-foreground" data-testid="franchise-button-logout">
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

  const statCards = [
    { label: "老師人數", value: stats?.totalCoaches ?? 0, icon: GraduationCap, color: "bg-tiffany/10 text-tiffany" },
    { label: "可用時段", value: stats?.totalSlots ?? 0, icon: Clock, color: "bg-coral/10 text-coral" },
    { label: "總預約數", value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: "bg-amber-warm text-amber-700" },
    { label: "已確認", value: stats?.confirmedBookings ?? 0, icon: Users, color: "bg-tiffany/10 text-tiffany" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-semibold text-foreground mb-1">
        {franchise?.name || "分校總覽"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {franchise ? `${franchise.city} ${franchise.district}` : "載入中..."}
      </p>
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
    </div>
  );
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
    </div>
  );
}

function CoachesTab() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    name: "", bio: "", specialties: [] as string[], isCertified: true, rating: 0, reviewCount: 0,
  });
  const [specialtyInput, setSpecialtyInput] = useState("");

  const { data: coaches = [], isLoading } = useQuery<Coach[]>({ queryKey: ["/api/franchise-admin/coaches"] });

  const resetForm = () => {
    setFormData({ name: "", bio: "", specialties: [], isCertified: true, rating: 0, reviewCount: 0 });
    setSpecialtyInput("");
    setEditingCoach(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };
  const openEdit = (c: Coach) => {
    setEditingCoach(c);
    setFormData({
      name: c.name, bio: c.bio || "", specialties: c.specialties || [],
      isCertified: c.isCertified, rating: c.rating || 0, reviewCount: c.reviewCount || 0,
    });
    setShowDialog(true);
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
            <div key={coach.id} className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4" data-testid={`franchise-coach-${coach.id}`}>
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-lg font-serif text-tiffany">{coach.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{coach.name}</p>
                  {coach.isCertified && <span className="text-xs bg-tiffany/10 text-tiffany px-2 py-0.5 rounded-full">已認證</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{coach.specialties?.join(" · ") || "一般數學教學"}</p>
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
      const res = await apiRequest("POST", "/api/franchise-admin/time-slots", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "時段已新增" });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/time-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/franchise-admin/stats"] });
      setShowAdd(false);
      setSlotForm({ date: "", startTime: "", endTime: "", coachId: 0, maxSeats: 5 });
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
                <Input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} data-testid="input-franchise-slot-start" />
              </div>
              <div>
                <Label>結束時間 *</Label>
                <Input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} data-testid="input-franchise-slot-end" />
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
              <Input type="number" min="1" value={slotForm.maxSeats} onChange={(e) => setSlotForm({ ...slotForm, maxSeats: parseInt(e.target.value) || 5 })} data-testid="input-franchise-slot-seats" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button
              onClick={() => addSlotMutation.mutate(slotForm)}
              disabled={!slotForm.date || !slotForm.startTime || !slotForm.endTime || addSlotMutation.isPending}
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
