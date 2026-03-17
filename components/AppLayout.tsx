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

const STEPS: { key: FlowStep; label: string; num: number }[] = [
  { key: "upload", label: "Upload", num: 1 },
  { key: "details", label: "Details", num: 2 },
  { key: "generating", label: "Generate", num: 3 },
  { key: "chatbot", label: "Assistant", num: 4 },
  { key: "results", label: "Results", num: 5 },
];

/** Resize image to maxDim on longest side and return base64 + mime. */
async function resizeAndEncode(
  file: File,
  maxDim: number,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1] || "";
      resolve({ base64, mimeType: "image/jpeg" });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/* ── Step Progress Indicator ── */
function StepProgress({ current }: { current: FlowStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="w-full max-w-xl mx-auto px-2">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold
                    transition-all duration-500 ease-out
                    ${done
                      ? "bg-amber text-white shadow-md shadow-amber/25"
                      : active
                        ? "bg-ink text-cream shadow-lg shadow-ink/20 scale-110"
                        : "bg-cream-dark text-ink-faint border border-border"
                    }
                  `}
                >
                  {done ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`
                    text-[10px] font-medium tracking-wide uppercase whitespace-nowrap
                    transition-colors duration-300
                    ${done ? "text-amber" : active ? "text-ink" : "text-ink-faint"}
                  `}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1.5 mb-5">
                  <div className="h-[2px] w-full rounded-full bg-cream-dark overflow-hidden">
                    <div
                      className={`
                        h-full rounded-full bg-amber transition-all duration-700 ease-out
                        ${i < currentIdx ? "w-full" : "w-0"}
                      `}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;
      if (selectedFile) {
        const { base64, mimeType } = await resizeAndEncode(selectedFile, 1024);
        if (base64) {
          imageBase64 = base64;
          imageMimeType = mimeType;
        }
      }
      const result = await api.generateListing({
        name,
        condition,
        category,
        ...(imageBase64 && { imageBase64, imageMimeType }),
      });
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
  }, [itemName, condition, category, selectedFile]);

  const stepTitle = useMemo(() => {
    switch (step) {
      case "upload": return "Upload your product photo";
      case "details": return "Describe your item";
      case "generating": return "Crafting your listing";
      case "chatbot": return "Etsy Assistant";
      case "results": return "Your listing is ready";
    }
  }, [step]);

  const stepSubtitle = useMemo(() => {
    switch (step) {
      case "upload": return "We'll use AI to recognize the item and generate a professional resale listing.";
      case "details": return "Add details to help AI create an accurate, optimized listing.";
      case "generating": return "Our AI is writing a compelling title, description, and pricing.";
      case "chatbot": return "Simulated Etsy updates for your demo.";
      case "results": return "Review, tweak, and publish to your preferred marketplace.";
    }
  }, [step]);

  return (
    <div className="noise-bg flex min-h-screen flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-5xl flex flex-col items-center">

          {/* Step progress — always visible */}
          <div className="w-full mb-8 mt-2">
            <StepProgress current={step} />
          </div>

          {/* Page title — hidden on results (it has its own header) */}
          {step !== "results" && (
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="font-serif text-2xl text-ink sm:text-3xl">
                {stepTitle}
              </h1>
              <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
                {stepSubtitle}
              </p>
            </div>
          )}

          {/* ── Upload ── */}
          {step === "upload" && (
            <div className="w-full flex justify-center">
              <UploadDropzone onFiles={handleFiles} />
            </div>
          )}

          {/* ── Details ── */}
          {step === "details" && (
            <div className="w-full max-w-lg animate-fade-in-up">
              {/* Image preview */}
              {previewUrl && (
                <div className="mx-auto mb-6 h-40 w-40 overflow-hidden rounded-2xl border border-border bg-cream shadow-sm">
                  <img src={previewUrl} alt="Upload" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Form card */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
                {/* Item name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                    Item name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Vintage Sony Walkman"
                    className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all"
                  />
                </div>

                {/* Condition & Category row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                      Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all appearance-none cursor-pointer"
                    >
                      {CONDITION_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-ink-muted mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error */}
                {apiError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 border border-red-100">
                    <svg className="h-4 w-4 mt-0.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-sm text-red-700" role="alert">{apiError}</p>
                  </div>
                )}

                {/* Generate button */}
                <button
                  type="button"
                  onClick={handleGenerateListing}
                  className="group w-full flex items-center justify-center gap-2.5 rounded-xl bg-amber px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-dark hover:shadow-md hover:shadow-amber/20"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  Generate listing with AI
                </button>
              </div>

              {/* Back link */}
              <button
                type="button"
                onClick={() => {
                  setStep("upload");
                  setSelectedFile(null);
                }}
                className="mt-4 flex items-center gap-1.5 mx-auto text-sm text-ink-muted hover:text-amber transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Choose a different photo
              </button>
            </div>
          )}

          {/* ── Generating ── */}
          {step === "generating" && (
            <LoadingState
              label="Crafting your listing..."
              helper="Writing a polished title, description, and pricing tailored for resale."
            />
          )}

          {/* ── Chatbot ── */}
          {step === "chatbot" && listing && (
            <EtsyChatbot
              listingTitle={listing.title}
              onComplete={() => setStep("results")}
            />
          )}

          {/* ── Results ── */}
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
                setItemName("");
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-ink-faint">
        Resale List — AI-powered listing generator
      </footer>
    </div>
  );
}
