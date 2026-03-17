"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

const DELAY_MS = 1400;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function EtsyChatbot({
  listingTitle,
  onComplete,
}: {
  listingTitle: string;
  onComplete: () => void;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const runFallback = useCallback(() => {
    setMessages([
      "Uploading to Etsy...",
      "Your listing is now live on Etsy!",
      `Until now, ${rand(200, 420)} people have seen your listing.`,
      `${rand(8, 28)} people have added this to their favorites.`,
      `${rand(3, 14)} people have this in their cart.`,
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    api
      .simulateEtsyUpdates({ listingTitle: listingTitle || "Your listing" })
      .then((data: { messages?: string[]; error?: string }) => {
        if (data.messages?.length) {
          setMessages(data.messages);
        } else {
          runFallback();
        }
      })
      .catch(() => runFallback())
      .finally(() => setLoading(false));
  }, [listingTitle, runFallback]);

  useEffect(() => {
    if (loading || visibleCount >= messages.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), DELAY_MS);
    return () => clearTimeout(t);
  }, [loading, visibleCount, messages.length]);

  const allShown = !loading && messages.length > 0 && visibleCount >= messages.length;

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F56400] text-white">
            <span className="text-sm font-bold">E</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Etsy listing updates</p>
            <p className="text-xs text-slate-500">Simulated for demo</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 min-h-[220px]">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
              </span>
              <span className="text-sm">Preparing updates…</span>
            </div>
          )}

          {messages.slice(0, visibleCount).map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
                {text}
              </div>
            </div>
          ))}

          {!loading && visibleCount < messages.length && messages.length > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
              </span>
            </div>
          )}
        </div>

        {allShown && (
          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={onComplete}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              View your listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
