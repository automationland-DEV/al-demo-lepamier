export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 tracking-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-500 mt-1 max-w-2xl break-words">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:flex-nowrap sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
