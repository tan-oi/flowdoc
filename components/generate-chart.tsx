"use client";
import { useState } from "react";
import { TypewriterText } from "./ui/type-writer";
import { AnimatePresence, motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export function GenerateChart() {
  const [showChart, setShowChart] = useState(false);
  const chartData = [
    { month: "April", units: 3200 },
    { month: "May", units: 4150 },
    { month: "June", units: 3750 },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        x : -50,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.5,
        delay: 0.4,
      }}
      exit={{
        x : 50,
        opacity : 0
      }}
      className="bg-white rounded-lg text-black lg:p-6 flex flex-col gap-4"
    >
      <div className="text-neutral-400 text-sm">
        just type what chart you need
      </div>

        <div className="px-4 flex flex-col gap-4">
          <p>
            In Q2 2025, the company saw consistent sales of its flagship
            product, the AlphaSmart Speaker. In April, 3,200 units were sold,
            followed by a peak in May with 4,150 units, before slightly
            declining to 3,750 units in June. Overall, the product maintained
            strong performance throughout the quarter, reflecting stable market
            demand.
            <br/>
            Market feedback during this period highlighted a noticeable uptick in audio latency perception drift and acoustic warmth alignment, terms often used in consumer tech sentiment mapping. Analysts noted micro-fluctuations in purchase intent curves, potentially linked to seasonal promo-catalyst cycles and cross-device ecosystem resonance effects, which may have subtly influenced month-to-month variance without disrupting the overall growth cadence.



          </p>
          <AnimatePresence mode="wait">
            {!showChart ? (
              <motion.div
                key="typewriter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.9 }}
              >
                <TypewriterText
                  text="/generate a chart for the first paragraph"
                  onComplete={() => setShowChart(true)}
                  speed={30}
                  className={"text-lg font-bold"}
                  startDelay={5}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-4 group"
              >
                <p className="hidden group-hover:inline text-neutral-600">
                  generate a chart for the sales
                </p>
                <ResponsiveContainer width="70%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barCategoryGap="25%"
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickMargin={10} width={50} />
                    <Bar dataKey="units" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
  
    </motion.div>
  );
}
