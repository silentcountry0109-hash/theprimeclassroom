import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  XCircle,
} from "lucide-react";
import type { Coach, Faq, SuccessStory, Franchise } from "@shared/schema";
import { createContext, useContext } from "react";

const SiteContentContext = createContext<Record<string, string>>({});
function useSiteContent(key: string, fallback: string): string {
  const content = useContext(SiteContentContext);
  return content[key] ?? fallback;
}

import heroClassroomImg from "@assets/hero_classroom.png";
import brandPhilosophyImg from "@assets/brand_philosophy.png";
import learningDetailImg from "@assets/learning_detail.png";
import parentChildImg from "@assets/parent_child.png";
import ctaDiagnosisImg from "@assets/ChatGPT_Image_2026年5月28日_下午03_31_57_1779953534103.png";
import feat1IndividualImg from "@assets/個別指導_1779958868727.png";
import feat2CertifiedImg from "@assets/專業認證師資_1779958868733.png";
import feat3FlexibleImg from "@assets/彈性的預約制度_1779958868735.png";
import textbookDisplayImg from "@assets/textbook_display.png";
import teacher1Img from "@assets/teacher_1.png";
import teacher2Img from "@assets/teacher_2.png";
import teacher3Img from "@assets/teacher_3.png";
import teacher4Img from "@assets/teacher_4.png";
import teacher5Img from "@assets/teacher_5.png";
import teacher6Img from "@assets/teacher_6.png";
import splashGif from "@assets/質數教室_1776327427705.gif";
import deco1 from "@assets/輔助圖文-1_1776327482726.png";
import deco2 from "@assets/輔助圖文-2_1776327482727.png";
import deco3 from "@assets/輔助圖文-3_1776327482727.png";
import deco4 from "@assets/輔助圖文-4_1776327482727.png";
import deco5 from "@assets/輔助圖文-5_1776327482727.png";
import deco6 from "@assets/輔助圖文-6_1776327482727.png";
import heroLogoImg from "@assets/工作區域_25_1776422059113.png";
import ip2Img from "@assets/工作區域_2_1776423698455.png";
import ip12Img from "@assets/工作區域_12_1776423698455.png";
import ip13Img from "@assets/工作區域_13_1776423698455.png";
import deco14Img from "@assets/工作區域_14_1776423698455.png";
import deco15Img from "@assets/工作區域_15_1776423698456.png";
import deco10Img from "@assets/工作區域_10_1776423709223.png";
import deco6Img from "@assets/工作區域_6_1776423712973.png";
import deco5Img from "@assets/工作區域_5_1776423714787.png";
import subtitleAnimatedWebp from "@assets/國小個別指導_pingpong_animated.webp";
import teachImg1 from "@assets/螺旋式課程_1776335067651.png";
import teachImg2 from "@assets/階梯式教學_1776335069419.png";
import teachImg3 from "@assets/單元評測_1776335072659.png";
import teachImg4 from "@assets/個別指導・個別進度_1776335074228.png";
import philIcon1 from "@assets/工作區域_10_1777786048500.png";
import philIcon2 from "@assets/工作區域_18_1777786055164.png";
import philIcon3 from "@assets/工作區域_23_1777786057128.png";
import philIcon4 from "@assets/工作區域_11_1777786058902.png";
import robotMascotImg from "@assets/工作區域_2_1777787491905.png";
import studentBoy1 from "@assets/student_boy_1.png";
import studentBoy2 from "@assets/student_boy_2.png";
import studentGirl1 from "@assets/student_girl_1.png";
import studentBoy3 from "@assets/student_boy_3.png";
import studentGirl2 from "@assets/student_girl_2.png";
import newTextbookImg from "@assets/Gemini_Generated_Image_xth2anxth2anxth2_1776664904973.png";
import newBrandImg from "@assets/工作區域_6_1776664958904.png";

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

const PARENT_TESTIMONIALS = [
  { name: "陳媽媽", avatar: teacher1Img, child: "小宇三年級", quote: "孩子以前最怕數學，現在每週都期待上課！" },
  { name: "林爸爸", avatar: teacher2Img, child: "小恩四年級", quote: "老師很有耐心，一對一教學效果真的很明顯。" },
  { name: "王媽媽", avatar: teacher3Img, child: "小涵五年級", quote: "數學成績從 70 分進步到 95 分，太感動了！" },
  { name: "張媽媽", avatar: teacher4Img, child: "小安二年級", quote: "質數教室讓孩子真正理解觀念，不是死背公式。" },
  { name: "李爸爸", avatar: teacher5Img, child: "小芸六年級", quote: "升國中前的數學打底，選擇質數教室很放心。" },
  { name: "黃媽媽", avatar: teacher6Img, child: "小翔三年級", quote: "老師會根據孩子的程度調整進度，很細心！" },
];

import { TAIWAN_DISTRICTS, CITIES, DAY_LABELS, TIME_PERIODS } from "@shared/constants";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

function WaveDivider({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 72, backgroundColor: from }}>
      <svg
        className="absolute bottom-0 left-0 h-full animate-wave-drift"
        style={{ width: "200%", fill: to }}
        viewBox="0 0 2880 72"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 C1680,72 1920,0 2160,36 C2400,72 2640,0 2880,36 L2880,72 L0,72 Z" />
      </svg>
    </div>
  );
}

