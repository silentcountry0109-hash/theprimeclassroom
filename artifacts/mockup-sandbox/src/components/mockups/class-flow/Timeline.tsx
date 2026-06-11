import React, { useEffect, useState } from 'react';
import { Lightbulb, BookOpen, Eye, Users, PenLine, CheckCircle, Repeat, Sparkles } from 'lucide-react';
import './_group.css';

export function Timeline() {
  const [activeStep, setActiveStep] = useState(-1);

  const steps = [
    { title: "觀念講解", icon: <Lightbulb className="w-6 h-6" /> },
    { title: "師資帶領示範解題", icon: <BookOpen className="w-6 h-6" /> },
    { title: "確認寫題狀況", icon: <Eye className="w-6 h-6" /> },
    { title: "專業師資引導協助", icon: <Users className="w-6 h-6" /> },
    { title: "再次進行問題演練", icon: <PenLine className="w-6 h-6" /> },
    { title: "當日課程總結", icon: <CheckCircle className="w-6 h-6" /> },
    { title: "回家演練加深記憶", icon: <Repeat className="w-6 h-6" /> },
  ];

  useEffect(() => {
    // Start animation sequence
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 600); // Reveal one step every 600ms

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="prime-root w-full bg-[#FAF9F6] py-20 px-6 sm:px-12 md:px-20 overflow-hidden font-sans text-[#3A3A3A]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes timeline-grow {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes timeline-fade-slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes timeline-fade-slide-left {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes timeline-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(129, 216, 208, 0); }
          100% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0); }
        }
        .animate-timeline-line {
          animation: timeline-grow 4.5s ease-out forwards;
        }
      `}} />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-0 left-1/4 w-12 h-12 rounded-full bg-[#FFB7B2] opacity-20 -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 rounded-full bg-[#81D8D0] opacity-20 translate-x-1/2 translate-y-1/2 blur-xl"></div>
          
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3A3A3A] mb-6 relative inline-block">
            課程進行方式
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#81D8D0] rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-[#6b7280] leading-relaxed mt-6">
            每一堂課都依循清楚的學習節奏，讓孩子穩穩吸收、扎實成長
          </p>
        </div>

        {/* Timeline */}
        <div className="relative py-10 max-w-4xl mx-auto">
          {/* Central Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2 rounded-full">
             <div className="absolute top-0 left-0 right-0 w-full bg-[#81D8D0] rounded-full animate-timeline-line" style={{ transformOrigin: 'top' }}></div>
          </div>

          <div className="space-y-12 md:space-y-20 relative">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const isActive = activeStep >= idx;
              
              return (
                <div 
                  key={idx} 
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateX(0)' : (isEven ? 'translateX(-30px)' : 'translateX(30px)'),
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Content Box */}
                  <div className="w-full md:w-[45%] pl-20 md:pl-0 md:px-12 flex justify-start md:justify-end">
                    <div className={`bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-5 w-full max-w-md ${
                      !isEven ? 'md:flex-row-reverse md:text-right' : 'md:text-left'
                    } transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(129,216,208,0.15)]`}>
                      <div className={`p-4 rounded-xl flex-shrink-0 ${idx % 2 === 0 ? 'bg-[#FFF9E5] text-[#FFB7B2]' : 'bg-[#f0fbf9] text-[#81D8D0]'}`}>
                        {step.icon}
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl font-bold text-[#3A3A3A] leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Node Dot */}
                  <div className="absolute left-8 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center">
                     <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-sm font-bold shadow-md transition-colors duration-500 ${
                       isActive ? 'bg-[#81D8D0] text-white' : 'bg-gray-200 text-gray-400'
                     }`} style={{ animation: isActive ? 'timeline-pulse-ring 2s infinite' : 'none' }}>
                       0{idx + 1}
                     </div>
                  </div>
                  
                  {/* Empty space for the other side */}
                  <div className="hidden md:block w-[45%]"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div 
           className="mt-20 max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#81D8D0]/20 relative overflow-hidden"
           style={{
             opacity: activeStep >= steps.length ? 1 : 0,
             transform: activeStep >= steps.length ? 'translateY(0)' : 'translateY(20px)',
             transition: 'all 0.8s ease-out 0.2s'
           }}
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-[#FFB7B2]"></div>
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-[#FFB7B2] flex-shrink-0 mt-1" />
            <p className="text-[#6b7280] text-lg leading-relaxed">
              專業師資將於整個過程觀察孩子寫題的狀況，必要時進行引導與協助。讓學習的本身回到訓練孩子獨立完成解題，進而達到有效學習。
            </p>
          </div>
        </div>
        
      </div>
    </section>
  );
}
