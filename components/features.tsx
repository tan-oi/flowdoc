"use client";
import { motion } from "motion/react";
import { Skeleton } from "./ui/skeleton";

export function Features() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="lg:text-3xl leading-wide font-bold">
          Documents, reimagined.
        </p>
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
            filter: "blur(10px)",
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            ease: "easeInOut",
          }}
          className="grid gap-4 md:grid-rows-2 w-full h-full"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <motion.div
              initial="rest"
              animate="rest"
              whileHover="hover"
              className="bg-card border border-[1px] aspect-[4/3] rounded-lg p-4 relative overflow-hidden group"
            >
              <div className="m-2 w-full h-full relative">
                <div className="absolute inset-0 text-neutral-600/30 text-md leading-relaxed blur-[2px]">
                  <p className="mb-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt.
                  </p>
                </div>

                <div className="relative z-10 mb-4">
                  <p>
                    <span className="font-bold font-primary font-mono underline">
                      English
                    </span>
                    <span> is all you need with</span>
                    <span className="font-semibold"> flowdocs</span>
                  </p>
                </div>

                <motion.div
                  variants={{
                    rest: {
                      opacity: 1,
                      filter: "blur(4px)",
                    },
                    hover: {
                      opacity: 1,
                      filter: "blur(0px)",
                    },
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeIn",
                  }}
                  className="absolute bottom-10 right-4 z-10"
                >
                  <div className="bg-neutral-800 flex flex-col border border-neutral-700 gap-1 pb-4 px-2 pt-2 rounded-lg w-full backdrop-blur-md">
                    <p className="text-light text-neutral-400 text-sm">
                      Ask AI
                    </p>
                    <div className="bg-neutral-900 p-2 rounded-lg">
                      <p className="text-sm text-neutral-300">
                        add a reactive summary
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <div className="bg-card border border-[1px] aspect-[4/3] rounded-lg p-4 relative overflow-hidden">
              <div className="m-2 w-full h-full relative">
                <div className="relative z-10 mb-4">
                  <p>
                    <span className="font-bold font-mono underline">
                      We handle
                    </span>
                    <span> the extra tasks, so your</span>
                    <span className="font-semibold"> writing gets better</span>
                  </p>
                </div>

                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-3/4">
                  <div className="absolute top-1/3 w-full h-px bg-blue-400/60"></div>

                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1/3">
                    <div className="bg-white/90 rounded-t-lg w-full h-full flex items-center justify-center">
                      <div className="text-xs text-black font-mono">Write</div>
                    </div>
                  </div>

                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-32 h-2/3 bg-blue-900/30">
                    <div className="bg-gradient-to-b from-blue-800/40 to-blue-900/60 w-full h-full rounded-b-lg flex flex-col items-center justify-center text-xs text-blue-200 space-y-1">
                      <div>Summaries</div>
                      <div>Grammar</div>
                      <div>Overview</div>
                      <div>Charts</div>
                      <div>Replace</div>
                      <div className="text-blue-300/50">...</div>
                    </div>
                  </div>

                  <div className="absolute top-1/3 w-full h-2/3 bg-gradient-to-b from-blue-500/20 to-blue-800/40 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="bg-card aspect-[3/2] md:aspect-[4/3] border border-px rounded-lg flex flex-col justify-around md:justify-none p-4 md:gap-2">
              <div className="flex flex-col gap-5 md:gap-2">
                <Skeleton className="w-full h-[20px]" />
                <Skeleton className="w-full h-[20px]" />
                <Skeleton className="w-full h-[20px]" />
                <Skeleton className="hidden sm:block w-full h-[20px] md:hidden" />
                <Skeleton className="hidden sm:block w-full h-[20px] md:hidden" />
                
              </div>

              <div className="gap-2">
                <p className="font-bold font-primary sm:text-xl md:text-base">Zero config interface</p>
                <p className="text-neutral-400 text-[14px] sm:text-[15px] md:text-[14px]">
                  No annoying panel, no bloated toolbar
                </p>
                <p className="text-neutral-400 text-[14px] sm:text-[15px] md:text-[14px]">
                  Just pure joy of writing
                </p>
              </div>
            </div>

            <div
           
            className="bg-card aspect-[3/2] md:aspect-[4/3] rounded-lg border border-px flex flex-col gap-4 p-4 ">
              <p className="">
                <span className="font-bold font-primary">You are</span> in
                Control
              </p>

              <div className="flex items-center justify-end gap-2">
                <div className="p-3 bg-emerald-500 rounded-lg text-md">
                  accept
                </div>
                <div className="p-3 bg-red-500 rounded-lg text-md">reject</div>
              </div>

              <div>
                <p className="bg-neutral-800 text-neutral-400 w-2/3 rounded px-2 pb-14 pt-6 sm:pb-9 text-sm h-full">
                  History
                </p>
              </div>
            </div>

            <div className="bg-card aspect-[3/2] md:aspect-[4/3] rounded-lg border border-px flex flex-col gap-2 p-4">
              <div>
                <p className="text-sm md:text-base">
                  Works on
                  <span className="font-primary font-bold"> intent</span>, not
                  clicks
                </p>
              </div>

              <motion.div
                className="bg-gray-900 rounded-lg p-4 md:p-6 relative flex-1"
                initial="start"
                animate="end"
              >
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-500"
                  animate={{
                    backgroundColor: [
                      "#6b7280",
                      "#6b7280",
                      "#ef4444",
                      "#ef4444",
                      "#10b981",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    times: [0, 0.3, 0.4, 0.8, 1],
                  }}
                />

                <div className="space-y-2 md:space-y-3">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      className={`h-3 md:h-4 bg-gray-700 rounded ${
                        i === 1 ? "w-3/4" : i === 2 ? "w-1/2" : ""
                      }`}
                      animate={{
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                      }}
                    />
                  ))}
                </div>

                <motion.div
                  className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 4,
                    times: [0, 0.3, 0.7, 1],
                  }}
                >
                  <motion.span
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 2, delay: 1 }}
                    className="inline-block overflow-hidden whitespace-nowrap"
                  >
                    update this to show data
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
