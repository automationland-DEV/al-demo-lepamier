import { useState, useRef, useEffect } from "react";
import { useActiveBranch } from "../context/BranchContext";
import { Icons } from "./Icons";

const { ChevronDown, Check, Building2, Layers, Search } = Icons;

export default function BranchSelector({ collapsed }) {
  const { activeBranchId, activeBranch, branches, setBranch, isAll } = useActiveBranch();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = branches.filter((b) =>
    `${b.name} ${b.code} ${b.city} ${b.region}`.toLowerCase().includes(q.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="px-3 py-2.5 border-b border-ink-200 flex justify-center relative">
        <button
          onClick={() => setOpen(!open)}
          title="Chọn khu du lịch"
          className="w-9 h-9 rounded-md bg-ink-50 hover:bg-ink-100 text-ink-700 flex items-center justify-center transition relative border border-ink-200"
        >
          <Building2 className="w-4 h-4" />
          {!isAll && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          )}
        </button>
        {open && (
          <BranchDropdown
            q={q}
            setQ={setQ}
            filtered={filtered}
            activeBranchId={activeBranchId}
            isAll={isAll}
            onSelect={(id) => {
              setBranch(id);
              setOpen(false);
            }}
            align="right"
          />
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-b border-ink-200 relative" ref={ref}>
      <div className="text-[10px] uppercase tracking-[0.12em] text-ink-400 font-semibold px-2 mb-1.5">
        Khu du lịch
      </div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition bg-white ${
          open
            ? "border-ink-300 ring-1 ring-ink-200"
            : "border-ink-200 hover:border-ink-300"
        }`}
      >
        <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center shrink-0">
          {isAll ? <Layers className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12px] font-semibold text-ink-900 truncate">
            {isAll ? "Tất cả chi nhánh" : activeBranch?.name}
          </div>
          <div className="text-[10px] text-ink-500 truncate">
            {isAll
              ? `${branches.length} khu đang hoạt động`
              : `${activeBranch?.code} · ${activeBranch?.region}`}
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-ink-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <BranchDropdown
          q={q}
          setQ={setQ}
          filtered={filtered}
          activeBranchId={activeBranchId}
          isAll={isAll}
          onSelect={(id) => {
            setBranch(id);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function BranchDropdown({ q, setQ, filtered, activeBranchId, isAll, onSelect, align = "left" }) {
  return (
    <div
      className={`absolute ${
        align === "right"
          ? "left-full ml-2 top-0 w-72 max-w-[calc(100vw-1.5rem)]"
          : "left-3 right-3 top-full mt-2 w-auto max-w-[calc(100vw-1.5rem)] sm:left-3 sm:right-auto sm:w-72"
      } z-30 bg-white rounded-lg shadow-pop border border-ink-200 overflow-hidden`}
    >
      <div className="p-2 border-b border-ink-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chi nhánh…"
            className="w-full text-[12px] pl-8 pr-2 py-1.5 rounded-md border border-ink-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
          />
        </div>
      </div>

      <button
        onClick={() => onSelect("ALL")}
        className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-ink-50 transition text-left min-w-0 ${
          isAll ? "bg-ink-50" : ""
        }`}
      >
        <div className="w-7 h-7 rounded bg-ink-900 text-white flex items-center justify-center shrink-0">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-ink-900 truncate">Tất cả chi nhánh</div>
          <div className="text-[10px] text-ink-500 truncate">Xem dữ liệu gộp toàn hệ thống</div>
        </div>
        {isAll && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
      </button>

      <div className="h-px bg-ink-100" />

      <div className="max-h-64 overflow-y-auto">
        {filtered.map((b) => {
          const selected = activeBranchId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-ink-50 transition text-left min-w-0 ${
                selected ? "bg-ink-50" : ""
              }`}
            >
              <div className="w-7 h-7 rounded bg-blue-700 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                {b.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-ink-900 truncate">{b.name}</div>
                <div className="text-[10px] text-ink-500 truncate">
                  {b.city} · {b.region}
                </div>
              </div>
              {selected && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-[11px] text-ink-400 text-center">
            Không tìm thấy chi nhánh
          </div>
        )}
      </div>
    </div>
  );
}
