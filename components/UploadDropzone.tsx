"use client";

import { useCallback, useState } from "react";

const ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

export function UploadDropzone({
  onFiles,
  variant = "light",
}: {
  onFiles: (files: File[]) => void;
  variant?: "light" | "dark";
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = variant === "dark";

  const filterImages = useCallback((files: FileList | null): File[] => {
    if (!files?.length) return [];
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    return Array.from(files).filter((f) => allowed.includes(f.type));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);
      const dropped = filterImages(e.dataTransfer.files);
      if (dropped.length === 0 && e.dataTransfer.files.length > 0) {
        setError("Please upload image files only (PNG, JPG, GIF, WebP).");
        return;
      }
      if (dropped.length > 0) onFiles(dropped);
    },
    [filterImages, onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const related = e.relatedTarget;
    if (related && related instanceof Node && e.currentTarget.contains(related)) return;
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selected = filterImages(e.target.files);
      if (selected.length === 0 && e.target.files?.length) {
        setError("Please upload image files only (PNG, JPG, GIF, WebP).");
        return;
      }
      if (selected.length > 0) onFiles(selected);
      e.target.value = "";
    },
    [filterImages, onFiles]
  );

  return (
    <div className="w-full max-w-xl">
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("upload-input")?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("upload-input")?.click();
          }
        }}
        className={`
          flex cursor-pointer flex-col items-center justify-center rounded-2xl border px-6 py-12 text-center transition-all duration-200 sm:px-8 sm:py-14
          ${
            isDark
              ? isDragging
                ? "border-white/[0.1] bg-white/[0.06] backdrop-blur-xl"
                : "border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.08] hover:bg-white/[0.05]"
              : isDragging
                ? "border-slate-300/90 bg-slate-100/70"
                : "border-slate-200/90 bg-white/60 hover:border-slate-300/80 hover:bg-white/80"
          }
        `}
      >
        <input
          id="upload-input"
          type="file"
          accept={Object.keys(ACCEPT).join(",")}
          multiple
          className="sr-only"
          onChange={handleChange}
        />
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full sm:mb-4 sm:h-12 sm:w-12 ${isDark ? "bg-white/[0.06]" : "bg-slate-100/90"}`}
        >
          <svg
            className={`h-5 w-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p
          className={`text-sm font-medium tracking-tight text-slate-300 sm:text-[15px] ${!isDark && "text-slate-700"}`}
        >
          {isDragging ? "Drop images here" : "Drag and drop images, or click to upload"}
        </p>
        <p
          className={`mt-1.5 text-[11px] font-medium uppercase tracking-wider sm:mt-2 sm:text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          PNG, JPG, GIF, WebP
        </p>
      </div>
      {error && (
        <p
          className={`mt-3 text-sm ${isDark ? "text-red-400" : "text-red-600/90"}`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
