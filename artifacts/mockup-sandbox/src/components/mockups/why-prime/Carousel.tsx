import React, { useState } from 'react';
import { Users, Shield, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import './_group.css';

const features = [
  {
    title: '個別指導',
    description: '每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。',
    image: '/__mockup/images/feat1.png',
    Icon: Users
  },
  {
    title: '專業認證師資',
    description: '所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。',
    image: '/__mockup/images/feat2.png',
    Icon: Shield
  },
  {
    title: '彈性預約制度',
    description: '如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。',
    image: '/__mockup/images/feat3.png',
    Icon: Target
  }
];

export function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="prime-root bg-[#FAF9F6] text-[#3A3A3A] py-20 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 -left-10 w-48 h-48 bg-[#FFF9E5] rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#E6F7F5] rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>

        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-wider text-[#3A3A3A]">
            為什麼選擇質數教室
          </h2>
          <p className="text-[#6b7280] tracking-widest text-sm md:text-base">
            我們相信，每個孩子都值得一場不被干擾的學習對話
          </p>
        </div>

        {/* Carousel Content */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#81D8D0]/10 p-6 md:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-10 lg:gap-16 z-10">
          
          {/* Left: Image */}
          <div className="w-full md:w-1/2 relative group overflow-hidden rounded-2xl aspect-[4/3] shadow-sm">
            {features.map((feature, idx) => (
              <img
                key={idx}
                src={feature.image}
                alt={feature.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  currentIndex === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                }`}
              />
            ))}
          </div>

          {/* Right: Content */}
          <div className="w-full md:w-1/2 relative min-h-[220px] md:min-h-[260px] flex flex-col justify-center">
            {features.map((feature, idx) => {
              const Icon = feature.Icon;
              return (
                <div
                  key={idx}
                  className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col justify-center ${
                    currentIndex === idx
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E6F7F5] text-[#81D8D0] mb-6 shadow-sm border border-[#81D8D0]/20 rotate-3">
                    <Icon size={32} strokeWidth={1.5} className="-rotate-3" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-[#3A3A3A] tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-[#6b7280] leading-relaxed text-base md:text-lg">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center mt-12 gap-8 relative z-10">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-[#81D8D0]/30 text-[#81D8D0] flex items-center justify-center hover:bg-[#81D8D0] hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#81D8D0]/50 bg-white shadow-sm"
            aria-label="上一項"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          
          <div className="flex items-center gap-3">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-12 h-2 bg-[#81D8D0]'
                    : 'w-2 h-2 bg-[#81D8D0]/30 hover:bg-[#81D8D0]/60'
                }`}
                aria-label={`切換至第 ${idx + 1} 項`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-[#81D8D0]/30 text-[#81D8D0] flex items-center justify-center hover:bg-[#81D8D0] hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#81D8D0]/50 bg-white shadow-sm"
            aria-label="下一項"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </section>
  );
}
