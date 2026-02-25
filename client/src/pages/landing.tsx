import { useState } from "react";
import { motion } from "framer-motion";
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
  Star,
  Quote,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import type { Coach, Faq, SuccessStory } from "@shared/schema";

const CITIES = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"];
const GRADES = [
  { value: "1", label: "一年級" },
  { value: "2", label: "二年級" },
  { value: "3", label: "三年級" },
  { value: "4", label: "四年級" },
  { value: "5", label: "五年級" },
  { value: "6", label: "六年級" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" },
};

function HeroSection() {
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [grade, setGrade] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (grade) params.set("grade", grade);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16"
      style={{
        backgroundColor: "#FAF9F6",
        backgroundImage: `
          linear-gradient(rgba(129, 216, 208, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(129, 216, 208, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <span className="absolute top-[12%] left-[6%] text-8xl text-tiffany/[0.06] font-serif rotate-[-15deg]">
          +
        </span>
        <span className="absolute top-[22%] right-[10%] text-7xl text-coral/[0.08] font-serif rotate-[20deg]">
          ×
        </span>
        <span className="absolute bottom-[35%] left-[12%] text-6xl text-tiffany/[0.05] font-serif rotate-[10deg]">
          ÷
        </span>
        <span className="absolute bottom-[18%] right-[6%] text-9xl text-tiffany/[0.05] font-serif rotate-[-8deg]">
          −
        </span>
        <span className="absolute top-[50%] left-[3%] text-5xl text-coral/[0.06] font-serif rotate-[25deg]">
          ∑
        </span>
        <span className="absolute top-[65%] right-[4%] text-6xl text-tiffany/[0.04] font-serif rotate-[-20deg]">
          π
        </span>
        <span className="absolute top-[35%] right-[25%] text-4xl text-tiffany/[0.05] font-serif rotate-[15deg]">
          ∞
        </span>
        <span className="absolute bottom-[45%] left-[30%] text-5xl text-coral/[0.05] font-serif rotate-[-10deg]">
          √
        </span>
      </div>

      <motion.div
        className="text-center max-w-4xl mx-auto z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] text-foreground mb-4">
          質數數學
        </h1>
        <p className="text-lg md:text-xl text-tiffany font-medium tracking-[0.1em] mb-3">
          The Prime Math
        </p>
        <p className="text-base md:text-lg text-muted-foreground mb-2 tracking-wide">
          國小數學個別指導
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-14 leading-relaxed">
          不可拆解的對話，讓教學回歸「1 位教練」對「1 位學生」的學習體驗
        </p>
      </motion.div>

      <motion.div
        id="hero-search"
        className="w-full max-w-3xl mx-auto z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl p-2 md:p-3">
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="flex-1 px-4 py-3 md:border-r border-gray-200/50">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-4 h-4 text-tiffany" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  地區
                </span>
              </div>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  className="border-0 p-0 h-auto shadow-none text-base font-medium focus:ring-0"
                  data-testid="select-city"
                >
                  <SelectValue placeholder="選擇地區" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 px-4 py-3 md:border-r border-gray-200/50">
              <div className="flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-4 h-4 text-tiffany" />
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  年級
                </span>
              </div>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger
                  className="border-0 p-0 h-auto shadow-none text-base font-medium focus:ring-0"
                  data-testid="select-grade"
                >
                  <SelectValue placeholder="選擇年級" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center px-2 py-2">
              <Button
                onClick={handleSearch}
                className="rounded-full w-full md:w-auto px-8 py-6 text-base font-medium"
                style={{ backgroundColor: "#81D8D0", color: "white" }}
                data-testid="button-hero-search"
              >
                <Search className="w-5 h-5 mr-2" />
                搜尋
              </Button>
            </div>
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

function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "一對一個別指導",
      description:
        "每位教練最多同時指導 5 位學生，確保每個孩子都能獲得充分的關注與即時回饋。",
    },
    {
      icon: Shield,
      title: "專業認證教練",
      description:
        "所有教練均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。",
    },
    {
      icon: Target,
      title: "彈性預約制度",
      description:
        "如同訂機票般簡單，家長可自由選擇教室、時段與教練，完全配合家庭的作息安排。",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
            為什麼選擇質數數學
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            我們相信，每個孩子都值得一場不被干擾的學習對話
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="text-center p-8 rounded-md border border-gray-100 bg-washi/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-tiffany/10 mb-6">
                <feature.icon className="w-7 h-7 text-tiffany" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
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

  return (
    <section id="about" className="py-24 px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
            推薦教練
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            經過嚴格培訓與認證的專業教練團隊
          </p>
        </motion.div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide justify-center flex-wrap">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-60 flex-shrink-0">
                  <Skeleton className="aspect-[3/4] rounded-2xl" />
                  <div className="flex justify-center gap-2 mt-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="w-2.5 h-2.5 rounded-full" />
                    ))}
                  </div>
                </div>
              ))
            : coaches.map((coach) => (
                <CoachCard
                  key={coach.id}
                  name={coach.name}
                  photoUrl={coach.photoUrl}
                  specialties={coach.specialties}
                  rating={coach.rating}
                  reviewCount={coach.reviewCount}
                  bookedSeats={2}
                  maxSeats={5}
                  isCertified={coach.isCertified}
                />
              ))}
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
      title: "選擇教練",
      description: "瀏覽教練資歷與評價，選擇最適合的教練",
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
      description: "孩子享受一對一的專業數學指導",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
            如何開始
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            只需簡單四步驟，即可開始孩子的學習旅程
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

  return (
    <section id="testimonials" className="py-24 px-6 bg-washi">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
            家長好評
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            聽聽家長們怎麼說
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-md" />
              ))
            : stories.map((story, i) => (
                <motion.div
                  key={story.id}
                  className="bg-white rounded-md border border-gray-100 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Quote className="w-8 h-8 text-tiffany/20 mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {story.testimonial}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-tiffany">
                        {story.studentName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {story.studentName}
                        {story.parentName && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            的家長
                          </span>
                        )}
                      </p>
                      {story.grade && (
                        <p className="text-xs text-muted-foreground">
                          {story.grade} 年級
                        </p>
                      )}
                    </div>
                  </div>
                  {story.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {story.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-amber-warm text-foreground/70 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
        </div>
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
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-16" {...fadeInUp}>
          <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
            常見問題
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            關於質數數學，您可能想知道的事
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
      className="py-24 px-6 relative"
      style={{
        backgroundColor: "#FAF9F6",
        backgroundImage: `
          linear-gradient(rgba(129, 216, 208, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(129, 216, 208, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <motion.div className="max-w-2xl mx-auto text-center" {...fadeInUp}>
        <h2 className="font-serif text-3xl md:text-4xl tracking-[0.1em] text-foreground mb-4">
          立即預約免費診斷
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          讓我們的認證教練為您的孩子進行一次免費的數學能力適性診斷，
          了解孩子的學習狀態，制定最適合的學習計畫。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="rounded-full px-10 py-6 text-base"
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
            <Button variant="outline" size="lg" className="rounded-full px-10 py-6 text-base">
              家長登入
            </Button>
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
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
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-foreground text-white/80 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl tracking-[0.15em] text-white mb-3">
              質數數學
            </h3>
            <p className="text-sm text-white/50 mb-1 tracking-wide">
              The Prime Math
            </p>
            <p className="text-sm text-white/60 leading-relaxed mt-4 max-w-sm">
              不可拆解的對話，讓教學回歸「1 位教練」對「1
              位學生」的學習體驗。我們致力於為每一位國小學生提供最專業的數學個別指導。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              快速連結
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#about"
                  className="text-sm text-white/60 transition-colors"
                  data-testid="footer-link-about"
                >
                  認識質數
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm text-white/60 transition-colors"
                  data-testid="footer-link-features"
                >
                  課程資訊
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-sm text-white/60 transition-colors"
                  data-testid="footer-link-testimonials"
                >
                  成功案例
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-white/60 transition-colors"
                  data-testid="footer-link-faq"
                >
                  常見問題
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

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} 質數數學 The Prime Math. All rights
            reserved.
          </p>
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
