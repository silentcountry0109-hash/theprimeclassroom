import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCredentialAuth } from "@/hooks/use-credential-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Users,
  CalendarCheck,
  LogOut,
  Plus,
  Trash2,
  GraduationCap,
  Clock,
  MapPin,
} from "lucide-react";
import type { Child, Booking } from "@shared/schema";
import type { User } from "@shared/models/auth";

interface BookingWithDetails extends Booking {
  slotDate?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  franchiseName?: string;
  coachName?: string;
  childName?: string;
}

export default function ParentDashboard() {
  const { user: replitUser, isLoading: replitLoading, logout: replitLogout } = useAuth();
  const { user: credUser, isLoading: credLoading, logout: credLogout } = useCredentialAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const isLoading = replitLoading || credLoading;
  const user = credUser || replitUser;
  const isCredentialUser = !!credUser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-washi flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-foreground mb-4">
            質數教室
          </h1>
          <Skeleton className="w-32 h-2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/parent-login";
    return null;
  }

  const handleLogout = () => {
    if (isCredentialUser) {
      credLogout();
      window.location.href = "/parent-login";
    } else {
      replitLogout();
    }
  };

  const typedUser = user as User;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-washi">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={typedUser.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-tiffany/10 text-tiffany">
                    {typedUser.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {typedUser.firstName} {typedUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {typedUser.email}
                  </p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>選單</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { id: "overview", label: "總覽", icon: Home },
                    { id: "children", label: "我的孩子", icon: Users },
                    { id: "bookings", label: "我的預約", icon: CalendarCheck },
                  ].map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        className={
                          activeTab === item.id ? "bg-sidebar-accent" : ""
                        }
                        data-testid={`nav-${item.id}`}
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
                onClick={() => handleLogout()}
                className="w-full justify-start text-muted-foreground"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-2 p-4 border-b border-gray-100 bg-white">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h2 className="font-serif text-lg tracking-wider text-foreground">
              質數教室
            </h2>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <OverviewTab user={typedUser} onNavigate={setActiveTab} />
            )}
            {activeTab === "children" && <ChildrenTab user={typedUser} />}
            {activeTab === "bookings" && <BookingsTab />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function OverviewTab({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: (tab: string) => void;
}) {
  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });
  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-foreground mb-1" data-testid="text-welcome">
        {user.firstName ? `${user.firstName}，歡迎回來` : "歡迎回來"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        管理您的孩子和預約
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          className="bg-white rounded-md border border-gray-100 p-5 cursor-pointer"
          onClick={() => onNavigate("children")}
          data-testid="card-stat-children"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-tiffany" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {children.length}
              </p>
              <p className="text-xs text-muted-foreground">已登記的孩子</p>
            </div>
          </div>
        </div>
        <div
          className="bg-white rounded-md border border-gray-100 p-5 cursor-pointer"
          onClick={() => onNavigate("bookings")}
          data-testid="card-stat-upcoming"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-tiffany" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {upcomingBookings.length}
              </p>
              <p className="text-xs text-muted-foreground">即將到來的課程</p>
            </div>
          </div>
        </div>
        <a
          href="/search"
          className="bg-white rounded-md border border-gray-100 p-5 block"
          data-testid="card-quick-book"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-coral" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">快速預約</p>
              <p className="text-xs text-muted-foreground">搜尋可用時段</p>
            </div>
          </div>
        </a>
      </div>

      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            即將到來的課程
          </h3>
          <div className="space-y-3">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
                data-testid={`booking-upcoming-${booking.id}`}
              >
                <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-tiffany" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {booking.franchiseName || "教室"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.slotDate} {booking.slotStartTime}
                    </span>
                    {booking.childName && (
                      <span>{booking.childName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChildrenTab({ user }: { user: User }) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; grade: number; school?: string }) => {
      const res = await apiRequest("POST", "/api/children", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "新增成功" });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      setShowAddDialog(false);
      setName("");
      setGrade("");
      setSchool("");
    },
    onError: (error: Error) => {
      toast({ title: "新增失敗", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/children/${id}`);
    },
    onSuccess: () => {
      toast({ title: "已刪除" });
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
    },
  });

  const handleAdd = () => {
    if (!name || !grade) return;
    addMutation.mutate({
      name,
      grade: parseInt(grade),
      school: school || undefined,
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">我的孩子</h1>
          <p className="text-sm text-muted-foreground">管理孩子的學習檔案</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="rounded-full"
          data-testid="button-add-child"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          新增孩子
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            尚未新增孩子
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            新增孩子後即可開始預約課程
          </p>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="rounded-full"
            data-testid="button-add-child-empty"
          >
            新增孩子
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
              data-testid={`card-child-${child.id}`}
            >
              <div className="w-12 h-12 rounded-full bg-tiffany/10 flex items-center justify-center">
                <span className="text-lg font-serif text-tiffany">
                  {child.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {child.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                  <span>{child.grade} 年級</span>
                  {child.school && <span>{child.school}</span>}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deleteMutation.mutate(child.id)}
                data-testid={`button-delete-child-${child.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增孩子</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>姓名</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入孩子的姓名"
                data-testid="input-child-name"
              />
            </div>
            <div>
              <Label>年級</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger data-testid="select-child-grade">
                  <SelectValue placeholder="選擇年級" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      {g} 年級
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>學校（選填）</Label>
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="請輸入學校名稱"
                data-testid="input-child-school"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!name || !grade || addMutation.isPending}
              data-testid="button-submit-child"
            >
              {addMutation.isPending ? "新增中..." : "確認新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingsTab() {
  const { toast } = useToast();
  const { data: bookings = [], isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      toast({ title: "已取消預約" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">我的預約</h1>
        <p className="text-sm text-muted-foreground">查看和管理您的預約</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md border border-gray-100">
          <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">
            尚無預約
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            搜尋可用時段開始預約課程
          </p>
          <a href="/search">
            <Button className="rounded-full" data-testid="button-go-search">
              搜尋課程
            </Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-md border border-gray-100 p-4 flex items-center gap-4"
              data-testid={`card-booking-${booking.id}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  booking.status === "confirmed"
                    ? "bg-tiffany/10"
                    : booking.status === "cancelled"
                    ? "bg-gray-100"
                    : "bg-amber-warm"
                }`}
              >
                <CalendarCheck
                  className={`w-6 h-6 ${
                    booking.status === "confirmed"
                      ? "text-tiffany"
                      : booking.status === "cancelled"
                      ? "text-gray-400"
                      : "text-amber-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-medium text-foreground">
                    {booking.franchiseName || "教室"}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-tiffany/10 text-tiffany"
                        : booking.status === "cancelled"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-warm text-amber-700"
                    }`}
                  >
                    {booking.status === "confirmed"
                      ? "已確認"
                      : booking.status === "cancelled"
                      ? "已取消"
                      : "已完成"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.slotDate} {booking.slotStartTime}
                  </span>
                  {booking.childName && <span>{booking.childName}</span>}
                  {booking.coachName && <span>老師：{booking.coachName}</span>}
                </div>
              </div>
              {booking.status === "confirmed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelMutation.mutate(booking.id)}
                  disabled={cancelMutation.isPending}
                  data-testid={`button-cancel-booking-${booking.id}`}
                >
                  取消
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
