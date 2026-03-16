"use client";

export function LoadingState({
  label,
  helper,
}: {
  label: string;
  helper?: string;
}) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white/70 px-6 py-10 shadow-sm backdrop-blur-sm transition">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-slate-700 bg-slate-50">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      </div>
    </div>
  );
}

