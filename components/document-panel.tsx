"use client";
import { useHistoryState } from "@/store/useHistoryStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { formatTimestamp } from "@/lib/functions/calculateTime";
import { SafeHtml } from "./safe-html";
import { Clipboard, Clock, Expand, BarChart3, PieChart } from "lucide-react";
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
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white data-[state=active]:rounded-none data-[state=active]:border-none"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent className="w-full h-full" value="history">
                {totalHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-400 text-center px-4">
                      Ask, and reference, anytime {":)"}
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
                        className="flex flex-col rounded-lg dark:bg-gradient-to-r from-transparent via-neutral-800 shadow-sm to-transparent border border-[2px] px-2 sm:py-1 py-4 gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[4px]">
                            <Clock className="w-3 h-3 dark:text-[#faf8b5f0] text-emerald-400" />
                            <p className="dark:text-[#faf8b5f0] text-emerald-400 text-xs font-mono">
                              {formatTimestamp(h.createdAt)}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size={"sm"}
                              className="cursor-pointer"
                              onClick={() => setExpandedEntry(h)}
                            >
                              <Expand className="sm:w-2 sm:h-2 w-4 h-4" />
                            </Button>

                            {h?.type === "text" ? (
                              <Button
                                size={"sm"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(h.content);
                                }}
                                className="cursor-pointer"
                              >
                                <Clipboard className="sm:w-2 sm:h-2 w-4 h-4" />
                              </Button>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="break-words sm:text-[14px] md:text-md font-medium text-bold line-clamp-1">
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
                                className="sm:text-[13px] md:text-[16px] text-primary/70 line-clamp-4 leading-relaxed"
                              />
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ideas">ideas rendering</TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {expandedEntry && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setExpandedEntry(null)}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(expandedEntry.createdAt)}
                </span>
                <Button
                  className="cursor-pointer"
                  onClick={() => setExpandedEntry(null)}
                >
                  Close
                </Button>
              </div>
              <p className="text-lg font-semibold">{expandedEntry.prompt}</p>
              {expandedEntry.type === "bar" || expandedEntry.type === "pie" ? (
                <div className="w-full">
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
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-red-300 rounded-lg">
                          <p className="text-red-500">
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
                  className="text-neutral-500 max-w-none"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