function PingPongGif({ src, className, alt }: { src: string; className?: string; alt?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    let animHandle: number;
    let cancelled = false;

    (async () => {
      try {
        const resp = await fetch(src);
        const buffer = await resp.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const { GifReader } = await import("omggif");
        const gr = new GifReader(uint8);
        const frames = gr.numFrames();
        const w = gr.width;
        const h = gr.height;
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const frameData: { pixels: Uint8ClampedArray; delay: number }[] = [];
        let prevPixels = new Uint8ClampedArray(w * h * 4);
        for (let i = 0; i < frames; i++) {
          const info = gr.frameInfo(i);
          const pixels = info.disposal === 2
            ? new Uint8ClampedArray(w * h * 4)
            : prevPixels.slice();
          gr.decodeAndBlitFrameRGBA(i, pixels);
          frameData.push({ pixels, delay: (info.delay || 10) * 10 });
          prevPixels = pixels.slice();
        }

        const backward = frameData.slice(1, -1).reverse();
        const sequence = [...frameData, ...backward];
        let idx = 0;
        let lastTime = 0;

        setCanvasReady(true);

        const tick = (now: number) => {
          if (cancelled) return;
          const frame = sequence[idx];
          if (now - lastTime >= frame.delay) {
            ctx.putImageData(new ImageData(frame.pixels.slice(), w, h), 0, 0);
            idx = (idx + 1) % sequence.length;
            lastTime = now;
          }
          animHandle = requestAnimationFrame(tick);
        };
        animHandle = requestAnimationFrame(tick);
      } catch {
        setCanvasReady(true);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animHandle);
    };
  }, [src]);

  return (
    <span className={`relative inline-block w-full ${className ?? ""}`} style={{ display: "block" }}>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        style={{ display: canvasReady ? "none" : "block" }}
      />
      <canvas
        ref={canvasRef}
        aria-label={alt}
        style={{ display: canvasReady ? "block" : "none", width: "100%", height: "auto" }}
      />
    </span>
  );
}

