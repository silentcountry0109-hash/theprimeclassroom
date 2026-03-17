import React from 'react';
import { Upload, Trash2, FileText, Plus, ChevronDown, LogOut, BookOpen, Settings, Users, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function HQUpload() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC'] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#92D7D0] flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-semibold text-lg text-gray-800">The Prime 質數教室 — 總部管理系統</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <span>HQ Admin</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <Separator orientation="vertical" className="h-6" />
          <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4" />
            <span>登出</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:block py-6">
          <nav className="flex flex-col gap-1 px-4">
            <NavItem icon={<LayoutDashboard size={20} />} label="總部儀表板" />
            <NavItem icon={<Users size={20} />} label="分校與帳號管理" />
            <NavItem icon={<BookOpen size={20} />} label="教材管理" active />
            <NavItem icon={<Settings size={20} />} label="系統設定" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Heading Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">教材庫管理</h1>
                <p className="text-gray-500 mt-2">上傳與管理提供給各分校的教學 PDF 檔案</p>
              </div>
              <Button className="bg-[#92D7D0] hover:bg-[#7bc0b9] text-white">
                <Plus className="w-4 h-4 mr-2" />
                新增單元主題
              </Button>
            </div>

            {/* Topic Sections */}
            <div className="space-y-6">
              {/* Topic 1 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                      單元 1：分數與小數
                    </CardTitle>
                    <div className="text-sm text-gray-500">2 份檔案</div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <FileRow name="分數基礎概念.pdf" date="2026/03/15" />
                    <Separator />
                    <FileRow name="帶分數練習題.pdf" date="2026/03/10" />
                    
                    {/* Drop Zone */}
                    <div className="p-4 bg-gray-50/30">
                      <div className="border-2 border-dashed border-[#92D7D0] bg-[#92D7D0]/5 rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#92D7D0]/10 cursor-pointer">
                        <Upload className="w-8 h-8 text-[#92D7D0] mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">拖曳 PDF 至此</h3>
                        <p className="text-sm text-gray-500 mb-4">或點擊選擇檔案上傳</p>
                        <Button variant="outline" className="border-[#92D7D0] text-[#92D7D0] hover:bg-[#92D7D0] hover:text-white">
                          選擇檔案
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 2 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                      單元 2：幾何圖形
                    </CardTitle>
                    <div className="text-sm text-gray-500">1 份檔案</div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <FileRow name="平面圖形總複習.pdf" date="2026/03/01" />
                    <div className="p-4">
                      <Button variant="ghost" className="text-[#92D7D0] hover:text-[#7bc0b9] hover:bg-[#92D7D0]/10 w-full justify-start border border-dashed border-gray-200">
                        <Plus className="w-4 h-4 mr-2" />
                        上傳教材
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Topic 3 */}
              <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                      單元 3：應用題
                    </CardTitle>
                    <div className="text-sm text-gray-500">1 份檔案</div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <FileRow name="速率問題解題技巧.pdf" date="2026/02/20" />
                    <div className="p-4">
                      <Button variant="ghost" className="text-[#92D7D0] hover:text-[#7bc0b9] hover:bg-[#92D7D0]/10 w-full justify-start border border-dashed border-gray-200">
                        <Plus className="w-4 h-4 mr-2" />
                        上傳教材
                      </Button>
                    </div>
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

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-[#92D7D0]/15 text-[#6eb8b1]' 
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
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 group transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#FFB7B2]/20 rounded text-[#FFB7B2]">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500 mt-1">更新：{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" className="h-8 text-xs bg-white">
          <Upload className="w-3 h-3 mr-1" />
          取代上傳
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 bg-white">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default HQUpload;
