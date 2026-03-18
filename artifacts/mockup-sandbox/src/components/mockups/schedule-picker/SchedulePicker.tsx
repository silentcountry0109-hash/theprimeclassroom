import { useState, useCallback } from "react";

const TIFFANY = "#81D8D0";
const TIFFANY_LIGHT = "#E8F8F7";
const TIFFANY_DARK = "#5BBFB7";
const CORAL = "#FFB7B2";
const AMBER = "#FFF9E5";

const DAYS = [
  { key: "mon", label: "一", full: "週一" },
  { key: "tue", label: "二", full: "週二" },
  { key: "wed", label: "三", full: "週三" },
  { key: "thu", label: "四", full: "週四" },
  { key: "fri", label: "五", full: "週五" },
  { key: "sat", label: "六", full: "週六" },
  { key: "sun", label: "日", full: "週日" },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 ~ 21:00

type SlotKey = `${string}-${number}`;

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

export function SchedulePicker() {
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set([
    "mon-9", "mon-10", "wed-14", "wed-15", "fri-10", "fri-11", "sat-9", "sat-10", "sat-11",
  ]));
  const [dragging, setDragging] = useState<{ adding: boolean } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const toggle = useCallback((key: SlotKey, forceAdd?: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (forceAdd !== undefined) {
        if (forceAdd) next.add(key); else next.delete(key);
      } else {
        if (next.has(key)) next.delete(key); else next.add(key);
      }
      return next;
    });
  }, []);

  const summaryByDay = DAYS.map(d => {
    const slots = HOURS.filter(h => selected.has(`${d.key}-${h}` as SlotKey));
    if (slots.length === 0) return null;
    const groups: string[] = [];
    let start = slots[0], prev = slots[0];
    for (let i = 1; i <= slots.length; i++) {
      if (slots[i] !== prev + 1) {
        groups.push(start === prev ? formatHour(start) : `${formatHour(start)}–${formatHour(prev + 1)}`);
        start = slots[i]; prev = slots[i];
      } else prev = slots[i];
    }
    return { day: d.full, times: groups };
  }).filter(Boolean);

  const totalSlots = selected.size;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ background: "linear-gradient(160deg, #f0fffe 0%, #fff9f9 50%, #fffef0 100%)", fontFamily: "'Noto Sans TC', sans-serif" }}
    >
      {/* Header */}
      <div className="w-full max-w-3xl mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: TIFFANY }}>
            π
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium tracking-wide">THE PRIME</div>
            <div className="text-sm font-bold text-gray-700 -mt-0.5">質數教室</div>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-800">設定授課時段</h1>
          <p className="text-sm text-gray-400 mt-0.5">點選格子選取可用時段，按住拖曳可一次選多格</p>
        </div>
      </div>

      {/* Grid Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Day header */}
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div className="py-3 text-center" />
          {DAYS.map(d => (
            <div
              key={d.key}
              className="py-3 text-center transition-colors"
              style={{ background: hoveredDay === d.key ? TIFFANY_LIGHT : "transparent" }}
            >
              <div
                className="inline-flex flex-col items-center gap-0.5 cursor-pointer select-none"
                onClick={() => {
                  const allHours = HOURS.map(h => `${d.key}-${h}` as SlotKey);
                  const allSelected = allHours.every(k => selected.has(k));
                  setSelected(prev => {
                    const next = new Set(prev);
                    if (allSelected) allHours.forEach(k => next.delete(k));
                    else allHours.forEach(k => next.add(k));
                    return next;
                  });
                }}
              >
                <span className="text-[10px] text-gray-400 font-medium">
                  {["六", "日"].includes(d.label) ? (
                    <span style={{ color: d.label === "日" ? CORAL : TIFFANY_DARK }}>{d.label === "六" ? "SAT" : "SUN"}</span>
                  ) : d.label === "一" ? "MON" : d.label === "二" ? "TUE" : d.label === "三" ? "WED" : d.label === "四" ? "THU" : "FRI"}
                </span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: HOURS.some(h => selected.has(`${d.key}-${h}` as SlotKey)) ? TIFFANY : "transparent",
                    color: HOURS.some(h => selected.has(`${d.key}-${h}` as SlotKey)) ? "white" : ["六", "日"].includes(d.label) ? (d.label === "日" ? CORAL : TIFFANY_DARK) : "#374151",
                  }}
                >
                  {d.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
          {HOURS.map((hour, hIdx) => (
            <div
              key={hour}
              className="grid items-center border-b border-gray-50 last:border-0"
              style={{ gridTemplateColumns: "56px repeat(7, 1fr)", minHeight: 44 }}
            >
              <div className="text-[11px] text-gray-400 font-mono text-right pr-3 py-2 leading-none">
                <div>{formatHour(hour)}</div>
              </div>
              {DAYS.map(d => {
                const key = `${d.key}-${hour}` as SlotKey;
                const isSelected = selected.has(key);
                const isWeekend = ["sat", "sun"].includes(d.key);
                return (
                  <div
                    key={d.key}
                    className="px-1 py-1.5 h-full cursor-pointer select-none transition-all group"
                    style={{
                      background: hoveredDay === d.key && !isSelected ? TIFFANY_LIGHT + "60" : "transparent",
                    }}
                    onMouseEnter={() => {
                      setHoveredDay(d.key);
                      if (dragging) toggle(key, dragging.adding);
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    onMouseDown={() => {
                      const adding = !isSelected;
                      setDragging({ adding });
                      toggle(key, adding);
                    }}
                    onMouseUp={() => setDragging(null)}
                  >
                    <div
                      className="w-full h-full rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150"
                      style={{
                        minHeight: 32,
                        background: isSelected
                          ? isWeekend ? `${TIFFANY}aa` : TIFFANY
                          : hIdx % 2 === 0 ? "#fafafa" : "white",
                        color: isSelected ? "white" : "transparent",
                        boxShadow: isSelected ? `0 2px 8px ${TIFFANY}55` : "none",
                        border: isSelected ? "none" : "1.5px solid #f0f0f0",
                        transform: isSelected ? "scale(0.97)" : "scale(1)",
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: TIFFANY }} />
            <span>已選取</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white" />
            <span>未選取</span>
          </div>
          <div className="ml-auto text-gray-500 font-medium">
            共 <span style={{ color: TIFFANY_DARK }}>{totalSlots}</span> 個時段
          </div>
        </div>
      </div>

      {/* Summary */}
      {summaryByDay.length > 0 && (
        <div className="w-full max-w-3xl mt-4">
          <div className="rounded-xl p-4" style={{ background: AMBER, border: `1.5px solid ${TIFFANY}33` }}>
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">已選時段總覽</div>
            <div className="flex flex-wrap gap-2">
              {summaryByDay.map((s) => s && (
                <div
                  key={s.day}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "white", border: `1.5px solid ${TIFFANY}55`, color: "#374151" }}
                >
                  <span style={{ color: TIFFANY_DARK, fontWeight: 700 }}>{s.day}</span>
                  <span className="text-gray-400">·</span>
                  <span>{s.times.join("、")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-3xl mt-4 flex items-center gap-3">
        <button
          className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 transition-colors"
          onClick={() => setSelected(new Set())}
        >
          清除全部
        </button>
        <button
          className="flex-[2] py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${TIFFANY} 0%, ${TIFFANY_DARK} 100%)`, boxShadow: `0 4px 16px ${TIFFANY}55` }}
        >
          確認設定 · {totalSlots} 個時段
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-300 text-center">
        點選欄位標題可選取整天 · 按住拖曳可快速多選
      </div>
    </div>
  );
}
