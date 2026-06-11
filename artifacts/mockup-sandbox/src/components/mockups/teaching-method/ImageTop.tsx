import React from 'react';
import { BookOpen, TrendingUp, Target, User } from 'lucide-react';
import './_group.css';

export function ImageTop() {
  const features = [
    {
      id: 1,
      title: '螺旋式課程',
      desc: '同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。',
      img: '/__mockup/images/teach1.png',
      icon: <BookOpen className="w-5 h-5 text-[#81D8D0]" />,
      bgClass: 'bg-gradient-to-br from-[#81D8D0]/20 to-[#81D8D0]/5'
    },
    {
      id: 2,
      title: '階梯式教學',
      desc: '由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。',
      img: '/__mockup/images/teach2.png',
      icon: <TrendingUp className="w-5 h-5 text-[#FFB7B2]" />,
      bgClass: 'bg-gradient-to-br from-[#FFB7B2]/20 to-[#FFB7B2]/5'
    },
    {
      id: 3,
      title: '單元評測',
      desc: '每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。',
      img: '/__mockup/images/teach3.png',
      icon: <Target className="w-5 h-5 text-[#FFF9E5]" />,
      bgClass: 'bg-gradient-to-br from-[#FFF9E5]/60 to-[#FFF9E5]/10'
    },
    {
      id: 4,
      title: '個別指導・個別進度',
      desc: '每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。',
      img: '/__mockup/images/teach4.png',
      icon: <User className="w-5 h-5 text-[#81D8D0]" />,
      bgClass: 'bg-gradient-to-br from-[#81D8D0]/20 to-white'
    }
  ];

  return (
    <section className="prime-root bg-[#FAF9F6] py-20 px-6 sm:px-12 md:px-20 lg:px-24 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#81D8D0] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFB7B2] opacity-5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3A3A3A] tracking-wider mb-6">
            教學特色
          </h2>
          <p className="text-lg md:text-xl text-[#6b7280] max-w-3xl mx-auto leading-relaxed">
            螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，<br className="hidden md:block" />
            為每個孩子量身打造吸收效率最好的學習規劃
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-2 group border border-gray-100 flex flex-col h-full relative"
            >
              {/* Image Section with soft background */}
              <div className={`relative pt-12 pb-8 px-6 ${feature.bgClass} flex justify-center items-center overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                {/* A decorative circle behind the image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/40 rounded-full blur-md group-hover:bg-white/60 transition-colors duration-500"></div>
                <img 
                  src={feature.img} 
                  alt={feature.title} 
                  className="w-48 h-48 object-contain relative z-10 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                />
              </div>

              {/* Content Section */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#81D8D0] font-bold text-sm shrink-0">
                    {feature.id}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#3A3A3A]">
                    {feature.title}
                  </h3>
                </div>
                <div className="w-12 h-1 bg-gradient-to-r from-[#81D8D0] to-[#FFB7B2] rounded-full mb-5 opacity-70 group-hover:w-full transition-all duration-500 ease-out"></div>
                <p className="text-[#6b7280] leading-relaxed text-[15px]">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
