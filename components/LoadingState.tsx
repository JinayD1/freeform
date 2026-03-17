"use client";

import { useEffect, useState } from "react";

const ANALYZING_STEPS = [
  "Recognizing product",
  "Detecting condition",
  "Identifying category",
  "Reading style & details",
];

const GENERATING_STEPS = [
  "Writing title",
  "Estimating price",
  "Finding comps",
  "Formatting for publish",
];

export function LoadingState({
  label,
  helper,
  variant = "light",
  phase,
  previewUrl,
}: {
  label: string;
  helper?: string;
  variant?: "light" | "dark";
  phase?: "analyzing" | "generating";
  previewUrl?: string | null;
}) {
  const isDark = variant === "dark";
  const steps = phase === "analyzing" ? ANALYZING_STEPS : GENERATING_STEPS;
  const [completedIndex, setCompletedIndex] = useState(0);

  useEffect(() => {
    if (phase !== "analyzing" && phase !== "generating") return;
    setCompletedIndex(0);
    const interval = setInterval(() => {
      setCompletedIndex((prev) => {
        if (prev >= steps.length) return prev;
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [phase, steps.length]);

  return (
    <div className="relative w-full max-w-xl">
      {isDark && (
        <div
          className="absolute -inset-3 rounded-3xl bg-slate-900/20 backdrop-blur-md sm:-inset-4"
          aria-hidden
        />
      )}

      <div
        className={`relative flex flex-col rounded-2xl border px-6 py-10 backdrop-blur-xl transition sm:px-8 sm:py-12 md:px-10 md:py-14 ${
          isDark
            ? "border-white/[0.06] bg-white/[0.04]"
            : "border-slate-200/80 bg-white/70"
        } ${previewUrl && phase ? "sm:flex-row sm:items-start sm:gap-6 md:gap-8" : "items-center gap-5 sm:gap-6"}`}
      >
        {/* Image preview in-context during analyzing/generating */}
        {isDark && previewUrl && phase && (
          <div className="flex shrink-0 justify-center sm:justify-start">
            <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:h-24 sm:w-24 md:h-28 md:w-28">
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className={`flex flex-1 flex-col min-w-0 ${previewUrl && phase ? "items-start text-left" : "items-center text-center"} gap-5 sm:gap-6`}>
          {(!phase || (phase && steps.length === 0)) ? (
            <>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12 ${
                  isDark
                    ? "border-white/[0.15] border-t-white/40 animate-pulse-soft"
                    : "border-slate-200 border-t-slate-600"
                } ${previewUrl && phase ? "sm:self-start" : ""}`}
              >
                <span
                  className={`h-4 w-4 animate-spin rounded-full border-2 sm:h-5 sm:w-5 ${
                    isDark
                      ? "border-white/[0.15] border-t-white/50"
                      : "border-slate-300 border-t-slate-600"
                  }`}
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <p
                  className={`text-sm font-medium tracking-tight sm:text-base ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {label}
                </p>
                {helper && (
                  <p className="max-w-sm text-xs leading-relaxed text-slate-500 sm:text-sm">
                    {helper}
                  </p>
                )}
                {isDark && (
                  <div className="flex flex-col gap-1.5 pt-1 sm:gap-2 sm:pt-2" aria-hidden>
                    <div className="h-1.5 w-full max-w-[160px] rounded-full animate-shimmer sm:max-w-[200px]" />
                    <div className="h-1.5 w-full max-w-[200px] rounded-full animate-shimmer" />
                    <div className="h-1.5 w-full max-w-[140px] rounded-full animate-shimmer" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 sm:h-10 sm:w-10 ${
                    isDark
                      ? "border-white/[0.15] border-t-white/40"
                      : "border-slate-200 border-t-slate-600"
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 animate-spin rounded-full border-2 sm:h-4 sm:w-4 ${
                      isDark
                        ? "border-white/[0.15] border-t-white/50"
                        : "border-slate-300 border-t-slate-600"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium tracking-tight sm:text-base ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {label}
                  </p>
                  {helper && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      {helper}
                    </p>
                  )}
                </div>
              </div>

              <ul className="w-full space-y-1.5 sm:space-y-2" role="list" aria-label="Progress">
                {steps.map((stepLabel, i) => {
                  const done = i < completedIndex;
                  const active = i === completedIndex;
                  return (
                    <li
                      key={stepLabel}
                      className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                        done ? "opacity-100" : active ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      {done ? (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-slate-300"
                          aria-hidden
                        >
                          <svg
                            className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      ) : active ? (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.2] border-t-white/50"
                          aria-hidden
                        >
                          <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white/[0.15] border-t-white/50" />
                        </span>
                      ) : (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08]"
                          aria-hidden
                        />
                      )}
                      <span
                        className={
                          done
                            ? "text-slate-400"
                            : active
                              ? "text-slate-200 font-medium"
                              : "text-slate-500"
                        }
                      >
                        {stepLabel}
                        {active && (
                          <span className="ml-1.5 text-slate-500">...</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
