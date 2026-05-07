import { useState } from "react";

const SELECTED_SLOTS = [
  { id: 1, date: "5/12（一）", time: "15:00–16:00", teacher: "林佳慧", franchise: "質數教室 南投信義" },
  { id: 2, date: "5/12（一）", time: "16:00–17:00", teacher: "林佳慧", franchise: "質數教室 南投信義" },
  { id: 3, date: "5/14（三）", time: "15:00–16:00", teacher: "林佳慧", franchise: "質數教室 南投信義" },
  { id: 4, date: "5/15（四）", time: "16:00–17:00", teacher: "林佳慧", franchise: "質數教室 南投信義" },
];

export default function Step2ConfirmList() {
  const [confirmed, setConfirmed] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [slots, setSlots] = useState(SELECTED_SLOTS);
  const credits = slots.length;

  const remove = (id: number) => {
    setRemoving(id);
    setTimeout(() => {
      setSlots(prev => prev.filter(s => s.id !== id));
      setRemoving(null);
    }, 200);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center px-6 font-sans" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        <div className="w-16 h-16 rounded-full bg-[#81D8D0]/15 flex items-center justify-center mb-5">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Shippori Mincho', serif" }}>預約成功！</h2>
        <p className="text-sm text-gray-500 text-center mb-1">已預約 {SELECTED_SLOTS.length} 堂課程</p>
        <p className="text-xs text-gray-400 text-center mb-8">課程通知將透過 LINE 傳送</p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 w-full space-y-2 mb-6">
          {SELECTED_SLOTS.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <div className="w-2 h-2 rounded-full bg-[#81D8D0] flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">{s.date} {s.time}</p>
                <p className="text-[10px] text-gray-400">{s.teacher} 老師</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl bg-[#81D8D0] text-white text-sm font-semibold shadow-sm">
          查看預約紀錄
        </button>
        <button className="mt-3 w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500">
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <button className="text-gray-400 text-lg">‹</button>
          <h1 className="text-base font-semibold text-gray-800">確認預約清單</h1>
        </div>
        <p className="text-xs text-gray-400 ml-6">確認後將一次扣除 {credits} 堂數</p>
      </div>

      {/* Child info */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#81D8D0]/20 flex items-center justify-center text-xs text-[#81D8D0] font-bold">仁</div>
        <span className="text-sm font-medium text-gray-700">黃仁人</span>
        <span className="text-xs text-gray-400">二年級</span>
        <span className="ml-auto text-xs text-gray-400">家庭錢包剩餘：<span className="font-semibold text-gray-600">11 堂</span></span>
      </div>

      {/* Slot list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-semibold text-gray-400 mb-3">已選 {slots.length} 個時段</p>
        <div className="space-y-2">
          {slots.map(slot => (
            <div
              key={slot.id}
              className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start justify-between shadow-sm transition-all duration-200 ${removing === slot.id ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-[#81D8D0] flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{slot.date}</p>
                  <p className="text-xs text-gray-500">{slot.time}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{slot.teacher} 老師 · {slot.franchise}</p>
                </div>
              </div>
              <button
                onClick={() => remove(slot.id)}
                className="text-gray-300 hover:text-[#FFB7B2] text-lg leading-none mt-0.5 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {slots.length === 0 && (
          <div className="text-center py-12 text-gray-300 text-sm">尚未選擇任何時段</div>
        )}

        {/* Credits summary */}
        {slots.length > 0 && (
          <div className="mt-4 bg-[#81D8D0]/8 rounded-xl p-4 border border-[#81D8D0]/20">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">課程堂數</span>
              <span className="font-medium text-gray-700">× {credits}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">家庭錢包</span>
              <span className="font-medium text-gray-700">11 堂</span>
            </div>
            <div className="border-t border-[#81D8D0]/20 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">預約後剩餘</span>
              <span className={`font-bold ${11 - credits >= 0 ? "text-[#81D8D0]" : "text-[#e87c76]"}`}>
                {11 - credits} 堂
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={() => slots.length > 0 && setConfirmed(true)}
          disabled={slots.length === 0}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95 ${
            slots.length > 0
              ? "bg-[#81D8D0] text-white"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {slots.length > 0 ? `確認預約 ${slots.length} 堂` : "請先選擇時段"}
        </button>
        <p className="text-center text-[10px] text-gray-300 mt-2">預約完成後可在預約紀錄中查看詳情</p>
      </div>
    </div>
  );
}
