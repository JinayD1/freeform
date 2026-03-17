"use client";

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 px-4 pt-3 sm:px-6 sm:pt-4">
      <nav
        className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/[0.06] bg-slate-900/50 px-3 py-2.5 backdrop-blur-xl sm:gap-4 sm:px-4 sm:py-2.5"
        aria-label="Main"
      >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm"
            aria-hidden
          >
            R
          </div>
          <span className="hidden truncate text-sm font-medium text-slate-300 sm:inline">
            Resale List
          </span>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6 sm:gap-8">
          <a
            href="#"
            className="text-xs text-slate-400 transition hover:text-slate-200 sm:text-sm"
          >
            How it works
          </a>
          <a
            href="#"
            className="text-xs text-slate-400 transition hover:text-slate-200 sm:text-sm"
          >
            Pricing
          </a>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 sm:px-4 sm:py-2 sm:text-sm"
          >
            Get started
          </button>
        </div>
      </nav>
    </header>
  );
}
