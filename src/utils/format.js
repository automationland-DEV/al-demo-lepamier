export const formatVND = (value) => {
  if (value == null) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString("vi-VN") + " đ";
};

export const formatVNDFull = (value) =>
  new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";

export const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatRelativeTime = (str) => str;