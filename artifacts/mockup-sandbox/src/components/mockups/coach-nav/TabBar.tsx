import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  User, 
  BookOpen, 
  Bell, 
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function TabBar() {
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', label: '行事曆', icon: Calendar },
    { id: 'students', label: '我的學生', icon: Users },
    { id: 'income', label: '收入總覽', icon: DollarSign },
    { id: 'profile', label: '個人資料', icon: User },
    { id: 'manual', label: '使用手冊', icon: BookOpen },
  ];

  // Generate a simple calendar for mockup purposes
  const generateDays = () => {
    const days = [];
    const today = new Date();
    const startOffset = 3; // Mock starting day of week
    
    // Empty slots for start of month
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, events: [] });
    }
    
    // Days in month
    for (let i = 1; i <= 31; i++) {
      // Add mock events to some days
      const events = [];
      if ([2, 5, 12, 19, 26].includes(i)) events.push('class'); // Tiffany
      if ([8, 15, 22].includes(i)) events.push('class', 'class'); 
      if ([10, 24].includes(i)) events.push('no-class'); // Coral
      if ([14, 28].includes(i)) events.push('class', 'no-class');
      
      days.push({ day: i, events, isToday: i === 15 });
    }
    return days;
  };

  const calendarDays = generateDays();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1a1a1a] font-['Noto_Sans_TC'] flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#92D7D0]/20 flex items-center justify-center text-[#92D7D0]">
            <GraduationCap size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-['Shippori_Mincho'] text-xl font-bold tracking-wider text-[#1a1a1a]">
              紀硯文 老師
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">質數教室 老師系統</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FFB7B2] rounded-full"></span>
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors hover:text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Tab Bar (Enhanced) */}
      <div className="bg-white border-b border-gray-200 px-6 sticky top-0 z-10 shadow-sm">
        <nav className="flex space-x-8 max-w-5xl mx-auto h-[52px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-1 relative transition-colors duration-200 h-full
                  ${isActive 
                    ? 'text-[#92D7D0] font-medium' 
                    : 'text-gray-500 hover:text-gray-900'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-[#92D7D0]' : 'text-gray-400'} />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#92D7D0] rounded-t-full shadow-[0_-1px_4px_rgba(146,215,208,0.4)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        {activeTab === 'calendar' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-['Shippori_Mincho'] text-2xl font-bold">2026年 3月</h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
                  今天
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {weekDays.map(day => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
                {calendarDays.map((item, i) => (
                  <div 
                    key={i} 
                    className={`
                      min-h-[100px] border-b border-r border-gray-100 p-2
                      ${i % 7 === 6 ? 'border-r-0' : ''}
                      ${!item.day ? 'bg-gray-50/30' : 'hover:bg-gray-50/50 cursor-pointer transition-colors'}
                    `}
                  >
                    {item.day && (
                      <div className="flex flex-col h-full">
                        <div className={`
                          w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1
                          ${item.isToday ? 'bg-[#92D7D0] text-white font-bold shadow-md' : 'text-gray-700'}
                        `}>
                          {item.day}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {item.events.map((event, eventIdx) => (
                            <div 
                              key={eventIdx}
                              className={`w-2 h-2 rounded-full ${event === 'class' ? 'bg-[#92D7D0]' : 'bg-[#FFB7B2]'}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-gray-500 text-sm mb-1">本月課堂數</p>
                  <p className="font-['Shippori_Mincho'] text-3xl font-bold text-[#1a1a1a]">12 <span className="text-base font-normal text-gray-400 font-['Noto_Sans_TC']">堂</span></p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#92D7D0]/10 flex items-center justify-center text-[#92D7D0] group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-gray-500 text-sm mb-1">本月收入</p>
                  <p className="font-['Shippori_Mincho'] text-3xl font-bold text-[#1a1a1a]">NT$4,800</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FFB7B2]/10 flex items-center justify-center text-[#FFB7B2] group-hover:scale-110 transition-transform">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Calendar, { size: 32, className: "text-gray-300" })}
            </div>
            <p>內容建置中</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default TabBar;
