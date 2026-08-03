import { useCallback, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { roomTypes as seed } from "../data/adminData";
import { rooms, branches } from "../data/mockData";
import { formatVNDFull } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat,
  Button, IconButton, SearchInput, Select, Field, Input, Segmented,
  Tag, StatusTag, Table, Th, Td, Tr, Modal, EmptyState, Toast,
  Dropdown, MenuItem, Eyebrow, Hairline,
} from "../components/ui";

/**
 * HẠNG PHÒNG — danh mục nền của toàn bộ nghiệp vụ khách sạn.
 *
 * Trước đây hạng phòng chỉ là một chuỗi nằm rải rác trong mockData nên
 * không sửa được giá gốc, sức chứa hay tiện nghi. Trang này biến nó thành
 * danh mục có thể quản trị: Bảng giá (§/rates) và Đặt phòng đều tham chiếu
 * về đây.
 */

const {
  LayoutList, Plus, Users, Maximize2, BedDouble, Edit2, Trash2, Eye,
  MoreHorizontal, LayoutGrid, List, Image: ImageIcon, Check, AlertCircle,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const AMENITIES = [
  "Wifi tốc độ cao", "Điều hòa", "Két an toàn", "Minibar", "Máy pha cà phê",
  "Bồn tắm", "Ban công", "View biển", "Bàn làm việc", "TV 55 inch",
  "Máy sấy tóc", "Áo choàng tắm", "Dép đi trong phòng", "Ấm siêu tốc",
];

const EMPTY = {
  code: "", name: "", basePrice: 1_500_000, capacity: 2,
  beds: "1 giường đôi", size: 30, amenities: [], image: "", active: true, desc: "",
};

/* Ảnh có thể hỏng link — luôn vẽ nền + icon, ảnh chỉ hiện khi tải xong */
function Cover({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: "var(--surface-3)" }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <ImageIcon className="w-6 h-6" style={{ color: "var(--fg-subtle)" }} />
      </div>
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity .25s var(--ease)" }}
        />
      )}
    </div>
  );
}

