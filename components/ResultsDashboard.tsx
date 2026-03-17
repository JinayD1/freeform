"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { GeneratedListing } from "./AppLayout";
import {
  MOCK_COMPARABLES,
  SUGGESTED_AVERAGE_PRICE,
} from "@/lib/mockResults";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6 md:p-7";

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD_CLASS} ${className}`}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:mb-5 sm:text-xs">
        {title}
      </h2>
      {children}
    </section>
  );
}

const STAGGER_MS = 90;

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

  const handleCopyListing = () => {
    const text = `${listing.title}\n\n$${listing.price}\n${listing.description}`;
    void navigator.clipboard.writeText(text);
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
    <div className="w-full max-w-5xl space-y-8 sm:space-y-10 md:space-y-12">
      {/* Page header: staged entrance */}
      <div
        className="animate-fade-in-up-stagger flex flex-col items-start justify-between gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:pb-8 md:pb-10"
        style={{ animationDelay: "0ms" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:text-xs">
            Results
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
            Your AI-generated listing
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400 sm:mt-2 sm:text-base">
            Review, tweak, and publish to your preferred marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-slate-200 sm:px-5"
        >
          Start over
        </button>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* 1. Photo Enhancement */}
        <div className="animate-fade-in-up-stagger" style={{ animationDelay: `${STAGGER_MS * 1}ms` }}>
          <Card title="Photo Enhancement">
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                No image
              </div>
            )}
          </div>
<<<<<<< HEAD
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Your uploaded photo. Listing was generated from your item details.
          </p>
          </Card>
        </div>

        {/* 2. Generated Listing */}
        <div className="animate-fade-in-up-stagger" style={{ animationDelay: `${STAGGER_MS * 2}ms` }}>
          <Card title="Generated Listing">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Title
              </p>
              <p className="mt-1.5 font-semibold text-white">
                {listing.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Price
                </p>
                <p className="mt-1.5 text-xl font-bold text-white">
                  ${listing.price}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Category
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  {category}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Condition
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  {condition}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Description
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                {listing.description}
              </p>
            </div>
            {listing.tags?.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tags
                </p>
                <p className="mt-1.5 text-sm text-slate-300">
                  {listing.tags.join(", ")}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleCopyListing}
              className="mt-1 min-h-[44px] rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Copy listing
            </button>
          </div>
          </Card>
        </div>
      </div>

      {/* 3. Comparable Listings */}
      <div
        className="animate-fade-in-up-stagger"
        style={{ animationDelay: `${STAGGER_MS * 3}ms` }}
      >
        <Card title="Comparable Listings">
        <p className="mb-5 text-xs leading-relaxed text-slate-500">
          Similar sold listings used to suggest your price.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {MOCK_COMPARABLES.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-3 sm:px-4 sm:py-3.5"
            >
              <p className="line-clamp-2 text-sm font-medium text-slate-200">
                {item.title}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                ${item.price}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-3 sm:mt-5 sm:py-3.5">
          <span className="text-sm font-medium text-emerald-300/90">
            Suggested average price
          </span>
          <span className="text-lg font-bold text-emerald-200/90">
            ${SUGGESTED_AVERAGE_PRICE}
          </span>
        </div>
      </Card>
      </div>

      {/* 4. Publish Listing */}
      <div
        className="animate-fade-in-up-stagger"
        style={{ animationDelay: `${STAGGER_MS * 4}ms` }}
      >
        <Card title="Publish Listing">
        <p className="mb-5 text-sm leading-relaxed text-slate-400">
          Post this listing to Etsy (or copy above and use other marketplaces).
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePublishEtsy}
            disabled={publishStatus === "loading"}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F56400] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#e55a00] disabled:opacity-50"
          >
            {publishStatus === "loading"
              ? "Publishing…"
              : publishStatus === "done"
                ? "Published to Etsy"
                : "Publish to Etsy"}
          </button>
          {publishStatus === "error" && publishError && (
            <p className="w-full text-sm text-red-400">{publishError}</p>
          )}
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-slate-200"
          >
            <span className="text-[#1877F2]">f</span>
            Facebook Marketplace
          </button>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-slate-200"
          >
            <span className="font-bold text-[#E53238]">e</span>
            eBay
          </button>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-slate-200"
          >
            <span className="font-bold text-[#00A878]">O</span>
            OfferUp
          </button>
        </div>
      </Card>
      </div>

      {/* 5. Buyer Negotiation Simulator */}
      <div
        className="animate-fade-in-up-stagger"
        style={{ animationDelay: `${STAGGER_MS * 5}ms` }}
      >
        <Card title="Buyer Negotiation Simulator">
        <p className="mb-5 text-sm leading-relaxed text-slate-400">
          Paste a buyer message and get an AI-suggested reply (respects minimum price).
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
              Buyer message
            </label>
            <textarea
              value={buyerMessage}
              onChange={(e) => setBuyerMessage(e.target.value)}
              placeholder="e.g. Will you take $40? Is shipping included?"
              rows={3}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          {aiReply !== null && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.06] p-3.5 sm:p-4">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                AI suggested reply
              </p>
              <p className="text-sm leading-relaxed text-slate-200">{aiReply}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleGenerateReply}
            disabled={replyLoading || !buyerMessage.trim()}
            className="w-full min-h-[44px] rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto"
          >
            {replyLoading ? "Generating…" : "Generate reply"}
          </button>
        </div>
      </Card>
      </div>
    </div>
  );
}
