export default function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-2 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-ink-100 flex-wrap">
          <div className="min-w-0 flex-1">
            {title && <h3 className="font-display font-semibold text-ink-900 truncate text-[14px] sm:text-base">{title}</h3>}
            {subtitle && <p className="text-[11px] sm:text-xs text-ink-500 mt-0.5 truncate hidden sm:block">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex flex-wrap gap-2">{action}</div>}
        </div>
      )}
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
}