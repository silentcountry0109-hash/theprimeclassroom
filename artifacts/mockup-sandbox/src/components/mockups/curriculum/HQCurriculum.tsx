import {
  Upload,
  Trash2,
  FileText,
  Plus,
  ChevronDown,
  LogOut,
  BookOpen,
  Settings,
  Users,
  LayoutDashboard,
  ClipboardList,
  Archive,
} from "lucide-react";

export function HQCurriculum() {
  return (
    <div className="min-h-screen flex flex-col font-['Noto_Sans_TC'] bg-[#FAF9F6] text-slate-800">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#92D7D0] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            P
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            The Prime 質數教室 — 總部管理系統
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="w-8 h-8 rounded-full bg-[#FFF9E5] border border-amber-200 flex items-center justify-center text-amber-700 font-semibold">
              HQ
            </div>
            <span className="font-medium">HQ Admin</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col py-6 shadow-sm z-0">
          <nav className="flex-1 px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
              <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-[#92D7D0]" />
              <span className="font-medium">總部儀表板</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
              <Users className="w-5 h-5 text-slate-400 group-hover:text-[#92D7D0]" />
              <span className="font-medium">分校帳號管理</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#92D7D0]/10 text-[#92D7D0] font-medium transition-colors group">
              <BookOpen className="w-5 h-5 text-[#92D7D0]" />
              <span>課程教材管理</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
              <Settings className="w-5 h-5 text-slate-400 group-hover:text-[#92D7D0]" />
              <span className="font-medium">系統設定</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Section Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">課程教材管理</h2>
                <p className="mt-2 text-slate-500 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  單元主題與聯絡簿同步，每個單元含 4 張配套考卷
                </p>
              </div>
              <button className="flex items-center gap-2 bg-[#92D7D0] hover:bg-[#7bc4bd] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                <Plus className="w-5 h-5" />
                新增單元主題
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-slate-200">
              <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-[#92D7D0] text-[#92D7D0] font-bold bg-white/50 rounded-t-lg">
                <BookOpen className="w-4 h-4" />
                教材與考卷
              </button>
              <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-medium rounded-t-lg transition-colors">
                <Archive className="w-4 h-4" />
                期中考歸檔
              </button>
            </div>

            {/* Units List */}
            <div className="space-y-6">
              
              {/* Unit Card: 分數與小數 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">單元一：分數與小數</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-slate-400"/> 教材: 1</span>
                    <span className="flex items-center gap-1"><ClipboardList className="w-4 h-4 text-slate-400"/> 考卷: 4/4</span>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: 教材 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <FileText className="w-5 h-5 text-[#92D7D0]" />
                      <h4 className="font-bold text-slate-700">📄 教材</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#92D7D0] hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">分數基礎概念.pdf</p>
                            <p className="text-xs text-slate-400">更新 2026/03/15</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-[#92D7D0] hover:bg-[#92D7D0]/10 rounded" title="取代上傳">
                            <Upload className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="刪除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#92D7D0] hover:text-[#92D7D0] hover:bg-[#92D7D0]/5 transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        上傳教材
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 考卷 */}
                  <div className="space-y-4 pl-0 lg:pl-8 lg:border-l border-slate-100">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#FFB7B2]" />
                        <h4 className="font-bold text-slate-700">📝 配套考卷</h4>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-[#FFB7B2]/20 text-red-600 rounded-full">4張考卷</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { num: 1, name: "分數概念測驗A.pdf" },
                        { num: 2, name: "分數概念測驗B.pdf" },
                        { num: 3, name: "帶分數練習卷.pdf" },
                        { num: 4, name: "綜合練習卷.pdf" },
                      ].map((quiz) => (
                        <div key={quiz.num} className="group flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-[#FFB7B2] hover:shadow-sm bg-white transition-all">
                          <div className="w-12 text-center text-xs font-bold text-slate-400">
                            第{quiz.num}張
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-400" />
                            <span className="font-medium text-sm text-slate-700">{quiz.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                            <button className="p-1.5 text-slate-400 hover:text-[#92D7D0] hover:bg-[#92D7D0]/10 rounded" title="取代">
                              <Upload className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="刪除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Card: 幾何圖形 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">單元二：幾何圖形</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-slate-400"/> 教材: 1</span>
                    <span className="flex items-center gap-1 text-amber-500"><ClipboardList className="w-4 h-4 text-amber-500"/> 考卷: 2/4</span>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: 教材 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <FileText className="w-5 h-5 text-[#92D7D0]" />
                      <h4 className="font-bold text-slate-700">📄 教材</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#92D7D0] hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">平面圖形總複習.pdf</p>
                            <p className="text-xs text-slate-400">更新 2026/03/12</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-[#92D7D0] hover:bg-[#92D7D0]/10 rounded" title="取代上傳">
                            <Upload className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="刪除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#92D7D0] hover:text-[#92D7D0] hover:bg-[#92D7D0]/5 transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        上傳教材
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 考卷 */}
                  <div className="space-y-4 pl-0 lg:pl-8 lg:border-l border-slate-100">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#FFB7B2]" />
                        <h4 className="font-bold text-slate-700">📝 配套考卷</h4>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-[#FFB7B2]/20 text-red-600 rounded-full">4張考卷</span>
                    </div>

                    <div className="space-y-3">
                      <div className="group flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-[#FFB7B2] hover:shadow-sm bg-white transition-all">
                        <div className="w-12 text-center text-xs font-bold text-slate-400">第1張</div>
                        <div className="flex-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-sm text-slate-700">幾何概念測驗A.pdf</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button className="p-1.5 text-slate-400 hover:text-[#92D7D0] hover:bg-[#92D7D0]/10 rounded" title="取代"><Upload className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="刪除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      <div className="group flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-[#FFB7B2] hover:shadow-sm bg-white transition-all">
                        <div className="w-12 text-center text-xs font-bold text-slate-400">第2張</div>
                        <div className="flex-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-sm text-slate-700">幾何概念測驗B.pdf</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button className="p-1.5 text-slate-400 hover:text-[#92D7D0] hover:bg-[#92D7D0]/10 rounded" title="取代"><Upload className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="刪除"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Missing quizzes */}
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <div className="w-12 text-center text-xs font-bold text-slate-400">第3張</div>
                        <div className="flex-1 flex items-center gap-2 text-slate-400 italic text-sm">
                          (尚未上傳)
                        </div>
                        <div className="pr-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#92D7D0] bg-[#92D7D0]/10 hover:bg-[#92D7D0]/20 rounded transition-colors">
                            <Upload className="w-3 h-3" />
                            上傳
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50">
                        <div className="w-12 text-center text-xs font-bold text-slate-400">第4張</div>
                        <div className="flex-1 flex items-center gap-2 text-slate-400 italic text-sm">
                          (尚未上傳)
                        </div>
                        <div className="pr-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#92D7D0] bg-[#92D7D0]/10 hover:bg-[#92D7D0]/20 rounded transition-colors">
                            <Upload className="w-3 h-3" />
                            上傳
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
