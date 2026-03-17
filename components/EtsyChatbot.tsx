"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { api } from "@/lib/api";

type ChatMsg = { role: "user" | "bot"; text: string };

export function EtsyChatbot({
  listingTitle,
  onComplete,
}: {
  listingTitle: string;
  onComplete: () => void;
}) {
  const suggestions = useMemo(
    () => [
      "How many views does my product have?",
      "Check inbox for any responses",
      "Is my listing live yet?",
      "Any pricing suggestions?",
    ],
    []
  );

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      role: "bot",
      text: `Your listing "${listingTitle}" is being set up. Ask me about views, favorites, carts, or posting status.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, sending]);

  const sendMessage = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || sending) return;
    setDraft("");
    setChat((c) => [...c, { role: "user", text: prompt }]);
    setSending(true);
    try {
      const result = await api.simulateChat({ prompt, listingTitle });
      if (result?.error) throw new Error(result.error);
      const reply = result?.reply || "Done — anything else you want to check?";
      setChat((c) => [...c, { role: "bot", text: reply }]);
    } catch (err) {
      setChat((c) => [
        ...c,
        {
          role: "bot",
          text: err instanceof Error ? err.message : "Chat failed — please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-lg animate-fade-in-up">
      {/* Chat header */}
      <div className="mb-4 text-center">
        <h2 className="font-serif text-2xl text-ink">Etsy Assistant</h2>
        <p className="mt-1 text-sm text-ink-muted">Simulated listing updates for your demo</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
        {/* Status bar */}
        <div className="flex items-center gap-3 border-b border-border-light bg-cream px-5 py-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-etsy text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">Listing Updates</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span className="text-xs text-ink-muted">Active</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex flex-col gap-3 p-5 min-h-[240px] max-h-[380px] overflow-y-auto">
          {chat.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-ink text-cream"
                    : "rounded-bl-md bg-cream-dark text-ink"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="rounded-2xl rounded-bl-md bg-cream-dark px-4 py-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border-light bg-cream/50 px-5 py-4 space-y-3">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                disabled={sending}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-light transition-all hover:border-amber hover:bg-amber-glow hover:text-amber disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask the Etsy assistant..."
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage(draft);
                }
              }}
            />
            <button
              type="button"
              disabled={sending || !draft.trim()}
              onClick={() => sendMessage(draft)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-cream transition-all hover:bg-ink-light disabled:opacity-40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Continue button */}
          <button
            type="button"
            onClick={onComplete}
            className="w-full rounded-xl bg-amber px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-dark hover:shadow-md"
          >
            Continue to results
          </button>
        </div>
      </div>
    </div>
  );
}
