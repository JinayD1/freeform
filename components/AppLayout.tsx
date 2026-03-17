"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { LoadingState } from "./LoadingState";
import { ResultsDashboard } from "./ResultsDashboard";
import { UploadDropzone } from "./UploadDropzone";

type FlowStep = "upload" | "preview" | "analyzing" | "generating" | "results";

const PREVIEW_DURATION_MS = 1200;
const ANALYZING_DURATION_MS = 2400;
const GENERATING_DURATION_MS = 2400;

export function AppLayout() {
  const [step, setStep] = useState<FlowStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (step === "preview") {
      timer = setTimeout(() => setStep("analyzing"), PREVIEW_DURATION_MS);
    } else if (step === "analyzing") {
      timer = setTimeout(() => setStep("generating"), ANALYZING_DURATION_MS);
    } else if (step === "generating") {
      timer = setTimeout(() => setStep("results"), GENERATING_DURATION_MS);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step]);

  const handleFiles = (files: File[]) => {
    if (!files.length) return;
    setSelectedFile(files[0]);
    setStep("preview");
  };

  const title = useMemo(() => {
    switch (step) {
      case "preview":
        return "Photo received";
      case "analyzing":
        return "Analyzing your image";
      case "generating":
        return "Building your listing";
      case "results":
        return "Your AI-generated listing";
      default:
        return "AI Resale Listing Generator";
    }
  }, [step]);

  const subtitle = useMemo(() => {
    switch (step) {
      case "upload":
        return "Upload a product photo to generate a resale listing.";
      case "preview":
        return "Starting analysis…";
      case "analyzing":
        return "Extracting product details, condition, and category.";
      case "generating":
        return "Writing your title, estimating price, and finding comps.";
      case "results":
        return "Review, tweak, and copy this listing into your marketplace.";
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
        className={`flex flex-1 flex-col items-center px-4 pt-[60px] sm:px-6 sm:pt-[72px] ${step === "results" ? "justify-start pb-12 sm:pb-16" : "justify-center py-12 sm:py-20 md:py-24"}`}
      >
        <div
          className={`flex w-full flex-col items-center ${step === "results" ? "max-w-5xl gap-8 sm:gap-10" : "max-w-4xl gap-12 sm:gap-16 md:gap-20"}`}
        >
          {(step === "upload" || step === "preview" || step === "analyzing" || step === "generating") && (
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
                  {step === "upload"
                    ? landingCopy.badge
                    : step === "preview"
                      ? "Upload complete"
                      : "AI-powered listings"}
                </span>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem] lg:leading-[1.1]">
                  {step === "upload" ? landingCopy.headline : title}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:mt-5 sm:text-lg md:text-xl">
                  {step === "upload" ? landingCopy.supporting : subtitle}
                </p>

                {step === "upload" && (
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
                )}

                {step === "upload" && (
                  <p className="mt-5 text-xs text-slate-500 sm:mt-6 sm:text-sm">
                    {landingCopy.trust}
                  </p>
                )}
              </div>

              {step === "upload" && (
                <div className="relative mt-6 w-full max-w-xl flex justify-center transition-opacity duration-300 ease-out sm:mt-8">
                  <UploadDropzone onFiles={handleFiles} variant="dark" />
                </div>
              )}

              {/* Preview: show selected image in-context before analysis */}
              {step === "preview" && previewUrl && (
                <div className="relative mt-6 w-full max-w-xl animate-fade-in-up sm:mt-8">
                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                    <div className="flex flex-col p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                      <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:mx-0">
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <p className="text-sm font-medium text-slate-200">
                          Starting analysis…
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          We’ll detect product type, condition, and category next.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(step === "analyzing" || step === "generating") && (
            <div className="relative mt-2 animate-fade-in-up" key={step}>
              <LoadingState
                label={
                  step === "analyzing"
                    ? "Analyzing image"
                    : "Building your listing"
                }
                helper={
                  step === "analyzing"
                    ? "Extracting product details, condition, and category."
                    : "Title, price estimate, comps, and publish-ready copy."
                }
                variant="dark"
                phase={step}
                previewUrl={previewUrl}
              />
            </div>
          )}

          {step === "results" && (
            <div className="w-full animate-fade-in-up">
              <ResultsDashboard
                previewUrl={previewUrl}
                imageAlt={selectedFile?.name ?? "Uploaded item preview"}
                onStartOver={() => setStep("upload")}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

