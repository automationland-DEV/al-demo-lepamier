import { useCallback, useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icons";
import { reviews as seed, REVIEW_SOURCES } from "../data/adminData";
import { branches } from "../data/mockData";
import { formatDate } from "../utils/format";
import { useActiveBranch } from "../context/BranchContext";
import { usePalette } from "../theme/palette";
import Pagination from "../components/Pagination";
import {
  Page, PageHeader, Toolbar, Panel, StatStrip, Stat, SectionHead,
  Button, SearchInput, Select, Field, Segmented,
  Tag, StatusTag, Avatar, Modal, EmptyState, Toast,
  Eyebrow, Hairline, ChartLegend, axisProps, gridProps, chartTip,
} from "../components/ui";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

/**
 * ĐÁNH GIÁ — gom nhận xét từ Google, OTA và khảo sát nội bộ về một chỗ.
 *
 * Điểm trung bình chỉ là bề mặt. Con số vận hành thật sự là "tỉ lệ đã phản
 * hồi" và "số đánh giá dưới 3 sao chưa xử lý" — đó mới là việc phải làm
 * trong ngày, nên hai chỉ số này được đặt ngay đầu trang.
 */

const {
  Star, MessageSquare, Reply,
  AlertTriangle, Send, Sparkles,
} = Icons;

const deaccent = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

const ratingTone = (r) => (r >= 4 ? "success" : r === 3 ? "warning" : "danger");

const REPLY_TEMPLATES = [
  "Condo HUB chân thành cảm ơn quý khách đã dành thời gian chia sẻ. Rất mong được đón tiếp quý khách trong những kỳ nghỉ tới.",
  "Chúng tôi rất tiếc về trải nghiệm chưa trọn vẹn của quý khách. Bộ phận liên quan đã được thông tin để khắc phục ngay.",
  "Cảm ơn góp ý của quý khách. Chúng tôi đã ghi nhận và sẽ cải thiện trong thời gian sớm nhất.",
];

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{
            width: size,
            height: size,
            color: i <= value ? "var(--metal)" : "var(--border)",
            fill: i <= value ? "var(--metal)" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { activeBranchId } = useActiveBranch();
  const { seriesMap, chart } = usePalette();
  const S = useMemo(() => seriesMap(REVIEW_SOURCES.map((s) => s.id)), [seriesMap]);
  const [lineColor] = chart(1);

  const [list, setList] = useState(seed);
  const [source, setSource] = useState("all");
  const [rating, setRating] = useState("all");
  const [state, setState] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState(null);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => setPage(1), [source, rating, state, search, activeBranchId]);

  const scoped = useMemo(
    () => (activeBranchId === "ALL" ? list : list.filter((r) => r.branchId === activeBranchId)),
    [list, activeBranchId]
  );

  const filtered = useMemo(() => {
    const q = deaccent(search.trim());
    return scoped.filter((r) => {
      if (source !== "all" && r.source !== source) return false;
      if (rating !== "all" && String(r.rating) !== rating) return false;
      if (state === "replied" && !r.replied) return false;
      if (state === "pending" && r.replied) return false;
      if (state === "negative" && r.rating >= 4) return false;
      if (q && !deaccent(`${r.guestName} ${r.text} ${r.tags.join(" ")}`).includes(q)) return false;
      return true;
    });
  }, [scoped, source, rating, state, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avg = scoped.length ? scoped.reduce((s, r) => s + r.rating, 0) / scoped.length : 0;
  const replied = scoped.filter((r) => r.replied).length;
  const repliedPct = scoped.length ? Math.round((replied / scoped.length) * 100) : 0;
  const negativePending = scoped.filter((r) => r.rating <= 3 && !r.replied).length;

  /* Phân bố sao — thanh ngang, đọc nhanh hơn biểu đồ tròn */
  const dist = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((n) => ({
        star: n,
        count: scoped.filter((r) => r.rating === n).length,
      })),
    [scoped]
  );
  const maxDist = Math.max(1, ...dist.map((d) => d.count));

  /* Điểm trung bình 8 tuần gần nhất */
  const trend = useMemo(() => {
    const buckets = Array.from({ length: 8 }, (_, i) => ({ week: `T${8 - i}`, sum: 0, n: 0 }));
    const now = new Date(2026, 7, 2).getTime();
    scoped.forEach((r) => {
      const diff = Math.floor((now - new Date(r.date).getTime()) / (7 * 864e5));
      if (diff >= 0 && diff < 8) {
        const b = buckets[diff];
        b.sum += r.rating;
        b.n += 1;
      }
    });
    return buckets
      .slice()
      .reverse()
      .map((b, i) => ({
        label: `Tuần ${i + 1}`,
        score: b.n ? +(b.sum / b.n).toFixed(2) : null,
        count: b.n,
      }));
  }, [scoped]);

  const sendReply = useCallback((review, text) => {
    setList((prev) => prev.map((r) => (r.id === review.id ? { ...r, replied: true, reply: text } : r)));
    setReplying(null);
    setToast(`Đã gửi phản hồi tới ${review.guestName}`);
  }, []);

  return (
    <Page>
      <PageHeader
        eyebrow="Khách hàng"
        title="Đánh giá"
        meta={[
          `${scoped.length} đánh giá trong phạm vi`,
          `Điểm trung bình ${avg.toFixed(2)} / 5`,
          `Đã phản hồi ${repliedPct}%`,
        ]}
        live={negativePending > 0}
        actions={
          <Button
            icon={Reply}
            onClick={() => setReplying(filtered.find((r) => !r.replied) || filtered[0])}
            disabled={!filtered.some((r) => !r.replied)}
          >
            Phản hồi đánh giá tiếp theo
          </Button>
        }
      />

      <StatStrip cols={4}>
        <Stat label="Điểm trung bình" value={avg.toFixed(2)} icon={Star}
          hint={`Trên ${scoped.length} đánh giá`} />
        <Stat label="Tỉ lệ đã phản hồi" value={`${repliedPct}%`} icon={Reply} progress={repliedPct}
          hint={`${scoped.length - replied} đánh giá chờ phản hồi`} />
        <Stat label="Đánh giá tiêu cực chờ xử lý" value={negativePending} icon={AlertTriangle}
          hint="Từ 3 sao trở xuống, chưa phản hồi" />
        <Stat label="Đánh giá 5 sao" value={dist[0].count} icon={Sparkles}
          hint={`${scoped.length ? Math.round((dist[0].count / scoped.length) * 100) : 0}% tổng số`} />
      </StatStrip>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel title="Phân bố sao">
          <div className="space-y-3">
            {dist.map((d) => (
              <button
                key={d.star}
                type="button"
                onClick={() => setRating(rating === String(d.star) ? "all" : String(d.star))}
                className="w-full flex items-center gap-3 text-left"
              >
                <span className="w-8 shrink-0 text-[12px] tnum" style={{ color: "var(--fg-muted)" }}>
                  {d.star} ★
                </span>
                <span className="flex-1 h-2 overflow-hidden" style={{ backgroundColor: "var(--surface-3)" }}>
                  <span
                    className="block h-full"
                    style={{
                      width: `${(d.count / maxDist) * 100}%`,
                      backgroundColor: `var(--${ratingTone(d.star)})`,
                      transition: "width .4s var(--ease)",
                    }}
                  />
                </span>
                <span className="w-8 text-right shrink-0 text-[12px] tnum" style={{ color: "var(--fg)" }}>
                  {d.count}
                </span>
              </button>
            ))}
          </div>

          <Hairline className="my-5" soft />

          <Eyebrow className="mb-2.5">Theo nguồn</Eyebrow>
          <div className="space-y-2">
            {REVIEW_SOURCES.map((s) => {
              const items = scoped.filter((r) => r.source === s.id);
              const a = items.length ? items.reduce((x, r) => x + r.rating, 0) / items.length : 0;
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="inline-flex items-center gap-2 min-w-0" style={{ color: "var(--fg-muted)" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: (S[s.id] || {}).base }} />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <span className="tnum shrink-0" style={{ color: "var(--fg)" }}>
                    {a ? a.toFixed(1) : "—"} <span style={{ color: "var(--fg-subtle)" }}>({items.length})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Điểm trung bình 8 tuần gần nhất">
          <ChartLegend className="mb-4" items={[{ label: "Điểm trung bình mỗi tuần", color: lineColor }]} />
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} {...axisProps} width={28} />
                <Tooltip {...chartTip} formatter={(v, _n, p) => [v ?? "—", `${p.payload.count} đánh giá`]} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionHead
        eyebrow="Hộp đánh giá"
        title="Nhận xét của khách"
        sub="Ưu tiên xử lý đánh giá tiêu cực chưa phản hồi."
        right={
          <Segmented
            value={state}
            onChange={setState}
            size="sm"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ phản hồi" },
              { value: "negative", label: "Tiêu cực" },
              { value: "replied", label: "Đã phản hồi" },
            ]}
          />
        }
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên khách, nội dung hoặc chủ đề…"
          wrapperClassName="flex-1 min-w-[220px]"
        />
        <Select value={source} onChange={(e) => setSource(e.target.value)} wrapperClassName="w-[190px]">
          <option value="all">Tất cả nguồn</option>
          {REVIEW_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
        <Select value={rating} onChange={(e) => setRating(e.target.value)} wrapperClassName="w-[150px]">
          <option value="all">Tất cả mức sao</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={String(n)}>{n} sao</option>)}
        </Select>
      </Toolbar>

      {filtered.length === 0 ? (
        <Panel className="mt-5">
          <EmptyState
            icon={MessageSquare}
            title="Không có đánh giá nào khớp"
            desc="Thử bỏ bớt bộ lọc nguồn hoặc mức sao. Nếu đang lọc 'Chờ phản hồi' thì tin tốt: mọi đánh giá đã được xử lý."
          />
        </Panel>
      ) : (
        <>
          <div className="mt-5 space-y-4">
            {paged.map((r) => {
              const c = S[r.source] || {};
              return (
                <article
                  key={r.id}
                  className="border p-5 card-hover"
                  style={{
                    borderRadius: "var(--r)",
                    backgroundColor: "var(--surface)",
                    borderColor: r.rating <= 2 ? "var(--danger-border)" : "var(--border)",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={r.guestName} src={r.guestAvatar} size={40} />
                      <div className="min-w-0">
                        <div className="font-medium truncate" style={{ color: "var(--fg)" }}>{r.guestName}</div>
                        <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                          <Stars value={r.rating} />
                          <span className="text-[11px] tnum" style={{ color: "var(--fg-subtle)" }}>
                            {formatDate(r.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Tag dot={c.base}>{r.sourceName}</Tag>
                      <StatusTag tone={r.replied ? "success" : "warning"}>
                        {r.replied ? "Đã phản hồi" : "Chờ phản hồi"}
                      </StatusTag>
                    </div>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--fg)" }}>
                    “{r.text}”
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {r.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                    <span className="text-[11px] ml-1" style={{ color: "var(--fg-subtle)" }}>
                      {branches.find((b) => b.id === r.branchId)?.name}
                    </span>
                  </div>

                  {r.replied ? (
                    <div
                      className="mt-4 pl-4 py-2 text-[13px] leading-relaxed"
                      style={{ borderLeft: "2px solid var(--metal)", color: "var(--fg-muted)" }}
                    >
                      <span className="font-medium" style={{ color: "var(--fg)" }}>Phản hồi của Condo HUB · </span>
                      {r.reply}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button size="sm" variant="outline" icon={Reply} onClick={() => setReplying(r)}>
                        Viết phản hồi
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemsPerPage={PAGE_SIZE}
          />
        </>
      )}

      <ReplyModal open={!!replying} review={replying} onClose={() => setReplying(null)} onSend={sendReply} />
      <Toast message={toast} onClose={() => setToast(null)} />
    </Page>
  );
}

/* ═══════════ Soạn phản hồi ═══════════ */
function ReplyModal({ open, review, onClose, onSend }) {
  const [text, setText] = useState("");
  const [lastId, setLastId] = useState(null);

  if (open && review && review.id !== lastId) {
    setLastId(review.id);
    setText(review.reply || (review.rating >= 4 ? REPLY_TEMPLATES[0] : REPLY_TEMPLATES[1]));
  }

  if (!review) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      eyebrow={`${review.sourceName} · ${formatDate(review.date)}`}
      title={`Phản hồi ${review.guestName}`}
      sub={`Đánh giá ${review.rating} sao`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon={Send} onClick={() => onSend(review, text)} disabled={!text.trim()}>
            Gửi phản hồi
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          className="p-4 text-[13px] leading-relaxed"
          style={{ borderRadius: "var(--r-sm)", backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}
        >
          <div className="mb-2"><Stars value={review.rating} /></div>
          “{review.text}”
        </div>

        <Field label="Nội dung phản hồi" hint={`${text.length} ký tự`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full p-3 text-[13px] border outline-none resize-y"
            style={{
              borderRadius: "var(--r-sm)",
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </Field>

        <div>
          <Eyebrow className="mb-2">Mẫu phản hồi nhanh</Eyebrow>
          <div className="space-y-1.5">
            {REPLY_TEMPLATES.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(t)}
                className="w-full text-left px-3 py-2 text-[12px] leading-relaxed border transition-colors"
                style={{
                  borderRadius: "var(--r-sm)",
                  backgroundColor: text === t ? "var(--accent-soft)" : "var(--surface-2)",
                  borderColor: text === t ? "var(--accent)" : "var(--border)",
                  color: text === t ? "var(--accent-fg)" : "var(--fg-muted)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
