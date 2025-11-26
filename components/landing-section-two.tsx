// "use client";

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// import { useState } from "react";
// import { GenerateChart } from "./generate-chart";
// import { GenerateSummary } from "./generate-summary";
// import { GenerateText } from "./generate-text";
// import { AnimatePresence } from "motion/react";

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BarChart3,
  Layers,
  Command,
  Terminal,
  MoreHorizontal,
  Search,
  Share2,
  Wand2,
  FileText,
} from "lucide-react";

export function SectionTwo() {
  const [activeTab, setActiveTab] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 12000);
    return () => clearInterval(cycleInterval);
  }, []);

  useEffect(() => {
    setStep(0);
    const animate = async () => {
      await new Promise((r) => setTimeout(r, 800));
      setStep(1);
      await new Promise((r) => setTimeout(r, 2500));
      setStep(2);
      await new Promise((r) => setTimeout(r, 2000));
      setStep(3);
    };
    animate();
  }, [activeTab]);

  const tabs = [
    { id: 0, label: "Smart Visuals", icon: BarChart3 },
    { id: 1, label: "Instant Summary", icon: Layers },
    { id: 2, label: "Tone Refine", icon: Wand2 },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-8">
        <h2 className="md:text-2xl font-bold tracking-wide text-lg text-white">
          See what magic can be done with this
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative w-full max-w-5xl mx-auto h-[500px] sm:h-[600px] rounded-xl border border-white/10 bg-[#0C0C0C] shadow-2xl flex flex-col ring-1 ring-white/5 overflow-hidden"
      >
        {/* Window Header */}
        <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-zinc-900/40 backdrop-blur-sm z-20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded text-[10px] font-medium transition-all duration-500 ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <tab.icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex gap-4 text-zinc-600">
            <Share2 size={14} />
            <MoreHorizontal size={14} />
          </div>
        </div>

        <div className="flex-1 flex relative">
          {/* Sidebar */}
          <div className="hidden md:flex w-16 border-r border-white/5 flex-col items-center py-6 gap-6 bg-zinc-900/20">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-100 border border-white/10 shadow-inner">
              <Terminal size={18} />
            </div>
            <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-zinc-600 transition-colors">
              <Search size={18} />
            </div>
            <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-zinc-600 transition-colors">
              <FileText size={18} />
            </div>
            <div className="mt-auto w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400">
              FD
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative bg-[#0C0C0C]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="p-6 sm:p-12 md:p-16 max-w-3xl mx-auto h-full overflow-hidden flex flex-col relative">
              <AnimatePresence mode="wait">
                {/* Tab 1: Smart Visuals */}
                {activeTab === 0 && (
                  <motion.div
                    key="visuals"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                  >
                    <div className="mb-6 h-12 flex items-center">
                      <h1 className="text-2xl sm:text-4xl font-semibold text-zinc-100 tracking-tight">
                        Q3 Revenue Analysis
                      </h1>
                    </div>
                    <div className="space-y-4 text-zinc-400 text-base sm:text-lg leading-relaxed relative">
                      <p>
                        {step >= 1 ? (
                          <>
                            Revenue grew by 24% month-over-month. <br />
                            <span className="text-orange-400 font-medium">
                              /visualize monthly growth
                            </span>
                          </>
                        ) : (
                          <span className="animate-pulse">|</span>
                        )}
                      </p>

                      {step >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.6 }}
                          className="absolute top-16 left-0 z-30 flex items-center gap-2 p-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl"
                        >
                          <div className="px-2 py-1 text-xs font-medium text-zinc-400 flex items-center gap-2">
                            <Sparkles size={12} className="text-orange-400" />{" "}
                            Generating Chart...
                          </div>
                        </motion.div>
                      )}

                      {step >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 1.2,
                          }}
                          className="mt-8 p-4 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-black/50 backdrop-blur-md w-full relative overflow-hidden ring-1 ring-white/5"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                                <BarChart3 size={18} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-zinc-200">
                                  Growth Trajectory
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="h-40 flex items-end justify-between gap-2 px-1">
                            {[40, 35, 55, 60, 75, 95].map((h, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{
                                  duration: 1.2,
                                  delay: i * 0.15,
                                  type: "spring",
                                  bounce: 0.2,
                                }}
                                className="w-full bg-gradient-to-t from-orange-600 to-orange-900/50 rounded-t border-t border-orange-400/30"
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tab 2: Instant Summary */}
                {activeTab === 1 && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                  >
                    <div className="mb-6 h-12 flex items-center">
                      <h1 className="text-2xl sm:text-4xl font-semibold text-zinc-100 tracking-tight">
                        Project Titan Specs
                      </h1>
                    </div>
                    <div className="space-y-4 text-zinc-500 text-xs sm:text-sm leading-relaxed blur-[1px] select-none opacity-50">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam.
                      </p>
                      <p>
                        Quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor
                        in reprehenderit in voluptate velit.
                      </p>
                      <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                    </div>

                    {step >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center p-4"
                      >
                        <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                          <div className="flex items-center gap-2 mb-4 text-emerald-400 text-xs sm:text-sm font-medium">
                            <Layers size={14} /> AI Summary
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2 items-start">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                              <p className="text-zinc-300 text-xs sm:text-sm">
                                Titan project is <b>on schedule</b> for Q4
                                launch.
                              </p>
                            </div>
                            <div className="flex gap-2 items-start">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                              <p className="text-zinc-300 text-xs sm:text-sm">
                                Budget requirements have decreased by <b>15%</b>
                                .
                              </p>
                            </div>
                            <div className="flex gap-2 items-start">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                              <p className="text-zinc-300 text-xs sm:text-sm">
                                Key stakeholder approval pending for Phase 2.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Tab 3: Tone Refine */}
                {activeTab === 2 && (
                  <motion.div
                    key="refine"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                  >
                    <div className="mb-6 h-12 flex items-center">
                      <h1 className="text-2xl sm:text-4xl font-semibold text-zinc-100 tracking-tight">
                        Email Draft
                      </h1>
                    </div>
                    <div className="text-base sm:text-lg leading-relaxed relative">
                      {step < 2 ? (
                        <p className="text-zinc-400">
                          Hey team, <br />
                          fix the login bug asap its annoying customers.{" "}
                          <span className="animate-pulse">|</span>
                        </p>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8 }}
                          className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200"
                        >
                          <p className="mb-2 text-[10px] sm:text-xs uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-2">
                            <Wand2 size={12} /> Refined to Professional
                          </p>
                          <p className="text-sm sm:text-base">
                            Team, please prioritize the resolution of the login
                            latency issue, as it is currently impacting user
                            experience.
                          </p>
                        </motion.div>
                      )}

                      {step === 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="absolute top-20 left-0 bg-[#1a1a1a] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-zinc-400 shadow-xl flex items-center gap-2"
                        >
                          <Command size={10} /> Refine Tone
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-8 border-t border-white/5 bg-zinc-900/80 backdrop-blur text-[10px] text-zinc-500 flex items-center justify-between px-4 font-mono">
              <div className="flex gap-4">
                <span className="hidden sm:inline">Ln 12, Col 42</span>
                <span className="hidden sm:inline">UTF-8</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="hidden sm:inline">Connected</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
