"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "./Header";
import { LoadingState } from "./LoadingState";
import { ResultsDashboard } from "./ResultsDashboard";
import { UploadDropzone } from "./UploadDropzone";

type FlowStep = "upload" | "analyzing" | "generating" | "results";

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

    if (step === "analyzing") {
      timer = setTimeout(() => setStep("generating"), 1500);
    } else if (step === "generating") {
      timer = setTimeout(() => setStep("results"), 1500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step]);

  const handleFiles = (files: File[]) => {
    if (!files.length) return;
    setSelectedFile(files[0]);
    setStep("analyzing");
  };

  const title = useMemo(() => {
    switch (step) {
      case "analyzing":
        return "Analyzing your image";
      case "generating":
        return "Generating your listing";
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
      case "analyzing":
        return "Finding key attributes, condition, and style from the image.";
      case "generating":
        return "Drafting a compelling title, description, and pricing hints.";
      case "results":
        return "Review, tweak, and copy this listing into your marketplace.";
      default:
        return "";
    }
  }, [step]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main
            className={`flex flex-1 flex-col items-center px-4 py-8 sm:px-6 ${step === "results" ? "justify-start" : "justify-center"}`}
          >
        <div
            className={`flex w-full flex-col items-center gap-8 ${step === "results" ? "max-w-5xl" : "max-w-4xl"}`}
          >
          {step !== "results" && (
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

          {step === "analyzing" && (
            <LoadingState
              label="Analyzing image..."
              helper="Extracting visual details like category, material, and condition."
            />
          )}

          {step === "generating" && (
            <LoadingState
              label="Generating listing..."
              helper="Writing a polished title and description tailored for resale."
            />
          )}

          {step === "results" && (
            <ResultsDashboard
              previewUrl={previewUrl}
              imageAlt={selectedFile?.name ?? "Uploaded item preview"}
              onStartOver={() => setStep("upload")}
            />
          )}
        </div>
      </main>
    </div>
  );
}

