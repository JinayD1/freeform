"use client";

import { useCallback, useState } from "react";

const ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

export function UploadDropzone({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full max-w-lg animate-fade-in-up">
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
          group relative flex cursor-pointer flex-col items-center justify-center
          rounded-2xl border-2 border-dashed px-8 py-16 text-center
          transition-all duration-300 ease-out
          ${
            isDragging
              ? "border-amber bg-amber-glow scale-[1.01] shadow-lg shadow-amber/10"
              : "border-ink-faint bg-surface hover:border-amber-light hover:bg-amber-glow/40 hover:shadow-md"
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

        <div className={`
          mb-5 rounded-2xl p-4 transition-all duration-300
          ${isDragging
            ? "bg-amber text-white scale-110"
            : "bg-cream-dark text-ink-muted group-hover:bg-amber-glow group-hover:text-amber"
          }
        `}>
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <p className="text-base font-medium text-ink">
          {isDragging ? "Drop your photo here" : "Upload a product photo"}
        </p>
        <p className="mt-1.5 text-sm text-ink-muted">
          Drag & drop or <span className="text-amber font-medium">browse files</span>
        </p>
        <p className="mt-4 text-xs text-ink-faint">PNG, JPG, GIF, WebP</p>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
