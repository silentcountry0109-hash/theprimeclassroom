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
  const [activeFilter, setActiveFilter] = useState('公倍數');
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
                onClick={() => setActiveFilter('公倍數')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeFilter === '公倍數'
                    ? 'bg-[#92D7D0] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#92D7D0] hover:text-[#92D7D0]'
                }`}
              >
                {activeFilter === '公倍數' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                公倍數
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
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#92D7D0]/15 text-[#5fada6]">F02</span>
                  <div>
                    <h3 className="font-['Shippori_Mincho'] font-bold text-lg text-slate-800">公倍數</h3>
                    <p className="text-sm text-slate-500 mt-0.5">包含 1 份教材（詳解）與 4 份配套考卷</p>
                  </div>
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
                          <h4 className="font-bold text-slate-800">F02公倍數(詳解).pdf</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>單元: 公倍數</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>更新 2026/03/17</span>
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
                          <span className="font-medium text-sm">F02公倍數(詳解).pdf</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span>第 1 頁 / 共 7 頁</span>
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
                        <div className="bg-white w-full max-w-2xl min-h-[500px] shadow-sm rounded border border-slate-200 p-10">
                          <div className="text-center mb-2 text-xs text-slate-400 tracking-widest uppercase">數學大師 國小資優數學系列</div>
                          <h2 className="text-3xl font-['Shippori_Mincho'] font-bold text-center mb-8 text-slate-800">f 02 　公倍數</h2>
                          
                          <div className="space-y-7 text-sm text-slate-700 leading-relaxed">
                            <section>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-6 h-6 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center">焦</span>
                                <h3 className="font-bold text-slate-800">焦點 1　最小公倍數</h3>
                              </div>
                              <p className="mb-2"><span className="font-bold">公倍數：</span>2 個或 2 個以上的整數中，共同的倍數。</p>
                              <div className="bg-[#FAF9F6] p-4 rounded-lg border border-slate-200 space-y-1 text-xs">
                                <p>例：2 的倍數：2、4、<span className="font-bold text-[#92D7D0]">6</span>、8、10、<span className="font-bold text-[#92D7D0]">12</span>、14、16、<span className="font-bold text-[#92D7D0]">18</span>、20</p>
                                <p>　　3 的倍數：3、<span className="font-bold text-[#92D7D0]">6</span>、9、<span className="font-bold text-[#92D7D0]">12</span>、15、<span className="font-bold text-[#92D7D0]">18</span></p>
                                <p>　　2 和 3 的公倍數：<span className="font-bold text-[#92D7D0]">6、12、18</span></p>
                              </div>
                            </section>

                            <section>
                              <p className="mb-3"><span className="font-bold">最小公倍數：</span>一組數的公倍數中，最小的那個數。若要找最小公倍數，一般可用：</p>
                              <div className="flex gap-3 text-xs mb-4">
                                <span className="px-3 py-1 rounded-full bg-[#92D7D0]/10 text-[#5fada6] font-bold">① 列舉法</span>
                                <span className="px-3 py-1 rounded-full bg-[#92D7D0]/10 text-[#5fada6] font-bold">② 質因數分解法</span>
                                <span className="px-3 py-1 rounded-full bg-[#92D7D0]/10 text-[#5fada6] font-bold">③ 短除法</span>
                              </div>

                              <div className="bg-[#FAF9F6] p-4 rounded-lg border border-slate-200 text-xs space-y-3">
                                <div>
                                  <p className="font-bold mb-1">例 1（列舉法）：求 4 和 6 的最小公倍數</p>
                                  <p>4 的倍數：4、8、<span className="font-bold text-[#FFB7B2]">12</span>、16……</p>
                                  <p>6 的倍數：6、<span className="font-bold text-[#FFB7B2]">12</span>、18……</p>
                                  <p>∴ [4, 6] = <span className="font-bold text-[#FFB7B2]">12</span></p>
                                </div>
                                <div>
                                  <p className="font-bold mb-1">例 2（質因數分解法）：求 24 和 30 的最小公倍數</p>
                                  <p>30 = 2×3×5　　24 = 2×2×2×3</p>
                                  <p>∴ [24, 30] = 2×2×2×3×5 = <span className="font-bold text-[#FFB7B2]">120</span></p>
                                </div>
                                <div>
                                  <p className="font-bold mb-1">例 3（短除法）：求 108 和 72 的最小公倍數</p>
                                  <div className="font-mono text-xs bg-white rounded border border-slate-100 p-3 inline-block">
                                    <p>2 | 108　72</p>
                                    <p>2 |　54　36</p>
                                    <p>3 |　27　18</p>
                                    <p>3 |　　9　　6</p>
                                    <p>　 |　　3　　2　← 互質即停</p>
                                  </div>
                                  <p className="mt-2">∴ [108, 72] = 2×2×3×3×3×2 = <span className="font-bold text-[#FFB7B2]">216</span></p>
                                </div>
                              </div>
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
                      {[
                        { num: 1, label: '第1張', title: 'F02公倍數A.pdf', date: '2026/03/17' },
                        { num: 2, label: '第2張', title: 'F02公倍數B.pdf', date: '2026/03/17' },
                        { num: 3, label: '第3張', title: 'F02公倍數C.pdf', date: '2026/03/17' },
                        { num: 4, label: '第4張', title: 'F02公倍數D.pdf', date: '2026/03/17' },
                      ].map((quiz) => (
                        <div key={quiz.num} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group relative z-10 bg-white">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2]">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#FFB7B2]/20 text-[#E08A84]">{quiz.label}</span>
                                <h4 className="font-medium text-slate-700 group-hover:text-[#FFB7B2] transition-colors">考卷：{quiz.title}</h4>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span>更新 {quiz.date}</span>
                              </div>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-[#FFB7B2] hover:text-[#FFB7B2] hover:bg-[#FFB7B2]/5 transition-colors">
                            開啟閱讀
                          </button>
                        </div>
                      ))}
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
