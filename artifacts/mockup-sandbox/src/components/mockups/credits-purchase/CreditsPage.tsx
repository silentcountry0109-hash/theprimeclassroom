import React from "react";
import { 
  Check, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Wallet, 
  Sparkles, 
  Zap, 
  Star,
  CheckCircle2
} from "lucide-react";

export function CreditsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC',sans-serif] text-slate-800 selection:bg-[#81D8D0] selection:text-white pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Shippori+Mincho:wght@500;600;700&display=swap');
        .font-serif { font-family: 'Shippori Mincho', serif; }
      `}} />

      {/* Header & Wallet */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-slate-900">堂數購買</h1>
          <div className="bg-gradient-to-r from-[#81D8D0]/10 to-[#81D8D0]/5 border border-[#81D8D0]/20 rounded-full px-4 py-1.5 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#81D8D0]" />
            <span className="text-sm font-medium text-slate-700">剩餘 <span className="text-[#81D8D0] font-bold text-base mx-1">12</span> 堂</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 space-y-20">
        
        {/* Section 1: Package Cards */}
        <section>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">選擇最適合的學習方案</h2>
            <p className="text-slate-500 max-w-xl mx-auto">所有的方案皆包含我們的核心學習系統，購買越多，單堂越優惠。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Plan 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md flex flex-col h-full mt-4 md:mt-8">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-1">體驗包</h3>
              <p className="text-sm text-slate-500 mb-6">適合想先試試水溫的孩子</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-3xl font-bold">$1,200</span>
                <span className="text-sm text-slate-500 mb-1">/ 8堂</span>
              </div>
              <div className="text-sm font-medium text-[#81D8D0] bg-[#81D8D0]/10 py-1.5 px-3 rounded-lg inline-block w-max mb-8">
                每堂 $150
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>8堂課程</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>3個月有效期</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>個人化診斷</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>學習歷程記錄</span></li>
              </ul>
              <button className="w-full py-3 rounded-xl font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">選擇體驗包</button>
            </div>

            {/* Plan 2 (Recommended) */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-[#81D8D0]/10 border-2 border-[#81D8D0] relative flex flex-col h-full z-10 transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#81D8D0] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-4 h-4" /> 最受歡迎
              </div>
              <div className="w-12 h-12 bg-[#81D8D0]/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-[#81D8D0]" />
              </div>
              <h3 className="text-xl font-bold mb-1 text-[#81D8D0]">標準包</h3>
              <p className="text-sm text-slate-500 mb-6">建立穩定學習習慣的最佳選擇</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold text-slate-900">$2,800</span>
                <span className="text-sm text-slate-500 mb-1">/ 20堂</span>
              </div>
              <div className="text-sm font-medium text-[#81D8D0] bg-[#81D8D0]/10 py-1.5 px-3 rounded-lg inline-block w-max mb-8">
                每堂 $140
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>20堂課程</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>6個月有效期</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>個人化診斷</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>學習歷程記錄</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>進步趨勢分析</span></li>
                <li className="flex items-start gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-[#81D8D0] shrink-0" /> <span>優先排課</span></li>
              </ul>
              <button className="w-full py-3 rounded-xl font-bold text-white bg-[#81D8D0] hover:bg-[#6BC4BC] transition-colors shadow-md shadow-[#81D8D0]/30">選擇標準包</button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md flex flex-col h-full mt-4 md:mt-8">
              <div className="w-12 h-12 bg-[#FFB7B2]/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#FFB7B2]" />
              </div>
              <h3 className="text-xl font-bold mb-1">衝刺包</h3>
              <p className="text-sm text-slate-500 mb-6">適合有明確目標、需密集輔導</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-3xl font-bold">$5,200</span>
                <span className="text-sm text-slate-500 mb-1">/ 40堂</span>
              </div>
              <div className="text-sm font-medium text-[#FFB7B2] bg-[#FFB7B2]/10 py-1.5 px-3 rounded-lg inline-block w-max mb-8">
                每堂 $130
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>40堂課程</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>12個月有效期</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>全部標準包功能</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>專屬老師配對</span></li>
                <li className="flex items-start gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" /> <span>學習報告匯出</span></li>
              </ul>
              <button className="w-full py-3 rounded-xl font-medium text-[#E87A72] bg-[#FFB7B2]/10 hover:bg-[#FFB7B2]/20 transition-colors">選擇衝刺包</button>
            </div>
          </div>
        </section>

        {/* Section 2: Cost Comparison */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">與其他學習管道比較</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-2 md:p-4 shadow-sm border border-slate-200 max-w-3xl mx-auto overflow-hidden">
            <div className="space-y-1">
              <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors"></div>
                  <div>
                    <div className="font-medium text-slate-900">數學家教</div>
                    <div className="text-xs text-slate-500 mt-1">每週 2 小時</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-500 line-through font-mono hidden md:block">$6,000–8,000/月</div>
                  <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">省 90%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors"></div>
                  <div>
                    <div className="font-medium text-slate-900">線上補習班</div>
                    <div className="text-xs text-slate-500 mt-1">大班制直播</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-500 line-through font-mono hidden md:block">$2,000–3,000/月</div>
                  <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">省 50%+</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-[#81D8D0]/5 border border-[#81D8D0]/20 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#81D8D0]"></div>
                <div className="flex items-center gap-4 pl-2">
                  <div className="w-2 h-2 rounded-full bg-[#81D8D0] shadow-[0_0_8px_rgba(129,216,208,0.8)]"></div>
                  <div>
                    <div className="font-bold text-[#2C857D]">質數教室標準包</div>
                    <div className="text-xs text-[#4AACA4] mt-1">個人化引導 + 完整追蹤</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-slate-900 font-mono hidden md:block">$2,800</div>
                  <div className="bg-[#81D8D0] text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 最划算
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#FFF9E5] border border-[#FDE08B] group-hover:bg-[#FDE08B] transition-colors"></div>
                  <div>
                    <div className="font-medium text-slate-900">一杯手搖飲 × 30 天</div>
                    <div className="text-xs text-slate-500 mt-1">每天的微小花費</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-slate-500 font-mono hidden md:block">$1,500/月</div>
                  <div className="bg-[#FFF9E5] text-[#D4A017] border border-[#FDE08B]/50 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">更有價值</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Core Features */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">所有方案都包含</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-blue-500" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">個人化診斷</h4>
              <p className="text-xs text-slate-500">精準找出學習盲點，對症下藥</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-green-500" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">進步追蹤</h4>
              <p className="text-xs text-slate-500">數據化呈現成長，看見進步</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-purple-500" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">學習歷程記錄</h4>
              <p className="text-xs text-slate-500">完整保存每一次的學習軌跡</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#FFB7B2]/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#FFB7B2]" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">專業老師陪伴</h4>
              <p className="text-xs text-slate-500">不再孤單學習，隨時有人解答</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
