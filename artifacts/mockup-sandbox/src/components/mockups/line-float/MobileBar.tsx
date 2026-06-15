import { useState } from "react";

const LINE_GREEN = "#06C755";

function LineIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function MobileBar() {
  const [pressed, setPressed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* 手機外框模擬 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl"
          style={{ width: 280, height: 480, border: "8px solid #1e293b" }}
        >
          {/* 手機頂部瀏海 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-xl z-10" />

          {/* 內容模擬 */}
          <div className="flex-1 px-4 pt-10 pb-16 space-y-2.5 overflow-hidden">
            {/* 假 header */}
            <div className="h-8 rounded-lg bg-teal-100 mb-4" />
            {[...Array(7)].map((_, i) => (
              <div key={i} className="rounded bg-slate-100" style={{ height: 10, width: `${65 + Math.sin(i * 1.3) * 25}%` }} />
            ))}
            <div className="mt-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl bg-slate-100 h-14" />
              ))}
            </div>
          </div>

          {/* 底部浮動條 */}
          {!dismissed && (
            <div className="absolute bottom-0 left-0 right-0">
              <button
                className="w-full flex items-center justify-between px-4 py-3 transition-all duration-150 relative"
                style={{
                  backgroundColor: pressed ? "#05a847" : LINE_GREEN,
                }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <LineIcon size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold leading-tight">加入 LINE 好友</div>
                    <div className="text-white/80 text-xs leading-tight">獲取最新課程消息</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="text-white/60 text-lg leading-none cursor-pointer hover:text-white/90"
                    onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
                  >
                    ×
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 標籤 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow px-3 py-1.5 text-xs font-semibold text-slate-600">
        D ∙ 手機底部固定橫條
      </div>

      {dismissed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={() => setDismissed(false)}
            className="rounded-full text-white text-xs px-3 py-1.5 shadow-md"
            style={{ backgroundColor: LINE_GREEN }}
          >
            重新顯示
          </button>
        </div>
      )}
    </div>
  );
}
