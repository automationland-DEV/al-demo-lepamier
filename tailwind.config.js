/** @type {import('tailwindcss').Config} */

/* Condo HUB — Design System v4 "Palmier Riviera".
 *
 * Nguồn màu thật của hệ thống là CSS variable trong src/index.css, không
 * phải file này. Các thang dưới đây chỉ tồn tại vì ~20 trang chưa migrate
 * còn viết `text-ink-500`, `bg-brand-600`… trực tiếp. Chúng đã được chỉnh
 * sang tông đất ấm để nếu lớp alias trong index.css có sót chỗ nào thì
 * màu rơi ra vẫn nằm trong bảng màu v4, không phải xanh dương của v3.
 *
 * Code mới: dùng var(--*) hoặc usePalette(), không dùng brand-* / ink-*.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* Màu nhà — ô-liu sâu (bộ sưu tập mặc định) */
        brand: {
          50: "#f0f3ef",
          100: "#e4eae3",
          200: "#c9d5c7",
          300: "#a4b8a2",
          400: "#719079",
          500: "#4a6b57",
          600: "#3a5b4a",
          700: "#2f4a3c",
          800: "#23372c",
          900: "#1a2921",
          950: "#101a14",
        },
        /* Mực — than ngả ô-liu, ấm chứ không xanh lạnh như v3 */
        ink: {
          50: "#f7f5f0",
          100: "#ebe6dc",
          200: "#ded8cb",
          300: "#c2bcac",
          400: "#6e7368",
          500: "#4e534a",
          600: "#40453c",
          700: "#343830",
          800: "#272a24",
          900: "#191c16",
          950: "#0e100c",
        },
        /* Kim loại — đồng thau. Dùng dè, xem Design.md §2.2 */
        metal: {
          50: "#f8f3e9",
          100: "#f2e9da",
          200: "#e4d2ae",
          300: "#cbaa77",
          400: "#b99a5b",
          500: "#a8834b",
          600: "#8d6c3c",
          700: "#7a5d2e",
          800: "#5c4623",
          900: "#3f301a",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        /* Chỉ dùng cho tiêu đề trang/section, LUÔN weight 400-500 */
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
      borderRadius: {
        /* Hình học v4: thẻ 6px, control 4px. Không còn rounded-full cho nút. */
        card: "6px",
        ctl: "4px",
      },
      boxShadow: {
        /* Viền là công cụ chính, bóng gần như không tồn tại */
        card: "0 1px 2px rgba(25, 28, 22, .04)",
        pop: "0 16px 48px -24px rgba(25, 28, 22, .28)",
        modal: "0 32px 80px -32px rgba(25, 28, 22, .42)",
      },
      letterSpacing: {
        eyebrow: "0.16em",
      },
      backgroundImage: {
        /* v4 không dùng gradient thương hiệu — giữ khóa này để trang chưa
         * migrate không lỗi build; index.css đã ép nó về màu phẳng. */
        "brand-gradient": "none",
        "soft-grid":
          "radial-gradient(circle at 1px 1px, rgba(25,28,22,0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