function HeroTestimonialCarousel({ socialProofText }: { socialProofText: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PARENT_TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = PARENT_TESTIMONIALS[activeIndex];

  const visibleAvatars = useMemo(() => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const idx = (activeIndex + i) % PARENT_TESTIMONIALS.length;
      result.push(PARENT_TESTIMONIALS[idx]);
    }
    return result;
  }, [activeIndex]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-2 mt-6 md:mt-10 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="hero-testimonial-carousel"
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 md:-space-x-3">
          {visibleAvatars.map((t, i) => (
            <motion.img
              key={`${activeIndex}-${i}`}
              src={t.avatar}
              alt={t.name}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white object-cover ${i === 3 ? "hidden sm:block" : ""}`}
              initial={{ opacity: 0, scale: 0.7, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            />
          ))}
        </div>
        <div className="text-left">
          <p className="text-xs sm:text-sm font-semibold text-foreground" data-testid="text-social-proof">{socialProofText}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">4.8 / 5</span>
          </div>
        </div>
      </div>

      <div className="relative h-12 sm:h-10 w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center gap-2 px-4"
          >
            <Quote className="w-3 h-3 text-tiffany/50 flex-shrink-0 -mt-2 self-start" />
            <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
              {current.quote}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[10px] sm:text-xs text-muted-foreground/70"
          data-testid="text-testimonial-author"
        >
          — {current.name}（{current.child}）
        </motion.p>
      </AnimatePresence>

      <div className="flex gap-1.5 mt-1">
        {PARENT_TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? "w-5 h-1.5 bg-tiffany"
                : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
            data-testid={`testimonial-dot-${i}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem("prime_splash_shown");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("prime_splash_shown", "1"); } catch {}
    }, 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: "#FAF9F6" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img
            src={splashGif}
            alt="質數教室"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeroSection() {
  const heroTagline = useSiteContent("hero.tagline", "讓教學回歸「1 位老師」對「1 位學生」的學習體驗");
  const heroSearchHint = useSiteContent("hero.searchHint", "找到最適合孩子的數學老師，立即預約免費診斷");
  const heroSocialProof = useSiteContent("hero.socialProof", "200+ 位家長推薦");
  const heroBackgroundImage = useSiteContent("hero.backgroundImage", "");

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

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 md:pt-20 pb-12 md:pb-16"
      style={{ backgroundColor: "#FAF9F6" }}
    >
      {heroBackgroundImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${heroBackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
      )}
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
        <img src={deco1} alt="" className="absolute top-[10%] left-[5%] w-16 md:w-24 h-auto opacity-30 animate-deco-cw-slow" />
        <img src={deco2} alt="" className="absolute top-[18%] right-[8%] w-14 md:w-20 h-auto opacity-30 animate-deco-ccw-med" />
        <img src={deco3} alt="" className="absolute bottom-[32%] left-[10%] w-14 md:w-20 h-auto opacity-25 hidden sm:block animate-deco-cw-vslow" />
        <img src={deco4} alt="" className="absolute bottom-[15%] right-[5%] w-20 md:w-28 h-auto opacity-25 animate-deco-ccw-slow" />
        <img src={deco5} alt="" className="absolute top-[58%] right-[4%] w-14 md:w-20 h-auto opacity-25 hidden sm:block animate-deco-cw-med" />
        <img src={deco6} alt="" className="absolute top-[38%] right-[22%] w-12 md:w-16 h-auto opacity-20 hidden md:block animate-deco-ccw-vslow" />
      </div>

      <div className="text-center max-w-4xl mx-auto z-10 px-2">
        <motion.div
          className="flex items-center justify-center gap-3 md:gap-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
        >
          <img src={heroLogoImg} alt="質數教室" className="h-16 md:h-24 w-auto object-contain mix-blend-multiply" />
          <motion.span
            className="text-lg md:text-2xl text-tiffany font-medium tracking-[0.08em]"
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.08em" }}
            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          >
            The Prime
          </motion.span>
        </motion.div>
        <motion.div
          className="flex justify-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <img
            src={subtitleAnimatedWebp}
            alt="國小數學個別指導"
            className="w-full max-w-lg mx-auto h-auto object-contain"
          />
        </motion.div>
        <motion.p
          className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-8 md:mb-14 leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {heroTagline}
        </motion.p>
      </div>

      <motion.div
        id="hero-search"
        className="w-full max-w-3xl md:max-w-4xl mx-auto z-20 relative"
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
          {heroSearchHint}
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

      </motion.div>

      <HeroTestimonialCarousel socialProofText={heroSocialProof} />

      <motion.div
        className="flex items-center justify-center gap-3 mt-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="text-xs text-muted-foreground/60">不想搜尋？</span>
        <a
          href="/api/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-tiffany hover:underline underline-offset-2"
          data-testid="link-hero-direct-cta"
        >
          直接預約免費診斷
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
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
  const brandTitle = useSiteContent("brand.title", "品牌與教學理念");
  const brandDescription = useSiteContent("brand.description", "The Prime 質數教室，專注國小數學個別指導。我們相信每個孩子都有獨特的學習節奏，不該被統一的進度框架限制。透過一對一的個別指導，讓每位孩子都能按照自己的步調，扎實地建立數學基礎。");
  const brandQuote = useSiteContent("brand.quote", "不是補習，是真正理解數學。當孩子真正理解了，分數自然會來。");
  const brandHeroImage = useSiteContent("brand.heroImage", "");
  const brandPhil1Title = useSiteContent("brand.phil1.title", "個別指導・個別進度");
  const brandPhil1Desc = useSiteContent("brand.phil1.desc", "每位孩子都有專屬的學習計畫，老師一對一關注，不是大班齊頭式教學");
  const brandPhil2Title = useSiteContent("brand.phil2.title", "理解優先・不靠死背");
  const brandPhil2Desc = useSiteContent("brand.phil2.desc", "引導孩子真正理解觀念，而非填鴨式記憶，讓數學成為思考的工具");
  const brandPhil3Title = useSiteContent("brand.phil3.title", "學習地圖・透明可見");
  const brandPhil3Desc = useSiteContent("brand.phil3.desc", "家長清楚掌握孩子的學習階段、單元進度與重點，學習不再是黑箱");
  const brandPhil4Title = useSiteContent("brand.phil4.title", "溫暖空間・安心成長");
  const brandPhil4Desc = useSiteContent("brand.phil4.desc", "明亮舒適的教室環境，讓孩子在輕鬆愉快的氛圍中專注學習");

  const philosophies = [
    { img: philIcon1, title: brandPhil1Title, description: brandPhil1Desc },
    { img: philIcon2, title: brandPhil2Title, description: brandPhil2Desc },
    { img: philIcon3, title: brandPhil3Title, description: brandPhil3Desc },
    { img: philIcon4, title: brandPhil4Title, description: brandPhil4Desc },
  ];

  return (
    <section id="about" className="relative bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-24">
        <motion.div className="text-center mb-10 md:mb-14" {...fadeInUp}>
          <p className="text-sm text-tiffany font-medium tracking-widest mb-3">BRAND PHILOSOPHY</p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-4" data-testid="text-brand-philosophy-title">
            {brandTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {brandDescription}
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl overflow-hidden mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={brandHeroImage || newBrandImg}
            alt="質數教室的溫暖教學環境"
            className="w-full h-auto object-contain"
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14">
          {philosophies.map((item, i) => (
            <motion.div
              key={item.title}
              className="group text-center p-5 md:p-6 rounded-2xl bg-washi border border-transparent hover:border-tiffany/20 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
              data-testid={`card-philosophy-${i}`}
            >
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <img src={item.img} alt={item.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
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
            「{brandQuote}」
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TeachingMethodSection() {
  const teachTitle = useSiteContent("teaching.title", "教學特色");
  const teachDesc = useSiteContent("teaching.description", "螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，為每個孩子量身打造吸收效率最好的學習規劃");
  const teach1Title = useSiteContent("teaching.method1.title", "螺旋式課程");
  const teach1Desc = useSiteContent("teaching.method1.desc", "同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。");
  const teach2Title = useSiteContent("teaching.method2.title", "階梯式教學");
  const teach2Desc = useSiteContent("teaching.method2.desc", "由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。");
  const teach3Title = useSiteContent("teaching.method3.title", "單元評測");
  const teach3Desc = useSiteContent("teaching.method3.desc", "每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。");
  const teach4Title = useSiteContent("teaching.method4.title", "個別指導・個別進度");
  const teach4Desc = useSiteContent("teaching.method4.desc", "每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。");

  const methods = [
    { img: teachImg1, title: teach1Title, description: teach1Desc },
    { img: teachImg2, title: teach2Title, description: teach2Desc },
    { img: teachImg3, title: teach3Title, description: teach3Desc },
    { img: teachImg4, title: teach4Title, description: teach4Desc },
  ];

  return (
    <section id="teaching" className="relative overflow-hidden py-14 md:py-24 px-4 md:px-6 bg-white">
      <img src={deco10Img} alt="" className="absolute bottom-8 right-4 md:right-10 w-24 md:w-36 pointer-events-none select-none opacity-[0.12] animate-float-deco-rev" aria-hidden="true" />
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16 relative overflow-visible" {...fadeInUp}>
          <div className="relative inline-block">
            <img src={ip2Img} alt="" className="absolute -top-8 -left-28 md:-left-36 w-28 md:w-36 h-auto object-contain pointer-events-none select-none animate-float-ip" aria-hidden="true" />
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4" data-testid="text-teaching-title">
              {teachTitle}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {teachDesc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {methods.map((method, i) => (
            <motion.div
              key={method.title}
              className="group relative bg-washi rounded-2xl p-5 md:p-8 border border-transparent hover:border-tiffany/20 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              data-testid={`card-teaching-method-${i}`}
            >
              <div className="flex items-start gap-4 md:gap-5">
                <img
                  src={method.img}
                  alt={method.title}
                  className="w-32 h-32 md:w-36 md:h-36 object-contain flex-shrink-0 group-hover:scale-150 group-hover:-translate-y-4 group-hover:drop-shadow-2xl transition-all duration-300"
                />
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

const LEARNING_MAP_ITEMS = [
  { unit: "三位數加減", status: "completed" as const, label: "已完成" },
  { unit: "乘法基礎", status: "completed" as const, label: "已完成" },
  { unit: "除法概念", status: "current" as const, label: "學習中" },
  { unit: "分數初步", status: "upcoming" as const, label: "即將學習" },
  { unit: "長度與重量", status: "upcoming" as const, label: "即將學習" },
];

function LearningMapCard() {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const [visibleCount, setVisibleCount] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    const totalItems = LEARNING_MAP_ITEMS.length;

    async function runCycle() {
      setPhase("entering");
      setVisibleCount(0);
      setProgressWidth(0);

      for (let i = 0; i <= totalItems; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 350));
        if (cancelled) return;
        setVisibleCount(i + 1);
      }

      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;
      setProgressWidth(40);
      setPhase("visible");

      await new Promise((r) => setTimeout(r, 3000));
      if (cancelled) return;

      setPhase("exiting");
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) return;

      setCycle((c) => c + 1);
    }

    runCycle();
    return () => { cancelled = true; };
  }, [isInView, cycle]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative"
    >
      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-tiffany/10 flex items-center justify-center">
            <Map className="w-4 h-4 text-tiffany" />
          </div>
          <span className="text-sm font-medium text-foreground">小明的學習地圖</span>
          <span className="ml-auto text-xs text-tiffany bg-tiffany/10 px-2 py-0.5 rounded-full">小三</span>
        </div>

        <div className="space-y-0 transition-opacity duration-700" style={{ opacity: phase === "exiting" ? 0 : 1 }}>
          {LEARNING_MAP_ITEMS.map((item, i) => {
            const show = visibleCount > i;
            return (
              <div
                key={`${cycle}-${i}`}
                className="flex items-center gap-3"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                      item.status === "completed" ? "border-tiffany" :
                      item.status === "current" ? "border-coral" :
                      "border-gray-300"
                    } ${item.status === "current" && show ? "animate-pulse-ring" : ""}`}
                    style={{
                      backgroundColor: show
                        ? (item.status === "completed" ? "#81D8D0" : item.status === "current" ? "white" : "#f3f4f6")
                        : "transparent",
                      borderColor: show
                        ? undefined
                        : "transparent",
                      transform: show ? "scale(1)" : "scale(0)",
                      transitionDelay: `${i * 50 + 100}ms`,
                    }}
                  />
                  {i < 4 && (
                    <div
                      className="w-0.5 h-6 transition-colors duration-300"
                      style={{
                        backgroundColor: show
                          ? (item.status === "completed" ? "rgba(129,216,208,0.4)" : "#e5e7eb")
                          : "transparent",
                        transitionDelay: `${i * 50 + 200}ms`,
                      }}
                    />
                  )}
                </div>
                <div
                  className={`flex-1 flex items-center justify-between py-1 transition-all duration-500 ${
                    item.status === "current" ? "font-medium text-foreground" :
                    item.status === "completed" ? "text-muted-foreground" : "text-muted-foreground/60"
                  }`}
                  style={{
                    opacity: show ? 1 : 0,
                    transform: show ? "translateX(0)" : "translateX(-12px)",
                    transitionDelay: `${i * 50}ms`,
                  }}
                >
                  <span className="text-sm">{item.unit}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                      item.status === "completed" ? "bg-tiffany/10 text-tiffany" :
                      item.status === "current" ? "bg-coral/10 text-coral" :
                      "bg-gray-100 text-muted-foreground"
                    }`}
                    style={{
                      opacity: show ? 1 : 0,
                      transform: show ? "scale(1)" : "scale(0.8)",
                      transitionDelay: `${i * 50 + 150}ms`,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-6 pt-4 border-t border-gray-100 transition-opacity duration-700"
          style={{ opacity: phase === "exiting" ? 0 : (visibleCount > LEARNING_MAP_ITEMS.length - 1 ? 1 : 0) }}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>學習進度</span>
            <span className="text-tiffany font-medium">2 / 5 單元完成</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tiffany to-tiffany/70 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-tiffany/5 rounded-full -z-10" />
      <div className="absolute -top-3 -left-3 w-14 h-14 bg-coral/5 rounded-full -z-10" />
    </motion.div>
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
    <section className="relative overflow-hidden py-14 md:py-24 px-4 md:px-6 bg-washi">
      <img src={deco15Img} alt="" className="absolute bottom-6 left-4 md:left-10 w-24 md:w-36 pointer-events-none select-none opacity-[0.12] animate-float-deco-slow" aria-hidden="true" />
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

          <LearningMapCard />
        </div>
      </div>
    </section>
  );
}

function BookUnitPopover({ book, units, color }: { book: string; units: string[]; color: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };
  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open || !isMobile) return;
    const handleOutside = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-book-popup="${book}"]`) && !target.closest(`[data-book="${book}"]`)) {
        setOpen(false);
      }
    };
    document.addEventListener("touchstart", handleOutside);
    return () => document.removeEventListener("touchstart", handleOutside);
  }, [open, book, isMobile]);

  return (
    <div
      className="relative flex-1"
      data-book={book}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`w-full bg-white rounded-lg py-2.5 px-4 text-sm text-foreground border transition-all duration-200 text-center font-medium ${
          open ? "border-tiffany/40 shadow-md ring-2 ring-tiffany/10" : "border-gray-100 hover:border-tiffany/30 hover:shadow-sm"
        }`}
        data-testid={`button-book-${book}`}
      >
        {book}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="hidden md:block">
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <p className={`text-xs font-semibold mb-2 px-1 ${color.includes("tiffany") ? "text-tiffany" : "text-coral"}`}>
                  {book} 單元內容
                </p>
                <ul className="space-y-1">
                  {units.map((unit, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed px-1 py-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${color.includes("tiffany") ? "bg-tiffany/50" : "bg-coral/50"}`} />
                      {unit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-6"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-full max-w-xs relative"
                  data-book-popup={book}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    data-testid={`button-close-popup-${book}`}
                  >
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <p className={`text-sm font-semibold mb-3 ${color.includes("tiffany") ? "text-tiffany" : "text-coral"}`}>
                    {book} 單元內容
                  </p>
                  <ul className="space-y-1.5">
                    {units.map((unit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed py-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${color.includes("tiffany") ? "bg-tiffany/50" : "bg-coral/50"}`} />
                        {unit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const BOOK_UNITS: Record<string, string[]> = {
  "第1冊": ["10以內的數", "比長短", "排順序與比多少", "分與合", "方盒、圓罐、球", "30以內的數", "10以內的加法", "10以內的減法", "幾點鐘"],
  "第2冊": ["18以內的加法", "18以內的減法", "圖形與分類", "幾月幾日", "100以內的數", "認識錢幣", "二位數的加法", "二位數的減法", "做紀錄"],
  "第3冊": ["200以內的數", "二位數的加減", "幾公分", "容量與重量", "加減應用", "時間", "乘法（一）", "乘法（二）", "面的大小比較"],
  "第4冊": ["1000以內的數", "加減應用", "公分和公尺", "乘法", "分東西", "公升和毫升", "三位數的加減", "年月日", "平面圖形與立體形體"],
  "第5冊": ["10000以內的數", "四位數的加減", "乘法", "周長與面積", "除法", "公斤和公克", "分數", "時間", "圓和角"],
  "第6冊": ["乘法", "除法", "公里", "分數", "小數", "統計圖表", "周界與周長", "面積", "時間"],
  "第7冊": ["一億以內的數", "乘法與除法", "角度", "整數四則運算", "三角形", "分數", "小數", "統計圖", "周長與面積"],
  "第8冊": ["大數", "概數", "分數的加減", "小數乘以整數", "長方體和正方體", "周長和面積", "整數四則", "規律", "時間的計算"],
  "第9冊": ["小數的乘法", "因數和倍數", "擴分、約分和通分", "多邊形", "異分母分數的加減", "體積", "整數四則運算", "平均", "比率與百分率"],
  "第10冊": ["分數的乘法", "小數的除法", "表面積", "線對稱圖形", "分數的除法", "比和比值", "圓", "統計圖表", "正比"],
  "第11冊": ["最大公因數與最小公倍數", "分數的除法", "小數的除法", "比和比值", "圓的面積", "速率", "柱體的體積", "等量公理", "統計圖"],
  "第12冊": ["小數與分數的四則運算", "概數與估算", "柱體與錐體", "比例尺", "正比與反比", "怎樣解題"],
};

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
    <section id="textbook" className="relative overflow-hidden py-14 md:py-24 px-4 md:px-6 bg-washi">
      <img src={deco6Img} alt="" className="absolute top-6 left-4 md:left-10 w-20 md:w-32 pointer-events-none select-none opacity-[0.12] animate-float-deco" aria-hidden="true" />
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4" data-testid="text-textbook-title">
            教材介紹
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            小一到小六共 12 冊，以一個單元一本教材，觀念、範例、演練、課後練習，由淺入深，紮實學習
          </p>
        </motion.div>

        <motion.div
          className="mb-10 md:mb-14 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={newTextbookImg}
            alt="質數教室教材展示"
            className="w-full h-[200px] sm:h-[280px] md:h-[360px] object-cover rounded-2xl"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-serif text-xl tracking-wide text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-tiffany" />
              全套 12 冊教材
            </h3>
            <p className="text-xs text-muted-foreground mb-6">點擊或移到各冊查看單元內容</p>
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
                      <BookUnitPopover key={b} book={b} units={BOOK_UNITS[b] || []} color={g.color} />
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
  const featTitle = useSiteContent("features.title", "為什麼選擇質數教室");
  const featDesc = useSiteContent("features.description", "我們相信，每個孩子都值得一場不被干擾的學習對話");
  const feat1Title = useSiteContent("features.feat1.title", "個別指導");
  const feat1Desc = useSiteContent("features.feat1.desc", "每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。");
  const feat2Title = useSiteContent("features.feat2.title", "專業認證師資");
  const feat2Desc = useSiteContent("features.feat2.desc", "所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。");
  const feat3Title = useSiteContent("features.feat3.title", "彈性預約制度");
  const feat3Desc = useSiteContent("features.feat3.desc", "如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。");

  const features = [
    { icon: Users, title: feat1Title, description: feat1Desc, image: feat1IndividualImg },
    { icon: Shield, title: feat2Title, description: feat2Desc, image: feat2CertifiedImg },
    { icon: Target, title: feat3Title, description: feat3Desc, image: feat3FlexibleImg },
  ];

  return (
    <section id="features" className="relative overflow-hidden py-14 md:py-24 px-4 md:px-6 bg-white">
      <img src={deco5Img} alt="" className="absolute top-8 right-4 md:right-10 w-24 md:w-36 pointer-events-none select-none opacity-[0.12] animate-float-deco" aria-hidden="true" />
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            {featTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {featDesc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="rounded-md border border-gray-100 bg-washi/50 hover:-translate-y-1.5 hover:shadow-md transition-all duration-300"
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
    <section className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16 relative overflow-visible" {...fadeInUp}>
          <div className="relative inline-block">
            <img src={ip12Img} alt="" className="absolute -top-8 -right-28 md:-right-36 w-28 md:w-36 h-auto object-contain pointer-events-none select-none animate-float-ip-alt" aria-hidden="true" />
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
              推薦師資
            </h2>
          </div>
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
                      coachId={coach.id}
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
  const procTitle = useSiteContent("process.title", "如何開始");
  const procDesc = useSiteContent("process.description", "只需簡單四步驟，即可開始孩子的學習旅程");
  const proc1Title = useSiteContent("process.step1.title", "搜尋教室");
  const proc1Desc = useSiteContent("process.step1.desc", "選擇地區與年級，找到離您最近的教室");
  const proc2Title = useSiteContent("process.step2.title", "選擇老師");
  const proc2Desc = useSiteContent("process.step2.desc", "瀏覽老師資歷與評價，選擇最適合的老師");
  const proc3Title = useSiteContent("process.step3.title", "預約時段");
  const proc3Desc = useSiteContent("process.step3.desc", "選擇方便的時段，輕鬆完成線上預約");
  const proc4Title = useSiteContent("process.step4.title", "開始學習");
  const proc4Desc = useSiteContent("process.step4.desc", "孩子享受專業的數學個別指導");

  const [activeStep, setActiveStep] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const advance = (current: number) => {
      const isLast = current === 3;
      const delay = isLast ? 1000 : 2500;
      timeoutId = setTimeout(() => {
        const next = isLast ? 0 : current + 1;
        setActiveStep(next);
        advance(next);
      }, delay);
    };
    advance(activeStep);
    return () => clearTimeout(timeoutId);
  }, [isInView]);

  const steps = [
    { icon: Search, number: "01", title: proc1Title, description: proc1Desc },
    { icon: Users, number: "02", title: proc2Title, description: proc2Desc },
    { icon: Clock, number: "03", title: proc3Title, description: proc3Desc },
    { icon: GraduationCap, number: "04", title: proc4Title, description: proc4Desc },
  ];

  const circumference = 2 * Math.PI * 90;

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-14 md:py-24 px-4 md:px-6 bg-white">
      <img src={deco14Img} alt="" className="absolute top-6 right-6 md:right-16 w-24 md:w-36 pointer-events-none select-none opacity-[0.13] animate-float-deco" aria-hidden="true" />
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
            {procTitle}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {procDesc}
          </p>
        </motion.div>

        <div className="md:hidden flex flex-col items-center">
          <div className="relative w-72 h-72 mx-auto">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240" aria-hidden="true">
              <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(129,216,208,0.15)" strokeWidth="3" />
              <circle
                cx="120" cy="120" r="90"
                fill="none"
                stroke="rgba(129,216,208,0.75)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${activeStep * circumference / 4} ${circumference}`}
                transform="rotate(-90 120 120)"
                style={{ transition: "stroke-dasharray 0.7s ease-in-out" }}
              />
              <circle cx="120" cy="30" r="26" fill="white" />
              <circle cx="210" cy="120" r="26" fill="white" />
              <circle cx="120" cy="210" r="26" fill="white" />
              <circle cx="30" cy="120" r="26" fill="white" />
            </svg>

            {steps.map((step, i) => {
              const nodeStyle = [
                { left: "122px", top: "14px" },
                { left: "230px", top: "122px" },
                { left: "122px", top: "218px" },
                { left: "14px", top: "122px" },
              ][i];
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              return (
                <button
                  key={step.title}
                  className={`absolute z-20 flex items-center gap-0.5 ${i === 2 ? "flex-col-reverse" : "flex-col"}`}
                  style={nodeStyle}
                  onClick={() => setActiveStep(i)}
                  data-testid={`btn-process-step-${i}`}
                  aria-label={step.title}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                    isActive
                      ? "bg-tiffany/30 ring-2 ring-tiffany/70 shadow-md scale-110"
                      : isPast
                      ? "bg-tiffany/20"
                      : "bg-gray-50 border border-gray-200"
                  }`}>
                    <step.icon className={`w-5 h-5 transition-colors duration-500 ${isActive ? "text-tiffany" : "text-tiffany/40"}`} />
                  </div>
                  <span
                    className={`text-[10px] font-semibold text-center leading-tight transition-colors duration-300 ${isActive ? "text-tiffany" : "text-foreground/45"}`}
                    style={{ maxWidth: 48 }}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}

            <motion.div
              className="absolute z-30 pointer-events-none"
              initial={{ left: 148, top: -4 }}
              animate={{
                left: [148, 252, 148, -14][activeStep],
                top: [-4, 102, 240, 102][activeStep],
              }}
              transition={{ type: "spring", stiffness: 130, damping: 18 }}
            >
              <motion.img
                src={robotMascotImg}
                alt="質數小助手"
                className="w-12 h-12 object-contain drop-shadow-sm"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <span className="block text-[10px] font-bold text-tiffany/60 tracking-widest mb-1">{steps[activeStep].number}</span>
                  <p className="text-sm font-semibold text-foreground mb-1.5">{steps[activeStep].title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{steps[activeStep].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === activeStep ? "w-6 h-2 bg-tiffany" : "w-2 h-2 bg-tiffany/30"
                }`}
                aria-label={`步驟 ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hidden md:block relative">
          <motion.div
            className="absolute z-20 pointer-events-none -translate-y-1/2"
            style={{ top: 24 }}
            animate={{ left: `calc(${(activeStep * 2 + 1) / 8 * 100}% + 20px)` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <motion.img
              src={robotMascotImg}
              alt="質數小助手"
              className="w-28 h-28 object-contain drop-shadow-md"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="grid grid-cols-4 gap-8">
          {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              return (
                <motion.div
                  key={step.title}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  {i < steps.length - 1 && (
                    <div className="absolute top-14 left-[58%] w-[84%] h-1 rounded-full overflow-hidden bg-tiffany/15">
                      <div
                        className="h-full bg-tiffany/50 rounded-full transition-all duration-700 ease-in-out"
                        style={{ width: isPast ? "100%" : isActive ? "50%" : "0%" }}
                      />
                    </div>
                  )}
                  <div className="relative z-10">
                    <span className={`text-xs font-bold tracking-widest mb-3 block transition-colors duration-500 ${isActive ? "text-tiffany" : "text-tiffany/40"}`}>
                      {step.number}
                    </span>
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-5 transition-all duration-500 ${
                        isActive
                          ? "bg-tiffany/25 scale-125 shadow-lg ring-2 ring-tiffany/40 -translate-y-2"
                          : isPast
                          ? "bg-tiffany/20 scale-100"
                          : "bg-tiffany/10 scale-100"
                      }`}
                    >
                      <step.icon className={`w-7 h-7 transition-colors duration-500 ${isActive ? "text-tiffany" : "text-tiffany/50"}`} />
                    </div>
                    <h3 className={`text-base font-semibold mb-2 transition-colors duration-500 ${isActive ? "text-foreground" : "text-foreground/50"}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors duration-500 ${isActive ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center gap-2 mt-10">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`rounded-full transition-all duration-500 ${
                i === activeStep ? "w-6 h-2 bg-tiffany" : "w-2 h-2 bg-tiffany/30"
              }`}
              aria-label={`步驟 ${i + 1}`}
              data-testid={`btn-process-step-${i}`}
            />
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
                          {stories[currentIndex].photoUrl || STUDENT_PHOTOS[stories[currentIndex].studentName] ? (
                            <img
                              src={stories[currentIndex].photoUrl || STUDENT_PHOTOS[stories[currentIndex].studentName]}
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
        <motion.div className="text-center mb-10 md:mb-16 relative overflow-visible" {...fadeInUp}>
          <div className="relative inline-block">
            <img src={ip13Img} alt="" className="absolute -top-8 -left-28 md:-left-36 w-28 md:w-36 h-auto object-contain pointer-events-none select-none animate-float-ip-slow" aria-hidden="true" />
            <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4">
              常見問題
            </h2>
          </div>
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
  const ctaTitle = useSiteContent("cta.title", "立即預約免費診斷");
  const ctaDesc = useSiteContent("cta.description", "讓我們的認證老師為您的孩子進行一次免費的數學能力適性診斷，了解孩子的學習狀態，制定最適合的學習計畫。");
  const ctaBackgroundImage = useSiteContent("cta.backgroundImage", "");

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
              src={ctaBackgroundImage || ctaDiagnosisImg}
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
              {ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {ctaDesc}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const footerDesc = useSiteContent("footer.description", "讓教學回歸「1 位老師」對「1 位學生」的學習體驗。我們致力於為每一位國小學生提供最專業的數學個別指導。");
  const footerPhone = useSiteContent("footer.phone", "02-1234-5678");
  const footerEmail = useSiteContent("footer.email", "hello@primemath.tw");
  const footerAddress = useSiteContent("footer.address", "台北市大安區");

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
              {footerDesc}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              快速連結
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#about" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-about">
                  認識質數
                </a>
              </li>
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
                <a href="#branches" className="text-sm text-white/60 transition-colors hover:text-white" data-testid="footer-link-branches">
                  全台分校
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
                {footerPhone}
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="w-4 h-4" />
                {footerEmail}
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4" />
                {footerAddress}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} The Prime 質數教室. All rights
              reserved.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="/privacy"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                data-testid="footer-link-privacy"
              >
                隱私權政策
              </a>
              <span className="text-white/20 text-xs">|</span>
              <a
                href="/refund"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
                data-testid="footer-link-refund"
              >
                退費規則
              </a>
            </div>
          </div>
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

type BranchLocationCard = {
  city: string;
  district?: string;
  districts: string;
  count: number;
  href: string;
};

function buildBranchLocations(franchises: Franchise[]): BranchLocationCard[] {
  const active = franchises.filter((f) => f.isActive && f.city && f.district);
  if (active.length === 0) return [];
  const uniqueCities = Array.from(new Set(active.map((f) => f.city)));
  const oneCardPerDistrict = uniqueCities.length <= 2;

  if (oneCardPerDistrict) {
    const byKey: Record<string, Franchise[]> = {};
    const orderedKeys: string[] = [];
    for (const f of active) {
      const key = `${f.city}|${f.district}`;
      if (!byKey[key]) {
        byKey[key] = [];
        orderedKeys.push(key);
      }
      byKey[key].push(f);
    }
    return orderedKeys.map((key) => {
      const items = byKey[key];
      const [city, district] = key.split("|");
      const districtLabel = items.length > 1 ? `${district}（${items.length} 間教室）` : district;
      return {
        city,
        district,
        districts: districtLabel,
        count: items.length,
        href: `/search?city=${encodeURIComponent(city)}&district=${encodeURIComponent(district)}`,
      };
    });
  }

  const byCity: Record<string, Franchise[]> = {};
  const orderedCities: string[] = [];
  for (const f of active) {
    if (!byCity[f.city]) {
      byCity[f.city] = [];
      orderedCities.push(f.city);
    }
    byCity[f.city].push(f);
  }
  return orderedCities.map((city) => {
    const items = byCity[city];
    const uniqueDistricts = Array.from(new Set(items.map((f) => f.district)));
    const districtsLabel = uniqueDistricts.length > 4
      ? `${uniqueDistricts.slice(0, 3).join("、")} 等 ${uniqueDistricts.length} 區`
      : uniqueDistricts.join("、");
    return {
      city,
      districts: districtsLabel,
      count: items.length,
      href: `/search?city=${encodeURIComponent(city)}`,
    } as BranchLocationCard;
  });
}

function getBranchGridClass(count: number): string {
  if (count <= 1) return "grid grid-cols-1 max-w-md mx-auto gap-4 md:gap-6 mb-10 md:mb-14";
  if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-4 md:gap-6 mb-10 md:mb-14";
  if (count === 3) return "grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-14";
  if (count === 4) return "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-14";
  return "grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-14";
}

function StatsSection() {
  const stats = [
    { value: "500+", label: "累計服務學生", icon: GraduationCap },
    { value: "50+", label: "認證師資", icon: Users },
    { value: "10+", label: "服務城市", icon: MapPin },
    { value: "4.8", label: "家長平均評分", icon: Star },
  ];

  return (
    <section className="py-10 md:py-14 px-4 md:px-6 bg-white" aria-label="數字說話">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center p-5 md:p-6 rounded-2xl bg-washi border border-transparent hover:border-tiffany/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              data-testid={`stat-card-${i}`}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-tiffany/10 mb-3">
                <stat.icon className="w-5 h-5 text-tiffany" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-1" data-testid={`stat-value-${i}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BranchLocationsSection() {
  const badgeText = useSiteContent("branches.badge", "全台服務據點");
  const titleText = useSiteContent("branches.title", "全台分校地圖");
  const descText = useSiteContent("branches.description", "精選展示 6 大核心城市，全台 10+ 縣市均有服務據點，讓每個孩子都能就近找到優質師資");

  const { data: franchises = [], isLoading } = useQuery<Franchise[]>({
    queryKey: ["/api/franchises"],
    staleTime: 30000,
  });

  const branches = buildBranchLocations(franchises);

  if (!isLoading && branches.length === 0) {
    return null;
  }

  return (
    <section id="branches" className="py-14 md:py-24 px-4 md:px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 md:mb-16" {...fadeInUp}>
          <div className="inline-flex items-center gap-2 bg-tiffany/10 text-tiffany text-sm font-medium px-3 py-1.5 rounded-full mb-4">
            <MapPin className="w-4 h-4" />
            {badgeText}
          </div>
          <h2 className="font-serif text-2xl md:text-4xl tracking-[0.1em] text-foreground mb-3 md:mb-4" data-testid="text-branches-title">
            {titleText}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto whitespace-pre-line">
            {descText}
          </p>
        </motion.div>

        <div className={getBranchGridClass(branches.length)}>
          {branches.map((branch, i) => (
            <motion.a
              key={`${branch.city}-${branch.district || "city"}`}
              href={branch.href}
              className="group bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:border-tiffany/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 block no-underline"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-testid={`card-branch-${i}`}
              aria-label={`搜尋 ${branch.city}${branch.district ? ` ${branch.district}` : ""} 的教室`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-tiffany/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-tiffany" />
                </div>
                <h3 className="font-semibold text-foreground">{branch.city}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{branch.districts}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-tiffany/60" />
                  <span className="text-xs text-tiffany font-medium">{branch.count} 個分校</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-tiffany/40 group-hover:text-tiffany transition-colors duration-200" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            size="lg"
            className="rounded-full px-8"
            style={{ backgroundColor: "#81D8D0", color: "white" }}
            onClick={() => {
              const el = document.querySelector("#hero-search");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-find-branch"
          >
            <Search className="w-4 h-4 mr-2" />
            搜尋附近教室
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Button
            size="lg"
            className="rounded-full px-7 shadow-xl text-sm font-medium"
            style={{ backgroundColor: "#81D8D0", color: "white", boxShadow: "0 8px 30px rgba(129,216,208,0.45)" }}
            onClick={() => {
              const el = document.querySelector("#hero-search");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-floating-cta"
          >
            <Search className="w-4 h-4 mr-2" />
            預約免費診斷
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const { data: siteContentData = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
  });

  return (
    <SiteContentContext.Provider value={siteContentData}>
      <SplashScreen />
      <FloatingCTA />
      <div className="min-h-screen">
        <Navbar />
        <HeroSection />
        <WaveDivider from="#FAF9F6" to="#ffffff" />
        <BrandPhilosophySection />
        <StatsSection />
        <WaveDivider from="#F0FBFA" to="#ffffff" />
        <TeachingMethodSection />
        <WaveDivider from="#ffffff" to="#FAF9F6" />
        <LearningMapSection />
        <TextbookSection />
        <WaveDivider from="#FAF9F6" to="#ffffff" />
        <FeaturesSection />
        <WaveDivider from="#ffffff" to="#FAF9F6" />
        <BranchLocationsSection />
        <CoachesSection />
        <WaveDivider from="#FAF9F6" to="#ffffff" />
        <ProcessSection />
        <WaveDivider from="#ffffff" to="#FAF9F6" />
        <TestimonialsSection />
        <WaveDivider from="#FAF9F6" to="#ffffff" />
        <FAQSection />
        <WaveDivider from="#ffffff" to="#FAF9F6" />
        <CTASection />
        <FooterSection />
      </div>
    </SiteContentContext.Provider>
  );
}
