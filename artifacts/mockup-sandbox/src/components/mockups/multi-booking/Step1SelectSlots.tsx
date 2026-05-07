import { useState } from "react";

const DAYS = ["一", "二", "三", "四", "五", "六"];
const DATES = ["5/12", "5/13", "5/14", "5/15", "5/16", "5/17"];

const SLOTS = [
  { id: 1, day: 0, time: "15:00", teacher: "林佳慧", seats: 3 },
  { id: 2, day: 0, time: "16:00", teacher: "林佳慧", seats: 2 },
  { id: 3, day: 1, time: "14:00", teacher: "陳志明", seats: 4 },
  { id: 4, day: 1, time: "16:00", teacher: "陳志明", seats: 1 },
  { id: 5, day: 2, time: "15:00", teacher: "林佳慧", seats: 3 },
  { id: 6, day: 3, time: "14:00", teacher: "陳志明", seats: 2 },
  { id: 7, day: 3, time: "16:00", teacher: "林佳慧", seats: 4 },
  { id: 8, day: 4, time: "15:00", teacher: "陳志明", seats: 2 },
  { id: 9, day: 5, time: "10:00", teacher: "林佳慧", seats: 5 },
  { id: 10, day: 5, time: "11:00", teacher: "陳志明", seats: 3 },
];

export default function Step1SelectSlots() {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const slotsByDay = DAYS.map((_, d) => SLOTS.filter(s => s.day === d));

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <button className="text-gray-400 text-lg">‹</button>
          <h1 className="text-base font-semibold text-gray-800">預約課程</h1>
        </div>
        <p className="text-xs text-gray-400 ml-6">可選擇多個時段一次預約</p>
      </div>

      {/* Child + week selector */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#81D8D0]/20 flex items-center justify-center text-xs text-[#81D8D0] font-bold">仁</div>
          <span className="text-sm font-medium text-gray-700">黃仁人</span>
          <span className="text-xs text-gray-400">二年級</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>本週</span>
          <span className="text-[#81D8D0]">▾</span>
        </div>
      </div>

      {/* Day tabs */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex gap-1 overflow-x-auto">
        {DAYS.map((day, i) => {
          const count = selected.filter(id => SLOTS.find(s => s.id === id && s.day === i)).length;
          return (
            <div key={i} className="flex flex-col items-center min-w-[48px] py-1 rounded-lg">
              <span className="text-[10px] text-gray-400">週{day}</span>
              <span className="text-xs font-medium text-gray-600">{DATES[i]}</span>
              {count > 0 && (
                <span className="mt-0.5 w-4 h-4 rounded-full bg-[#81D8D0] text-white text-[9px] flex items-center justify-center font-bold">{count}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Slot list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {DAYS.map((day, di) => (
          <div key={di}>
            <p className="text-xs font-semibold text-gray-400 mb-2">週{day} · {DATES[di]}</p>
            <div className="space-y-2">
              {slotsByDay[di].length === 0 && (
                <p className="text-xs text-gray-300 pl-1">無可預約時段</p>
              )}
              {slotsByDay[di].map(slot => {
                const isSelected = selected.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() => toggle(slot.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
                      isSelected
                        ? "bg-[#81D8D0]/10 border-[#81D8D0] shadow-sm"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#81D8D0] border-[#81D8D0]" : "border-gray-300"
                      }`}>
                        {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800">{slot.time}</p>
                        <p className="text-xs text-gray-400">{slot.teacher} 老師</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        slot.seats === 1 ? "bg-[#FFB7B2]/20 text-[#e87c76]" : "bg-gray-50 text-gray-400"
                      }`}>
                        剩 {slot.seats} 位
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 safe-area-bottom">
        {selected.length > 0 ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">已選 {selected.length} 堂</p>
              <p className="text-sm font-semibold text-gray-700">消耗 <span className="text-[#81D8D0]">{selected.length}</span> 堂數</p>
            </div>
            <button className="bg-[#81D8D0] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm active:scale-95 transition-transform">
              確認預約 →
            </button>
          </div>
        ) : (
          <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium">
            請選擇時段
          </button>
        )}
      </div>
    </div>
  );
}
