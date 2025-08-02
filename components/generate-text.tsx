"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TypewriterText } from "./ui/type-writer";

export function GenerateText() {
  const [content, setContent] = useState(false);
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.98,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className="bg-white rounded-lg text-black lg:p-6 p-4 flex flex-col gap-4"
    >
      <div className="text-neutral-400 text-sm">
        ask AI to generate some cool content for you
      </div>

      <div>
        <AnimatePresence mode="wait">
          {!content ? (
            <motion.div
              key="typewriter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9 }}
            >
              <TypewriterText
                text="/generate a couple of paragraphs on a imaginary product named AlphaSmart Speaker showing its Q2 2025 sales and market analysis"
                onComplete={() => setContent(true)}
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
              <p>
                In Q2 2025, the company saw consistent sales of its flagship
                product, the AlphaSmart Speaker. In April, 3,200 units were
                sold, followed by a peak in May with 4,150 units, before
                slightly declining to 3,750 units in June. Overall, the product
                maintained strong performance throughout the quarter, reflecting
                stable market demand.
                <br />
                Market feedback during this period highlighted a noticeable
                uptick in audio latency perception drift and acoustic warmth
                alignment, terms often used in consumer tech sentiment mapping.
                Analysts noted micro-fluctuations in purchase intent curves,
                potentially linked to seasonal promo-catalyst cycles and
                cross-device ecosystem resonance effects, which may have subtly
                influenced month-to-month variance without disrupting the
                overall growth cadence.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
