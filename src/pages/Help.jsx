import { useMemo, useState, useEffect } from "react";
import { Icons } from "../components/Icons";
import { usePalette, TONE } from "../theme/palette";

const {
  GraduationCap, PlayCircle, Play, Clock, Eye, ListChecks,
  CheckCircle2, Circle, ChevronDown, Search, X, Mail, Phone,
  MessageSquare, Globe, Keyboard, Sparkles, BookOpen, Video, Lightbulb,
  Users, BedDouble, CalendarCheck, Wallet, Megaphone,
  Utensils, LifeBuoy, Timer, BadgeCheck,
} = Icons;

const TABS = [
  { id: "video",   label: "Video hướng dẫn", icon: Video },
  { id: "article", label: "Bài viết",        icon: BookOpen },
  { id: "process", label: "Quy trình",       icon: ListChecks },
];

/* Chủ đề — màu lấy từ usePalette() theo thứ tự khóa này (Design.md §2.2) */
const TOPIC_KEYS = ["basic", "room", "booking", "guest", "fnb", "report", "marketing"];
const TOPIC_LABEL = {
  basic: "Bắt đầu", room: "Phòng", booking: "Đặt phòng", guest: "Khách hàng",
  fnb: "Nhà hàng", report: "Báo cáo", marketing: "Marketing",
};
const TOPIC_ICON = {
  basic: Sparkles, room: BedDouble, booking: CalendarCheck, guest: Users,
  fnb: Utensils, report: Wallet, marketing: Megaphone,
};

const LEVEL = {
  beginner: { label: "Cơ bản",    ...TONE.success },
  medium:   { label: "Trung cấp", ...TONE.info },
  advanced: { label: "Nâng cao",  ...TONE.warning },
};

