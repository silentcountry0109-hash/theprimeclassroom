import React, { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, Eye, Users, PenLine, CheckCircle, Repeat, Sparkles } from 'lucide-react';
import './_group.css';

export function Path() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev >= 7 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: 1, title: '觀念講解', icon: Lightbulb },
    { id: 2, title: '師資帶領示範解題', icon: BookOpen },
    { id: 3, title: '確認寫題狀況', icon: Eye },
    { id: 4, title: '專業師資引導協助', icon: Users },
    { id: 5, title: '再次進行問題演練', icon: PenLine },
    { id: 6, title: '當日課程總結', icon: CheckCircle },
    { id: 7, title: '回家演練加深記憶', icon: Repeat },
  ];

  const desktopPositions = [
    { left: '12.5%', top: '100px' },
    { left: '37.5%', top: '100px' },
    { left: '62.5%', top: '100px' },
    { left: '87.5%', top: '100px' },
    { left: '87.5%', top: '380px' },
    { left: '62.5%', top: '380px' },
    { left: '37.5%', top: '380px' },
  ];

  return (
    <section className="prime-root w-full bg-[#FAF9F6] py-20 px-6 sm:px-12 md:px-20 overflow-hidden font-sans text-[#3A3A3A]">
      <style>{`
        @keyframes cf-dash-flow {
          from { stroke-dashoffset: 32; }
          to { stroke-dashoffset: 0; }
        }
        .cf-path-anim {
          animation: cf-dash-flow 1s linear infinite;
        }
        @keyframes cf-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(129, 216, 208, 0); }
          100% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0); }
        }
        .cf-active-pulse {
          animation: cf-pulse-ring 1.5s infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 relative">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#3A3A3A] mb-4">
            課程進行方式
          </h2>
          <p className="text-base md:text-xl text-[#6b7280] leading-relaxed">
            每一堂課都依循清楚的學習節奏，讓孩子穩穩吸收、扎實成長
          </p>
        </div>

        {/* Desktop Journey Path (S-Shape) */}
        <div className="hidden md:block relative w-full max-w-5xl mx-auto h-[520px] mb-16">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 520" preserveAspectRatio="none">
            {/* Background dashed path */}
            <path
              d="M 125 100 L 825 100 Q 875 100 875 150 L 875 330 Q 875 380 825 380 L 375 380"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
            {/* Animated dashed path overlay */}
            <path
              d="M 125 100 L 825 100 Q 875 100 875 150 L 875 330 Q 875 380 825 380 L 375 380"
              fill="none"
              stroke="#81D8D0"
              strokeWidth="4"
              strokeDasharray="16 16"
              className="cf-path-anim"
            />
          </svg>

          {steps.map((step, idx) => {
            const pos = desktopPositions[idx];
            const isLit = step.id <= activeStep;
            const isActive = step.id === activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="absolute flex flex-col items-center justify-start w-48 z-10 transition-transform duration-500"
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: 'translate(-50%, -36px)',
                }}
              >
                {/* Node Circle */}
                <div
                  className={`relative w-18 h-18 rounded-full border-[4px] flex items-center justify-center transition-all duration-500 ${
                    isLit
                      ? 'bg-[#81D8D0] border-[#81D8D0] text-white shadow-lg'
                      : 'bg-white border-gray-200 text-[#d1d5db]'
                  } ${isActive ? 'cf-active-pulse scale-110' : ''}`}
                  style={{ width: '72px', height: '72px' }}
                >
                  <Icon className={`w-8 h-8 transition-colors duration-500 ${isLit ? 'text-white' : 'text-gray-400'}`} />
                  
                  {/* Step Number Badge */}
                  <div
                    className={`absolute -top-2 -right-2 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isLit ? 'bg-[#FFB7B2] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    0{step.id}
                  </div>
                </div>

                {/* Node Text Card */}
                <div
                  className={`mt-4 px-5 py-3 rounded-xl transition-all duration-500 w-full text-center shadow-sm ${
                    isActive
                      ? 'bg-white border-2 border-[#81D8D0] shadow-md -translate-y-1'
                      : isLit
                      ? 'bg-white border border-gray-200 opacity-90'
                      : 'bg-white/60 border border-gray-100 opacity-60 grayscale'
                  }`}
                >
                  <h4 className={`font-serif font-bold text-sm lg:text-base ${isActive ? 'text-[#81D8D0]' : 'text-[#3A3A3A]'}`}>
                    {step.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Journey Path */}
        <div className="md:hidden relative flex flex-col pt-4 pb-8 mb-12">
          {/* Vertical SVG Line */}
          <svg className="absolute left-[39px] top-12 bottom-12 w-2 h-[calc(100%-96px)] pointer-events-none" preserveAspectRatio="none">
            <line x1="4" y1="0" x2="4" y2="100%" fill="none" stroke="#E5E7EB" strokeWidth="3" strokeDasharray="8 8" />
            <line x1="4" y1="0" x2="4" y2="100%" fill="none" stroke="#81D8D0" strokeWidth="3" strokeDasharray="16 16" className="cf-path-anim" />
          </svg>

          {steps.map((step) => {
            const isLit = step.id <= activeStep;
            const isActive = step.id === activeStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex gap-6 relative z-10 mb-10 last:mb-0 w-full pr-4">
                {/* Node Circle */}
                <div
                  className={`w-20 h-20 shrink-0 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 ${
                    isLit
                      ? 'bg-[#81D8D0] border-[#81D8D0] text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-400'
                  } ${isActive ? 'cf-active-pulse scale-105' : ''}`}
                >
                  <Icon className={`w-8 h-8 transition-colors duration-500 ${isLit ? 'text-white' : 'text-gray-400'}`} />
                  
                  {/* Step Number Badge */}
                  <div
                    className={`absolute top-0 right-0 translate-x-1 -translate-y-1 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isLit ? 'bg-[#FFB7B2] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    0{step.id}
                  </div>
                </div>

                {/* Node Text */}
                <div className="flex-1 flex flex-col justify-center pt-2">
                  <div
                    className={`px-4 py-4 rounded-xl transition-all duration-500 shadow-sm ${
                      isActive
                        ? 'bg-white border-l-4 border-l-[#81D8D0] border border-gray-100 shadow-md'
                        : isLit
                        ? 'bg-white border border-gray-100'
                        : 'bg-white/50 border border-transparent'
                    }`}
                  >
                    <h4 className={`font-serif font-bold text-lg ${isActive ? 'text-[#81D8D0]' : 'text-[#3A3A3A]'}`}>
                      {step.title}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="max-w-3xl mx-auto bg-[#FFF9E5] border border-[#FFB7B2]/30 rounded-2xl p-6 md:p-8 flex gap-4 items-start shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="bg-[#FFB7B2]/20 p-2 rounded-lg shrink-0 mt-1">
            <Sparkles className="w-5 h-5 text-[#FFB7B2]" />
          </div>
          <p className="text-[#3A3A3A] leading-relaxed text-sm md:text-base">
            專業師資將於整個過程觀察孩子寫題的狀況，必要時進行引導與協助。讓學習的本身回到訓練孩子獨立完成解題，進而達到有效學習。
          </p>
        </div>
      </div>
    </section>
  );
}
