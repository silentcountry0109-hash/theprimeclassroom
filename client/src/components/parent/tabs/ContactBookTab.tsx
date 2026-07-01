// 家長端「聯絡簿」共用元件 — 抽取自 parent-dashboard.tsx ContactBookTab(web 超集)。
// web shell:預設全開,行為與原版逐行等價(另補顯示 schema 既有的 performance 欄位)。
// LIFF shell:enableLearningSummary=false(不抓 /api/textbooks、不顯示學習歷程區塊)。
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Child } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  TrendingUp,
  CalendarDays,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  FileText,
  Pencil,
  Award,
  Bell,
  Sparkles,
} from "lucide-react";
import avatarBoyPath from "@/assets/avatar-boy.png";
import avatarGirlPath from "@/assets/avatar-girl.png";
import type { ContactBookWithDetails } from "../types";

export function ContactBookTab({
  enableLearningSummary = true,
}: {
  enableLearningSummary?: boolean;
} = {}) {
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: childrenList = [] } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: contactBooksRaw = [], isLoading } = useQuery<ContactBookWithDetails[]>({
    queryKey: ["/api/parent/contact-books"],
  });

  const { data: textbooksData = [] } = useQuery<any[]>({
    queryKey: ["/api/textbooks"],
    enabled: enableLearningSummary,
  });

  const contactBooks = useMemo(() => {
    if (selectedChildId === "all") return contactBooksRaw;
    return contactBooksRaw.filter((cb) => cb.childId === parseInt(selectedChildId));
  }, [contactBooksRaw, selectedChildId]);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const textbookMap = useMemo(() => new Map(textbooksData.map((t: any) => [t.unitCode, t])), [textbooksData]);
  const textbookByName = useMemo(() => new Map(textbooksData.map((t: any) => [`${t.unitCode} ${t.unitName}`, t])), [textbooksData]);

  const matchTextbook = useCallback((lessonUnit: string) => {
    if (textbookMap.has(lessonUnit)) return textbookMap.get(lessonUnit);
    if (textbookByName.has(lessonUnit)) return textbookByName.get(lessonUnit);
    const entries = Array.from(textbookMap.values());
    for (let i = 0; i < entries.length; i++) {
      const t = entries[i];
      if (lessonUnit.includes(t.unitCode) || lessonUnit.includes(t.unitName)) return t;
    }
    return null;
  }, [textbookMap, textbookByName]);

  const gradeLabels = ["一", "二", "三", "四", "五", "六"];

  const learningSummaries = useMemo(() => {
    if (!enableLearningSummary) return [];
    const targetChildren = selectedChildId === "all"
      ? childrenList
      : childrenList.filter(c => c.id === parseInt(selectedChildId));

    return targetChildren.map(child => {
      const childBooks = contactBooksRaw.filter(cb => cb.childId === child.id);
      const gradeTextbooks = textbooksData.filter((t: any) => t.grade === child.grade);
      const completedUnits = new Set<string>();
      childBooks.forEach(cb => {
        const matched = matchTextbook(cb.lessonUnit);
        if (matched && matched.grade === child.grade) {
          completedUnits.add(matched.unitCode);
        }
      });
      const totalUnits = gradeTextbooks.length;
      const completed = completedUnits.size;
      const pct = totalUnits > 0 ? Math.round((completed / totalUnits) * 100) : 0;
      const quizzes = childBooks.filter(cb => cb.quizScore != null);
      const avgScore = quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, cb) => sum + (cb.quizScore! / (cb.quizTotal || 100)) * 100, 0) / quizzes.length)
        : null;
      return { child, completed, totalUnits, pct, quizCount: quizzes.length, avgScore, totalLessons: childBooks.length };
    });
  }, [childrenList, contactBooksRaw, textbooksData, selectedChildId, matchTextbook, enableLearningSummary]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2" data-testid="text-contact-book-title">
          <BookOpen className="w-5 h-5 text-tiffany" />
          聯絡簿
        </h2>
        {childrenList.length > 1 && (
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-36" data-testid="select-contact-book-child">
              <SelectValue placeholder="所有孩子" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有孩子</SelectItem>
              {childrenList.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {learningSummaries.length > 0 && learningSummaries.some(s => s.totalLessons > 0) && (
        <div className="space-y-3" data-testid="learning-summary-section">
          {learningSummaries.filter(s => s.totalLessons > 0).map(({ child, completed, totalUnits, pct, quizCount, avgScore, totalLessons }) => (
            <div key={child.id} className="bg-white rounded-xl border border-gray-100 p-4" data-testid={`learning-summary-${child.id}`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-tiffany" />
                <span className="text-sm font-semibold text-foreground">{child.name} 的學習歷程</span>
                <span className="text-[10px] bg-tiffany/10 text-tiffany px-1.5 py-0.5 rounded-full">
                  {gradeLabels[child.grade - 1] || child.grade}年級
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground" data-testid={`text-total-lessons-${child.id}`}>{totalLessons}</p>
                  <p className="text-[10px] text-muted-foreground">上課次數</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground" data-testid={`text-quiz-count-${child.id}`}>{quizCount}</p>
                  <p className="text-[10px] text-muted-foreground">考試次數</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${avgScore !== null ? (avgScore >= 80 ? "text-tiffany" : avgScore >= 60 ? "text-amber-500" : "text-red-500") : "text-muted-foreground"}`} data-testid={`text-avg-score-${child.id}`}>
                    {avgScore !== null ? `${avgScore}%` : "--"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">平均成績</p>
                </div>
              </div>
              {totalUnits > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">教材進度</span>
                    <span className="text-[10px] text-tiffany font-medium" data-testid={`text-parent-progress-${child.id}`}>{completed}/{totalUnits} 單元 ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: "#81D8D0" }}
                      data-testid={`parent-progress-bar-${child.id}`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {contactBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" data-testid="contact-book-empty">
          <BookOpen className="w-12 h-12 text-muted-foreground/15 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            目前還沒有聯絡簿
          </h3>
          <p className="text-xs text-muted-foreground">
            老師在上課後會為孩子填寫聯絡簿，屆時會顯示在這裡
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contactBooks.map((cb) => {
            const isExpanded = expandedId === cb.id;
            const avatarSrc = cb.childGender === "female" ? avatarGirlPath : avatarBoyPath;
            const dateObj = new Date(cb.lessonDate + "T00:00:00");
            const dateLabel = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

            return (
              <button
                key={cb.id}
                onClick={() => toggleExpand(cb.id)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-tiffany/20 transition-colors"
                data-testid={`contact-book-card-${cb.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {cb.childName && (
                      <img
                        src={avatarSrc}
                        alt={cb.childName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          {cb.childName && (
                            <span className="text-sm font-semibold text-foreground truncate" data-testid={`text-cb-child-${cb.id}`}>
                              {cb.childName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                          <CalendarDays className="w-3 h-3" />
                          <span data-testid={`text-cb-date-${cb.id}`}>{dateLabel}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">單元：</span>
                          <span className="text-foreground font-medium truncate" data-testid={`text-cb-unit-${cb.id}`}>{cb.lessonUnit}</span>
                        </div>
                        {cb.lessonProgress && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">進度：</span>
                            <span className="text-foreground truncate" data-testid={`text-cb-progress-${cb.id}`}>{cb.lessonProgress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <GraduationCap className="w-3 h-3 text-tiffany" />
                            {cb.coachName} 老師
                          </span>
                          {cb.quizScore !== null && cb.quizScore !== undefined && (
                            <span className="flex items-center gap-1 text-muted-foreground" data-testid={`text-cb-score-${cb.id}`}>
                              <FileText className="w-3 h-3" />
                              小考 {cb.quizScore}/{cb.quizTotal || 100}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-gray-50 space-y-3" data-testid={`contact-book-detail-${cb.id}`}>
                      {cb.performance && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            上課表現
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-gray-50/80 rounded-lg p-3" data-testid={`text-cb-performance-${cb.id}`}>
                            {cb.performance}
                          </p>
                        </div>
                      )}
                      {cb.homework && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            回家作業
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-gray-50/80 rounded-lg p-3" data-testid={`text-cb-homework-${cb.id}`}>
                            {cb.homework}
                          </p>
                        </div>
                      )}
                      {cb.nextExam && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Pencil className="w-3 h-3" />
                            下次考試
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-gray-50/80 rounded-lg p-3" data-testid={`text-cb-next-exam-${cb.id}`}>
                            {cb.nextExam}
                          </p>
                        </div>
                      )}
                      {cb.quizScore !== null && cb.quizScore !== undefined && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-tiffany" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">小考成績</p>
                            <p className="text-lg font-bold text-foreground" data-testid={`text-cb-score-detail-${cb.id}`}>
                              {cb.quizScore} <span className="text-sm font-normal text-muted-foreground">/ {cb.quizTotal || 100}</span>
                            </p>
                          </div>
                        </div>
                      )}
                      {cb.teacherRemarks && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            老師備註
                          </p>
                          <p className="text-sm text-foreground leading-relaxed bg-tiffany/5 rounded-lg p-3 border border-tiffany/10" data-testid={`text-cb-remarks-${cb.id}`}>
                            {cb.teacherRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
