import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import CoachCard from "@/components/coach-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  GraduationCap,
  Search,
  Users,
  Target,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Building2,
  BookOpen,
  Layers,
  BarChart3,
  Repeat,
  Lightbulb,
  PenLine,
  Map,
  Compass,
  Milestone,
  Eye,
} from "lucide-react";
import type { Coach, Faq, SuccessStory } from "@shared/schema";

import heroClassroomImg from "@assets/hero_classroom.png";
import brandPhilosophyImg from "@assets/brand_philosophy.png";
import learningDetailImg from "@assets/learning_detail.png";
import parentChildImg from "@assets/parent_child.png";
import teacher1Img from "@assets/teacher_1.png";
import teacher2Img from "@assets/teacher_2.png";
import teacher3Img from "@assets/teacher_3.png";
import teacher4Img from "@assets/teacher_4.png";
import teacher5Img from "@assets/teacher_5.png";
import teacher6Img from "@assets/teacher_6.png";
import studentBoy1 from "@assets/student_boy_1.png";
import studentBoy2 from "@assets/student_boy_2.png";
import studentGirl1 from "@assets/student_girl_1.png";
import studentBoy3 from "@assets/student_boy_3.png";
import studentGirl2 from "@assets/student_girl_2.png";

const TEACHER_PHOTOS: Record<string, string> = {
  "林佳慧": teacher1Img,
  "陳志明": teacher2Img,
  "王雅琪": teacher3Img,
  "張育銘": teacher4Img,
  "李美玲": teacher5Img,
  "黃建宏": teacher6Img,
};

const STUDENT_PHOTOS: Record<string, string> = {
  "小明": studentBoy1,
  "小華": studentBoy2,
  "小美": studentGirl1,
  "小傑": studentBoy3,
  "小芳": studentGirl2,
};

import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

