"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export const UploadZone = ({
  onUpload,
}: {
  onUpload: (base64: string) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer w-full max-w-4xl mx-auto border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all duration-300 mt-8",
        isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
        preview ? "py-6" : "py-24"
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative w-full flex justify-center group overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Fabric preview"
            className="max-h-72 object-contain rounded-lg shadow-xl"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
             <p className="text-white font-medium flex items-center gap-2">
               <UploadCloud className="w-5 h-5" /> Replace Image
             </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-6">
            <UploadCloud className="w-10 h-10 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold dark:text-zinc-200 text-zinc-800 mb-2">
            Upload your fabric
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md">
            Drag and drop a clear photo of your raw cloth or fabric here, or click to browse. Let the magic begin.
          </p>
        </>
      )}
    </div>
  );
};
