"use client";

export function LoadingState({
  label,
  helper,
}: {
  label: string;
  helper?: string;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 animate-fade-in-up">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
        {/* Spinning ring */}
        <svg className="h-20 w-20 animate-gentle-spin" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" stroke="#E8E6E1" strokeWidth="3" />
          <path
            d="M40 4a36 36 0 0 1 36 36"
            stroke="#C4841D"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {/* Center icon */}
        <div className="absolute flex h-10 w-10 items-center justify-center rounded-xl bg-amber-glow">
          <svg className="h-5 w-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-ink">{label}</p>
        {helper && <p className="text-sm text-ink-muted">{helper}</p>}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber animate-bounce" />
      </div>
    </div>
  );
}
