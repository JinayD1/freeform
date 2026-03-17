"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { EtsyChatbot } from "./EtsyChatbot";
import { Header } from "./Header";
import { LoadingState } from "./LoadingState";
import { ResultsDashboard } from "./ResultsDashboard";
import { UploadDropzone } from "./UploadDropzone";

export type GeneratedListing = {
  title: string;
  description: string;
  tags: string[];
  price: number;
};

type FlowStep = "upload" | "details" | "generating" | "chatbot" | "results";

const CONDITION_OPTIONS = ["Used", "Like New", "Good", "Fair", "Refurbished"];
const CATEGORY_OPTIONS = ["Electronics", "Clothing", "Home & Living", "Collectibles", "Furniture", "Other"];

export function AppLayout() {
  const [step, setStep] = useState<FlowStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [condition, setCondition] = useState("Used");
  const [category, setCategory] = useState("Electronics");
  const [listing, setListing] = useState<GeneratedListing | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    if (!itemName.trim()) {
      const base = selectedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || "Item";
      setItemName(base);
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setSelectedFile(files[0]);
    setApiError(null);
    setStep("details");
  }, []);

  const handleGenerateListing = useCallback(async () => {
    setApiError(null);
    setStep("generating");
    try {
      const name = itemName.trim() || "Item";
      const result = await api.generateListing({ name, condition, category });
      if (result.error) throw new Error(result.error);
      setListing({
        title: result.title ?? "",
        description: result.description ?? "",
        tags: Array.isArray(result.tags) ? result.tags : [],
        price: typeof result.price === "number" ? result.price : Number(result.price) || 0,
      });
      setStep("chatbot");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to generate listing");
      setStep("details");
    }
  }, [itemName, condition, category]);

  const title = useMemo(() => {
    switch (step) {
      case "details":
        return "Describe your item";
      case "generating":
        return "Generating your listing";
      case "chatbot":
        return "Listing on Etsy";
      case "results":
        return "Your AI-generated listing";
      default:
        return "AI Resale Listing Generator";
    }
  }, [step]);

  const subtitle = useMemo(() => {
    switch (step) {
      case "upload":
        return "Upload a product photo, then add details to generate a resale listing.";
      case "details":
        return "Name, condition, and category help the AI write a better listing.";
      case "generating":
        return "Drafting a compelling title, description, and pricing.";
      case "chatbot":
        return "Simulated Etsy updates for your demo.";
      case "results":
        return "Review, tweak, and publish to Etsy or copy the listing.";
      default:
        return "";
    }
  }, [step]);

  const landingCopy = useMemo(() => {
    return {
      badge: "New: photo → listing in seconds",
      headline: "Sell smarter with AI-written listings and better pricing.",
      supporting:
        "Upload a product photo and get a marketplace-ready title, description, price estimate, and comparable comps—plus tools to publish faster and handle buyer messages.",
      primaryCta: "Upload a photo",
      secondaryCta: "See how it works",
      trust: "Built for Marketplace, eBay, OfferUp, and more.",
    };
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Header />
      <main
        className={`flex flex-1 flex-col items-center px-4 pt-[60px] sm:px-6 sm:pt-[72px] ${step === "results" || step === "chatbot" ? "justify-start pb-12 sm:pb-16" : "justify-center py-12 sm:py-20 md:py-24"}`}
      >
        <div
          className={`flex w-full flex-col items-center ${step === "results" || step === "chatbot" ? "max-w-5xl gap-8 sm:gap-10" : "max-w-4xl gap-12 sm:gap-16 md:gap-20"}`}
        >
          {(step === "upload" || step === "details" || step === "generating") && (
            <div className="relative flex w-full flex-col items-center">
              {/* Hero glow — soft, supports type */}
              <div
                className="pointer-events-none absolute top-0 flex justify-center pt-6 sm:pt-10"
                aria-hidden
              >
                <div className="h-[280px] w-[min(100%,520px)] rounded-full bg-indigo-500/[0.05] blur-[100px] sm:h-[360px] sm:w-[640px]" />
              </div>
              <div
                className="pointer-events-none absolute top-0 flex justify-center pt-12 sm:pt-20"
                aria-hidden
              >
                <div className="h-[240px] w-[min(100%,440px)] rounded-full bg-slate-400/[0.04] blur-[80px] sm:h-[300px] sm:w-[520px]" />
              </div>

              <div className="relative flex flex-col items-center text-center">
                <span
                  className="mb-5 inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:mb-6 sm:text-xs"
                  role="status"
                >
                  {step === "upload" ? landingCopy.badge : "AI-powered listings"}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem] lg:leading-[1.1]">
                  {step === "upload" ? landingCopy.headline : title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:mt-5 sm:text-lg md:text-xl">
                  {step === "upload" ? landingCopy.supporting : subtitle}
                </p>

                {step === "upload" && (
                  <>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => document.getElementById("upload-input")?.click()}
                        className="min-h-[44px] rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:px-6 sm:py-3.5"
                      >
                        {landingCopy.primaryCta}
                      </button>
                      <button
                        type="button"
                        className="min-h-[44px] rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:bg-white/[0.08] hover:text-slate-200 sm:px-6 sm:py-3.5"
                      >
                        {landingCopy.secondaryCta}
                      </button>
                    </div>
                    <p className="mt-5 text-xs text-slate-500 sm:mt-6 sm:text-sm">
                      {landingCopy.trust}
                    </p>
                  </>
                )}
              </div>

              {step === "upload" && (
                <div className="relative mt-6 w-full max-w-xl flex justify-center transition-opacity duration-300 ease-out sm:mt-8">
                  <UploadDropzone onFiles={handleFiles} variant="dark" />
                </div>
              )}

              {step === "details" && (
                <div className="relative mt-8 w-full max-w-xl animate-fade-in-up">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
                    {previewUrl && (
                      <div className="mx-auto mb-5 aspect-square w-28 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:w-32">
                        <img src={previewUrl} alt="Upload" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Item name
                        </label>
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          placeholder="e.g. Vintage Sony Walkman"
                          className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Condition
                        </label>
                        <select
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                        >
                          {CONDITION_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-3 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                        >
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {apiError && (
                        <p className="text-sm text-red-400" role="alert">{apiError}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateListing}
                        className="w-full min-h-[44px] rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Generate listing with AI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === "generating" && (
                <div className="relative mt-2 animate-fade-in-up">
                  <LoadingState
                    label="Generating listing..."
                    helper="Writing a polished title and description tailored for resale."
                    variant="dark"
                  />
                </div>
              )}
            </div>
          )}

          {step === "chatbot" && listing && (
            <EtsyChatbot
              listingTitle={listing.title}
              onComplete={() => setStep("results")}
            />
          )}

          {step === "results" && listing && (
            <div className="w-full animate-fade-in-up">
              <ResultsDashboard
                previewUrl={previewUrl}
                imageAlt={selectedFile?.name ?? "Uploaded item preview"}
                listing={listing}
                condition={condition}
                category={category}
                onStartOver={() => {
                  setStep("upload");
                  setListing(null);
                  setSelectedFile(null);
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
