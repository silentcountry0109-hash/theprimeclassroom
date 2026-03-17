import React from "react";
import {
  Calendar,
  Users,
  DollarSign,
  User,
  BookOpen,
  Bell,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const navItems = [
    { icon: Calendar, label: "行事曆", active: true },
    { icon: Users, label: "我的學生", active: false },
    { icon: DollarSign, label: "收入總覽", active: false },
    { icon: User, label: "個人資料", active: false },
    { icon: BookOpen, label: "使用手冊", active: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] font-['Noto_Sans_TC'] text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-10 shadow-sm">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#92D7D0] flex items-center justify-center text-white font-['Shippori_Mincho'] font-bold text-lg mr-3 shadow-sm">
            P
          </div>
          <span className="font-['Shippori_Mincho'] font-bold text-lg tracking-wide text-gray-800">
            The Prime
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                item.active
                  ? "bg-[#92D7D0]/10 text-[#92D7D0]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`absolute left-0 w-1 h-8 rounded-r-md transition-all duration-200 ${
                  item.active ? "bg-[#92D7D0]" : "bg-transparent scale-y-0 group-hover:scale-y-100 group-hover:bg-gray-200"
                }`}
              />
              <item.icon
                className={`w-5 h-5 mr-3 transition-colors ${
                  item.active ? "text-[#92D7D0]" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center hover:bg-gray-50 p-2 rounded-xl transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB7B2] to-[#ff9e99] flex items-center justify-center text-white font-bold shadow-sm">
              紀
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-gray-900">紀硯文</p>
              <p className="text-xs text-gray-500">老師</p>
            </div>
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] flex flex-col h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-0">
          <h1 className="font-['Shippori_Mincho'] text-2xl font-bold text-gray-800">
            行事曆
          </h1>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFB7B2] rounded-full border border-white"></span>
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#92D7D0]/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#92D7D0]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">本月課堂數</p>
                  <p className="text-2xl font-bold font-['Shippori_Mincho']">12 <span className="text-sm text-gray-400 font-normal">堂</span></p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#FFB7B2]/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#FFB7B2]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">本月收入</p>
                  <p className="text-2xl font-bold font-['Shippori_Mincho']">NT$4,800</p>
                </div>
              </div>
            </div>

            {/* Calendar Mockup */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-['Shippori_Mincho'] text-lg font-bold">2023年 10月</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-md border border-gray-200 text-sm hover:bg-gray-50">上個月</button>
                  <button className="px-3 py-1 rounded-md bg-[#92D7D0] text-white text-sm hover:bg-[#82c7c0] shadow-sm">今天</button>
                  <button className="px-3 py-1 rounded-md border border-gray-200 text-sm hover:bg-gray-50">下個月</button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                  {/* Days */}
                  {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                    <div key={day} className="bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Grid */}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = i - 2; // offset for mockup
                    const isCurrentMonth = date > 0 && date <= 31;
                    const hasEvent = [4, 12, 15, 18, 25].includes(date);
                    const isToday = date === 15;

                    return (
                      <div key={i} className={`bg-white min-h-[100px] p-2 ${!isCurrentMonth ? 'bg-gray-50/50' : ''}`}>
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm mb-2 ${
                          isToday 
                            ? 'bg-[#92D7D0] text-white font-bold shadow-sm' 
                            : isCurrentMonth 
                              ? 'text-gray-700 font-medium' 
                              : 'text-gray-300'
                        }`}>
                          {isCurrentMonth ? date : (date <= 0 ? 30 + date : date - 31)}
                        </div>
                        
                        {hasEvent && isCurrentMonth && (
                          <div className="space-y-1">
                            <div className="text-xs px-2 py-1 rounded bg-[#92D7D0]/20 text-[#2a877d] truncate font-medium border border-[#92D7D0]/30">
                              14:00 數學家教
                            </div>
                            {date === 15 && (
                              <div className="text-xs px-2 py-1 rounded bg-[#FFB7B2]/20 text-[#d95b54] truncate font-medium border border-[#FFB7B2]/30">
                                16:30 英文輔導
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Sidebar;
