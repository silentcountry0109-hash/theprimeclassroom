import type { ReactNode } from 'react';
import { Upload, Trash2, FileText, Plus, ChevronDown, LogOut, BookOpen, Settings, Users, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HQUpload() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC'] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#92D7D0] flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-base text-gray-800">The Prime 質數教室 — 總部管理系統</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <span>HQ Admin</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-r py-4 shrink-0">
          <nav className="flex flex-col gap-0.5 px-3">
            <NavItem icon={<LayoutDashboard size={18} />} label="總部儀表板" />
            <NavItem icon={<Users size={18} />} label="分校帳號管理" />
            <NavItem icon={<BookOpen size={18} />} label="教材管理" active />
            <NavItem icon={<Settings size={18} />} label="系統設定" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Heading Row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">教材庫管理</h1>
                <p className="text-sm text-gray-500 mt-1">上傳與管理提供給各分校的教學 PDF 檔案</p>
              </div>
              <Button className="bg-[#92D7D0] hover:bg-[#7bc0b9] text-white text-sm h-9">
                <Plus className="w-4 h-4 mr-1.5" />
                新增單元主題
              </Button>
            </div>

            {/* Topic Sections */}
            <div className="space-y-4">
              {/* Topic 1 - with drop zone */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      分數與小數
                    </CardTitle>
                    <span className="text-xs text-gray-400">2 份檔案</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FileRow name="分數基礎概念.pdf" date="2026/03/15" />
                  <div className="h-px bg-gray-100 mx-4" />
                  <FileRow name="帶分數練習題.pdf" date="2026/03/10" />
                  {/* Drop Zone */}
                  <div className="p-4 bg-gray-50/50">
                    <div className="border-2 border-dashed border-[#92D7D0] bg-[#92D7D0]/5 rounded-lg py-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#92D7D0]/10 transition-colors">
                      <Upload className="w-6 h-6 text-[#92D7D0] mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">拖曳 PDF 至此</p>
                      <p className="text-xs text-gray-400 mb-3">或點擊選擇檔案上傳</p>
                      <Button variant="outline" size="sm" className="border-[#92D7D0] text-[#92D7D0] hover:bg-[#92D7D0] hover:text-white h-8 text-xs">
                        選擇檔案
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 2 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      幾何圖形
                    </CardTitle>
                    <span className="text-xs text-gray-400">1 份檔案</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FileRow name="平面圖形總複習.pdf" date="2026/03/01" />
                  <div className="p-3">
                    <button className="w-full flex items-center justify-center gap-1.5 text-sm text-[#92D7D0] border border-dashed border-gray-200 rounded-md py-2 hover:bg-[#92D7D0]/5 transition-colors">
                      <Plus className="w-4 h-4" />
                      上傳教材
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 3 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      應用題
                    </CardTitle>
                    <span className="text-xs text-gray-400">1 份檔案</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <FileRow name="速率問題解題技巧.pdf" date="2026/02/20" />
                  <div className="p-3">
                    <button className="w-full flex items-center justify-center gap-1.5 text-sm text-[#92D7D0] border border-dashed border-gray-200 rounded-md py-2 hover:bg-[#92D7D0]/5 transition-colors">
                      <Plus className="w-4 h-4" />
                      上傳教材
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
        active
          ? 'bg-[#92D7D0]/15 text-[#5eaaa4] border-l-2 border-[#92D7D0]'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function FileRow({ name, date }: { name: string; date: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#FFB7B2]/20 flex items-center justify-center text-[#e8938e] shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-xs text-gray-400 mt-0.5">更新：{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" className="h-7 text-xs px-2 bg-white">
          <Upload className="w-3 h-3 mr-1" />
          取代上傳
        </Button>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 bg-white">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default HQUpload;
