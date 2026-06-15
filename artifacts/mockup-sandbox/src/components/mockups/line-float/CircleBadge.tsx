import { useState, useEffect } from "react";

const LINE_GREEN = "#06C755";

function LineIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default function CircleBadge() {
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex items-center justify-center">
      {/* 頁面內容模擬 */}
      <div className="w-full max-w-sm space-y-3 p-8 opacity-30 pointer-events-none select-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded bg-slate-200" style={{ height: 12, width: `${70 + Math.sin(i) * 20}%` }} />
        ))}
      </div>

      {/* 浮動按鈕 */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
        {/* Tooltip */}
        <div
          className="transition-all duration-300 overflow-hidden"
          style={{ maxWidth: hovered ? 160 : 0, opacity: hovered ? 1 : 0 }}
        >
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
            加入 LINE 好友 →
          </div>
        </div>

        {/* 圓形按鈕 */}
        <div className="relative">
          {/* 脈衝光環 */}
          {pulse && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: LINE_GREEN, opacity: 0.35 }}
            />
          )}
          <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative rounded-full shadow-xl flex items-center justify-center transition-transform duration-200"
            style={{
              width: 60,
              height: 60,
              backgroundColor: LINE_GREEN,
              transform: hovered ? "scale(1.1)" : "scale(1)",
              boxShadow: hovered
                ? `0 8px 24px ${LINE_GREEN}60`
                : `0 4px 16px ${LINE_GREEN}40`,
            }}
          >
            <LineIcon size={30} />
          </button>
        </div>
      </div>

      {/* 標籤 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow px-3 py-1.5 text-xs font-semibold text-slate-600">
        A ∙ 圓形圖示 + 脈衝動畫
      </div>
    </div>
  );
}
