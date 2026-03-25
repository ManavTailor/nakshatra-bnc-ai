"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

export type LoadingState = {
  text: string;
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  if (!loading) return null;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/50"
        >
          <div className="h-96 w-96 max-w-sm relative flex flex-col items-start justify-center p-8 bg-black border rounded-2xl shadow-xl dark:border-white/[0.1] border-black/[0.1]">
            <h2 className="text-xl font-bold mb-4 dark:text-white text-white">
              Processing Design
            </h2>
            <div className="w-full h-full relative space-y-4">
              {loadingStates.map((state, index) => (
                <div key={index} className="flex relative items-center">
                  <motion.div
                    className={cn(
                      "w-4 h-4 rounded-full mr-4 shadow-xl border-t flex-shrink-0 animate-spin transition-all duration-300",
                      index === currentState
                        ? "border-t-white bg-white/20 opacity-100"
                        : index < currentState
                        ? "border-emerald-500 bg-emerald-500 opacity-100 animate-none"
                        : "border-transparent bg-transparent opacity-30 animate-none"
                    )}
                  />
                  <div
                    className={cn(
                      "text-white text-sm transition-opacity duration-300 font-medium font-sans",
                      index === currentState
                        ? "opacity-100 text-white"
                        : index < currentState
                        ? "opacity-100 text-emerald-500"
                        : "opacity-30"
                    )}
                  >
                    {state.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