function HeroSection() {
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  const districts = city ? TAIWAN_DISTRICTS[city] || [] : [];

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (selectedDays.length > 0) params.set("days", selectedDays.join(","));
    if (selectedPeriods.length > 0) params.set("periods", selectedPeriods.join(","));
    navigate(`/search?${params.toString()}`);
  };

  const timeFilterLabel = () => {
    const parts = [];
    if (selectedDays.length > 0) {
      parts.push(selectedDays.map((d) => DAY_LABELS[d]).join("、"));
    }
    if (selectedPeriods.length > 0) {
      parts.push(selectedPeriods.map((p) => TIME_PERIODS.find((t) => t.value === p)?.label || "").join("、"));
    }
    return parts.length > 0 ? parts.join(" · ") : "";
  };

  const titleChars = ["質", "數", "教", "室"];

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 md:pt-20 pb-12 md:pb-16"
      style={{ backgroundColor: "#FAF9F6" }}
    >
      <div
        className="absolute inset-0 pointer-events-none animate-grid-h"
        style={{
          backgroundImage: "linear-gradient(rgba(129, 216, 208, 0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none animate-grid-v"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(129, 216, 208, 0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <span className="absolute top-[12%] left-[6%] text-6xl md:text-8xl text-tiffany/[0.14] font-serif rotate-[-15deg]">+</span>
        <span className="absolute top-[22%] right-[10%] text-5xl md:text-7xl text-coral/[0.18] font-serif rotate-[20deg]">×</span>
        <span className="absolute bottom-[35%] left-[12%] text-5xl md:text-6xl text-tiffany/[0.12] font-serif rotate-[10deg] hidden sm:block">÷</span>
        <span className="absolute bottom-[18%] right-[6%] text-7xl md:text-9xl text-tiffany/[0.12] font-serif rotate-[-8deg]">−</span>
        <span className="absolute top-[50%] left-[3%] text-4xl md:text-5xl text-coral/[0.14] font-serif rotate-[25deg] hidden sm:block">∑</span>
        <span className="absolute top-[65%] right-[4%] text-5xl md:text-6xl text-tiffany/[0.10] font-serif rotate-[-20deg] hidden sm:block">π</span>
        <span className="absolute top-[35%] right-[25%] text-3xl md:text-4xl text-tiffany/[0.12] font-serif rotate-[15deg] hidden md:block">∞</span>
        <span className="absolute bottom-[45%] left-[30%] text-4xl md:text-5xl text-coral/[0.12] font-serif rotate-[-10deg] hidden md:block">√</span>
      </div>

      <div className="text-center max-w-4xl mx-auto z-10 px-2">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.1em] sm:tracking-[0.15em] text-foreground mb-4 overflow-hidden">
          {titleChars.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 40, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.12,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="text-lg md:text-xl text-tiffany font-medium tracking-[0.1em] mb-3"
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.1em" }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
        >
          The Prime
        </motion.p>
        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-2 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          國小數學個別指導
        </motion.p>
        <motion.p
          className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-8 md:mb-14 leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          讓教學回歸「1 位老師」對「1 位學生」的學習體驗
        </motion.p>
      </div>

      <motion.div
        id="hero-search"
        className="w-full max-w-3xl mx-auto z-20 relative"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      >
        <motion.p
          className="text-center text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <Sparkles className="w-4 h-4 text-tiffany" />
          找到最適合孩子的數學老師，立即預約免費診斷
        </motion.p>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-[2rem] border border-tiffany/15 shadow-[0_8px_40px_rgba(129,216,208,0.12)] p-2 md:p-3 relative">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 px-3 md:px-4 py-2.5 md:py-3 md:border-r border-b md:border-b-0 border-gray-200/50">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-3.5 md:w-4 h-3.5 md:h-4 text-tiffany" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">縣市</span>
              </div>
              <Select value={city} onValueChange={(val) => { setCity(val); setDistrict(""); }}>
                <SelectTrigger className="border-0 p-0 h-auto shadow-none text-base font-medium focus:ring-0" data-testid="select-city">
                  <SelectValue placeholder="選擇縣市" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 px-3 md:px-4 py-2.5 md:py-3 md:border-r border-b md:border-b-0 border-gray-200/50">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-tiffany" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">區/鄉鎮</span>
              </div>
              <Select value={district} onValueChange={setDistrict} disabled={!city}>
                <SelectTrigger className="border-0 p-0 h-auto shadow-none text-base font-medium focus:ring-0" data-testid="select-district">
                  <SelectValue placeholder={city ? "選擇區域" : "先選縣市"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 px-3 md:px-4 py-2.5 md:py-3 md:border-r border-b md:border-b-0 border-gray-200/50 relative">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-tiffany" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">時段</span>
              </div>
              <button
                onClick={() => setShowTimeFilter(!showTimeFilter)}
                className="w-full text-left text-base font-medium text-foreground flex items-center justify-between"
                data-testid="button-time-filter"
              >
                <span className={timeFilterLabel() ? "text-foreground" : "text-muted-foreground"}>
                  {timeFilterLabel() || "選擇時段"}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTimeFilter ? "rotate-180" : ""}`} />
              </button>
              {showTimeFilter && (
                <div className="absolute top-full left-0 right-0 md:left-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl p-4 z-[100] min-w-[240px] md:min-w-[280px] -mx-2 md:mx-0">
                  <p className="text-xs font-medium text-muted-foreground mb-2">星期</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(DAY_LABELS).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => toggleDay(val)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          selectedDays.includes(val)
                            ? "bg-tiffany text-white border-tiffany"
                            : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                        }`}
                        data-testid={`chip-day-${val}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">時段</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PERIODS.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => togglePeriod(period.value)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          selectedPeriods.includes(period.value)
                            ? "bg-tiffany text-white border-tiffany"
                            : "bg-white text-muted-foreground border-gray-200 hover:border-tiffany/50"
                        }`}
                        data-testid={`chip-period-${period.value}`}
                      >
                        {period.label}
                        <span className="text-[10px] opacity-70 ml-1">{period.range}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTimeFilter(false)}
                    className="w-full mt-3 text-xs text-tiffany font-medium py-1.5 rounded-lg hover:bg-tiffany/5 transition-colors"
                    data-testid="button-time-filter-done"
                  >
                    完成
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center px-2 py-2">
              <Button
                onClick={handleSearch}
                className="rounded-full w-full md:w-auto px-8 py-3 text-sm font-medium relative group"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                data-testid="button-hero-search"
              >
                <span className="absolute inset-0 rounded-full bg-tiffany/20 animate-ping opacity-30 group-hover:opacity-0" />
                <Search className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">搜尋</span>
              </Button>
            </div>
          </div>
        </div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {["免費診斷", "無需綁約", "隨時取消"].map((text) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-tiffany" />
              {text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-3 mt-6 md:mt-10 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <div className="flex -space-x-2 md:-space-x-3">
          <img src={teacher1Img} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover" />
          <img src={teacher2Img} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover" />
          <img src={teacher3Img} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover" />
          <img src={teacher4Img} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover hidden sm:block" />
        </div>
        <div className="text-left">
          <p className="text-xs sm:text-sm font-semibold text-foreground">200+ 位家長推薦</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">4.8 / 5</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-5 h-5 text-muted-foreground/40" />
      </motion.div>
    </section>
  );
}

function BrandPhilosophySection() {
  const philosophies = [
    {
      icon: Users,
      title: "個別指導・個別進度",
      description: "每位孩子都有專屬的學習計畫，老師一對一關注，不是大班齊頭式教學",
      color: "tiffany",
    },
    {
      icon: Lightbulb,
      title: "理解優先・不靠死背",
      description: "引導孩子真正理解觀念，而非填鴨式記憶，讓數學成為思考的工具",
      color: "coral",
    },
    {
      icon: Map,
      title: "學習地圖・透明可見",
      description: "家長清楚掌握孩子的學習階段、單元進度與重點，學習不再是黑箱",
      color: "tiffany",
    },
    {
      icon: Shield,
      title: "溫暖空間・安心成長",
      description: "明亮舒適的教室環境，讓孩子在輕鬆愉快的氛圍中專注學習",
      color: "coral",
    },
  ];

  return (
    <section className="relative bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-24">
        <motion.div className="text-center mb-10 md:mb-14" {...fadeInUp}>
          <p className="text-sm text-tiffany font-medium tracking-widest mb-3">BRAND PHILOSOPHY</p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-4" data-testid="text-brand-philosophy-title">
            品牌與教學理念
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Prime 質數教室，專注國小數學個別指導。我們相信每個孩子都有獨特的學習節奏，不該被統一的進度框架限制。透過一對一的個別指導，讓每位孩子都能按照自己的步調，扎實地建立數學基礎。
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-2xl overflow-hidden mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={brandPhilosophyImg}
            alt="質數教室的溫暖教學環境"
            className="w-full h-[220px] sm:h-[300px] md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm md:text-base">國小數學個別指導</p>
                <p className="text-white/70 text-xs">小一到小六・完整課程規劃</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
          {philosophies.map((item, i) => (
            <motion.div
              key={item.title}
              className="text-center p-5 md:p-6 rounded-2xl bg-washi border border-transparent hover:border-tiffany/15 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              data-testid={`card-philosophy-${i}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${item.color === "tiffany" ? "bg-tiffany/10" : "bg-coral/10"}`}>
                <item.icon className={`w-5 h-5 ${item.color === "tiffany" ? "text-tiffany" : "text-coral"}`} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1.5">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-r from-tiffany/5 to-coral/5 rounded-2xl p-6 md:p-8 border border-tiffany/10 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-foreground font-medium text-base md:text-lg leading-relaxed">
            「不是補習，是真正理解數學。<br className="hidden sm:block" />當孩子真正理解了，分數自然會來。」
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TeachingMethodSection() {
  const methods = [
    {
      icon: Repeat,
      title: "螺旋式課程",
      description: "同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。",
      color: "tiffany",
    },
    {
      icon: Layers,
      title: "階梯式教學",
      description: "由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。",
      color: "coral",
    },
    {
      icon: BarChart3,
      title: "單元評測",
      description: "每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。",
      color: "tiffany",
    },
    {
      icon: Users,
      title: "個別指導・個別進度",
      description: "每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。",
      color: "coral",
    },
  ];

  return (
    <section id="teaching" className="py-14 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4" data-testid="text-teaching-title">
            教學特色
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，為每個孩子量身打造吸收效率最好的學習規劃
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {methods.map((method, i) => (
            <motion.div
              key={method.title}
              className="group relative bg-washi rounded-2xl p-5 md:p-8 border border-transparent hover:border-tiffany/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              data-testid={`card-teaching-method-${i}`}
            >
              <div className="flex items-start gap-4 md:gap-5">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 ${method.color === "tiffany" ? "bg-tiffany/10" : "bg-coral/10"}`}>
                  <method.icon className={`w-6 h-6 md:w-7 md:h-7 ${method.color === "tiffany" ? "text-tiffany" : "text-coral"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg md:text-xl tracking-wide text-foreground mb-1.5 md:mb-2">{method.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{method.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function LearningMapSection() {
  const highlights = [
    {
      icon: Compass,
      title: "清楚定位",
      description: "孩子現在在哪個學習階段，一目瞭然",
      color: "tiffany",
    },
    {
      icon: BookOpen,
      title: "學習單元",
      description: "正在學什麼、接下來要學什麼，家長全程掌握",
      color: "coral",
    },
    {
      icon: Target,
      title: "學習重點",
      description: "每個單元的核心觀念與重點，清楚標示",
      color: "tiffany",
    },
    {
      icon: Eye,
      title: "進度透明",
      description: "老師、家長、孩子三方同步，學習不再是黑箱",
      color: "coral",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-tiffany/10 text-tiffany text-sm font-medium px-3 py-1.5 rounded-full mb-4">
              <Map className="w-4 h-4" />
              學習地圖領航
            </div>
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-4 md:mb-6" data-testid="text-learning-map-title">
              讓學習的每一步<br className="hidden sm:block" />都扎實穩固
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 md:mb-8">
              我們會為每位學生與家長提供一份專屬的學習地圖。您會清楚知道孩子現在在哪個階段、正在學什麼單元、重點是什麼。不再盲目前進，讓學習地圖領航，孩子走的每一步都踏實有力。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  data-testid={`card-learning-map-${i}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color === "tiffany" ? "bg-tiffany/10" : "bg-coral/10"}`}>
                    <item.icon className={`w-4.5 h-4.5 ${item.color === "tiffany" ? "text-tiffany" : "text-coral"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-tiffany/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-tiffany" />
                </div>
                <span className="text-sm font-medium text-foreground">小明的學習地圖</span>
                <span className="ml-auto text-xs text-tiffany bg-tiffany/10 px-2 py-0.5 rounded-full">小三</span>
              </div>

              <div className="space-y-4">
                {[
                  { unit: "三位數加減", status: "completed", label: "已完成" },
                  { unit: "乘法基礎", status: "completed", label: "已完成" },
                  { unit: "除法概念", status: "current", label: "學習中" },
                  { unit: "分數初步", status: "upcoming", label: "即將學習" },
                  { unit: "長度與重量", status: "upcoming", label: "即將學習" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                        item.status === "completed" ? "bg-tiffany border-tiffany" :
                        item.status === "current" ? "bg-white border-coral ring-4 ring-coral/20" :
                        "bg-gray-100 border-gray-300"
                      }`} />
                      {i < 4 && (
                        <div className={`w-0.5 h-6 ${
                          item.status === "completed" ? "bg-tiffany/40" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                    <div className={`flex-1 flex items-center justify-between py-1 ${
                      item.status === "current" ? "font-medium text-foreground" : 
                      item.status === "completed" ? "text-muted-foreground" : "text-muted-foreground/60"
                    }`}>
                      <span className="text-sm">{item.unit}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === "completed" ? "bg-tiffany/10 text-tiffany" :
                        item.status === "current" ? "bg-coral/10 text-coral" :
                        "bg-gray-100 text-muted-foreground"
                      }`}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>學習進度</span>
                  <span className="text-tiffany font-medium">2 / 5 單元完成</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-tiffany to-tiffany/70 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "40%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-tiffany/5 rounded-full -z-10" />
            <div className="absolute -top-3 -left-3 w-14 h-14 bg-coral/5 rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TextbookSection() {
  const grades = [
    { grade: "小一", books: ["第1冊", "第2冊"], color: "bg-tiffany/80" },
    { grade: "小二", books: ["第3冊", "第4冊"], color: "bg-tiffany/70" },
    { grade: "小三", books: ["第5冊", "第6冊"], color: "bg-tiffany/60" },
    { grade: "小四", books: ["第7冊", "第8冊"], color: "bg-coral/50" },
    { grade: "小五", books: ["第9冊", "第10冊"], color: "bg-coral/60" },
    { grade: "小六", books: ["第11冊", "第12冊"], color: "bg-coral/70" },
  ];

  const structure = [
    { icon: Lightbulb, label: "觀念", desc: "清楚建立核心概念" },
    { icon: BookOpen, label: "範例", desc: "老師帶領示範解題" },
    { icon: PenLine, label: "演練", desc: "即時動手練習鞏固" },
    { icon: Target, label: "課後練習", desc: "回家複習加深記憶" },
  ];

  return (
    <section id="textbook" className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4" data-testid="text-textbook-title">
            教材介紹
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            小一到小六共 12 冊，以一個單元一本教材，觀念、範例、演練、課後練習，由淺入深，紮實學習
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-xl tracking-wide text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-tiffany" />
              全套 12 冊教材
            </h3>
            <div className="space-y-3">
              {grades.map((g, i) => (
                <motion.div
                  key={g.grade}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  data-testid={`row-textbook-grade-${i}`}
                >
                  <div className={`w-16 text-center py-2 rounded-lg text-white text-sm font-medium ${g.color}`}>
                    {g.grade}
                  </div>
                  <div className="flex-1 flex gap-2">
                    {g.books.map((b) => (
                      <div key={b} className="flex-1 bg-white rounded-lg py-2.5 px-4 text-sm text-foreground border border-gray-100 text-center font-medium">
                        {b}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 className="font-serif text-xl tracking-wide text-foreground mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-coral" />
              每本教材結構
            </h3>
            <div className="relative">
              {structure.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="flex items-start gap-4 relative pb-8 last:pb-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  data-testid={`step-textbook-structure-${i}`}
                >
                  {i < structure.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-tiffany/30 to-coral/30" />
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${i < 2 ? "bg-tiffany/10" : "bg-coral/10"}`}>
                    <step.icon className={`w-6 h-6 ${i < 2 ? "text-tiffany" : "text-coral"}`} />
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
                    <p className="font-medium text-foreground mb-0.5">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-xl p-5 border border-tiffany/15">
              <p className="text-sm text-foreground font-medium mb-1">由淺入深的設計理念</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                每本教材從觀念建立開始，透過範例示範，再讓孩子親自演練，最後以課後練習鞏固。確保每個單元都能真正被理解、被吸收。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "個別指導",
      description:
        "每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。",
      image: learningDetailImg,
    },
    {
      icon: Shield,
      title: "專業認證師資",
      description:
        "所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。",
      image: teacher1Img,
    },
    {
      icon: Target,
      title: "彈性預約制度",
      description:
        "如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。",
      image: parentChildImg,
    },
  ];

  return (
    <section id="features" className="py-14 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            為什麼選擇質數教室
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            我們相信，每個孩子都值得一場不被干擾的學習對話
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="rounded-md border border-gray-100 bg-washi/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="h-40 rounded-t-md">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover rounded-t-md"
                />
              </div>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tiffany/10 mb-4 -mt-10 relative z-10 border-4 border-white">
                  <feature.icon className="w-5 h-5 text-tiffany" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoachesSection() {
  const { data: coaches = [], isLoading } = useQuery<Coach[]>({
    queryKey: ["/api/coaches"],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardWidth = 256;
  const gap = 24;
  const step = cardWidth + gap;

  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const visibleCards = containerWidth > 0 ? Math.floor((containerWidth + gap) / step) : 3;
  const maxIndex = Math.max(0, coaches.length - visibleCards);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;
    const interval = setInterval(goNext, 4000);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, goNext]);

  return (
    <section id="about" className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            推薦師資
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            經過嚴格培訓與認證的專業老師團隊
          </p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={containerRef}
        >
          {maxIndex > 0 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-coaches-prev"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-coaches-next"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            {isLoading ? (
              <div className="flex gap-6 justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-60 flex-shrink-0">
                    <Skeleton className="aspect-[3/4] rounded-2xl" />
                    <div className="flex justify-center gap-2 mt-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="w-2.5 h-2.5 rounded-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="flex gap-6"
                animate={{ x: -currentIndex * step }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              >
                {coaches.map((coach) => (
                  <div key={coach.id} className="flex-shrink-0" style={{ width: cardWidth }}>
                    <CoachCard
                      name={coach.name}
                      photoUrl={TEACHER_PHOTOS[coach.name] || coach.photoUrl}
                      specialties={coach.specialties}
                      rating={coach.rating}
                      reviewCount={coach.reviewCount}
                      bookedSeats={2}
                      maxSeats={5}
                      isCertified={coach.isCertified}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {maxIndex > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-tiffany w-6" : "bg-gray-300"
                  }`}
                  data-testid={`dot-coach-${i}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "搜尋教室",
      description: "選擇地區與年級，找到離您最近的教室",
    },
    {
      icon: Users,
      number: "02",
      title: "選擇老師",
      description: "瀏覽老師資歷與評價，選擇最適合的老師",
    },
    {
      icon: Clock,
      number: "03",
      title: "預約時段",
      description: "選擇方便的時段，輕鬆完成線上預約",
    },
    {
      icon: GraduationCap,
      number: "04",
      title: "開始學習",
      description: "孩子享受專業的數學個別指導",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            如何開始
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            只需簡單四步驟，即可開始孩子的學習旅程
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-tiffany/20" />
              )}
              <div className="relative z-10">
                <span className="text-xs font-bold text-tiffany tracking-widest mb-3 block">
                  {step.number}
                </span>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-tiffany/10 mb-5">
                  <step.icon className="w-7 h-7 text-tiffany" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { data: stories = [], isLoading } = useQuery<SuccessStory[]>({
    queryKey: ["/api/success-stories"],
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = Math.max(0, stories.length - 1);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || stories.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, stories.length, goNext]);

  return (
    <section id="testimonials" className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            家長好評
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            聽聽家長們怎麼說
          </p>
        </motion.div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {stories.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute -left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-testimonials-prev"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute -right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-testimonials-next"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            <div className="overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                {stories[currentIndex] && (
                  <motion.div
                    key={stories[currentIndex].id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 md:p-12"
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -80 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-tiffany/20 shadow-md">
                          {STUDENT_PHOTOS[stories[currentIndex].studentName] ? (
                            <img
                              src={STUDENT_PHOTOS[stories[currentIndex].studentName]}
                              alt={stories[currentIndex].studentName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-tiffany/10 flex items-center justify-center">
                              <span className="text-3xl font-serif text-tiffany">
                                {stories[currentIndex].studentName[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <Quote className="w-10 h-10 text-tiffany/15 mb-4 mx-auto md:mx-0" />
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                          {stories[currentIndex].testimonial}
                        </p>
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                          <div>
                            <p className="text-base font-medium text-foreground">
                              {stories[currentIndex].studentName}
                              {stories[currentIndex].parentName && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}的家長
                                </span>
                              )}
                            </p>
                            {stories[currentIndex].grade && (
                              <p className="text-sm text-muted-foreground">
                                {stories[currentIndex].grade} 年級
                              </p>
                            )}
                          </div>
                        </div>
                        {stories[currentIndex].tags && stories[currentIndex].tags!.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                            {stories[currentIndex].tags!.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-amber-warm text-foreground/70 px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {stories.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-tiffany w-6" : "bg-gray-300"
                    }`}
                    data-testid={`dot-testimonial-${i}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQSection() {
  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
  });

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <section id="faq" className="py-14 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            常見問題
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            關於質數教室，您可能想知道的事
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        ) : (
          <motion.div {...fadeInUp}>
            {categories.map((category) => (
              <div key={category} className="mb-8">
                <h3 className="text-sm font-semibold text-tiffany tracking-wide uppercase mb-4">
                  {category}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs
                    .filter((f) => f.category === category)
                    .map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={`faq-${faq.id}`}
                        className="border border-gray-100 rounded-md px-4 data-[state=open]:bg-washi/50"
                      >
                        <AccordionTrigger
                          className="text-sm font-medium text-foreground hover:no-underline"
                          data-testid={`faq-trigger-${faq.id}`}
                        >
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section
      className="py-14 md:py-24 px-4 md:px-6 relative"
      style={{
        backgroundColor: "#FAF9F6",
        backgroundImage: `
          linear-gradient(rgba(129, 216, 208, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(129, 216, 208, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={parentChildImg}
              alt="家長與孩子一起學習"
              className="w-full h-[220px] sm:h-[300px] md:h-[360px] object-cover rounded-2xl shadow-lg"
            />
          </motion.div>
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
              立即預約免費診斷
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              讓我們的認證老師為您的孩子進行一次免費的數學能力適性診斷，
              了解孩子的學習狀態，制定最適合的學習計畫。
            </p>
            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
              <Button
                size="lg"
                className="rounded-full px-8 py-3 text-sm"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                onClick={() => {
                  const el = document.querySelector("#hero-search");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="button-cta-book"
              >
                立即預約
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a href="/api/login" data-testid="link-login-cta">
                <Button variant="outline" className="rounded-full px-8 py-3 text-sm">
                  家長登入
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-5 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-tiffany" />
                免費診斷
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-tiffany" />
                無需綁約
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-tiffany" />
                隨時取消
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-foreground text-white/80 py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-8 md:mb-12">
          <div className="col-span-2">
            <h3 className="font-serif text-xl md:text-2xl tracking-[0.15em] text-white mb-3">
              質數教室
            </h3>
            <p className="text-sm text-white/50 mb-1 tracking-wide">
              The Prime
            </p>
            <p className="text-sm text-white/60 leading-relaxed mt-4 max-w-sm">
              讓教學回歸「1 位老師」對「1
              位學生」的學習體驗。我們致力於為每一位國小學生提供最專業的數學個別指導。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              快速連結
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#teaching" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-teaching">
                  教學特色
                </a>
              </li>
              <li>
                <a href="#textbook" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-textbook">
                  教材介紹
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-about">
                  認識質數
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-testimonials">
                  成功案例
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-faq">
                  常見問題
                </a>
              </li>
              <li>
                <a href="/franchise-login" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-franchise-login">
                  分校登入
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              聯絡我們
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="w-4 h-4" />
                02-1234-5678
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="w-4 h-4" />
                hello@primemath.tw
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4" />
                台北市大安區
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} The Prime 質數教室. All rights
            reserved.
          </p>
          <a
            href="/api/login"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-tiffany transition-colors border border-white/15 rounded-full px-5 py-2 hover:border-tiffany/40"
            data-testid="link-franchise-admin"
          >
            <Building2 className="w-4 h-4" />
            分校管理
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BrandPhilosophySection />
      <TeachingMethodSection />
      <LearningMapSection />
      <TextbookSection />
      <FeaturesSection />
      <CoachesSection />
      <ProcessSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