export default function Help() {
  const { brand, seriesMap } = usePalette();
  const TOPIC = useMemo(() => seriesMap(TOPIC_KEYS), [seriesMap]);
  const data = useMemo(buildData, []);

  const [tab, setTab] = useState("video");
  const [topic, setTopic] = useState("all");
  const [search, setSearch] = useState("");
  const [video, setVideo] = useState(null);
  const [article, setArticle] = useState(null);
  const [openProcess, setOpenProcess] = useState(data.processes[0].id);
  const [doneSteps, setDoneSteps] = useState({});

  useEffect(() => setTopic("all"), [tab]);

  const match = (x) => {
    if (topic !== "all" && x.topic !== topic) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return x.title.toLowerCase().includes(q) || (x.desc || "").toLowerCase().includes(q);
  };

  const videos = data.videos.filter(match);
  const articles = data.articles.filter(match);
  const processes = data.processes.filter(match);

  const current = tab === "video" ? videos : tab === "article" ? articles : processes;
  const source = tab === "video" ? data.videos : tab === "article" ? data.articles : data.processes;

  const toggleStep = (pid, idx) =>
    setDoneSteps((s) => ({ ...s, [`${pid}-${idx}`]: !s[`${pid}-${idx}`] }));

  return (
    <div className="max-w-[1360px] mx-auto pb-10">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1 pb-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.14em] text-white mb-3"
               style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
            <GraduationCap className="w-3 h-3" /> Trung tâm hỗ trợ
          </div>
          <h1 className="font-display font-extrabold tracking-[-0.03em] text-[32px] sm:text-[38px] leading-none"
              style={{ color: "var(--fg)" }}>
            Hướng dẫn sử dụng
          </h1>
          <div className="flex items-center gap-2.5 mt-2.5 text-[13px] flex-wrap" style={{ color: "var(--fg-muted)" }}>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{data.videos.length}</b> video</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{data.articles.length}</b> bài viết</span>
            <span className="opacity-40">•</span>
            <span><b className="font-extrabold" style={{ color: "var(--fg)" }}>{data.processes.length}</b> quy trình</span>
          </div>
        </div>

        <a href="#lien-he"
           className="glowbtn inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-bold text-white"
           style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})`,
                    boxShadow: `0 8px 20px -8px ${brand.from}a6` }}>
          <LifeBuoy className="w-4 h-4" /> Liên hệ hỗ trợ
        </a>
      </div>

      {/* ═══ TAB ═══ */}
      <div className="noscroll flex items-center gap-1.5 p-1.5 rounded-full mb-5 overflow-x-auto w-full sm:w-fit"
           style={{ backgroundColor: "var(--surface-2)" }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          const n = t.id === "video" ? data.videos.length
                  : t.id === "article" ? data.articles.length
                  : data.processes.length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
                    className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-bold transition-all duration-200"
                    style={on ? { background: `linear-gradient(135deg,${brand.from},${brand.to})`, color: "#fff",
                                  boxShadow: `0 8px 18px -8px ${brand.from}` }
                              : { color: "var(--fg-muted)" }}>
              <t.icon className="w-4 h-4" /> {t.label}
              <span className="text-[11px] font-extrabold px-1.5 rounded-full tabular-nums"
                    style={on ? { backgroundColor: "rgba(255,255,255,.25)" } : { backgroundColor: "var(--surface-3)" }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div className="rounded-[var(--r)] border p-2.5 mb-5"
           style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="relative mb-2.5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--fg-subtle)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Tìm nội dung hướng dẫn…"
                 className="w-full h-11 pl-11 pr-10 rounded-full text-[13px] border-0 outline-none"
                 style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)" }} />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Xóa"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-subtle)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="noscroll flex items-center gap-2 overflow-x-auto">
          <TopicChip active={topic === "all"} onClick={() => setTopic("all")}
                     icon={Sparkles} from="#475569" to="#1e293b" label="Tất cả" count={source.length} />
          {TOPIC_KEYS.map((k) => {
            const n = source.filter((x) => x.topic === k).length;
            if (!n) return null;
            return (
              <TopicChip key={k} active={topic === k} onClick={() => setTopic(topic === k ? "all" : k)}
                         icon={TOPIC_ICON[k]} from={TOPIC[k].from} to={TOPIC[k].to}
                         label={TOPIC_LABEL[k]} count={n} />
            );
          })}
        </div>
      </div>

      {/* ═══ NỘI DUNG ═══ */}
      {current.length === 0 ? (
        <EmptyState brand={brand} onClear={() => { setTopic("all"); setSearch(""); }} />
      ) : tab === "video" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((v) => <VideoCard key={v.id} v={v} c={TOPIC[v.topic]} onOpen={() => setVideo(v)} />)}
        </div>
      ) : tab === "article" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {articles.map((a) => <ArticleCard key={a.id} a={a} c={TOPIC[a.topic]} onOpen={() => setArticle(a)} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {processes.map((p) => (
            <ProcessCard key={p.id} p={p} c={TOPIC[p.topic]}
                         open={openProcess === p.id}
                         onToggle={() => setOpenProcess(openProcess === p.id ? null : p.id)}
                         doneSteps={doneSteps} onToggleStep={(i) => toggleStep(p.id, i)} />
          ))}
        </div>
      )}

      {/* ═══ PHÍM TẮT + LIÊN HỆ ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <Panel icon={Keyboard} brand={brand} title="Mẹo & phím tắt" sub="Thao tác nhanh trong hệ thống">
          <div className="space-y-2.5">
            {data.tips.map((t) => (
              <div key={t.kbd} className="flex items-start gap-3">
                <kbd className="shrink-0 inline-flex items-center h-6 px-2 rounded-md text-[11px] font-bold font-mono whitespace-nowrap"
                     style={{ backgroundColor: "var(--surface-2)", color: "var(--fg)", border: "1px solid var(--border)" }}>
                  {t.kbd}
                </kbd>
                <span className="text-[12.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel id="lien-he" icon={LifeBuoy} brand={brand} title="Liên hệ hỗ trợ" sub="Đội ngũ trực 24/7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.contacts.map((c) => (
              <a key={c.label} href={c.href}
                 className="flex items-center gap-3 p-3 rounded-xl transition hover:bg-ink-50"
                 style={{ backgroundColor: "var(--surface-2)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                     style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
                  <c.Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: "var(--fg-subtle)" }}>{c.label}</div>
                  <div className="text-[12.5px] font-bold truncate" style={{ color: "var(--fg)" }}>{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </Panel>
      </div>

      {video && <VideoModal v={video} c={TOPIC[video.topic]} brand={brand} onClose={() => setVideo(null)} />}
      {article && <ArticleModal a={article} c={TOPIC[article.topic]} brand={brand} onClose={() => setArticle(null)} />}
    </div>
  );
}

/* ═══════════════ VIDEO ═══════════════ */
function VideoCard({ v, c, onOpen }) {
  const Icon = TOPIC_ICON[v.topic];
  const lv = LEVEL[v.level];
  return (
    <button onClick={onOpen}
            className="lift group rounded-[var(--r)] border overflow-hidden text-left flex flex-col"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${c.from}45` }}>
      <div className="relative aspect-video overflow-hidden shrink-0">
        <Cover src={v.thumb} from={c.from} to={c.to} Icon={Icon} />
        <div className="absolute inset-0"
             style={{ background: "linear-gradient(to top,rgba(15,18,24,.72),rgba(15,18,24,.08) 60%,transparent)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: "rgba(255,255,255,.92)", boxShadow: "0 8px 24px -6px rgba(0,0,0,.4)" }}>
            <Play className="w-6 h-6 ml-0.5" style={{ color: c.ink }} fill="currentColor" />
          </span>
        </div>
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold text-white tabular-nums"
              style={{ backgroundColor: "rgba(15,18,24,.78)" }}>
          <Clock className="w-3 h-3" /> {v.duration}
        </span>
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-extrabold bg-white/95"
              style={{ color: c.ink }}>
          <Icon className="w-3 h-3" /> {TOPIC_LABEL[v.topic]}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-[14.5px] font-extrabold leading-snug line-clamp-2" style={{ color: "var(--fg)" }}>
          {v.title}
        </div>
        <p className="text-[12.5px] mt-1.5 line-clamp-2 leading-relaxed flex-1" style={{ color: "var(--fg-muted)" }}>
          {v.desc}
        </p>
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <span className="inline-flex items-center px-2 h-6 rounded-full text-[11px] font-extrabold"
                style={{ backgroundColor: lv.bg, color: lv.ink }}>{lv.label}</span>
          <span className="inline-flex items-center gap-1 text-[12px] tabular-nums" style={{ color: "var(--fg-muted)" }}>
            <Eye className="w-3.5 h-3.5" /> {v.views}
          </span>
        </div>
      </div>
    </button>
  );
}

