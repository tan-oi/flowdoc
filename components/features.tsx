"use client";
import { motion } from "motion/react";
import { Skeleton } from "./ui/skeleton";

export function Features() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 mb-10 text-center">
        <p className="text-2xl md:text-3xl leading-wide font-bold text-white">
          Documents, reimagined.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4">
          <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            // Use auto height on mobile to prevent squashing, aspect ratio on desktop
            className="bg-neutral-900/50 border border-white/10 min-h-[300px] h-auto md:aspect-[4/3] rounded-xl p-4 relative overflow-hidden group"
          >
            <div className="m-2 w-full h-full relative flex flex-col justify-between z-20">
              <div className="text-neutral-500 text-sm md:text-base leading-relaxed blur-[1px]">
                <p className="mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore.
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium.
                </p>
              </div>

              <div className="mt-auto mb-16 md:mb-4">
                <p className="text-white">
                  <span className="font-bold font-mono underline decoration-orange-500/50">
                    English
                  </span>
                  <span className="text-neutral-300">
                    {" "}
                    is all you need with
                  </span>
                  <span className="font-semibold text-orange-400">
                    {" "}
                    flowdocs
                  </span>
                </p>
              </div>
            </div>

            <motion.div
              variants={{
                rest: { opacity: 0.8, y: 10 },
                hover: { opacity: 1, y: 0 },
              }}
              // Adjusted bottom position for mobile
              className="absolute bottom-4 right-4 z-30 w-48 md:w-56"
            >
              <div className="bg-neutral-800/90 flex flex-col border border-neutral-700 gap-1 pb-3 px-2 pt-2 rounded-lg w-full backdrop-blur-md shadow-2xl">
                <p className="text-xs text-neutral-400 ml-1">Ask AI</p>
                <div className="bg-black/50 p-2 rounded border border-white/5">
                  <p className="text-xs md:text-sm text-neutral-300">
                    add a reactive summary
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="bg-neutral-900/50 border border-white/10 min-h-[300px] h-auto md:aspect-[4/3] rounded-xl p-4 relative overflow-hidden">
            <div className="m-2 w-full h-full relative z-20">
              <div className="mb-4">
                <p className="text-white text-lg md:text-xl">
                  <span className="font-bold font-mono underline decoration-blue-500/50">
                    We handle
                  </span>
                  <span className="text-neutral-300">
                    {" "}
                    the extra tasks, so your
                  </span>
                  <span className="font-semibold text-blue-400">
                    {" "}
                    writing gets better
                  </span>
                </p>
              </div>

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-3/4 pointer-events-none">
                <div className="absolute top-1/3 w-full h-px bg-blue-400/30"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1/3">
                  <div className="bg-neutral-800 rounded-t-lg w-full h-full flex items-center justify-center border-t border-x border-white/10">
                    <div className="text-xs text-white font-mono">Write</div>
                  </div>
                </div>
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-32 h-2/3 bg-blue-900/20 backdrop-blur-sm border-x border-blue-500/20">
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-blue-200 space-y-2">
                    <div>Summaries</div>
                    <div>Grammar</div>
                    <div>Overview</div>
                    <div className="text-blue-300/50">...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="bg-neutral-900/50 min-h-[220px] h-auto md:aspect-[4/3] border border-white/10 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="w-full h-[12px] bg-neutral-800/50" />
              <Skeleton className="w-3/4 h-[12px] bg-neutral-800/50" />
              <Skeleton className="w-5/6 h-[12px] bg-neutral-800/50" />
            </div>
            <div className="space-y-1 mt-4">
              <p className="font-bold text-white sm:text-lg">
                Zero config interface
              </p>
              <p className="text-neutral-400 text-xs sm:text-sm">
                No annoying panel, no bloated toolbar. Just pure joy of writing.
              </p>
            </div>
          </div>

          <div className="bg-neutral-900/50 min-h-[220px] h-auto md:aspect-[4/3] rounded-xl border border-white/10 flex flex-col p-6 relative overflow-hidden">
            <p className="text-white text-lg sm:text-xl z-20">
              <span className="font-bold text-emerald-400">You are</span> in
              Control
            </p>
            <div className="flex items-center justify-end gap-2 mt-4 z-20">
              <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                accept
              </div>
              <div className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium">
                reject
              </div>
            </div>
            <div className="mt-auto z-10">
              <div className="bg-neutral-800/50 text-neutral-500 w-2/3 rounded p-3 text-xs border border-white/5">
                History: Previous Version...
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 min-h-[220px] h-auto md:aspect-[4/3] rounded-xl border border-white/10 flex flex-col p-6 overflow-hidden">
            <div className="mb-4 z-20">
              <p className="text-white text-sm md:text-base">
                Works on{" "}
                <span className="font-bold text-purple-400">intent</span>, not
                clicks
              </p>
            </div>
            <div className="relative flex-1 bg-black/40 rounded-lg border border-white/5 p-4">
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <div className="space-y-2">
                <div className="h-1.5 bg-neutral-700 rounded w-full" />
                <div className="h-1.5 bg-neutral-700 rounded w-2/3" />
              </div>
              <div className="mt-4 text-[10px] text-purple-300 bg-purple-500/10 p-2 rounded border border-purple-500/20">
                Auto-formatting...
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
