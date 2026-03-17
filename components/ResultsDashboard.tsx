"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { GeneratedListing } from "./AppLayout";
import {
  MOCK_COMPARABLES,
  SUGGESTED_AVERAGE_PRICE,
} from "@/lib/mockResults";

function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-glow text-amber">
            {icon}
          </div>
        )}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function ResultsDashboard({
  previewUrl,
  imageAlt,
  listing,
  condition,
  category,
  onStartOver,
}: {
  previewUrl: string | null;
  imageAlt: string;
  listing: GeneratedListing;
  condition: string;
  category: string;
  onStartOver: () => void;
}) {
  const [buyerMessage, setBuyerMessage] = useState("");
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyListing = () => {
    const text = `${listing.title}\n\n$${listing.price}\n\n${listing.description}\n\nTags: ${listing.tags.join(", ")}`;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishEtsy = async () => {
    setPublishStatus("loading");
    setPublishError(null);
    try {
      const result = await api.createListing({
        title: listing.title,
        description: listing.description,
        price: listing.price,
      });
      if (result.error) throw new Error(result.error);
      setPublishStatus("done");
    } catch (err) {
      setPublishStatus("error");
      setPublishError(err instanceof Error ? err.message : "Publish failed");
    }
  };

  const handleGenerateReply = async () => {
    if (!buyerMessage.trim()) return;
    setReplyLoading(true);
    setAiReply(null);
    try {
      const result = await api.generateReply({
        message: buyerMessage.trim(),
        product: {
          title: listing.title,
          price: listing.price,
          min_price: Math.round(listing.price * 0.75),
        },
      });
      if (result.error) throw new Error(result.error);
      setAiReply(result.reply ?? "");
    } catch (err) {
      setAiReply(err instanceof Error ? err.message : "Could not generate reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber">Step 5 of 5</p>
          <h1 className="mt-1 font-serif text-3xl text-ink sm:text-4xl">
            Your listing is ready
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Review, tweak, and publish to your preferred marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-light transition-all hover:border-amber hover:text-amber"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Start over
        </button>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo */}
        <Card
          title="Product Photo"
          icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
        >
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border-light bg-cream">
            {previewUrl ? (
              <img src={previewUrl} alt={imageAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-ink-faint">
                No image
              </div>
            )}
          </div>
        </Card>

        {/* Generated Listing */}
        <Card
          title="Generated Listing"
          icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
        >
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-ink-faint mb-1">Title</p>
              <p className="text-base font-semibold leading-snug text-ink">{listing.title}</p>
            </div>

            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs font-medium text-ink-faint mb-1">Price</p>
                <p className="font-serif text-3xl text-amber">${listing.price}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg bg-cream-dark px-3 py-1.5 text-xs font-medium text-ink-light">
                  {category}
                </span>
                <span className="rounded-lg bg-cream-dark px-3 py-1.5 text-xs font-medium text-ink-light">
                  {condition}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink-faint mb-1">Description</p>
              <p className="text-sm leading-relaxed text-ink-light whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {listing.tags?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-faint mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {listing.tags.map((tag, i) => (
                    <span key={i} className="rounded-full border border-border bg-cream px-2.5 py-1 text-xs text-ink-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyListing}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-light transition-all hover:border-amber hover:text-amber"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy listing"}
            </button>
          </div>
        </Card>
      </div>

      {/* Comparable Listings */}
      <Card
        title="Market Comparables"
        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_COMPARABLES.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border-light bg-cream/50 px-4 py-3.5 transition-all hover:border-border hover:shadow-sm"
            >
              <p className="line-clamp-2 text-sm font-medium text-ink">
                {item.title}
              </p>
              <p className="mt-2 font-serif text-lg text-ink">
                ${item.price}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-sage-light px-5 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage/10">
            <svg className="h-4 w-4 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-sage">Suggested price</p>
            <p className="font-serif text-xl text-sage">${SUGGESTED_AVERAGE_PRICE}</p>
          </div>
        </div>
      </Card>

      {/* Publish */}
      <Card
        title="Publish"
        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>}
      >
        <p className="mb-4 text-sm text-ink-muted">
          Post this listing to your preferred marketplace.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePublishEtsy}
            disabled={publishStatus === "loading" || publishStatus === "done"}
            className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 ${
              publishStatus === "done"
                ? "bg-sage"
                : "bg-etsy hover:shadow-md hover:shadow-etsy/20"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {publishStatus === "done" ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </>
              )}
            </svg>
            {publishStatus === "loading"
              ? "Publishing..."
              : publishStatus === "done"
                ? "Published to Etsy"
                : "Publish to Etsy"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-ink-light transition-all hover:border-[#1877F2] hover:text-[#1877F2]"
          >
            Facebook
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-ink-light transition-all hover:border-[#E53238] hover:text-[#E53238]"
          >
            eBay
          </button>
        </div>
        {publishStatus === "error" && publishError && (
          <p className="mt-3 text-sm text-red-600">{publishError}</p>
        )}
      </Card>

      {/* Buyer Negotiation */}
      <Card
        title="Negotiation Simulator"
        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
      >
        <p className="mb-4 text-sm text-ink-muted">
          Paste a buyer message and get an AI-suggested reply (respects your minimum price).
        </p>
        <div className="space-y-4">
          <textarea
            value={buyerMessage}
            onChange={(e) => setBuyerMessage(e.target.value)}
            placeholder='e.g. "Will you take $40? Is shipping included?"'
            rows={3}
            className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all"
          />
          {aiReply !== null && (
            <div className="rounded-xl border border-sage-light bg-sage-light/50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sage">
                AI suggested reply
              </p>
              <p className="text-sm leading-relaxed text-ink-light">{aiReply}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleGenerateReply}
            disabled={replyLoading || !buyerMessage.trim()}
            className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-cream transition-all hover:bg-ink-light disabled:opacity-40"
          >
            {replyLoading ? "Generating..." : "Generate reply"}
          </button>
        </div>
      </Card>
    </div>
  );
}
