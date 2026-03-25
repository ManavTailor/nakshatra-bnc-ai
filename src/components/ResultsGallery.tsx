"use client";
import React from "react";
import { Download, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const ResultsGallery = ({ images }: { images: string[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-12 w-full">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative group overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-2xl bg-zinc-100 dark:bg-zinc-900"
        >
          {img ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={img}
              alt={`Generated design ${idx + 1}`}
              className="w-full h-full object-cover aspect-[4/5] transform group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full aspect-[4/5] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
            <button className="flex items-center space-x-2 text-white hover:text-rose-400 transition-colors">
              <Heart className="w-6 h-6" />
              <span className="font-medium text-sm">Save</span>
            </button>
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">HD</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
