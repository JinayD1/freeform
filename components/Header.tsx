"use client";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Resale List
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Settings
        </button>
      </div>
    </header>
  );
}