function VideoModal({ v, c, brand, onClose }) {
  const Icon = TOPIC_ICON[v.topic];
  return (
    <Modal onClose={onClose} wide icon={Video} brand={brand} title={v.title}
           sub={`${TOPIC_LABEL[v.topic]} · ${v.duration} · ${LEVEL[v.level].label}`}>
      <div className="p-5 space-y-5">
        {/* Khung phát — bản demo chưa gắn file video thật */}
        <div className="relative aspect-video rounded-2xl overflow-hidden">
          <Cover src={v.thumb} from={c.from} to={c.to} Icon={Icon} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
               style={{ background: "rgba(15,18,24,.62)" }}>
            <span className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,.94)" }}>
              <Play className="w-7 h-7 ml-1" style={{ color: c.ink }} fill="currentColor" />
            </span>
            <span className="text-[12px] font-semibold text-white/85">Bản demo — chưa gắn file video thật</span>
          </div>
        </div>

        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>{v.desc}</p>

        <div>
          <Label>Nội dung theo mốc thời gian</Label>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
            {v.chapters.map((ch, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 transition hover:bg-ink-50"
                   style={{ borderColor: "var(--border-soft)" }}>
                <span className="shrink-0 text-[11.5px] font-extrabold tabular-nums w-11" style={{ color: c.ink }}>{ch.at}</span>
                <span className="text-[13px] flex-1 min-w-0" style={{ color: "var(--fg)" }}>{ch.t}</span>
                <PlayCircle className="w-4 h-4 shrink-0" style={{ color: "var(--fg-subtle)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════ BÀI VIẾT ═══════════════ */
function ArticleCard({ a, c, onOpen }) {
  const Icon = TOPIC_ICON[a.topic];
  return (
    <button onClick={onOpen}
            className="lift rounded-[var(--r)] border overflow-hidden text-left flex"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", "--glow": `${c.from}45` }}>
      <div className="relative w-[128px] sm:w-[168px] shrink-0">
        <Cover src={a.thumb} from={c.from} to={c.to} Icon={Icon} />
      </div>
      <div className="p-4 min-w-0 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold"
                style={{ backgroundColor: c.soft, color: c.ink }}>
            <Icon className="w-3 h-3" /> {TOPIC_LABEL[a.topic]}
          </span>
          {a.pinned && (
            <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold"
                  style={{ backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
              <BadgeCheck className="w-3 h-3" /> Nên đọc
            </span>
          )}
        </div>
        <div className="text-[14.5px] font-extrabold leading-snug mt-2 line-clamp-2" style={{ color: "var(--fg)" }}>
          {a.title}
        </div>
        <p className="text-[12.5px] mt-1.5 line-clamp-2 leading-relaxed flex-1" style={{ color: "var(--fg-muted)" }}>
          {a.desc}
        </p>
        <div className="flex items-center gap-2.5 mt-3 text-[11.5px]" style={{ color: "var(--fg-subtle)" }}>
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.readTime}</span>
          <span className="opacity-40">•</span>
          <span>Cập nhật {a.updated}</span>
        </div>
      </div>
    </button>
  );
}

function ArticleModal({ a, c, brand, onClose }) {
  const Icon = TOPIC_ICON[a.topic];
  return (
    <Modal onClose={onClose} wide icon={BookOpen} brand={brand} title={a.title}
           sub={`${TOPIC_LABEL[a.topic]} · ${a.readTime} · cập nhật ${a.updated}`}>
      <div className="p-5 space-y-5">
        <div className="relative aspect-[16/6] rounded-2xl overflow-hidden">
          <Cover src={a.thumb} from={c.from} to={c.to} Icon={Icon} />
        </div>
        <p className="text-[14px] leading-relaxed font-medium" style={{ color: "var(--fg)" }}>{a.desc}</p>
        {a.body.map((sec, i) => (
          <div key={i}>
            <div className="font-display font-extrabold text-[15px] mb-2" style={{ color: "var(--fg)" }}>{sec.h}</div>
            <ul className="space-y-2">
              {sec.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: c.from }} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ═══════════════ QUY TRÌNH ═══════════════ */
function ProcessCard({ p, c, open, onToggle, doneSteps, onToggleStep }) {
  const Icon = TOPIC_ICON[p.topic];
  const done = p.steps.filter((_, i) => doneSteps[`${p.id}-${i}`]).length;
  const pct = Math.round((done / p.steps.length) * 100);

  return (
    <div className="rounded-[var(--r)] border overflow-hidden"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3.5 p-4 sm:p-5 text-left transition hover:bg-ink-50">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${c.from},${c.to})`, boxShadow: `0 6px 14px -7px ${c.from}` }}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-extrabold text-[15.5px]" style={{ color: "var(--fg)" }}>{p.title}</span>
            <span className="inline-flex items-center px-2 h-6 rounded-full text-[11px] font-extrabold"
                  style={{ backgroundColor: c.soft, color: c.ink }}>{p.steps.length} bước</span>
            <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-extrabold"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--fg-muted)" }}>
              <Timer className="w-3 h-3" /> {p.time}
            </span>
          </div>
          <p className="text-[12.5px] mt-1 truncate" style={{ color: "var(--fg-muted)" }}>{p.desc}</p>

          <div className="flex items-center gap-2.5 mt-2.5">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-[240px]" style={{ backgroundColor: "var(--surface-3)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                   style={{ width: `${pct}%`, background: `linear-gradient(90deg,${c.from},${c.to})` }} />
            </div>
            <span className="text-[11.5px] font-extrabold tabular-nums"
                  style={{ color: done === p.steps.length ? TONE.success.ink : "var(--fg-muted)" }}>
              {done}/{p.steps.length}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                     style={{ color: "var(--fg-subtle)" }} />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-1">
          <div className="border-l-2 ml-5 pl-5 space-y-3" style={{ borderColor: c.soft }}>
            {p.steps.map((s, i) => {
              const isDone = !!doneSteps[`${p.id}-${i}`];
              return (
                <div key={i} className="relative">
                  <span className="absolute -left-[27px] top-3 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
                        style={{ background: isDone
                          ? `linear-gradient(135deg,${TONE.success.from},${TONE.success.to})`
                          : `linear-gradient(135deg,${c.from},${c.to})` }}>
                    {isDone ? "✓" : i + 1}
                  </span>
                  <button onClick={() => onToggleStep(i)}
                          className="w-full text-left rounded-xl p-3.5 transition hover:bg-ink-50 flex items-start gap-3"
                          style={{ backgroundColor: "var(--surface-2)" }}>
                    {isDone
                      ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: TONE.success.dot }} />
                      : <Circle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--fg-subtle)" }} />}
                    <div className="min-w-0">
                      <div className={`text-[13.5px] font-bold ${isDone ? "line-through opacity-60" : ""}`} style={{ color: "var(--fg)" }}>
                        {s.t}
                      </div>
                      <div className="text-[12.5px] mt-0.5 leading-relaxed" style={{ color: "var(--fg-muted)" }}>{s.d}</div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {p.note && (
            <div className="flex items-start gap-2.5 mt-4 p-3.5 rounded-xl"
                 style={{ backgroundColor: TONE.warning.bg, color: TONE.warning.ink }}>
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-[12.5px] font-semibold leading-relaxed">{p.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ THÀNH PHẦN CHUNG ═══════════════ */

function Cover({ src, from, to, Icon }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [src]);
  return (
    <div className="absolute inset-0 flex items-center justify-center"
         style={{ background: `linear-gradient(135deg,${from},${to})` }}>
      {!loaded && <Icon className="w-9 h-9 text-white/45" />}
      {src && (
        <img src={src} alt="" onLoad={() => setLoaded(true)}
             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
             style={{ opacity: loaded ? 1 : 0 }} />
      )}
    </div>
  );
}

function TopicChip({ active, onClick, label, count, from, to, icon: Icon }) {
  return (
    <button onClick={onClick}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2 rounded-full text-[12px] font-bold border transition-all duration-200"
            style={active
              ? { background: `linear-gradient(135deg,${from},${to})`, color: "#fff", borderColor: "transparent",
                  boxShadow: `0 6px 14px -6px ${from}` }
              : { backgroundColor: "var(--surface-2)", color: "var(--fg-muted)", borderColor: "transparent" }}>
      <Icon className="w-3.5 h-3.5 shrink-0" style={active ? undefined : { color: from }} />
      {label}
      <span className="text-[10.5px] font-extrabold px-1 rounded-full tabular-nums"
            style={active ? { backgroundColor: "rgba(255,255,255,.25)" } : { backgroundColor: "var(--surface-3)" }}>
        {count}
      </span>
    </button>
  );
}

function Panel({ id, icon: Icon, title, sub, brand, children }) {
  return (
    <div id={id} className="rounded-[var(--r)] border overflow-hidden scroll-mt-6"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border-soft)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
             style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[14px] truncate" style={{ color: "var(--fg)" }}>{title}</div>
          {sub && <div className="text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Modal({ children, onClose, icon: Icon, title, sub, brand, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
         style={{ backgroundColor: "rgba(15,18,24,.55)", backdropFilter: "blur(6px)" }}
         onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] rounded-[20px] overflow-hidden flex flex-col`}
           style={{ backgroundColor: "var(--surface)", boxShadow: "0 30px 70px -20px rgba(0,0,0,.5)" }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b shrink-0"
             style={{ borderColor: "var(--border-soft)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                 style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[16px] truncate" style={{ color: "var(--fg)" }}>{title}</div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--fg-muted)" }}>{sub}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-ink-100 shrink-0"
                  style={{ color: "var(--fg-muted)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div className="text-[10.5px] uppercase tracking-wider font-extrabold mb-2.5" style={{ color: "var(--fg-subtle)" }}>
      {children}
    </div>
  );
}

function EmptyState({ onClear, brand }) {
  return (
    <div className="rounded-[var(--r)] border py-20 text-center"
         style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="floaty w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4"
           style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
        <Search className="w-7 h-7" />
      </div>
      <div className="text-[16px] font-bold" style={{ color: "var(--fg)" }}>Không tìm thấy nội dung nào</div>
      <div className="text-[13px] mt-1" style={{ color: "var(--fg-muted)" }}>Thử đổi từ khóa hoặc bỏ bộ lọc chủ đề.</div>
      <button onClick={onClear} className="mt-5 h-10 px-5 rounded-full text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg,${brand.from},${brand.to})` }}>
        Xóa bộ lọc
      </button>
    </div>
  );
}

/* ═══════════════ DỮ LIỆU ═══════════════ */
const IMG = {
  basic:     "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop&q=80",
  room:      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=450&fit=crop&q=80",
  booking:   "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=450&fit=crop&q=80",
  guest:     "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop&q=80",
  fnb:       "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=450&fit=crop&q=80",
  report:    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&q=80",
  marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&q=80",
};

function buildData() {
  const videos = [
    {
      id: "v1", topic: "basic", level: "beginner", duration: "6:12", views: "1.2K", thumb: IMG.basic,
      title: "Làm quen hệ thống trong 6 phút",
      desc: "Tổng quan sidebar, thanh tìm kiếm, bộ chọn chi nhánh và cách đọc Dashboard.",
      chapters: [
        { at: "0:00", t: "Đăng nhập và giao diện tổng quan" },
        { at: "1:20", t: "Bộ chọn chi nhánh — lọc dữ liệu toàn hệ thống" },
        { at: "2:45", t: "Thanh tìm kiếm nhanh Ctrl + K" },
        { at: "4:10", t: "Đọc các chỉ số trên Dashboard" },
      ],
    },
    {
      id: "v2", topic: "room", level: "beginner", duration: "8:40", views: "980", thumb: IMG.room,
      title: "Quản lý phòng và sơ đồ trạng thái",
      desc: "Thêm phòng hàng loạt theo dải số, đổi trạng thái và hiểu bảng màu sơ đồ phòng.",
      chapters: [
        { at: "0:00", t: "Cấu trúc trang Phòng" },
        { at: "2:05", t: "Thêm nhiều phòng cùng lúc (101–120)" },
        { at: "4:30", t: "Bảng màu trạng thái: trống · đang ở · dọn · bảo trì" },
        { at: "6:50", t: "Lọc theo tầng và hạng phòng" },
      ],
    },
    {
      id: "v3", topic: "booking", level: "medium", duration: "11:05", views: "1.6K", thumb: IMG.booking,
      title: "Tạo booking, check-in và check-out",
      desc: "Toàn bộ vòng đời một đơn đặt phòng, từ lúc nhận yêu cầu đến khi xuất hóa đơn.",
      chapters: [
        { at: "0:00", t: "Tạo booking mới" },
        { at: "3:15", t: "Gán khách và chọn phòng trống" },
        { at: "6:00", t: "Check-in — chuyển trạng thái tự động" },
        { at: "8:30", t: "Check-out và xuất hóa đơn" },
      ],
    },
    {
      id: "v4", topic: "fnb", level: "medium", duration: "9:28", views: "742", thumb: IMG.fnb,
      title: "Vận hành nhà hàng: KDS và sơ đồ bàn",
      desc: "Theo dõi đơn bếp thời gian thực, chuyển bước món và quản lý sơ đồ 35 bàn mỗi chi nhánh.",
      chapters: [
        { at: "0:00", t: "Màn hình bếp (KDS) hoạt động thế nào" },
        { at: "2:40", t: "Nhấn vào đơn để chuyển bước" },
        { at: "5:10", t: "Sơ đồ bàn và 4 trạng thái" },
        { at: "7:20", t: "Cảnh báo nguyên liệu sắp hết" },
      ],
    },
    {
      id: "v5", topic: "marketing", level: "advanced", duration: "14:32", views: "634", thumb: IMG.marketing,
      title: "Marketing Hub và automation đa kênh",
      desc: "Kết nối Facebook, Zalo, TikTok; lên lịch bài viết và dựng workflow tự động đăng.",
      chapters: [
        { at: "0:00", t: "Kết nối các kênh" },
        { at: "3:50", t: "Lịch đăng theo tuần" },
        { at: "7:15", t: "Tạo workflow automation" },
        { at: "11:00", t: "Đọc báo cáo hiệu quả" },
      ],
    },
    {
      id: "v6", topic: "report", level: "advanced", duration: "10:18", views: "512", thumb: IMG.report,
      title: "Đọc báo cáo doanh thu và dự báo",
      desc: "Phân biệt ADR, RevPAR, tỉ lệ lấp đầy và cách dùng biểu đồ dự báo 14 ngày.",
      chapters: [
        { at: "0:00", t: "Các chỉ số cốt lõi" },
        { at: "3:30", t: "So sánh giữa các chi nhánh" },
        { at: "6:40", t: "Biểu đồ dự báo và cách diễn giải" },
        { at: "8:50", t: "Xuất báo cáo" },
      ],
    },
  ];

  const articles = [
    {
      id: "a1", topic: "basic", readTime: "4 phút đọc", updated: "28/07/2026", pinned: true, thumb: IMG.basic,
      title: "Bắt đầu nhanh: 5 việc cần làm trong ngày đầu tiên",
      desc: "Danh sách kiểm tra ngắn giúp quản lý mới thiết lập xong hệ thống trong một buổi.",
      body: [
        { h: "Thiết lập ban đầu", items: [
          "Kiểm tra thông tin 4 chi nhánh trong mục Khu du lịch.",
          "Vào Cài đặt → Tuỳ chỉnh giao diện để chọn màu chủ đạo và chế độ sáng/tối.",
          "Gán nhân viên vào đúng chi nhánh phụ trách.",
        ]},
        { h: "Kiểm tra dữ liệu", items: [
          "Đối chiếu số phòng thực tế với sơ đồ trong trang Phòng & Căn.",
          "Xem lại bảng giá trong mục Dịch vụ trước khi mở bán.",
        ]},
      ],
    },
    {
      id: "a2", topic: "booking", readTime: "6 phút đọc", updated: "26/07/2026", pinned: true, thumb: IMG.booking,
      title: "Xử lý booking trùng phòng và hủy phòng",
      desc: "Cách hệ thống chặn trùng lịch, quy tắc hoàn tiền và thao tác đổi phòng cho khách.",
      body: [
        { h: "Khi phát hiện trùng lịch", items: [
          "Hệ thống cảnh báo ngay khi chọn phòng đã có booking chồng ngày.",
          "Dùng nút Đổi phòng để chuyển sang phòng trống cùng hạng.",
          "Nếu hết phòng cùng hạng, nâng hạng miễn phí và ghi chú lý do.",
        ]},
        { h: "Chính sách hủy", items: [
          "Hủy trước 48 giờ: hoàn 100%.",
          "Hủy trong 24–48 giờ: hoàn 50%.",
          "Hủy dưới 24 giờ hoặc không đến: không hoàn.",
        ]},
      ],
    },
    {
      id: "a3", topic: "guest", readTime: "5 phút đọc", updated: "24/07/2026", pinned: false, thumb: IMG.guest,
      title: "Phân hạng khách hàng và chương trình thành viên",
      desc: "Năm hạng thành viên, điều kiện lên hạng và quyền lợi đi kèm từng hạng.",
      body: [
        { h: "Năm hạng thành viên", items: [
          "Thường · Bạc · Vàng · Bạch kim · Kim cương.",
          "Hạng tính theo tổng số lần lưu trú, cập nhật tự động sau mỗi lần trả phòng.",
        ]},
        { h: "Quyền lợi nổi bật", items: [
          "Vàng trở lên: nhận phòng sớm và trả phòng muộn miễn phí.",
          "Bạch kim và Kim cương: nâng hạng phòng khi còn trống.",
        ]},
      ],
    },
    {
      id: "a4", topic: "fnb", readTime: "7 phút đọc", updated: "22/07/2026", pinned: false, thumb: IMG.fnb,
      title: "Quản lý tồn kho bếp và đặt bổ sung",
      desc: "Ngưỡng cảnh báo, cách đọc thanh tồn kho và quy trình đặt hàng nhà cung cấp.",
      body: [
        { h: "Ba mức cảnh báo", items: [
          "Khẩn (đỏ): còn đủ dùng dưới 2 ngày — cần đặt ngay.",
          "Sắp hết (cam): còn 3–7 ngày — lên kế hoạch đặt.",
          "Ổn (xanh): trên 7 ngày.",
        ]},
        { h: "Đặt bổ sung", items: [
          "Nhấn Đặt thêm ngay trên dòng nguyên liệu để tạo đơn mua hàng.",
          "Theo dõi tiến độ trong mục Đơn mua hàng hôm nay.",
        ]},
      ],
    },
    {
      id: "a5", topic: "report", readTime: "8 phút đọc", updated: "20/07/2026", pinned: false, thumb: IMG.report,
      title: "Hiểu đúng ADR, RevPAR và tỉ lệ lấp đầy",
      desc: "Ba chỉ số quan trọng nhất của ngành khách sạn, công thức và cách dùng khi ra quyết định.",
      body: [
        { h: "Công thức", items: [
          "ADR = Doanh thu phòng ÷ Số phòng đã bán.",
          "RevPAR = Doanh thu phòng ÷ Tổng số phòng khả dụng.",
          "Tỉ lệ lấp đầy = Số phòng đã bán ÷ Tổng số phòng khả dụng.",
        ]},
        { h: "Dùng khi nào", items: [
          "ADR thấp mà lấp đầy cao: đang bán rẻ, cân nhắc tăng giá.",
          "ADR cao mà lấp đầy thấp: giá đang cao so với thị trường.",
        ]},
      ],
    },
    {
      id: "a6", topic: "marketing", readTime: "5 phút đọc", updated: "18/07/2026", pinned: false, thumb: IMG.marketing,
      title: "Chuẩn nội dung khi đăng đa kênh",
      desc: "Kích thước ảnh, độ dài chú thích và thời điểm đăng phù hợp cho từng nền tảng.",
      body: [
        { h: "Kích thước ảnh", items: [
          "Facebook và Website: tỉ lệ 16:9.",
          "Instagram feed: 1:1 · Reels và TikTok: 9:16.",
        ]},
        { h: "Thời điểm đăng tốt", items: [
          "Zalo OA: 11:00–13:00 và 19:00–21:00.",
          "TikTok: 20:00–22:00 các ngày trong tuần.",
        ]},
      ],
    },
  ];

  const processes = [
    {
      id: "p1", topic: "booking", title: "Quy trình nhận phòng cho khách", time: "~5 phút",
      desc: "Từ lúc khách đến quầy đến khi bàn giao chìa khóa",
      note: "Nếu khách đến sớm mà phòng chưa dọn xong, tạo yêu cầu ưu tiên cho buồng phòng ngay trên sơ đồ phòng.",
      steps: [
        { t: "Tra cứu booking", d: "Vào Đặt phòng, tìm theo mã booking, tên hoặc số điện thoại khách." },
        { t: "Đối chiếu giấy tờ", d: "Kiểm tra CCCD hoặc hộ chiếu khớp với thông tin trên booking." },
        { t: "Xác nhận phòng và dịch vụ kèm", d: "Kiểm tra hạng phòng, số đêm và các dịch vụ đã đặt trước." },
        { t: "Thu tiền cọc", d: "Ghi nhận khoản đặt cọc và chọn hình thức thanh toán." },
        { t: "Nhấn Check-in", d: "Trạng thái phòng tự chuyển sang \"Đang ở\", đồng hồ lưu trú bắt đầu đếm." },
        { t: "Bàn giao chìa khóa", d: "Hướng dẫn khách về tiện ích và giờ phục vụ ăn sáng." },
      ],
    },
    {
      id: "p2", topic: "booking", title: "Quy trình trả phòng và xuất hóa đơn", time: "~7 phút",
      desc: "Đối soát chi phí phát sinh và hoàn tất thanh toán",
      note: "Luôn kiểm tra minibar và dịch vụ phát sinh trước khi chốt hóa đơn — đây là khoản hay bị bỏ sót nhất.",
      steps: [
        { t: "Mở booking đang lưu trú", d: "Vào Đặt phòng, lọc trạng thái \"Đang ở\" rồi chọn đúng phòng." },
        { t: "Kiểm tra phát sinh", d: "Rà soát minibar, spa, giặt ủi, nhà hàng và các dịch vụ khác." },
        { t: "Đối soát với khách", d: "Trình bảng kê chi tiết, giải thích từng khoản phát sinh." },
        { t: "Thu phần còn lại", d: "Trừ tiền cọc, thu số còn thiếu hoặc hoàn lại nếu dư." },
        { t: "Nhấn Check-out", d: "Phòng chuyển sang \"Đang dọn\", doanh thu ghi nhận vào báo cáo ngày." },
        { t: "Gửi hóa đơn", d: "Xuất hóa đơn điện tử và gửi qua email cho khách." },
      ],
    },
    {
      id: "p3", topic: "room", title: "Quy trình dọn phòng và bàn giao", time: "~30 phút",
      desc: "Chuẩn buồng phòng từ lúc khách trả đến khi sẵn sàng bán lại",
      steps: [
        { t: "Nhận thông báo", d: "Phòng chuyển sang \"Đang dọn\" ngay sau khi khách trả phòng." },
        { t: "Kiểm tra đồ thất lạc", d: "Rà soát đồ khách để quên, ghi nhận vào sổ nếu có." },
        { t: "Dọn và thay đồ vải", d: "Thay ga, khăn, bổ sung tiện ích phòng tắm." },
        { t: "Nạp lại minibar", d: "Bổ sung theo tiêu chuẩn hạng phòng, ghi nhận phần đã dùng." },
        { t: "Kiểm tra thiết bị", d: "Điều hòa, TV, đèn, khóa cửa, wifi. Có lỗi thì tạo phiếu kỹ thuật." },
        { t: "Chuyển trạng thái Trống", d: "Phòng lập tức sẵn sàng cho booking mới." },
      ],
    },
    {
      id: "p4", topic: "fnb", title: "Quy trình xử lý đơn bếp", time: "~15 phút",
      desc: "Từ khi nhận order đến khi món ra bàn",
      note: "Đơn quá thời gian mục tiêu sẽ đổi màu đỏ trên KDS — ưu tiên xử lý các đơn này trước.",
      steps: [
        { t: "Đơn hiện trên KDS", d: "Order từ bàn đổ về màn hình bếp kèm số bàn và thời gian mục tiêu." },
        { t: "Bếp nhận đơn", d: "Nhấn vào đơn để chuyển sang trạng thái đang chế biến." },
        { t: "Chế biến theo khu", d: "Đơn tự phân về bếp nóng, bếp lạnh hoặc lò nướng." },
        { t: "Báo món xong", d: "Nhấn chuyển bước, phục vụ nhận thông báo ngay." },
        { t: "Phục vụ ra món", d: "Kiểm tra đúng bàn, đúng món trước khi mang ra." },
        { t: "Đóng đơn", d: "Đơn rời khỏi KDS và được ghi nhận vào doanh thu ca." },
      ],
    },
    {
      id: "p5", topic: "guest", title: "Quy trình xử lý khiếu nại", time: "~20 phút",
      desc: "Tiếp nhận, xử lý và ghi nhận phản ánh của khách",
      note: "Mọi khiếu nại đều phải ghi vào hồ sơ khách, kể cả khi đã xử lý xong tại chỗ.",
      steps: [
        { t: "Lắng nghe và ghi nhận", d: "Để khách trình bày hết, ghi lại thời gian và nội dung cụ thể." },
        { t: "Xin lỗi và xác nhận", d: "Nhắc lại vấn đề để khách thấy mình đã hiểu đúng." },
        { t: "Phân loại mức độ", d: "Thấp, trung bình hoặc cao — mức cao phải báo quản lý trong 5 phút." },
        { t: "Đưa phương án", d: "Đổi phòng, giảm giá, tặng dịch vụ hoặc hoàn tiền tùy mức độ." },
        { t: "Theo dõi kết quả", d: "Liên hệ lại sau khi xử lý để xác nhận khách đã hài lòng." },
        { t: "Ghi vào hồ sơ khách", d: "Lưu vào mục Ghi chú để lần sau phục vụ tốt hơn." },
      ],
    },
    {
      id: "p6", topic: "basic", title: "Quy trình thêm chi nhánh mới", time: "~10 phút",
      desc: "Khai báo và đưa một khu nghỉ dưỡng mới vào vận hành",
      steps: [
        { t: "Vào Khu du lịch → Thêm chi nhánh", d: "Mở form khai báo thông tin cơ bản." },
        { t: "Điền thông tin", d: "Tên hiển thị, mã, địa chỉ, hotline, email và người quản lý." },
        { t: "Chọn tiện ích", d: "Đánh dấu hồ bơi, spa, gym, nhà hàng, bãi đỗ xe…" },
        { t: "Đặt giá khởi điểm", d: "Giá phòng trung bình để hệ thống gợi ý khi tạo booking." },
        { t: "Thêm phòng", d: "Vào Phòng → thêm theo dải số để tạo nhanh hàng loạt." },
        { t: "Gán nhân viên", d: "Vào Nhân viên → chọn người → gán chi nhánh phụ trách." },
      ],
    },
  ];

  const tips = [
    { kbd: "Ctrl + K", desc: "Mở nhanh thanh tìm kiếm trên Topbar — gõ phòng, booking, khách hàng, nhân viên." },
    { kbd: "Chọn chi nhánh", desc: "Dropdown góc phải Topbar lọc dữ liệu toàn hệ thống, chọn \"Tất cả\" để gộp." },
    { kbd: "Nhấn số liệu", desc: "Trên Dashboard, nhấn vào thẻ chỉ số bất kỳ để xem chi tiết theo chi nhánh." },
    { kbd: "Nhấn đúp dòng", desc: "Mở nhanh chi tiết trong bảng Phòng, Đặt phòng, Khách hàng, Nhân viên." },
    { kbd: "Esc", desc: "Đóng hộp thoại hoặc bảng chi tiết đang mở." },
    { kbd: "Đổi giao diện", desc: "Cài đặt → Tuỳ chỉnh giao diện: màu chủ đạo, sáng/tối, đơn sắc hoặc đa sắc." },
  ];

  const contacts = [
    { Icon: Phone, label: "Hotline", value: "1900 6868 · 24/7", href: "tel:19006868" },
    { Icon: Mail, label: "Email", value: "support@lepalmier.vn", href: "mailto:support@lepalmier.vn" },
    { Icon: MessageSquare, label: "Chat nội bộ", value: "8:00 – 22:00 hằng ngày", href: "/messages" },
    { Icon: Globe, label: "Cổng hỗ trợ", value: "help.lepalmier.vn", href: "https://help.lepalmier.vn" },
  ];

  return { videos, articles, processes, tips, contacts };
}
