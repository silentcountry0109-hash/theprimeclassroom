// 家長端共用型別與工具(web dashboard 與 LIFF 兩個 shell 共用)。
// 抽取自 parent-dashboard.tsx — 行為需與原版逐行等價,勿在此加入 shell 特定邏輯。
import type { Booking, CreditBalance } from "@shared/schema";

export interface BookingWithDetails extends Booking {
  slotDate?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  franchiseName?: string;
  coachName?: string;
  childName?: string;
  childGender?: string;
}

export interface ContactBookWithDetails {
  id: number;
  bookingId: number | null;
  coachId: number;
  childId: number;
  lessonDate: string;
  lessonUnit: string;
  lessonProgress: string | null;
  performance: string | null;
  classNotes: string | null;
  quizScore: number | null;
  quizTotal: number | null;
  homework: string | null;
  nextExam: string | null;
  teacherRemarks: string | null;
  createdAt: string | null;
  coachName: string;
  childName?: string;
  childGrade?: number;
  childGender?: string;
}

export interface WalletData {
  balance: number;
  balances: CreditBalance[];
  expiringBalances: { credits: number; expiresAt: string; daysLeft: number }[];
}

export const WALLET_QUERY_OPTIONS = {
  queryKey: ["/api/parent/wallet"] as const,
  staleTime: 60 * 1000,
  refetchOnWindowFocus: true,
  refetchInterval: 5 * 60 * 1000,
} as const;

// 正規 tab id(web 的 ?tab= 值)。LIFF shell 自行把 id 對應到 /liff/* 路徑。
export type ParentTabId =
  | "overview"
  | "book"
  | "children"
  | "bookings"
  | "credits"
  | "contact-book"
  | "shop";

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "夜深了";
  if (hour < 12) return "早安";
  if (hour < 18) return "午安";
  return "晚安";
}

export function getCountdownText(dateStr: string, timeStr: string): string {
  const now = new Date();
  const target = new Date(`${dateStr}T${timeStr}`);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "即將開始";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days} 天 ${hours} 小時後`;
  if (hours > 0) return `${hours} 小時 ${mins} 分鐘後`;
  return `${mins} 分鐘後`;
}
