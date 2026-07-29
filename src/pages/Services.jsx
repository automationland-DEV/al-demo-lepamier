import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { Icons } from "../components/Icons";
import { serviceList } from "../data/mockData";
import { formatVNDFull } from "../utils/format";

const { ConciergeBell, Plus, Edit2, Trash2, Search, Filter } = Icons;

const CATEGORY_COLORS = {
  "Ăn uống": "bg-amber-100 text-amber-700",
  "Sức khỏe": "bg-blue-100 text-blue-700",
  "Di chuyển": "bg-blue-100 text-blue-700",
  "Tiện ích": "bg-violet-100 text-violet-700",
  "Sự kiện": "bg-rose-100 text-rose-700",
  "Trải nghiệm": "bg-brand-100 text-brand-700",
};

export default function Services() {
  const categories = Object.keys(CATEGORY_COLORS);

  return (
    <div>
      <PageHeader
        title="Quản lý dịch vụ & tiện ích"
        subtitle={`${serviceList.length} dịch vụ đang cung cấp tại hệ thống`}
        actions={
          <>
            <button className="btn-outline"><Filter className="w-4 h-4" /> Lọc</button>
            <button className="btn-primary"><Plus className="w-4 h-4" /> Thêm dịch vụ</button>
          </>
        }
      />

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {categories.map((cat) => {
          const count = serviceList.filter((s) => s.category === cat).length;
          return (
            <Card key={cat} className="text-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${CATEGORY_COLORS[cat]}`}>
                <ConciergeBell className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-ink-900 truncate">{cat}</div>
              <div className="text-xs text-ink-500 mt-1">{count} dịch vụ</div>
            </Card>
          );
        })}
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {serviceList.map((s) => (
          <Card key={s.id} className="hover:shadow-pop hover:-translate-y-0.5 transition group p-3 sm:p-5">
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLORS[s.category]}`}>
                <ConciergeBell className="w-5 h-5" />
              </div>
              <span className={`badge ${CATEGORY_COLORS[s.category]} truncate`}>{s.category}</span>
            </div>
            <h3 className="font-display font-bold text-ink-900 text-base sm:text-lg truncate">{s.name}</h3>
            <div className="mt-1 text-xs text-ink-500">Mã: {s.id}</div>
            <div className="mt-4 pt-4 border-t border-ink-100 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-ink-500">Đơn giá</div>
                <div className="font-bold text-ink-900 text-base sm:text-lg truncate">{formatVNDFull(s.price)}</div>
                <div className="text-xs text-ink-500">/{s.unit}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-600"><Edit2 className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}