import React from "react";
import { Users, Shield, Target } from "lucide-react";
import "./_group.css";

export function Timeline() {
  const features = [
    {
      title: "個別指導",
      description: "每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。",
      image: "/__mockup/images/feat1.png",
      icon: Users,
    },
    {
      title: "專業認證師資",
      description: "所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。",
      image: "/__mockup/images/feat2.png",
      icon: Shield,
    },
    {
      title: "彈性預約制度",
      description: "如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。",
      image: "/__mockup/images/feat3.png",
      icon: Target,
    },
  ];

  return (
    <section className="prime-root bg-[#FAF9F6] py-16 px-6 md:py-24 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#81D8D0] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFB7B2] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="font-serif text-3xl md:text-4xl text-[#3A3A3A] mb-4 tracking-wider">
            為什麼選擇質數教室
          </h2>
          <p className="text-[#6b7280] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            我們相信，每個孩子都值得一場不被干擾的學習對話
          </p>
        </div>

        <div className="relative">
          {/* Vertical line - hidden on mobile, visible on desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-[#81D8D0]/30 to-transparent" />

          <div className="space-y-16 md:space-y-24">
            {features.map((feature, index) => {
              const isEven = index % 2 === 0;
              const Icon = feature.icon;

              return (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content side */}
                  <div className={`w-full md:w-1/2 flex flex-col ${isEven ? "md:items-end md:text-right" : "md:items-start md:text-left"} items-center text-center`}>
                    <div className="max-w-md">
                      <div className={`flex items-center justify-center md:justify-start gap-3 mb-4 ${isEven ? "md:flex-row-reverse" : "md:flex-row"}`}>
                        <div className="w-12 h-12 rounded-full bg-[#FFF9E5] flex items-center justify-center shadow-sm text-[#81D8D0] flex-shrink-0">
                          <Icon size={24} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-serif text-2xl text-[#3A3A3A]">{feature.title}</h3>
                      </div>
                      <p className="text-[#6b7280] leading-relaxed mb-6">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Node for Desktop */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#81D8D0] rounded-full shadow-[0_0_0_8px_rgba(129,216,208,0.15)] z-10" />

                  {/* Image side */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div className={`relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-[1.02] ${isEven ? "md:translate-x-4" : "md:-translate-x-4"}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
