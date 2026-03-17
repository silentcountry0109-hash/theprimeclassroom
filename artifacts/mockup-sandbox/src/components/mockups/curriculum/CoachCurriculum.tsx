import { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Bell, 
  LogOut, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ClipboardList, 
  Archive,
  Search,
  Filter
} from 'lucide-react';

export function CoachCurriculum() {
  const [activeTab, setActiveTab] = useState<'materials' | 'midterm'>('materials');
  const [activeFilter, setActiveFilter] = useState('分數與小數');
  const [isPdfOpen, setIsPdfOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC'] text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#92D7D0]/20 rounded-full flex items-center justify-center text-[#92D7D0]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-['Shippori_Mincho'] font-bold text-slate-800">紀硯文 老師</h1>
                <p className="text-xs text-slate-500">質數教室 老師系統</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFB7B2] rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {['行事曆', '我的學生', '收入總覽', '個人資料', '使用手冊', '教材庫'].map((tab) => (
              <button
                key={tab}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tab === '教材庫'
                    ? 'border-[#92D7D0] text-[#92D7D0]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-['Shippori_Mincho'] font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#92D7D0]" />
            教材庫
          </h2>
          <p className="text-slate-500 mt-1 text-sm">瀏覽所有教學教材、配套考卷及期中考歸檔資料</p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/60 inline-flex">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'materials'
                ? 'bg-white text-[#92D7D0] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            教材與考卷
          </button>
          <button
            onClick={() => setActiveTab('midterm')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'midterm'
                ? 'bg-white text-[#92D7D0] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Archive className="w-4 h-4" />
            期中考歸檔
          </button>
        </div>

        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">單元分類</span>
              </div>
              <button
                onClick={() => setActiveFilter('全部')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === '全部'
                    ? 'bg-[#92D7D0] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#92D7D0] hover:text-[#92D7D0]'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveFilter('分數與小數')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeFilter === '分數與小數'
                    ? 'bg-[#92D7D0] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#92D7D0] hover:text-[#92D7D0]'
                }`}
              >
                {activeFilter === '分數與小數' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                分數與小數
              </button>
              <button
                onClick={() => setActiveFilter('幾何圖形')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === '幾何圖形'
                    ? 'bg-[#92D7D0] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#92D7D0] hover:text-[#92D7D0]'
                }`}
              >
                幾何圖形
              </button>
              <button
                onClick={() => setActiveFilter('應用題')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === '應用題'
                    ? 'bg-[#92D7D0] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#92D7D0] hover:text-[#92D7D0]'
                }`}
              >
                應用題
              </button>
            </div>

            {/* Content Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-['Shippori_Mincho'] font-bold text-lg text-slate-800">單元：分數與小數</h3>
                  <p className="text-sm text-slate-500 mt-1">包含 1 份教材與 4 份配套考卷</p>
                </div>
              </div>

              <div className="p-2">
                {/* Row 1: Teaching Material */}
                <div className={`p-3 rounded-xl transition-colors ${isPdfOpen ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#92D7D0]/10 flex items-center justify-center text-[#92D7D0]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">教材</span>
                          <h4 className="font-bold text-slate-800">分數基礎概念</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>單元: 分數與小數</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>更新 2026/03/15</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsPdfOpen(!isPdfOpen)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        isPdfOpen 
                          ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700' 
                          : 'bg-white text-[#92D7D0] border-[#92D7D0] hover:bg-[#92D7D0]/5'
                      }`}
                    >
                      {isPdfOpen ? '關閉閱讀' : '開啟閱讀'}
                    </button>
                  </div>

                  {/* PDF Reader Panel (Expanded) */}
                  {isPdfOpen && (
                    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 animate-in slide-in-from-top-4 fade-in duration-300">
                      {/* Reader Toolbar */}
                      <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-sm">分數基礎概念.pdf</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span>第 1 頁 / 共 6 頁</span>
                            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="w-px h-4 bg-slate-600"></div>
                          <button 
                            onClick={() => setIsPdfOpen(false)}
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Reader Content Area */}
                      <div className="p-8 flex justify-center bg-slate-200/50">
                        <div className="bg-white w-full max-w-2xl min-h-[500px] shadow-sm rounded border border-slate-200 p-12">
                          <h2 className="text-3xl font-['Shippori_Mincho'] font-bold text-center mb-12 text-slate-800">分數基礎概念</h2>
                          
                          <div className="space-y-8">
                            <section>
                              <h3 className="text-xl font-bold mb-4 text-[#92D7D0]">1. 認識分數</h3>
                              <p className="text-slate-600 leading-relaxed mb-4">
                                分數是用來表示「整體中的一部分」的數字表示方法。在分數中，橫線下方的數字稱為「分母」，表示把一個整體平分成幾份；橫線上方的數字稱為「分子」，表示我們取了其中的幾份。
                              </p>
                              <div className="bg-[#FAF9F6] p-6 rounded-xl border border-[#92D7D0]/20 flex items-center justify-center gap-8 my-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-slate-800 border-b-2 border-slate-800 pb-1 px-4">1</div>
                                  <div className="text-2xl font-bold text-slate-800 pt-1 px-4">2</div>
                                </div>
                                <div className="text-slate-400 text-xl">+</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-slate-800 border-b-2 border-slate-800 pb-1 px-4">1</div>
                                  <div className="text-2xl font-bold text-slate-800 pt-1 px-4">4</div>
                                </div>
                                <div className="text-slate-400 text-xl">=</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[#FFB7B2] border-b-2 border-[#FFB7B2] pb-1 px-4">3</div>
                                  <div className="text-2xl font-bold text-[#FFB7B2] pt-1 px-4">4</div>
                                </div>
                              </div>
                            </section>

                            <section>
                              <h3 className="text-xl font-bold mb-4 text-[#92D7D0]">2. 等值分數</h3>
                              <p className="text-slate-600 leading-relaxed">
                                當兩個分數代表相同的大小，我們稱它們為等值分數。例如：½ 和 ²/₄ 是等值分數。將分子和分母同乘以一個不為零的整數，就可以得到等值分數，這個過程稱為擴分。
                              </p>
                            </section>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="my-2 border-t border-slate-100 mx-3"></div>

                {/* Quizzes Section */}
                <div className="pl-6 relative">
                  {/* Decorative timeline line */}
                  <div className="absolute left-[33px] top-6 bottom-6 w-px bg-slate-200"></div>

                  <div className="py-2">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#FFB7B2]" />
                      配套考卷 (4份)
                    </h4>
                    
                    <div className="space-y-1">
                      {/* Quiz 1 */}
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10 bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2]">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#FFB7B2]/20 text-[#E08A84]">第1張</span>
                              <h4 className="font-medium text-slate-700 group-hover:text-[#FFB7B2] transition-colors">考卷：分數概念測驗A</h4>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>更新 2026/03/15</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-[#FFB7B2] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/5 transition-colors">
                          開啟閱讀
                        </button>
                      </div>

                      {/* Quiz 2 */}
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10 bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2]">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#FFB7B2]/20 text-[#E08A84]">第2張</span>
                              <h4 className="font-medium text-slate-700 group-hover:text-[#FFB7B2] transition-colors">考卷：分數概念測驗B</h4>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>更新 2026/03/14</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-[#FFB7B2] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/5 transition-colors">
                          開啟閱讀
                        </button>
                      </div>

                      {/* Quiz 3 */}
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10 bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2]">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#FFB7B2]/20 text-[#E08A84]">第3張</span>
                              <h4 className="font-medium text-slate-700 group-hover:text-[#FFB7B2] transition-colors">考卷：帶分數練習卷</h4>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>更新 2026/03/10</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-[#FFB7B2] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/5 transition-colors">
                          開啟閱讀
                        </button>
                      </div>

                      {/* Quiz 4 */}
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10 bg-white">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2]">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#FFB7B2]/20 text-[#E08A84]">第4張</span>
                              <h4 className="font-medium text-slate-700 group-hover:text-[#FFB7B2] transition-colors">考卷：綜合練習卷</h4>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>更新 2026/03/08</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-[#FFB7B2] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/5 transition-colors">
                          開啟閱讀
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Another Unit (Collapsed) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-['Shippori_Mincho'] font-bold text-lg text-slate-800">單元：幾何圖形</h3>
                  <p className="text-sm text-slate-500 mt-1">包含 1 份教材與 4 份配套考卷</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'midterm' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-16 h-16 bg-[#92D7D0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-[#92D7D0]" />
            </div>
            <h3 className="text-xl font-['Shippori_Mincho'] font-bold text-slate-800 mb-2">期中考歸檔區</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              此區包含歷屆期中考試題與相關複習資料。點擊下方按鈕以瀏覽或搜尋特定學期之試卷。
            </p>
            <button className="px-6 py-2.5 bg-[#92D7D0] text-white rounded-lg font-medium shadow-sm hover:bg-[#7bc4bd] transition-colors inline-flex items-center gap-2">
              <Search className="w-4 h-4" />
              搜尋歸檔資料
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
