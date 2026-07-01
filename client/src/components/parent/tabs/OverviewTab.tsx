// 家長端「首頁總覽」共用元件 — 抽取自 parent-dashboard.tsx OverviewTab(web 超集)。
// web shell:全 flag 預設開、navigate=setActiveTab(?tab= 路由),行為與原版逐行等價。
// LIFF shell:enableShop/enableChildrenTab 關閉、navigate 對應到 /liff/* 路徑。
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Child } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Bell,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Users,
  Plus,
  Wallet,
  Timer,
  CalendarPlus,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import avatarBoyPath from "@/assets/avatar-boy.png";
import avatarGirlPath from "@/assets/avatar-girl.png";
import {
  type BookingWithDetails,
  type WalletData,
  type ParentTabId,
  WALLET_QUERY_OPTIONS,
  getTimeGreeting,
  getCountdownText,
} from "../types";

export function OverviewTab({
  user,
  navigate,
  enableShop = true,
  enableChildrenTab = true,
}: {
  user: User;
  navigate: (tab: ParentTabId) => void;
  enableShop?: boolean;
  enableChildrenTab?: boolean;
}) {
  const { data: children = [], isError: childrenError } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });
  const { data: bookings = [], isError: bookingsError } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const upcomingBookings = bookings
    .filter((b) => {
      if (b.status !== "confirmed" && b.status !== "checked_in") return false;
      if (!b.slotDate) return false;
      const now = new Date();
      const slotEnd = new Date(b.slotDate + "T" + (b.slotEndTime || "23:59") + ":00+08:00");
      return slotEnd > now;
    })
    .sort((a, b) => {
      const dateA = `${a.slotDate} ${a.slotStartTime}`;
      const dateB = `${b.slotDate} ${b.slotStartTime}`;
      return dateA.localeCompare(dateB);
    });

  const completedCount = bookings.filter((b) => b.status === "completed").length;

  const nextClassPerChild = useMemo(() => {
    const seen = new Set<number>();
    const result: typeof upcomingBookings = [];
    for (const b of upcomingBookings) {
      if (!seen.has(b.childId)) {
        seen.add(b.childId);
        result.push(b);
      }
    }
    return result;
  }, [upcomingBookings]);

  const gradeLabel = (g: number) => {
    const labels = ["一", "二", "三", "四", "五", "六"];
    return labels[g - 1] ? `${labels[g - 1]}年級` : `${g}年級`;
  };

  return (
    <div className="space-y-5">
      {(childrenError || bookingsError) && (
        <div className="bg-white rounded-xl border border-red-200 p-4 flex items-center gap-3" data-testid="error-loading">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">部分資料載入失敗，請重新整理頁面再試</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground" data-testid="text-welcome">
            {user.firstName ? `${user.firstName}，${getTimeGreeting()}` : getTimeGreeting()}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-today-date">
            {new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
        {upcomingBookings.length > 0 && (
          <button
            onClick={() => navigate("bookings")}
            className="flex items-center gap-1.5 text-xs text-tiffany bg-tiffany/5 px-3 py-1.5 rounded-full hover:bg-tiffany/10 transition-colors"
            data-testid="link-all-bookings-count"
          >
            <Bell className="w-3.5 h-3.5" />
            {upcomingBookings.length} 堂待上課
          </button>
        )}
      </div>

      {nextClassPerChild.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-tiffany" />
            <span className="text-xs font-medium text-tiffany tracking-wider">下一堂課</span>
            <span className="text-[10px] text-muted-foreground ml-auto" data-testid="text-next-class-countdown">
              {nextClassPerChild[0].slotDate && nextClassPerChild[0].slotStartTime && getCountdownText(nextClassPerChild[0].slotDate, nextClassPerChild[0].slotStartTime)}
            </span>
          </div>
          {nextClassPerChild.map((nc) => (
            <button
              key={nc.id}
              onClick={() => navigate("bookings")}
              className="w-full bg-gradient-to-r from-tiffany/8 via-white to-coral/5 rounded-2xl border border-tiffany/20 p-4 sm:p-5 text-left hover:shadow-md transition-all group"
              data-testid={`card-next-class-${nc.childId}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
                  <div className="text-xs text-muted-foreground text-center">
                    {(() => {
                      if (!nc.slotDate) return "";
                      const d = new Date(nc.slotDate + "T00:00:00");
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const tmrw = new Date(today); tmrw.setDate(tmrw.getDate()+1);
                      if (d.getTime() === today.getTime()) return "今天";
                      if (d.getTime() === tmrw.getTime()) return "明天";
                      return `${d.getMonth()+1}/${d.getDate()}`;
                    })()}
                  </div>
                  <div className="text-xl font-bold text-tiffany text-center">
                    {nc.slotStartTime?.slice(0, 5)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-foreground truncate group-hover:text-tiffany transition-colors">
                      {nc.franchiseName || "教室"}
                    </p>
                    {nc.status === "checked_in" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0" data-testid={`badge-in-class-${nc.id}`}>
                        上課中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5 flex-wrap">
                    <span className="text-muted-foreground/60">
                      {nc.slotStartTime?.slice(0,5)} - {nc.slotEndTime?.slice(0,5)}
                    </span>
                    {nc.coachName && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-tiffany" />
                        {nc.coachName} 老師
                      </span>
                    )}
                  </div>
                  {nc.childName && (
                    <div className="flex items-center gap-1.5 mt-2" data-testid={`text-next-class-child-${nc.childId}`}>
                      <img
                        src={nc.childGender === "female" ? avatarGirlPath : avatarBoyPath}
                        alt={nc.childName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-foreground">{nc.childName}</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-tiffany transition-colors flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              開始使用質數教室
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              先登記孩子的資料，就可以搜尋教室、預約課程
            </p>
            {enableChildrenTab && (
              <Button
                onClick={() => navigate("children")}
                size="sm"
                className="rounded-full"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                data-testid="button-add-child-cta"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                登記孩子
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4 text-tiffany" />
              孩子概況
            </h2>
            {enableChildrenTab && (
              <button
                onClick={() => navigate("children")}
                className="text-xs text-muted-foreground hover:text-tiffany flex items-center gap-0.5 transition-colors"
                data-testid="link-manage-children"
              >
                管理
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className={`grid gap-3 ${children.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {children.map((child) => {
              const childUpcoming = upcomingBookings.filter((b) => b.childId === child.id).length;
              const childCompleted = bookings.filter((b) => b.childId === child.id && b.status === "completed").length;
              const avatarSrc = child.gender === "female" ? avatarGirlPath : avatarBoyPath;
              return (
                <div
                  key={child.id}
                  className="bg-white rounded-xl border border-gray-100 p-3.5 hover:border-tiffany/20 transition-colors"
                  data-testid={`overview-child-${child.id}`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img src={avatarSrc} alt={child.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-50" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-overview-child-name-${child.id}`}>{child.name}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-overview-child-grade-${child.id}`}>{gradeLabel(child.grade)}{child.school ? ` · ${child.school}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-tiffany" />
                      <span className="text-muted-foreground">待上課</span>
                      <span className="font-semibold text-foreground" data-testid={`text-overview-child-upcoming-${child.id}`}>{childUpcoming}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">已完成</span>
                      <span className="font-semibold text-foreground" data-testid={`text-overview-child-completed-${child.id}`}>{childCompleted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <WalletOverviewCard navigate={navigate} />

      <div className={`grid ${enableShop ? "grid-cols-3" : "grid-cols-2"} gap-2.5`}>
        <button
          onClick={() => navigate("book")}
          className="bg-gradient-to-br from-tiffany/8 to-tiffany/3 rounded-xl border border-tiffany/15 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
          data-testid="card-quick-book"
        >
          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <CalendarPlus className="w-5 h-5 text-tiffany" />
          </div>
          <p className="text-xs font-semibold text-foreground">預約課程</p>
        </button>
        <button
          onClick={() => navigate("bookings")}
          className="bg-white rounded-xl border border-gray-100 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
          data-testid="card-stat-upcoming"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-xs font-semibold text-foreground">{completedCount} 堂完成</p>
        </button>
        {enableShop && (
          <button
            onClick={() => navigate("shop")}
            className="bg-white rounded-xl border border-gray-100 p-3.5 text-center hover:shadow-sm hover:border-tiffany/30 transition-all group"
            data-testid="card-quick-shop"
          >
            <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-coral" />
            </div>
            <p className="text-xs font-semibold text-foreground">教材商城</p>
          </button>
        )}
      </div>

    </div>
  );
}

function WalletOverviewCard({ navigate }: { navigate: (tab: ParentTabId) => void }) {
  const { data: wallet, isLoading } = useQuery<WalletData>(WALLET_QUERY_OPTIONS);

  if (isLoading) {
    return <Skeleton className="h-28 rounded-xl" />;
  }

  const balance = wallet?.balance || 0;
  const expiringBalances = wallet?.expiringBalances || [];

  return (
    <button
      onClick={() => navigate("credits")}
      className="w-full bg-gradient-to-r from-tiffany/10 via-white to-tiffany/5 rounded-xl border border-tiffany/20 p-4 text-left hover:shadow-sm transition-all group"
      data-testid="card-wallet-overview"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-tiffany" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">剩餘堂數</p>
            <p className="text-2xl font-bold text-foreground" data-testid="text-wallet-balance">
              {balance} <span className="text-sm font-normal text-muted-foreground">堂</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-tiffany transition-colors">
          <span>查看詳情</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
      {expiringBalances.length > 0 && (
        <div className="mt-3 pt-3 border-t border-tiffany/10">
          {expiringBalances.map((eb, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-amber-600" data-testid={`text-expiring-${idx}`}>
              <Timer className="w-3 h-3 flex-shrink-0" />
              <span>{eb.credits} 堂將於 {new Date(eb.expiresAt).toLocaleDateString("zh-TW", { month: "short", day: "numeric" })} 到期（剩 {eb.daysLeft} 天）</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
