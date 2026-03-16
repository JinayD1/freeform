"use client";

import {
  MOCK_LISTING,
  MOCK_COMPARABLES,
  SUGGESTED_AVERAGE_PRICE,
  MOCK_BUYER_MESSAGE,
  MOCK_AI_REPLY,
} from "@/lib/mockResults";

const CARD_CLASS =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

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
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ResultsDashboard({
  previewUrl,
  imageAlt,
  onStartOver,
}: {
  previewUrl: string | null;
  imageAlt: string;
  onStartOver: () => void;
}) {
  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Your AI-generated listing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review, tweak, and publish to your preferred marketplace.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Start over
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Photo Enhancement */}
        <Card title="Photo Enhancement">
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={imageAlt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                No image
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Your uploaded photo. AI enhancement can be added when backend is connected.
          </p>
        </Card>

        {/* 2. Generated Listing */}
        <Card title="Generated Listing">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Title
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {MOCK_LISTING.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Price
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  ${MOCK_LISTING.price}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Category
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {MOCK_LISTING.category}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Condition
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {MOCK_LISTING.condition}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {MOCK_LISTING.description}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Copy listing
            </button>
          </div>
        </Card>
      </div>

      {/* 3. Comparable Listings */}
      <Card title="Comparable Listings">
        <p className="mb-4 text-xs text-slate-500">
          Similar sold listings used to suggest your price.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_COMPARABLES.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <p className="line-clamp-2 text-sm font-medium text-slate-800">
                {item.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                ${item.price}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3">
          <span className="text-sm font-medium text-emerald-800">
            Suggested average price
          </span>
          <span className="text-lg font-bold text-emerald-900">
            ${SUGGESTED_AVERAGE_PRICE}
          </span>
        </div>
      </Card>

      {/* 4. Publish Listing */}
      <Card title="Publish Listing">
        <p className="mb-4 text-sm text-slate-600">
          Post this listing to one or more marketplaces.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-[#1877F2]">f</span>
            Facebook Marketplace
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="font-bold text-[#E53238]">e</span>
            eBay
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="font-bold text-[#00A878]">O</span>
            OfferUp
          </button>
        </div>
      </Card>

      {/* 5. Buyer Negotiation Simulator */}
      <Card title="Buyer Negotiation Simulator">
        <p className="mb-4 text-sm text-slate-600">
          Paste a buyer message and get an AI-suggested reply.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Buyer message
            </p>
            <p className="text-sm text-slate-800">{MOCK_BUYER_MESSAGE}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              AI suggested reply
            </p>
            <p className="text-sm leading-relaxed text-slate-800">
              {MOCK_AI_REPLY}
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            Generate & Apply
          </button>
        </div>
      </Card>
    </div>
  );
}
