"use client";

import { useState } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { UploadZone } from "@/components/UploadZone";
import { ResultsGallery } from "@/components/ResultsGallery";
import { Sparkles, Scissors, Shirt, Briefcase } from "lucide-react";

const loadingSteps = [
  { text: "Analyzing your fabric texture..." },
  { text: "Draping patterns virtually..." },
  { text: "Stitching design details..." },
  { text: "Applying cinematic studio lighting..." },
  { text: "Finalizing your masterpiece..." },
];

const GARMENTS = [
  {
    id: "lehenga",
    title: "Lehenga",
    description: "Flowing skirts, elegant drape.",
    icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "blouse",
    title: "Saree Blouse",
    description: "Meticulously stitched, modern design.",
    icon: <Scissors className="h-5 w-5 text-rose-500" />,
  },
  {
    id: "western",
    title: "Western Dress",
    description: "Chic A-line or midi patterns.",
    icon: <Shirt className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "suit",
    title: "Suit",
    description: "Tailored fit, professional look.",
    icon: <Briefcase className="h-5 w-5 text-amber-500" />,
  },
];

const BLOUSE_PATTERNS = [
  "Madhubala Pattern",
  "Boat Neck",
  "High Neck",
  "Collar Neck",
  "Princess Cut",
  "Elbow Sleeve",
  "Deep Back Neck",
  "Dori (Tie-Up) Back",
  "Keyhole Back",
  "Button Back",
  "Off-Shoulder",
];

export default function Home() {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<string | null>(null);
  const [blousePattern, setBlousePattern] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleGenerate = async (selectedGarment: string, pattern?: string) => {
    if (!base64Image) return;

    setGarmentType(selectedGarment);
    if (pattern) setBlousePattern(pattern);
    setIsGenerating(true);
    setResults([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: base64Image, 
          garmentType: selectedGarment,
          blousePattern: pattern 
        }),
      });

      const data = await res.json();
      if (data.images) {
        setResults(data.images);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black/90 w-full flex flex-col items-center pt-24 pb-32 px-4 selection:bg-emerald-500/30">
      <MultiStepLoader
        loadingStates={loadingSteps}
        loading={isGenerating}
        duration={1500}
      />

      <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-block border border-zinc-200 dark:border-white/10 rounded-full px-4 py-1 mb-6 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Welcome to the Future of Fashion
        </div>
        <TextGenerateEffect
          words="Nakshatra B&C Virtual Design Studio"
          className="text-4xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight max-w-4xl mx-auto"
        />
        <p className="mt-6 text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
          Upload your raw fabric and let our AI tailor craft stunning, photorealistic garments exclusively for you.
        </p>

        <div className="w-full mt-16 flex flex-col items-center space-y-24">
          <section className="w-full" id="upload-section">
            <UploadZone onUpload={setBase64Image} />
          </section>

          {base64Image && results.length === 0 && !isGenerating && !garmentType && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
              <h2 className="text-3xl font-bold dark:text-white mb-8">
                Select a Garment Style
              </h2>
              <BentoGrid className="w-full">
                {GARMENTS.map((g) => (
                  <BentoGridItem
                    key={g.id}
                    title={g.title}
                    description={g.description}
                    icon={g.icon}
                    className="h-48 group-hover/bento:bg-zinc-100 cursor-pointer"
                    onClick={() => {
                      if (g.id === "blouse") {
                        setGarmentType("blouse");
                      } else {
                        handleGenerate(g.id);
                      }
                    }}
                  />
                ))}
              </BentoGrid>
            </section>
          )}

          {base64Image && results.length === 0 && !isGenerating && garmentType === "blouse" && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold dark:text-white mb-4">
                Select Blouse Pattern
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                Choose a specific pattern for your custom blouse.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {BLOUSE_PATTERNS.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => handleGenerate("blouse", pattern)}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center text-center font-medium shadow-sm hover:shadow-md"
                  >
                    {pattern}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setGarmentType(null)}
                className="mt-12 px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ← Back to Garments
              </button>
            </section>
          )}

          {results.length > 0 && (
            <section className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700 w-full">
              <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-bold dark:text-white capitalize">
                  Your Bespoke {garmentType} Collection
                </h2>
                {blousePattern && (
                  <p className="text-emerald-500 dark:text-emerald-400 font-medium mt-2">
                    Style: {blousePattern}
                  </p>
                )}
                <p className="text-zinc-500 mt-3">
                  Click the heart to save your favorite designs to your wardrobe.
                </p>
              </div>
              <ResultsGallery images={results} />
              <button
                onClick={() => {
                  setResults([]);
                  setBase64Image(null);
                  setGarmentType(null);
                  setBlousePattern(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-16 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-medium hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                Start New Design
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
