"use client";
import { useHistoryState } from "@/store/useHistoryStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { formatTimestamp } from "@/lib/functions/calculateTime";
import { SafeHtml } from "./safe-html";
import { Clipboard, Clock, Expand, BarChart3, PieChart, X } from "lucide-react";
import { Button } from "./ui/button";
import { usePanelStore } from "@/store/panelStore";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { BarChartComponent } from "./bar-chart";
import { PieChartComponent } from "./pie-chart";

export function DocumentPanel({ id }: { id: string }) {
  const setActiveDocument = useHistoryState((s) => s.setActiveDocument);
  const { isOpen } = usePanelStore();

  const [expandedEntry, setExpandedEntry] = useState<null | {
    content: string;
    prompt: string;
    createdAt: string;
    type?: string;
  }>(null);

  const entries = useHistoryState(
    useShallow((state) => state.batchedEntries[id] || [])
  );

  async function handleCopy(htmlContent: any) {
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  useEffect(() => {
    setActiveDocument(id);
  }, [id, setActiveDocument]);

  useEffect(() => {
    if (!expandedEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedEntry(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expandedEntry]);

  const { data, isLoading } = useQuery({
    queryKey: ["doc", "history", `${id}`],
    queryFn: () => fetch(`/api/doc/history/${id}`).then((res) => res.json()),
    staleTime: Infinity,
    enabled: isOpen,
  });

  if (isLoading) {
    return (
      <motion.div
        initial={false}
        animate={{ width: isOpen ? "300px" : "0px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col h-full border shadow-sm bg-card rounded overflow-hidden"
      />
    );
  }

  const totalHistory = [...(data ?? []), ...entries];
  return (
    <>
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? "300px" : "0px",
          minWidth: isOpen ? "220px" : "0px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col h-full border-l-px shadow-sm bg-muted rounded-lg
        hidden sm:block text-card-foreground border-r-card
        overflow-hidden"
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
            delay: isOpen ? 0.1 : 0,
            ease: "easeInOut",
          }}
          className="py-2 px-1 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent"
        >
          <div className="py-1 px-1 w-full h-full">
            <Tabs className="w-full h-full" defaultValue="history">
              <TabsList className="w-full">
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent className="w-full h-full" value="history">
                {totalHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 px-4 py-10">
                    <div className="flex items-center justify-center size-8 rounded-full bg-white/[0.04] ring-1 ring-white/[0.06]">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-[12px] text-muted-foreground text-center">
                      No history yet
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 text-center">
                      Ask AI and reference it later
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {totalHistory.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{
                          opacity: isOpen ? 1 : 0,
                          y: isOpen ? 0 : 10,
                        }}
                        transition={{
                          duration: 0.2,
                          delay: isOpen ? 0.2 + i * 0.05 : 0,
                        }}
                        onClick={() => setExpandedEntry(h)}
                        className="flex flex-col rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors cursor-pointer px-2.5 py-2 gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <p className="text-[11px] font-mono">
                              {formatTimestamp(h.createdAt)}
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="cursor-pointer h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedEntry(h);
                              }}
                              aria-label="Expand"
                            >
                              <Expand className="w-3 h-3" />
                            </Button>

                            {h?.type === "text" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(h.content);
                                }}
                                className="cursor-pointer h-6 w-6 p-0"
                                aria-label="Copy"
                              >
                                <Clipboard className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="break-words text-[13px] font-medium text-foreground line-clamp-1">
                            {h.prompt}
                          </p>
                          {h.type === "bar" || h.type === "pie" ? (
                            <div className=" q">
                              {(() => {
                                try {
                                  const chartData = JSON.parse(h.content);
                                  if (h.type === "bar") {
                                    return (
                                      <BarChartComponent
                                        chartData={chartData}
                                        compact={true}
                                      />
                                    );
                                  } else if (h.type === "pie") {
                                    return (
                                      <PieChartComponent
                                        chartData={chartData}
                                        compact={true}
                                      />
                                    );
                                  }
                                } catch (error) {
                                  console.error(
                                    "Failed to parse chart data:",
                                    error
                                  );
                                  return (
                                    <div className="flex items-center gap-2 text-sm text-red-500">
                                      {h.type === "bar" ? (
                                        <BarChart3 className="w-4 h-4" />
                                      ) : (
                                        <PieChart className="w-4 h-4" />
                                      )}
                                      <span>Invalid chart data</span>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          ) : (
                            <>
                              <SafeHtml
                                html={h.content}
                                className="text-[12px] text-muted-foreground line-clamp-3 leading-relaxed"
                              />
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {expandedEntry && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setExpandedEntry(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#161618]/95 backdrop-blur-xl ring-1 ring-white/[0.06] rounded-[10px] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_16px_-4px_rgba(0,0,0,0.4),0_24px_48px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(expandedEntry.createdAt)}
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedEntry(null)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center size-6 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
                <p className="text-[18px] font-semibold text-neutral-100 leading-snug tracking-tight">
                  {expandedEntry.prompt}
                </p>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  {expandedEntry.type === "bar" || expandedEntry.type === "pie" ? (
                    <div className="w-full rounded-md bg-white/[0.02] ring-1 ring-white/[0.04] p-3">
                      {(() => {
                        try {
                          const chartData = JSON.parse(expandedEntry.content);
                          if (expandedEntry.type === "bar") {
                            return <BarChartComponent chartData={chartData} />;
                          } else if (expandedEntry.type === "pie") {
                            return <PieChartComponent chartData={chartData} />;
                          }
                        } catch (error) {
                          console.error("Failed to parse chart data:", error);
                          return (
                            <div className="flex items-center justify-center p-6 border border-red-500/30 bg-red-500/5 rounded-md">
                              <p className="text-red-400 text-sm">
                                Invalid chart data format
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <SafeHtml
                      html={expandedEntry.content}
                      className="text-[13.5px] text-neutral-300 leading-relaxed max-w-none [&_h1]:text-neutral-100 [&_h1]:text-[17px] [&_h1]:font-semibold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h2]:text-neutral-100 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-neutral-100 [&_h3]:text-[13.5px] [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-neutral-100 [&_strong]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_code]:bg-white/[0.06] [&_code]:text-neutral-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12.5px] [&_code]:font-mono [&_blockquote]:border-l-2 [&_blockquote]:border-white/10 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-400 [&_blockquote]:italic"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.01]">
                <span className="text-[10.5px] text-neutral-500 tracking-tight">
                  <kbd className="px-1 py-px rounded bg-white/[0.05] ring-1 ring-white/[0.06] text-neutral-400 font-mono text-[10px]">
                    esc
                  </kbd>{" "}
                  to close
                </span>
                {expandedEntry.type === "text" && (
                  <button
                    type="button"
                    onClick={() => handleCopy(expandedEntry.content)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/[0.06] transition-colors"
                  >
                    <Clipboard className="w-3 h-3" />
                    Copy
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
