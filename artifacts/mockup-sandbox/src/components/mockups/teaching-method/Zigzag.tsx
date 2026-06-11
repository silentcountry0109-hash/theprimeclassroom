import React from 'react';
import { BookOpen, TrendingUp, CheckCircle, Target } from 'lucide-react';
import './_group.css';

export function Zigzag() {
  const features = [
    {
      title: "螺旋式課程",
      desc: "同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。",
      img: "/__mockup/images/teach1.png",
      icon: <BookOpen className="w-6 h-6 text-[#81D8D0]" />
    },
    {
      title: "階梯式教學",
      desc: "由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。",
      img: "/__mockup/images/teach2.png",
      icon: <TrendingUp className="w-6 h-6 text-[#FFB7B2]" />
    },
    {
      title: "單元評測",
      desc: "每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。",
      img: "/__mockup/images/teach3.png",
      icon: <CheckCircle className="w-6 h-6 text-[#81D8D0]" />
    },
    {
      title: "個別指導・個別進度",
      desc: "每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。",
      img: "/__mockup/images/teach4.png",
      icon: <Target className="w-6 h-6 text-[#FFB7B2]" />
    }
  ];

  return (
    <section className="prime-root w-full bg-[#FAF9F6] py-20 px-6 sm:px-12 md:px-20 overflow-hidden font-sans text-[#3A3A3A]">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 relative">
          {/* Decorative dots */}
          <div className="absolute top-0 left-4 w-12 h-12 rounded-full bg-[#FFB7B2] opacity-20 -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          <div className="absolute bottom-0 right-10 w-16 h-16 rounded-full bg-[#81D8D0] opacity-20 translate-x-1/2 translate-y-1/2 blur-xl"></div>
          
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3A3A3A] mb-6 relative inline-block">
            教學特色
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#81D8D0] rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-[#6b7280] leading-relaxed mt-6">
            螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，為每個孩子量身打造吸收效率最好的學習規劃
          </p>
        </div>

        {/* Zigzag Content */}
        <div className="space-y-24 md:space-y-32">
          {features.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24 ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Image side - explicitly larger (45% width on md) */}
              <div className="w-full md:w-[45%] relative flex justify-center group">
                {/* Decorative blob behind image */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-30 blur-2xl transition-all duration-1000 group-hover:scale-105 ${idx % 2 === 0 ? 'bg-[#81D8D0]' : 'bg-[#FFF9E5]'}`}></div>
                
                {/* Accent circle */}
                <div className={`absolute w-24 h-24 rounded-full opacity-40 blur-md ${idx % 2 === 0 ? '-bottom-6 -right-6 bg-[#FFB7B2]' : '-top-6 -left-6 bg-[#81D8D0]'}`}></div>

                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full max-w-[400px] md:max-w-none h-auto object-contain relative z-10 drop-shadow-xl hover:scale-[1.02] transition-transform duration-500" 
                />
              </div>

              {/* Text side */}
              <div className="w-full md:w-[55%] flex flex-col justify-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-xl font-bold font-serif ${idx % 2 === 0 ? 'text-[#81D8D0]' : 'text-[#FFB7B2]'}`}>
                    0{idx + 1}
                  </span>
                  <div className="p-2 rounded-xl bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#3A3A3A] mb-6 leading-snug">
                  {item.title}
                </h3>
                
                <p className="text-lg text-[#6b7280] leading-relaxed">
                  {item.desc}
                </p>
                
                {/* Decorative subtle line */}
                <div className="mt-8 h-px w-24 bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
