import React from 'react';
import { Repeat, TrendingUp, ClipboardCheck, UserCheck } from 'lucide-react';
import './_group.css';

const features = [
  {
    title: '螺旋式課程',
    desc: '同一概念在不同階段反覆出現，每次加深難度，讓孩子自然內化數學觀念，不再死記硬背。',
    img: '/__mockup/images/teach1.png',
    icon: Repeat,
    bgColor: 'bg-[#81D8D0]/15',
    iconColor: 'text-[#81D8D0]',
  },
  {
    title: '階梯式教學',
    desc: '由淺入深，每一步都建立在前一步的基礎上，確保孩子穩紮穩打，不會因跳躍式進度而掉隊。',
    img: '/__mockup/images/teach2.png',
    icon: TrendingUp,
    bgColor: 'bg-[#FFB7B2]/15',
    iconColor: 'text-[#FFB7B2]',
  },
  {
    title: '單元評測',
    desc: '每個單元結束後進行評測，精準掌握孩子的學習狀態，找出需要加強的環節，即時調整教學方向。',
    img: '/__mockup/images/teach3.png',
    icon: ClipboardCheck,
    bgColor: 'bg-[#FFF9E5]',
    iconColor: 'text-[#D97706]',
  },
  {
    title: '個別指導・個別進度',
    desc: '每位孩子都有專屬的學習計畫與進度，老師依據評測結果量身打造最適合的學習路徑，讓吸收效率最大化。',
    img: '/__mockup/images/teach4.png',
    icon: UserCheck,
    bgColor: 'bg-[#81D8D0]/15',
    iconColor: 'text-[#81D8D0]',
  }
];

export function IconGrid() {
  return (
    <section className="prime-root py-16 px-6 bg-[#FAF9F6] w-full">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#3A3A3A] mb-4">教學特色</h2>
          <p className="text-[#6b7280] max-w-3xl mx-auto leading-relaxed">
            螺旋式課程、階梯式教學、搭配單元評測，個別指導、個別進度，為每個孩子量身打造吸收效率最好的學習規劃
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="group relative flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Background Decor */}
                <div className={`absolute top-0 left-0 right-0 h-40 ${item.bgColor} rounded-t-3xl transition-colors duration-300`} />
                
                {/* Image - Prominent visual protagonist */}
                <div className="relative z-10 w-44 h-44 mb-4 mt-2 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                  <img src={item.img} alt={item.title} className="w-full h-full object-contain" />
                </div>
                
                {/* Icon Badge */}
                <div className={`relative z-10 -mt-10 mb-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm ${item.iconColor}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>

                <div className="relative z-10 text-center flex-grow flex flex-col">
                  <h3 className="font-serif text-xl font-bold text-[#3A3A3A] mb-3">{item.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed text-justify">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
