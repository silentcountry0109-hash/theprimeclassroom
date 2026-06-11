import React, { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, Eye, Users, PenLine, CheckCircle, Repeat, Sparkles } from 'lucide-react';
import './_group.css';

const steps = [
  { id: 1, title: '觀念講解', icon: Lightbulb },
  { id: 2, title: '師資帶領示範解題', icon: BookOpen },
  { id: 3, title: '確認寫題狀況', icon: Eye },
  { id: 4, title: '專業師資引導協助', icon: Users },
  { id: 5, title: '再次進行問題演練', icon: PenLine },
  { id: 6, title: '當日課程總結', icon: CheckCircle },
  { id: 7, title: '回家演練加深記憶', icon: Repeat },
];

export function Stepper() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="prime-root w-full bg-[#FAF9F6] py-20 px-6 sm:px-12 md:px-20 overflow-hidden font-sans text-[#3A3A3A]">
      <style>{`
        @keyframes stepperPulse {
          0% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(129, 216, 208, 0); }
          100% { box-shadow: 0 0 0 0 rgba(129, 216, 208, 0); }
        }
        .step-active {
          animation: stepperPulse 2s infinite;
        }
        @keyframes flowProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-0 left-4 w-12 h-12 rounded-full bg-[#FFB7B2] opacity-20 -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          <div className="absolute bottom-0 right-10 w-16 h-16 rounded-full bg-[#81D8D0] opacity-20 translate-x-1/2 translate-y-1/2 blur-xl"></div>
          
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#3A3A3A] mb-6 relative inline-block">
            課程進行方式
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#81D8D0] rounded-full"></span>
          </h2>
          <p className="text-lg md:text-xl text-[#6b7280] leading-relaxed mt-6">
            每一堂課都依循清楚的學習節奏，讓孩子穩穩吸收、扎實成長
          </p>
        </div>

        {/* Stepper Container */}
        <div className="relative mb-20">
          {/* Progress Bar Background */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
          
          {/* Active Progress Bar */}
          <div 
            className="hidden md:block absolute top-1/2 left-0 h-1 bg-[#81D8D0] -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          ></div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8 md:gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isPast = index <= activeStep;

              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center group relative cursor-pointer"
                  onClick={() => setActiveStep(index)}
                >
                  <div className="md:hidden absolute top-0 left-1/2 w-0.5 h-full bg-gray-200 -translate-x-1/2 -z-10"></div>
                  {isPast && (
                    <div className="md:hidden absolute top-0 left-1/2 w-0.5 bg-[#81D8D0] -translate-x-1/2 -z-10 transition-all duration-500" style={{ height: '100%' }}></div>
                  )}

                  <div className={`
                    w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
                    transition-all duration-500 ease-out z-10 bg-white
                    ${isActive ? 'scale-110 border-[3px] border-[#81D8D0] step-active text-[#81D8D0]' : 
                      isPast ? 'border-[3px] border-[#81D8D0] text-[#81D8D0]' : 'border-2 border-gray-200 text-gray-400'}
                  `}>
                    <Icon className={`${isActive ? 'w-7 h-7 md:w-8 md:h-8' : 'w-6 h-6 md:w-7 md:h-7'} transition-all duration-500`} />
                  </div>
                  
                  <div className={`
                    mt-4 text-center transition-all duration-500
                    ${isActive ? 'scale-105' : 'opacity-60'}
                  `}>
                    <div className={`font-serif font-bold text-sm md:text-base mb-1 ${isActive ? 'text-[#81D8D0]' : ''}`}>
                      Step 0{step.id}
                    </div>
                    <div className={`text-sm md:text-base font-medium max-w-[100px] md:max-w-[120px] leading-tight ${isActive ? 'text-[#3A3A3A]' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remark Box */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#FFF9E5] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF9E5] rounded-bl-full opacity-50 -z-0"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFF9E5] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FFB7B2]" />
            </div>
            <p className="text-base md:text-lg text-[#3A3A3A] leading-relaxed pt-1">
              專業師資將於整個過程觀察孩子寫題的狀況，必要時進行引導與協助。讓學習的本身回到訓練孩子獨立完成解題，進而達到有效學習。
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
