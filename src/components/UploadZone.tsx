"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const UploadZone = ({
  onUpload,
}: {
  onUpload: (base64: string) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result);
      };
      reader.readAsDataURL(file);
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-3xl mx-auto relative mt-12 z-10 group">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer w-full rounded-2xl flex flex-col items-center justify-center p-14 transition-all duration-300 backdrop-blur-sm overflow-hidden",
          "border border-zinc-800 bg-zinc-950/40",
          isDragActive
            ? "border-zinc-400 bg-zinc-900/60"
            : "hover:border-zinc-600 hover:bg-zinc-900/50",
          preview ? "py-8" : "py-24",
        )}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full flex justify-center group/img overflow-hidden rounded-xl bg-black p-2 ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Fabric preview"
              className="max-h-80 object-contain rounded-lg shadow-2xl transition-transform duration-500 group-hover/img:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg backdrop-blur-sm">
              <UploadCloud className="w-6 h-6 text-zinc-300 mb-2" />
              <p className="text-zinc-200 font-medium">
                Click or Drop to Replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center relative z-10">
            <div className="relative p-3 rounded-xl mb-6  shadow-sm group-hover:scale-105 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-zinc-100 mb-2 text-center tracking-tight">
              Paste or drop your fabric texture
            </h3>
            <p className="text-zinc-500 text-center max-w-md text-sm mb-6">
              Supported formats: JPEG, PNG, WEBP.
            </p>
            <div className="flex items-center gap-6 text-xs text-zinc-500 font-medium tracking-wide uppercase">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> High Quality
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Clear Lighting
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
