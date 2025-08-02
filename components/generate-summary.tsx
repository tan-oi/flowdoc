"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TypewriterText } from "./ui/type-writer";

export function GenerateSummary() {
  const [showSummary, setShowSummary] = useState(false);
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -50,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      exit={{
        opacity: 0,
        x: 50,
      }}
      className="bg-white rounded-lg text-black lg:p-6 p-4 flex flex-col gap-4"
    >
      <div className="text-neutral-400 text-sm">
        watch how easy is it to add a summary
      </div>

      <div className="px-4 flex flex-col md:gap-4 gap-3">
        <p className="text-neutral-700 md:text-md text-sm">
          In Q2 2025, the company saw consistent sales of its flagship product,
          the AlphaSmart Speaker. In April, 3,200 units were sold, followed by a
          peak in May with 4,150 units, before slightly declining to 3,750 units
          in June. Overall, the product maintained strong performance throughout
          the quarter, reflecting stable market demand.
          <br />
          Market feedback during this period highlighted a noticeable uptick in
          audio latency perception drift and acoustic warmth alignment, terms
          often used in consumer tech sentiment mapping. Analysts noted
          micro-fluctuations in purchase intent curves, potentially linked to
          seasonal promo-catalyst cycles and cross-device ecosystem resonance
          effects, which may have subtly influenced month-to-month variance
          without disrupting the overall growth cadence.
        </p>

        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key="typewriter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9 }}
            >
              <TypewriterText
                text="/generate a summary for this doc"
                onComplete={() => setShowSummary(true)}
                speed={30}
                className={"md:text-lg font-bold"}
                startDelay={0}
              />
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 group"
            >
              <p className="hidden group-hover:inline text-neutral-600">
                generate a summary of this doc
              </p>

              <div>
                <p>
                  In Q2 2025, AlphaSmart Speaker sales remained strong, with a
                  peak in May. Market stability persisted despite slight monthly
                  variations, likely influenced by consumer perception shifts
                  and promotional ecosystem effects.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
