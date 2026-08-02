import { useState, useRef, useEffect } from "react";
import { useActiveBranch } from "../context/BranchContext";
import { Icons } from "./Icons";

const { ChevronDown, Check, Building2, Layers, Search } = Icons;

/* Ô mã chi nhánh — trước đây tô bg-blue-700 cứng nên không đổi theo bộ sưu
 * tập và hỏng ở chế độ tối. Nay là ô viền tóc trung tính. */
function CodeChip({ children, icon: Icon }) {
  return (
    <span
      className="w-7 h-7 flex items-center justify-center shrink-0 border text-[10px] font-semibold"
      style={{
        borderRadius: "var(--r-sm)",
        backgroundColor: "var(--surface-3)",
        borderColor: "var(--border)",
        color: "var(--fg-muted)",
      }}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : children}
    </span>
  );
}

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
      <div
        className="px-3 py-2.5 border-b flex justify-center relative"
        style={{ borderColor: "var(--border)" }}
        ref={ref}
      >
        <button
          onClick={() => setOpen(!open)}
          title="Chọn chi nhánh"
          aria-label="Chọn chi nhánh"
          className="w-9 h-9 flex items-center justify-center transition-colors relative border"
          style={{
            borderRadius: "var(--r-sm)",
            backgroundColor: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--fg-muted)",
          }}
        >
          <Building2 className="w-4 h-4" />
          {!isAll && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--metal)", boxShadow: "0 0 0 2px var(--surface)" }}
            />
          )}
        </button>
        {open && (
          <BranchDropdown
            q={q}
            setQ={setQ}
            filtered={filtered}
            activeBranchId={activeBranchId}
            isAll={isAll}
            onSelect={(id) => { setBranch(id); setOpen(false); }}
            align="right"
          />
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-3.5 border-b relative" style={{ borderColor: "var(--border)" }} ref={ref}>
      <div
        className="text-[10px] uppercase tracking-[0.16em] font-semibold px-1 mb-2"
        style={{ color: "var(--fg-subtle)" }}
      >
        Chi nhánh
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 border transition-colors"
        style={{
          borderRadius: "var(--r-sm)",
          backgroundColor: "var(--surface)",
          borderColor: open ? "var(--fg-subtle)" : "var(--border)",
        }}
      >
        <CodeChip icon={isAll ? Layers : undefined}>{activeBranch?.code}</CodeChip>
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-[12px] font-medium truncate" style={{ color: "var(--fg)" }}>
            {isAll ? "Tất cả chi nhánh" : activeBranch?.name}
          </span>
          <span className="block text-[10px] truncate" style={{ color: "var(--fg-muted)" }}>
            {isAll
              ? `${branches.length} chi nhánh đang hoạt động`
              : `${activeBranch?.code} · ${activeBranch?.region}`}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--fg-subtle)" }}
        />
      </button>

      {open && (
        <BranchDropdown
          q={q}
          setQ={setQ}
          filtered={filtered}
          activeBranchId={activeBranchId}
          isAll={isAll}
          onSelect={(id) => { setBranch(id); setOpen(false); }}
        />
      )}
    </div>
  );
}

function BranchRow({ code, icon, title, sub, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left min-w-0"
      style={{
        backgroundColor: selected || hover ? "var(--surface-2)" : "transparent",
        boxShadow: selected ? "inset 2px 0 0 0 var(--metal)" : "none",
      }}
    >
      <CodeChip icon={icon}>{code}</CodeChip>
      <span className="flex-1 min-w-0">
        <span className="block text-[12px] font-medium truncate" style={{ color: "var(--fg)" }}>{title}</span>
        <span className="block text-[10px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</span>
      </span>
      {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--metal)" }} />}
    </button>
  );
}

function BranchDropdown({ q, setQ, filtered, activeBranchId, isAll, onSelect, align = "left" }) {
  return (
    <div
      className={`absolute ${
        align === "right"
          ? "left-full ml-2 top-0 w-72 max-w-[calc(100vw-1.5rem)]"
          : "left-3 right-3 top-full mt-2 w-auto max-w-[calc(100vw-1.5rem)] sm:left-3 sm:right-auto sm:w-72"
      } z-30 border overflow-hidden animate-fadeIn`}
      style={{
        borderRadius: "var(--r)",
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      <div className="p-2 border-b" style={{ borderColor: "var(--border-soft)" }}>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--fg-subtle)" }}
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chi nhánh…"
            className="w-full text-[12px] pl-8 pr-2 h-8 border outline-none"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      <BranchRow
        icon={Layers}
        title="Tất cả chi nhánh"
        sub="Xem dữ liệu gộp toàn hệ thống"
        selected={isAll}
        onClick={() => onSelect("ALL")}
      />

      <div className="h-px" style={{ backgroundColor: "var(--border-soft)" }} />

      <div className="max-h-64 overflow-y-auto">
        {filtered.map((b) => (
          <BranchRow
            key={b.id}
            code={b.code}
            title={b.name}
            sub={`${b.city} · ${b.region}`}
            selected={activeBranchId === b.id}
            onClick={() => onSelect(b.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-5 text-[11px] text-center" style={{ color: "var(--fg-subtle)" }}>
            Không tìm thấy chi nhánh
          </div>
        )}
      </div>
    </div>
  );
}
