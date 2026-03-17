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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main
            className={`flex flex-1 flex-col items-center px-4 py-8 sm:px-6 ${step === "results" ? "justify-start" : step === "chatbot" ? "justify-start" : "justify-center"}`}
          >
        <div
            className={`flex w-full flex-col items-center gap-8 ${step === "results" || step === "chatbot" ? "max-w-5xl" : "max-w-4xl"}`}
          >
          {step !== "results" && step !== "chatbot" && (
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>
            </div>
          )}

          {step === "upload" && (
            <div className="w-full flex justify-center transition-opacity duration-300 ease-out">
              <UploadDropzone onFiles={handleFiles} />
            </div>
          )}

          {step === "details" && (
            <div className="w-full max-w-xl space-y-6">
              {previewUrl && (
                <div className="mx-auto aspect-square w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img src={previewUrl} alt="Upload" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Item name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Vintage Sony Walkman"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {apiError && (
                  <p className="text-sm text-red-600" role="alert">{apiError}</p>
                )}
                <button
                  type="button"
                  onClick={handleGenerateListing}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                >
                  Generate listing with AI
                </button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <LoadingState
              label="Generating listing..."
              helper="Writing a polished title and description tailored for resale."
            />
          )}

          {step === "chatbot" && listing && (
            <EtsyChatbot
              listingTitle={listing.title}
              onComplete={() => setStep("results")}
            />
          )}

          {step === "results" && listing && (
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
          )}
        </div>
      </main>
    </div>
  );
}

