import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  User, 
  BookOpen, 
  Bell, 
  LogOut, 
  FolderOpen, 
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Brand colors
const colors = {
  tiffany: '#92D7D0',
  coral: '#FFB7B2',
  amber: '#FFF9E5',
  washi: '#FAF9F6',
  text: '#1a1a1a'
};

export default function CardHome() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const today = new Date();
  const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][today.getDay()]}`;

  const features = [
    {
      id: 'calendar',
      title: '行事曆',
      subtitle: '今日 3 堂課',
      icon: Calendar,
      color: colors.tiffany,
      borderClass: 'border-l-4 border-l-[#92D7D0]',
      bgClass: 'group-hover:bg-[#92D7D0]/10',
      iconBg: 'bg-[#92D7D0]/20 text-[#2C8077]'
    },
    {
      id: 'students',
      title: '我的學生',
      subtitle: '共 8 位學生',
      icon: Users,
      color: colors.coral,
      borderClass: 'border-l-4 border-l-[#FFB7B2]',
      bgClass: 'group-hover:bg-[#FFB7B2]/10',
      iconBg: 'bg-[#FFB7B2]/20 text-[#A64A43]'
    },
    {
      id: 'revenue',
      title: '收入總覽',
      subtitle: '本月 NT$4,800',
      icon: DollarSign,
      color: colors.amber,
      borderClass: 'border-l-4 border-l-[#F2D06B]', // slightly darker amber for border
      bgClass: 'bg-[#FFF9E5] group-hover:bg-[#FFF2CC]',
      iconBg: 'bg-[#FDE293] text-[#A67C00]'
    },
    {
      id: 'profile',
      title: '個人資料',
      subtitle: '查看認證資訊',
      icon: User,
      borderClass: 'border-l-4 border-l-slate-200',
      bgClass: 'group-hover:bg-slate-50',
      iconBg: 'bg-slate-100 text-slate-600'
    },
    {
      id: 'manual',
      title: '使用手冊',
      subtitle: '操作說明',
      icon: BookOpen,
      borderClass: 'border-l-4 border-l-slate-200',
      bgClass: 'group-hover:bg-slate-50',
      iconBg: 'bg-slate-100 text-slate-600'
    },
    {
      id: 'resources',
      title: '教材庫',
      subtitle: '總部提供教材',
      icon: FolderOpen,
      muted: true,
      borderClass: 'border-l-4 border-l-slate-100',
      bgClass: 'group-hover:bg-slate-50',
      iconBg: 'bg-slate-50 text-slate-400'
    }
  ];

  return (
    <div className="min-h-screen font-['Noto_Sans_TC'] text-[#1a1a1a]" style={{ backgroundColor: colors.washi }}>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: colors.tiffany }}>
              P
            </div>
            <span className="font-['Shippori_Mincho'] text-lg font-bold tracking-wide">The Prime 質數教室</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: colors.coral }}></span>
            </Button>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 hover:bg-slate-100 p-1.5 pr-2 rounded-full transition-colors">
              <Avatar className="w-8 h-8 border border-slate-200">
                <AvatarImage src="/assets/avatar-boy.png" />
                <AvatarFallback className="bg-slate-100 text-sm">紀</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm font-medium">紀硯文 老師</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </button>
            
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24">
        
        {/* Hero Greeting */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <p className="text-sm font-medium text-slate-500 mb-2">{dateString}</p>
          <h1 className="text-3xl md:text-4xl font-['Shippori_Mincho'] font-bold text-[#1a1a1a] mb-3 flex items-center gap-3">
            早安，紀老師 <span className="text-4xl origin-bottom-right hover:animate-bounce">👋</span>
          </h1>
          <p className="text-lg text-slate-600">
            今天有 <span className="font-bold text-[#2C8077]" style={{ color: '#2C8077' }}>3 堂課</span>，祝您教學順利！
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300 border border-black/5 cursor-pointer rounded-2xl hover:shadow-lg hover:-translate-y-1 bg-white",
                  feature.borderClass,
                  feature.muted && "opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100",
                  activeFeature === feature.id && "ring-2 ring-offset-2 ring-[#92D7D0] shadow-md"
                )}
                style={{
                  animationDelay: `${idx * 100}ms`
                }}
              >
                <CardContent className={cn("p-6 flex flex-col h-full", feature.bgClass, "transition-colors duration-300")}>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", feature.iconBg)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {feature.id === 'calendar' && (
                      <span className="bg-[#92D7D0]/20 text-[#2C8077] text-xs font-bold px-2.5 py-1 rounded-full">
                        Next: 14:00
                      </span>
                    )}
                    {feature.id === 'resources' && (
                      <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">
                        即將推出
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <h3 className="font-['Shippori_Mincho'] text-xl font-bold mb-1 group-hover:text-[#2C8077] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className={cn(
                      "text-sm font-medium",
                      feature.id === 'revenue' ? "text-[#A67C00]" : "text-slate-500"
                    )}>
                      {feature.subtitle}
                    </p>
                  </div>
                  
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Mockup Active State Alert */}
        {activeFeature && (
          <div className="mt-8 p-4 bg-slate-800 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 text-center max-w-sm mx-auto flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>已點擊：{features.find(f => f.id === activeFeature)?.title} (模擬跳轉)</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-white hover:bg-slate-700 h-8 px-2"
              onClick={() => setActiveFeature(null)}
            >
              關閉
            </Button>
          </div>
        )}
      </main>

    </div>
  );
}
