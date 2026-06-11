import { Users, Shield, Target } from "lucide-react";
import './_group.css';

export function Asymmetric() {
  return (
    <div className="prime-root bg-[#FAF9F6] w-full py-20 px-6 sm:px-8 lg:px-12 font-sans text-[#3A3A3A] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D8D0] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFB7B2] opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#3A3A3A] tracking-wider">
            為什麼選擇質數教室
          </h2>
          <div className="w-12 h-1 bg-[#81D8D0] mx-auto rounded-full"></div>
          <p className="text-[#6b7280] text-lg max-w-2xl mx-auto leading-relaxed">
            我們相信，每個孩子都值得一場不被干擾的學習對話
          </p>
        </div>

        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Large Card - Individual Guidance */}
          <div className="lg:col-span-7 group">
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full transition-transform duration-500 hover:-translate-y-1 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#81D8D0] to-[#81D8D0]/50"></div>
              <div className="aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] relative overflow-hidden">
                <img 
                  src="/__mockup/images/feat1.png" 
                  alt="個別指導" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-3 shadow-sm">
                    <Users className="w-5 h-5 text-[#81D8D0]" />
                    <span className="font-serif font-medium text-[#3A3A3A]">個別指導</span>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-10">
                <h3 className="font-serif text-2xl mb-4 text-[#3A3A3A]">量身打造的專屬學習進度</h3>
                <p className="text-[#6b7280] leading-loose text-lg">
                  每位學生都有獨立的學習進度與教材，老師會依據學生狀態即時調整教學，確保每個孩子都能獲得充分的關注。
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Stacked Cards */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Professional Teachers */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 transition-transform duration-500 hover:-translate-y-1 relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FFB7B2] to-[#FFB7B2]/50"></div>
              <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-2/5 relative overflow-hidden hidden sm:block">
                   <img 
                    src="/__mockup/images/feat2.png" 
                    alt="專業認證師資" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFB7B2]/10 flex items-center justify-center mb-4 text-[#FFB7B2]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl mb-3 text-[#3A3A3A]">專業認證師資</h3>
                  <p className="text-[#6b7280] leading-relaxed text-sm">
                    所有老師均通過總部嚴格培訓與認證，深諳認知轉譯技巧，能以孩子的語言解釋數學概念。
                  </p>
                </div>
              </div>
            </div>

            {/* Flexible Booking */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 transition-transform duration-500 hover:-translate-y-1 relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FFF9E5] to-[#FFF9E5]/50"></div>
               <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-2/5 relative overflow-hidden hidden sm:block">
                   <img 
                    src="/__mockup/images/feat3.png" 
                    alt="彈性預約制度" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E5] flex items-center justify-center mb-4 text-[#eab308]">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl mb-3 text-[#3A3A3A]">彈性預約制度</h3>
                  <p className="text-[#6b7280] leading-relaxed text-sm">
                    如同訂機票般簡單，家長可自由選擇教室、時段與老師，完全配合家庭的作息安排。
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
