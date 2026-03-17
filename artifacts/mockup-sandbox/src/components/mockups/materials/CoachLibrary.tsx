import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  Bell, 
  LogOut, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const materials = [
  { id: 1, title: '分數基礎概念', topic: '分數與小數', date: '2026/03/15' },
  { id: 2, title: '小數的加減法', topic: '分數與小數', date: '2026/03/12' },
  { id: 3, title: '三角形與四邊形面積', topic: '幾何圖形', date: '2026/03/10' },
  { id: 4, title: '時間與距離應用題', topic: '應用題', date: '2026/03/05' },
];

const topics = ['全部', '分數與小數', '幾何圖形', '應用題'];

export function CoachLibrary() {
  const [activeTopic, setActiveTopic] = useState('全部');
  const [readingId, setReadingId] = useState<number | null>(1);
  const [page, setPage] = useState(1);
  const totalPages = 8;

  const filteredMaterials = activeTopic === '全部' 
    ? materials 
    : materials.filter(m => m.topic === activeTopic);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC'] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#92D7D0]/20 flex items-center justify-center text-[#92D7D0]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-['Shippori_Mincho'] font-bold text-gray-900">紀硯文 老師</h1>
                <p className="text-sm text-gray-500">質數教室 老師系統</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-8 overflow-x-auto">
            {['行事曆', '我的學生', '收入總覽', '個人資料', '使用手冊', '教材庫'].map((tab) => (
              <button
                key={tab}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                  tab === '教材庫'
                    ? "border-[#92D7D0] text-[#92D7D0]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-['Shippori_Mincho'] font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#92D7D0]" />
            教材庫
          </h2>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeTopic === topic
                  ? "bg-[#92D7D0] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Materials List */}
        <div className="space-y-4">
          {filteredMaterials.map(material => (
            <div key={material.id} className="space-y-4">
              <Card 
                className={cn(
                  "transition-all duration-200 hover:shadow-md border-transparent hover:border-[#92D7D0]/30",
                  readingId === material.id ? "border-[#92D7D0] shadow-md ring-1 ring-[#92D7D0]" : "border-gray-200"
                )}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-lg flex-shrink-0 transition-colors",
                      readingId === material.id ? "bg-[#92D7D0]/20 text-[#92D7D0]" : "bg-gray-100 text-gray-500"
                    )}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{material.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 font-normal">
                          {material.topic}
                        </Badge>
                        <span className="text-sm text-gray-400">更新：{material.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {readingId !== material.id ? (
                    <Button 
                      onClick={() => setReadingId(material.id)}
                      className="bg-[#92D7D0] hover:bg-[#7bc4bd] text-white w-full sm:w-auto transition-transform active:scale-95"
                    >
                      開啟閱讀
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => setReadingId(null)}
                      className="text-gray-500 w-full sm:w-auto"
                    >
                      收起
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Expanded PDF Viewer */}
              {readingId === material.id && (
                <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="bg-gray-800 text-gray-200 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium">PDF 閱讀區 - {material.title}</span>
                    <button 
                      onClick={() => setReadingId(null)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm bg-gray-700/50 px-2 py-1 rounded-md"
                    >
                      <X className="w-4 h-4" /> 關閉
                    </button>
                  </div>
                  
                  <div className="p-4 sm:p-8 bg-gray-200/50 flex flex-col items-center min-h-[500px]">
                    {/* Simulated PDF Page */}
                    <div className="bg-white w-full max-w-3xl aspect-[1/1.414] shadow-lg rounded-sm p-8 sm:p-12 flex flex-col">
                      <div className="border-b-2 border-gray-800 pb-4 mb-8">
                        <h1 className="text-3xl font-['Shippori_Mincho'] font-bold text-center">{material.title}</h1>
                      </div>
                      
                      <div className="flex-1 space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg font-bold">1. 認識分數</p>
                        <p>分數是用來表示整體中一部分的一種數的表達方式。我們可以用圓形披薩來想像，當一個披薩被平分成 4 塊，你拿了其中的 1 塊，這 1 塊就是整個披薩的 1/4。</p>
                        
                        <div className="bg-[#FAF9F6] p-6 rounded-lg border border-[#92D7D0]/30 my-6 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full border-4 border-[#92D7D0] flex items-center justify-center relative overflow-hidden">
                            {/* Simple simulated pie chart */}
                            <div className="absolute inset-0 bg-[#FFB7B2]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}></div>
                            <div className="absolute inset-0 border-t-4 border-r-4 border-l-4 border-[#92D7D0]"></div>
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl z-10 text-gray-800 mix-blend-overlay">1/4</div>
                          </div>
                        </div>

                        <p className="text-lg font-bold">2. 分數的組成</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><span className="font-bold text-[#92D7D0]">分子：</span>在分數線上面的數字，表示我們有幾份。</li>
                          <li><span className="font-bold text-[#FFB7B2]">分母：</span>在分數線下面的數字，表示整體被平分成了幾份。</li>
                        </ul>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-400">
                        {material.title} - 質數教室教材
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="mt-6 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-sm border border-gray-200">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-medium min-w-[100px] text-center">
                        第 {page} 頁 / 共 {totalPages} 頁
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredMaterials.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">此分類目前沒有教材</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
