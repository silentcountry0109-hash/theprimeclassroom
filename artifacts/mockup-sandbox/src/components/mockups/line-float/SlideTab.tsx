import { useState } from "react";

const LINE_GREEN = "#06C755";

function LineIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default function SlideTab() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex items-center justify-center">
      {/* 頁面內容模擬 */}
      <div className="w-full max-w-sm space-y-3 p-8 opacity-30 pointer-events-none select-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded bg-slate-200" style={{ height: 12, width: `${70 + Math.sin(i) * 20}%` }} />
        ))}
      </div>

      {/* 右側滑出標籤 */}
      <div
        className="absolute"
        style={{ right: 0, top: "50%", transform: "translateY(-50%)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          className="flex items-center gap-0 rounded-l-2xl shadow-xl overflow-hidden transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: LINE_GREEN,
            height: 52,
            boxShadow: hovered ? `0 6px 20px ${LINE_GREEN}50` : `0 3px 12px ${LINE_GREEN}35`,
          }}
        >
          {/* 文字展開區 */}
          <div
            className="transition-all duration-300 overflow-hidden whitespace-nowrap"
            style={{ maxWidth: hovered ? 160 : 0, opacity: hovered ? 1 : 0 }}
          >
            <span className="text-white text-sm font-semibold pl-4 pr-1 flex items-center gap-1.5 h-full">
              加入 LINE 好友
            </span>
          </div>

          {/* 圖示固定區 */}
          <div className="w-14 h-full flex items-center justify-center shrink-0">
            <LineIcon size={26} />
          </div>
        </button>
      </div>

      {/* 標籤 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow px-3 py-1.5 text-xs font-semibold text-slate-600">
        B ∙ 右側滑出標籤（Hover 展開）
      </div>
    </div>
  );
}