export default function RoomTypes() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap } = usePalette();
  const COLOR = useMemo(() => seriesMap(seed.map((t) => t.code)), [seriesMap]);

  const [list, setList] = useState(seed);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  /* Số phòng thực tế của từng hạng, bám chi nhánh đang chọn */
  const countByType = useMemo(() => {
    const scope = activeBranchId === "ALL" ? rooms : rooms.filter((r) => r.branchId === activeBranchId);
    return scope.reduce((a, r) => ((a[r.type] = (a[r.type] || 0) + 1), a), {});
  }, [activeBranchId]);

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return list.filter((t) => {
      if (status === "active" && !t.active) return false;
      if (status === "off" && t.active) return false;
      if (activeBranchId !== "ALL" && !t.branches.includes(activeBranchId)) return false;
      if (q && !deaccent(`${t.name} ${t.code} ${t.beds}`).includes(q)) return false;
      return true;
    });
  }, [list, search, status, activeBranchId]);

  const totalRooms = useMemo(
    () => filtered.reduce((s, t) => s + (countByType[t.code] || 0), 0),
    [filtered, countByType]
  );
  const avgPrice = filtered.length
    ? Math.round(filtered.reduce((s, t) => s + t.basePrice, 0) / filtered.length)
    : 0;
  const maxCap = filtered.length ? Math.max(...filtered.map((t) => t.capacity)) : 0;

  const save = useCallback((data) => {
    setList((prev) => {
      const exists = prev.some((t) => t.id === data.id);
      return exists ? prev.map((t) => (t.id === data.id ? data : t)) : [...prev, data];
    });
    setToast(data.id && seed.some((t) => t.id === data.id) ? "Đã lưu hạng phòng" : "Đã thêm hạng phòng");
    setForm(null);
  }, []);

  const remove = useCallback((t) => {
    setList((prev) => prev.filter((x) => x.id !== t.id));
    setConfirm(null);
    setDetail(null);
    setToast(`Đã xóa hạng ${t.name}`);
  }, []);

  const toggle = useCallback((t) => {
    setList((prev) => prev.map((x) => (x.id === t.id ? { ...x, active: !x.active } : x)));
    setToast(t.active ? `Đã ngừng bán hạng ${t.name}` : `Đã mở bán hạng ${t.name}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Khách sạn"
        title="Hạng phòng"
        meta={[
          `${list.length} hạng đang khai báo`,
          `${totalRooms.toLocaleString("vi-VN")} phòng thuộc phạm vi đang xem`,
          `Giá trung bình ${formatVNDFull(avgPrice)}`,
        ]}
        actions={
          <>
            <Segmented
              value={view}
              onChange={setView}
              size="sm"
              options={[
                { value: "grid", label: "Thẻ", icon: LayoutGrid },
                { value: "table", label: "Bảng", icon: List },
              ]}
            />
            <Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>
              Thêm hạng phòng
            </Button>
          </>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Hạng phòng" value={filtered.length} icon={LayoutList}
          hint={`${list.filter((t) => !t.active).length} hạng đang tạm ngừng bán`} />
        <Stat label="Tổng số phòng" value={totalRooms.toLocaleString("vi-VN")} icon={BedDouble}
          hint={activeBranchId === "ALL" ? "Toàn hệ thống" : "Chi nhánh đang chọn"} />
        <Stat label="Giá công bố trung bình" value={formatVNDFull(avgPrice)} icon={Check}
          hint="Chưa gồm phụ thu mùa cao điểm" />
        <Stat label="Sức chứa tối đa" value={`${maxCap} khách`} icon={Users}
          hint="Hạng cao nhất trong phạm vi" />
      </StatStrip>

      <Toolbar className="mt-5">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hạng, mã hoặc loại giường…"
          wrapperClassName="flex-1 min-w-[220px]"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} wrapperClassName="w-[180px]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang mở bán</option>
          <option value="off">Tạm ngừng bán</option>
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <Panel className="mt-5">
          <EmptyState
            icon={LayoutList}
            title="Không có hạng phòng nào khớp"
            desc="Thử bỏ bớt bộ lọc, hoặc thêm một hạng phòng mới cho chi nhánh này."
            action={<Button icon={Plus} onClick={() => setForm({ ...EMPTY, id: null })}>Thêm hạng phòng</Button>}
          />
        </Panel>
      ) : view === "grid" ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const c = COLOR[t.code] || COLOR[Object.keys(COLOR)[0]];
            const n = countByType[t.code] || 0;
            return (
              <article
                key={t.id}
                className="border overflow-hidden flex flex-col card-hover"
                style={{
                  borderRadius: "var(--r)",
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <Cover src={t.image} alt={t.name} className="h-[168px]" />

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Eyebrow className="mb-1.5">{t.code}</Eyebrow>
                      <h3 className="font-display text-[20px] leading-tight truncate" style={{ color: "var(--fg)" }}>
                        {t.name}
                      </h3>
                    </div>
                    <StatusTag tone={t.active ? "success" : "neutral"}>
                      {t.active ? "Đang bán" : "Ngừng bán"}
                    </StatusTag>
                  </div>

                  <p className="mt-2.5 text-[13px] leading-relaxed line-clamp-2" style={{ color: "var(--fg-muted)" }}>
                    {t.desc}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-px border overflow-hidden"
                    style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
                    {[
                      { label: "Diện tích", value: `${t.size} m²`, icon: Maximize2 },
                      { label: "Sức chứa", value: `${t.capacity} khách`, icon: Users },
                      { label: "Số phòng", value: n.toLocaleString("vi-VN"), icon: BedDouble },
                    ].map((m) => (
                      <div key={m.label} className="px-3 py-2.5" style={{ backgroundColor: "var(--surface)" }}>
                        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>
                          {m.label}
                        </div>
                        <div className="mt-1 text-[13px] font-medium tnum" style={{ color: "var(--fg)" }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.amenities.slice(0, 3).map((a) => (
                      <Tag key={a} dot={c.base}>{a}</Tag>
                    ))}
                    {t.amenities.length > 3 && (
                      <Tag>+{t.amenities.length - 3}</Tag>
                    )}
                  </div>

                  <Hairline className="my-4" soft />

                  <div className="mt-auto flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>
                        Giá công bố / đêm
                      </div>
                      <div className="mt-1 text-[20px] font-medium tnum" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>
                        {formatVNDFull(t.basePrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <IconButton icon={Eye} label="Xem chi tiết" size="md" onClick={() => setDetail(t)} />
                      <IconButton icon={Edit2} label="Sửa hạng phòng" size="md" onClick={() => setForm(t)} />
                      <Dropdown
                        trigger={<IconButton icon={MoreHorizontal} label="Thao tác khác" size="md" />}
                      >
                        <MenuItem icon={Check} onClick={() => toggle(t)}>
                          {t.active ? "Ngừng bán" : "Mở bán lại"}
                        </MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => setConfirm(t)}>Xóa hạng phòng</MenuItem>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Panel className="mt-5" flush>
          <Table minWidth={980}>
            <thead>
              <tr>
                <Th>Hạng phòng</Th>
                <Th>Giường</Th>
                <Th align="right">Diện tích</Th>
                <Th align="right">Sức chứa</Th>
                <Th align="right">Số phòng</Th>
                <Th align="right">Giá công bố</Th>
                <Th>Trạng thái</Th>
                <Th align="right">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <Tr key={t.id} onClick={() => setDetail(t)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="w-1 h-8 shrink-0" style={{ backgroundColor: (COLOR[t.code] || {}).base }} />
                      <div className="min-w-0">
                        <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{t.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--fg-subtle)" }}>{t.code}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{t.beds}</Td>
                  <Td align="right" num>{t.size} m²</Td>
                  <Td align="right" num>{t.capacity}</Td>
                  <Td align="right" num>{(countByType[t.code] || 0).toLocaleString("vi-VN")}</Td>
                  <Td align="right" num>{formatVNDFull(t.basePrice)}</Td>
                  <Td>
                    <StatusTag tone={t.active ? "success" : "neutral"}>
                      {t.active ? "Đang bán" : "Ngừng bán"}
                    </StatusTag>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <IconButton icon={Edit2} label="Sửa" size="sm" onClick={() => setForm(t)} />
                      <IconButton icon={Trash2} label="Xóa" size="sm" onClick={() => setConfirm(t)} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      )}

      <RoomTypeForm open={!!form} data={form} onClose={() => setForm(null)} onSave={save} />

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        wide
        eyebrow={detail?.code}
        title={detail?.name || ""}
        sub={detail?.desc}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>Đóng</Button>
            <Button icon={Edit2} onClick={() => { setForm(detail); setDetail(null); }}>Sửa hạng phòng</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <Cover src={detail.image} alt={detail.name} className="h-[190px]" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border overflow-hidden"
              style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--border)", borderColor: "var(--border)" }}>
              {[
                ["Giá công bố", formatVNDFull(detail.basePrice)],
                ["Diện tích", `${detail.size} m²`],
                ["Sức chứa", `${detail.capacity} khách`],
                ["Số phòng", (countByType[detail.code] || 0).toLocaleString("vi-VN")],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3" style={{ backgroundColor: "var(--surface)" }}>
                  <div className="text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--fg-subtle)" }}>{k}</div>
                  <div className="mt-1 text-[14px] font-medium tnum" style={{ color: "var(--fg)" }}>{v}</div>
                </div>
              ))}
            </div>

            <div>
              <Eyebrow className="mb-2">Cấu hình giường</Eyebrow>
              <p className="text-[13px]" style={{ color: "var(--fg)" }}>{detail.beds}</p>
            </div>

            <div>
              <Eyebrow className="mb-2">Tiện nghi trong phòng</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {detail.amenities.map((a) => <Tag key={a}>{a}</Tag>)}
              </div>
            </div>

            <div>
              <Eyebrow className="mb-2">Chi nhánh áp dụng</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {detail.branches.map((id) => (
                  <Tag key={id}>{branches.find((b) => b.id === id)?.name || id}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        eyebrow="Xác nhận"
        title={`Xóa hạng ${confirm?.name || ""}?`}
        sub="Các phòng đang gán hạng này sẽ mất tham chiếu giá. Thao tác chỉ ảnh hưởng bản demo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Hủy</Button>
            <Button variant="danger" icon={Trash2} onClick={() => remove(confirm)}>Xóa hạng phòng</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-[13px]" style={{ color: "var(--fg-muted)" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
          <span>
            Hiện có <strong className="tnum" style={{ color: "var(--fg)" }}>
              {(countByType[confirm?.code] || 0).toLocaleString("vi-VN")}
            </strong> phòng thuộc hạng này trong phạm vi đang xem.
          </span>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Form thêm / sửa ═══════════ */
function RoomTypeForm({ open, data, onClose, onSave }) {
  const [v, setV] = useState(EMPTY);
  const [touched, setTouched] = useState(false);

  // Đồng bộ khi mở modal với bản ghi khác
  const key = data?.id || "new";
  const [lastKey, setLastKey] = useState(key);
  if (open && key !== lastKey) {
    setLastKey(key);
    setV(data || EMPTY);
    setTouched(false);
  }

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));
  const setNum = (k) => (e) => setV((p) => ({ ...p, [k]: Number(e.target.value) || 0 }));
  const toggleAmenity = (a) =>
    setV((p) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a],
    }));

  const errName = touched && !v.name.trim() ? "Bắt buộc nhập tên hạng phòng" : "";
  const errCode = touched && !v.code.trim() ? "Bắt buộc nhập mã" : "";

  const submit = () => {
    setTouched(true);
    if (!v.name.trim() || !v.code.trim()) return;
    onSave({
      ...v,
      id: v.id || `RT-${v.code.toUpperCase()}`,
      code: v.code.toUpperCase(),
      roomCount: v.roomCount || 0,
      branches: v.branches || branches.map((b) => b.id),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow={data?.id ? "Chỉnh sửa" : "Thêm mới"}
      title={data?.id ? `Sửa hạng ${data.name}` : "Thêm hạng phòng"}
      sub="Hạng phòng là danh mục nền — Bảng giá và Đặt phòng đều tham chiếu về đây."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Check} onClick={submit}>{data?.id ? "Lưu thay đổi" : "Thêm hạng phòng"}</Button>
        </>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tên hạng phòng" required error={errName}>
          <Input value={v.name} onChange={set("name")} placeholder="Deluxe Ocean View" />
        </Field>
        <Field label="Mã hạng" required error={errCode} hint="Viết hoa, 3 ký tự">
          <Input value={v.code} onChange={set("code")} placeholder="DLX" maxLength={4} />
        </Field>
        <Field label="Giá công bố / đêm (VNĐ)">
          <Input type="number" value={v.basePrice} onChange={setNum("basePrice")} step={100000} />
        </Field>
        <Field label="Diện tích (m²)">
          <Input type="number" value={v.size} onChange={setNum("size")} />
        </Field>
        <Field label="Sức chứa (khách)">
          <Input type="number" value={v.capacity} onChange={setNum("capacity")} min={1} max={12} />
        </Field>
        <Field label="Cấu hình giường">
          <Select value={v.beds} onChange={set("beds")}>
            {["1 giường đơn", "1 giường đôi", "1 giường đôi lớn", "2 giường đơn",
              "1 King hoặc 2 đơn", "1 King + sofa bed", "1 King + phòng khách",
              "2 phòng ngủ King"].map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        <Field label="Ảnh đại diện (URL)" className="sm:col-span-2"
          hint="Bản demo không upload — dán liên kết ảnh">
          <Input value={v.image} onChange={set("image")} placeholder="https://…" />
        </Field>
        <Field label="Mô tả ngắn" className="sm:col-span-2">
          <Input value={v.desc} onChange={set("desc")} placeholder="Phòng hướng biển, ban công riêng…" />
        </Field>
      </div>

      <div className="mt-5">
        <Eyebrow className="mb-2.5">Tiện nghi trong phòng</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => {
            const on = v.amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium border transition-colors"
                style={{
                  borderRadius: "var(--r-sm)",
                  backgroundColor: on ? "var(--accent-soft)" : "var(--surface-2)",
                  borderColor: on ? "var(--accent)" : "var(--border)",
                  color: on ? "var(--accent-fg)" : "var(--fg-muted)",
                  transitionDuration: ".16s",
                }}
              >
                {on && <Check className="w-3.5 h-3.5" />}
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
