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
          flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition
          ${
            isDragging
              ? "border-slate-400 bg-slate-50"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
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
        <div className="mb-3 rounded-full bg-slate-200/80 p-3">
          <svg
            className="h-6 w-6 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">
          {isDragging ? "Drop images here" : "Drag and drop images, or click to upload"}
        </p>
        <p className="mt-1 text-xs text-slate-500">PNG, JPG, GIF, WebP</p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
