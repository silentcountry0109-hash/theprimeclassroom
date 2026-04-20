import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch, useLocation } from "wouter";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { getDefaultClassroomImage } from "@/lib/default-images";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import ip13Img from "@assets/工作區域_13_1776423698455.png";
import deco14Img from "@assets/工作區域_14_1776423698455.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Star,
  Award,
  ChevronRight,
  Building2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";
import type { Franchise } from "@shared/schema";

interface FranchiseResult {
  franchise: Franchise;
  availableSlots: number;
  coachCount: number;
  coaches: string[];
  nextAvailable: string | null;
}

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "家長好評推薦": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "年度績優校區": { bg: "bg-tiffany/10", text: "text-tiffany", border: "border-tiffany/30" },
  "成績進步快速": { bg: "bg-coral/10", text: "text-coral", border: "border-coral/30" },
};

export default function SearchResults() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(searchString);
  const initialCity = params.get("city") || "";
  const initialDistrict = params.get("district") || "";
  const initialDays = params.get("days") ? params.get("days")!.split(",") : [];
  const initialPeriods = params.get("periods") ? params.get("periods")!.split(",") : [];

  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(initialPeriods);

  const districts = city ? TAIWAN_DISTRICTS[city] || [] : [];

  const queryParams = new URLSearchParams();
  if (city) queryParams.set("city", city);
  if (district) queryParams.set("district", district);
  if (selectedDays.length > 0) queryParams.set("days", selectedDays.join(","));
  if (selectedPeriods.length > 0) queryParams.set("periods", selectedPeriods.join(","));

  const { data: results = [], isLoading } = useQuery<FranchiseResult[]>({
    queryKey: ["/api/search-franchises", city, district, selectedDays.join(","), selectedPeriods.join(",")],
    queryFn: async () => {
      const res = await fetch(`/api/search-franchises?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
  });

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const togglePeriod = (period: string) => {
    setSelectedPeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    );
  };

  const filterSummary = () => {
    const parts = [];
    if (city) parts.push(city);
    if (district) parts.push(district);
    if (selectedDays.length > 0) {
      parts.push(selectedDays.map((d) => DAY_LABELS[d]).join("、"));
    }
    if (selectedPeriods.length > 0) {
      parts.push(selectedPeriods.map((p) => TIME_PERIODS.find((t) => t.value === p)?.label || "").join("、"));
    }
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-washi relative overflow-x-hidden">
      <img src={deco14Img} alt="" className="fixed top-24 right-4 md:right-10 w-20 md:w-28 pointer-events-none select-none opacity-[0.08] animate-float-deco" aria-hidden="true" />
      <Navbar />
      <div className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          className="mb-6 relative overflow-visible"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={ip13Img} alt="" className="absolute -top-6 -left-4 md:-left-10 w-12 md:w-14 h-auto object-contain pointer-events-none select-none animate-float-ip-slow" aria-hidden="true" />
          <Link href="/">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer mb-4 block" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </span>
          </Link>
          <h1
            className="font-serif text-2xl md:text-3xl tracking-[0.1em] text-foreground mb-2"
            data-testid="text-search-title"
          >
            搜尋教室
          </h1>
          <p className="text-sm text-muted-foreground">
            {filterSummary() && <span className="mr-2">{filterSummary()}</span>}
            {!isLoading && results.length > 0 && (
              <span>— 找到 {results.length} 間教室</span>
            )}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4 lg:sticky lg:top-24">
              <h3 className="text-sm font-semibold text-foreground tracking-wide">篩選條件</h3>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">縣市</label>
                <Select value={city} onValueChange={(val) => { setCity(val); setDistrict(""); }}>
                  <SelectTrigger className="text-sm" data-testid="filter-city">
                    <SelectValue placeholder="所有縣市" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">區/鄉鎮</label>
                <Select value={district} onValueChange={setDistrict} disabled={!city}>
                  <SelectTrigger className="text-sm" data-testid="filter-district">
                    <SelectValue placeholder={city ? "所有區域" : "先選縣市"} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">星期</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(DAY_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => toggleDay(val)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                        selectedDays.includes(val)
                          ? "bg-tiffany text-white border-tiffany"
                          : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                      }`}
                      data-testid={`filter-day-${val}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">時段</label>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_PERIODS.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => togglePeriod(period.value)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                        selectedPeriods.includes(period.value)
                          ? "bg-tiffany text-white border-tiffany"
                          : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                      }`}
                      data-testid={`filter-period-${period.value}`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {(city || district || selectedDays.length > 0 || selectedPeriods.length > 0) && (
                <button
                  onClick={() => {
                    setCity("");
                    setDistrict("");
                    setSelectedDays([]);
                    setSelectedPeriods([]);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-clear-filters"
                >
                  清除所有篩選
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-20">📐</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  目前沒有符合條件的教室
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  試試其他地區或調整篩選條件？
                </p>
                <Link href="/">
                  <Button className="rounded-full" data-testid="button-back-search">
                    重新搜尋
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, idx) => {
                  const f = result.franchise;
                  return (
                    <motion.div
                      key={f.id}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-tiffany/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/classroom/${f.id}`)}
                      data-testid={`franchise-card-${f.id}`}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: idx * 0.08 }}
                    >
                      {(() => {
                        const coverImg = f.coverPhoto || (f.photos && f.photos.length > 0 ? f.photos[0] : null) || getDefaultClassroomImage(f.id);
                        return (
                          <div className="w-full h-44 md:h-48 overflow-hidden">
                            <img src={coverImg} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        );
                      })()}
                      <div className="p-5">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-tiffany transition-colors">
                              {f.name}
                            </h3>
                            {(f.rating ?? 0) >= 4.8 && (
                              <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {f.rating?.toFixed(1)}
                              </span>
                            )}
                          </div>

                          {f.tags && f.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {f.tags.map((tag) => {
                                const style = TAG_STYLES[tag] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
                                return (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {tag === "家長好評推薦" && <Award className="w-3 h-3" />}
                                    {tag === "年度績優校區" && <Sparkles className="w-3 h-3" />}
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {f.city} {f.district} · {f.address}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {result.coachCount} 位老師
                            </span>
                          </div>

                          {f.description && (
                            <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-2">
                              {f.description}
                            </p>
                          )}

                          {f.nearbySchools && f.nearbySchools.length > 0 && (
                            <p className="text-xs text-muted-foreground/60">
                              鄰近學校：{f.nearbySchools.slice(0, 3).join("、")}
                              {f.nearbySchools.length > 3 && ` 等 ${f.nearbySchools.length} 所`}
                            </p>
                          )}
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:min-w-[140px]">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end mb-1">
                              <Clock className="w-3.5 h-3.5 text-tiffany" />
                              <span className="text-sm font-semibold text-tiffany">
                                {result.availableSlots} 個可預約時段
                              </span>
                            </div>
                            {result.nextAvailable && (
                              <p className="text-xs text-muted-foreground">
                                最近：{result.nextAvailable}
                              </p>
                            )}
                            {(f.reviewCount ?? 0) > 0 && (
                              <div className="flex items-center gap-1 justify-end mt-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.round(f.rating || 0)
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({f.reviewCount})
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="rounded-full px-5 text-sm group-hover:shadow-md transition-all"
                            style={{ backgroundColor: "#81D8D0", color: "white" }}
                            data-testid={`button-view-${f.id}`}
                          >
                            查看詳情
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
